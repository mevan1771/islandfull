import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { validatePromoCode } from '@/app/actions/promo'
import { eachDayOfInterval, parseISO, format } from 'date-fns'
import { sendPendingEmail, sendReceiptEmail, sendHostEmail } from '@/app/actions/email'
import { revalidatePath } from 'next/cache'
import { getExchangeRate } from '@/app/actions/settings'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20' as any,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { activityId, title, priceUsd, date, endDate, bookingType, pricingModel, guests, whatsapp, touristName, touristEmail, selectedOption, totalUsd, pickupLocation, specialRequests, fromLocation, toLocation, paymentStrategy, promoCode } = body

    // 0. Fetch Commission Rate and Capacity
    const { data: activity } = await supabaseAdmin
      .from('activities')
      .select('commission_rate, max_capacity, cover_image_url, hosts(name, email)')
      .eq('id', activityId)
      .single()

    const commissionRate = activity?.commission_rate || 15.00
    const maxCapacity = activity?.max_capacity || 10

    // Full-Day Availability Block Validation
    const { data: blockedDate } = await supabaseAdmin
      .from('activity_blocks')
      .select('id')
      .eq('activity_id', activityId)
      .eq('blocked_date', date)
      .single()

    if (blockedDate) {
      return new NextResponse(`The selected date (${date}) is blocked and unavailable for booking.`, { status: 400 })
    }

    // Multi-Day Overlap Validation
    if (bookingType === 'multi_day' && endDate) {
      const { data: overlappingBookings } = await supabaseAdmin
        .from('bookings')
        .select('travel_date, end_date, pax_count')
        .eq('activity_id', activityId)
        .in('status', ['confirmed', 'pending', 'pending_payment', 'completed'])
        .lte('travel_date', endDate)
        .gte('end_date', date)

      if (overlappingBookings && overlappingBookings.length > 0) {
        const dailyCounts: Record<string, number> = {}

        for (const b of overlappingBookings) {
          if (!b.travel_date || !b.end_date) continue
          const bDays = eachDayOfInterval({ start: parseISO(b.travel_date), end: parseISO(b.end_date) })
          for (const d of bDays) {
            const dStr = format(d, 'yyyy-MM-dd')
            dailyCounts[dStr] = (dailyCounts[dStr] || 0) + b.pax_count
          }
        }

        const reqDays = eachDayOfInterval({ start: parseISO(date), end: parseISO(endDate) })
        for (const d of reqDays) {
          const dStr = format(d, 'yyyy-MM-dd')
          const currentBooked = dailyCounts[dStr] || 0
          if (currentBooked + guests > maxCapacity) {
            return new NextResponse(`Not enough availability on ${dStr}. Max capacity is ${maxCapacity}, currently ${currentBooked} booked.`, { status: 400 })
          }
        }
      }
    }

    let discountAmountUsd = 0;
    let appliedPromoCode = null;

    if (promoCode) {
      const validation = await validatePromoCode(promoCode, totalUsd)
      if (!validation.success) {
        return new NextResponse(validation.error, { status: 400 })
      }
      discountAmountUsd = validation.discountAmountUsd || 0
      appliedPromoCode = validation.code
    }

    // Commission Ledger Math
    const grossPlatformFee = (totalUsd * commissionRate) / 100;
    const hostPayoutUsd = totalUsd - grossPlatformFee;
    const platformFeeUsd = Math.max(0, grossPlatformFee - discountAmountUsd); // Platform absorbs discount
    const finalTotalUsd = Math.max(0, totalUsd - discountAmountUsd); // Final total charged to customer

    // 1. Insert pending booking to Supabase
    const { data: booking, error: dbError } = await supabaseAdmin
      .from('bookings')
      .insert({
        activity_id: activityId,
        tourist_name: touristName,
        tourist_email: touristEmail,
        tourist_whatsapp: whatsapp,
        pax_count: guests,
        travel_date: date,
        end_date: endDate || null,
        total_usd: finalTotalUsd,
        tour_option: selectedOption || null,
        pickup_location: bookingType === 'point_to_point' ? `From: ${fromLocation} To: ${toLocation}` : (pickupLocation || null),
        special_requests: specialRequests || null,
        status: ['no_card', 'pay_later'].includes(paymentStrategy) ? 'pending_payment' : 'pending',
        payment_status: 'unpaid',
        promo_code_applied: appliedPromoCode,
        discount_amount_usd: discountAmountUsd,
        platform_fee_usd: platformFeeUsd,
        host_payout_usd: hostPayoutUsd,
        commission_rate_applied: commissionRate,
        exchange_rate_used: await getExchangeRate()
      })
      .select('id')
      .single()

    if (dbError) throw dbError;

    // Instantly revalidate the admin dashboard so the new booking shows up
    revalidatePath('/admin', 'layout');

    // If it's totally free, handle it immediately without Stripe
    if (finalTotalUsd === 0) {
      await supabaseAdmin.from('bookings').update({ status: 'confirmed', payment_status: 'paid' }).eq('id', booking.id);

      try {
        const { autoBlockDate } = await import('@/app/actions/tours');
        await autoBlockDate(activityId, date);
      } catch (e) {
        console.error("Failed to auto-block date for free booking:", e);
      }

      if (appliedPromoCode) {
        const { data: currentPromo } = await supabaseAdmin.from('promo_codes').select('current_uses, partner_commission, total_partner_earnings').eq('code', appliedPromoCode).single()
        if (currentPromo) {
          const updates: any = { current_uses: currentPromo.current_uses + 1 }
          if (currentPromo.partner_commission && currentPromo.partner_commission > 0) {
            updates.total_partner_earnings = (currentPromo.total_partner_earnings || 0) + currentPromo.partner_commission
          }
          await supabaseAdmin.from('promo_codes').update(updates).eq('code', appliedPromoCode)
        }
      }

      // Generate QR Code internally
      const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://islandfull.com';
      const qrCodeUrl = `${appUrl}/api/qr?id=${encodeURIComponent(booking.id)}`

      // Send Receipt Email
      const tourOptionStr = selectedOption ? ` (${selectedOption})` : ''
      try {
        await sendReceiptEmail({
          toEmail: touristEmail,
          touristName: touristName,
          activityTitle: `${title}${tourOptionStr}`,
          date: date,
          guests: guests,
          qrCodeUrl,
          imageUrl: activity?.cover_image_url
        })

        // Send Host Email
        const host: any = Array.isArray(activity?.hosts) ? activity.hosts[0] : activity?.hosts;
        if (host?.email) {
          await sendHostEmail({
            toEmail: host.email,
            hostName: host.name || 'Host',
            touristName: touristName,
            activityTitle: `${title}${tourOptionStr}`,
            date: date,
            guests: guests,
            totalPayout: hostPayoutUsd
          })
        }
      } catch (error) {
        console.error("[RESEND_EMAIL_ERROR]", error);
      }

      return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking/success?session_id=no_card_${booking.id}` })
    }

    // 2. Create Stripe Checkout Session (for both 'card' and 'pay_later')
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedOption ? `${title} (${selectedOption})` : title,
              description: pricingModel === 'flat_rate' ? `Private Group (Up to ${guests} guests) on ${date}` : `${guests} Pax on ${date}`,
            },
            unit_amount: pricingModel === 'flat_rate' ? Math.round(finalTotalUsd * 100) : Math.round((finalTotalUsd / guests) * 100),
          },
          quantity: pricingModel === 'flat_rate' ? 1 : guests,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking/cancel`,
      client_reference_id: booking.id, // we use this in the webhook to mark as confirmed
      customer_email: touristEmail,
    })

    if (['no_card', 'pay_later'].includes(paymentStrategy)) {
      // Pay Later: send pending email WITH the Stripe link
      try {
        await sendPendingEmail({
          toEmail: touristEmail,
          touristName,
          activityTitle: selectedOption ? `${title} (${selectedOption})` : title,
          date,
          guests,
          imageUrl: activity?.cover_image_url,
          paymentUrl: session.url || undefined
        });

        // Send Host Email for pending booking
        const host: any = Array.isArray(activity?.hosts) ? activity.hosts[0] : activity?.hosts;
        if (host?.email) {
          await sendHostEmail({
            toEmail: host.email,
            hostName: host.name || 'Host',
            touristName: touristName,
            activityTitle: selectedOption ? `${title} (${selectedOption})` : title,
            date: date,
            guests: guests,
            totalPayout: hostPayoutUsd
          })
        }
      } catch (error) {
        console.error("[RESEND_EMAIL_ERROR]", error);
      }



      // Return local success URL so the guest is NOT forced to pay immediately
      return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking/success?session_id=no_card_${booking.id}` })
    }

    // Direct Card Payment: Return Stripe URL
    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe error:', error)
    return new NextResponse(error.message, { status: 500 })
  }
}
