import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20' as any,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { activityId, title, priceUsd, date, guests, whatsapp, touristName, touristEmail } = body

    const totalUsd = priceUsd * guests

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
        status: 'pending'
      })
      .select('id')
      .single()

    if (dbError) throw dbError;

    // 2. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: title,
              description: `${guests} Pax on ${date}`,
            },
            unit_amount: Math.round(priceUsd * 100), // Stripe expects cents
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
