import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20' as any,
})

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.client_reference_id

    if (bookingId) {
      // Mark as confirmed
      await supabaseAdmin.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId)
      
      // Look up booking to increment promo uses
      const { data: booking } = await supabaseAdmin.from('bookings').select('promo_code_applied').eq('id', bookingId).single()
      if (booking && booking.promo_code_applied) {
         const { data: currentPromo } = await supabaseAdmin.from('promo_codes').select('current_uses').eq('code', booking.promo_code_applied).single()
         if (currentPromo) {
             await supabaseAdmin.from('promo_codes').update({ current_uses: currentPromo.current_uses + 1 }).eq('code', booking.promo_code_applied)
         }
      }
    }
  }

  return new NextResponse('OK', { status: 200 })
}
