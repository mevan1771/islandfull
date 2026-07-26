import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20' as any,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { activityId, title, priceUsd, date, guests, whatsapp, touristName, touristEmail, selectedOption, totalUsd, pickupLocation, specialRequests, paymentStrategy } = body

    // 1. Insert pending booking to Supabase
    const { data: booking, error: dbError } = await supabase
      .from('bookings')
      .insert({
        activity_id: activityId,
        tourist_name: touristName,
        tourist_email: touristEmail,
        tourist_whatsapp: whatsapp,
        pax_count: guests,
        travel_date: date,
        total_usd: totalUsd,
        tour_option: selectedOption || null,
        pickup_location: pickupLocation || null,
        special_requests: specialRequests || null,
        status: 'pending'
      })
      .select('id')
      .single()

    if (dbError) throw dbError;

    // If No Card Needed, skip Stripe entirely
    if (paymentStrategy === 'no_card') {
      // Mark booking as confirmed instantly
      await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', booking.id);
      
      // Auto-block the date if applicable
      try {
        const { autoBlockDate } = await import('@/app/actions/tours');
        await autoBlockDate(activityId, date);
      } catch (e) {
        console.error("Failed to auto-block date for no_card booking:", e);
      }

      return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/booking/success?session_id=no_card_${booking.id}` })
    }

    // 2. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedOption ? `${title} (${selectedOption})` : title,
              description: `${guests} Pax on ${date}`,
            },
            unit_amount: Math.round((totalUsd / guests) * 100), // Stripe expects cents, per unit
          },
          quantity: guests,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/booking/cancel`,
      client_reference_id: booking.id, // we use this in the webhook to mark as confirmed
      customer_email: touristEmail,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe error:', error)
    return new NextResponse(error.message, { status: 500 })
  }
}
