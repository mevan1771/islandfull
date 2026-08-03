import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { sendPendingEmail } from '@/app/actions/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20' as any,
})

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json()

    if (!bookingId) {
      return new NextResponse('Booking ID is required', { status: 400 })
    }

    // 1. Fetch booking and related activity
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select('*, activities(*)')
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      return new NextResponse('Booking not found', { status: 404 })
    }

    if (!booking.activities) {
      return new NextResponse('Activity not found', { status: 404 })
    }

    // 2. Create Stripe Checkout Session
    const title = booking.activities.title;
    const selectedOption = booking.tour_option;
    const guests = booking.pax_count;
    const date = booking.travel_date;
    const finalTotalUsd = booking.total_usd;
    const pricingModel = booking.activities.pricing_model;

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
      client_reference_id: booking.id,
      customer_email: booking.tourist_email,
      expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours expiration
    })

    // 3. Send Email
    try {
      await sendPendingEmail({
        toEmail: booking.tourist_email,
        touristName: booking.tourist_name,
        activityTitle: selectedOption ? `${title} (${selectedOption})` : title,
        date,
        guests,
        imageUrl: booking.activities?.cover_image_url,
        paymentUrl: session.url || undefined
      });
    } catch (emailError) {
      console.error("[RESEND_EMAIL_ERROR]", emailError);
      return new NextResponse('Failed to send email', { status: 500 })
    }

    // 4. Update Database Tracking
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ payment_request_sent_at: new Date().toISOString() })
      .eq('id', booking.id);
      
    if (updateError) {
      console.error("Failed to update payment_request_sent_at", updateError);
    }

    return NextResponse.json({ success: true, url: session.url })
  } catch (error: any) {
    console.error('Send payment request error:', error)
    return new NextResponse(error.message, { status: 500 })
  }
}
