import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

import { sendReceiptEmail } from '@/app/actions/email'

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

  let bookingId: string | null = null;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    bookingId = session.client_reference_id
  } else if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice
    bookingId = invoice.metadata?.booking_id || null
  }

  if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
    if (bookingId) {
      // Mark as confirmed
      await supabaseAdmin.from('bookings').update({ status: 'confirmed', payment_status: 'paid' }).eq('id', bookingId)
      
      // Look up booking details for email and promo
      const { data: booking } = await supabaseAdmin
        .from('bookings')
        .select('*, activities(title)')
        .eq('id', bookingId)
        .single()
        
      if (booking) {
        // Increment promo uses
        if (booking.promo_code_applied) {
           const { data: currentPromo } = await supabaseAdmin.from('promo_codes').select('current_uses').eq('code', booking.promo_code_applied).single()
           if (currentPromo) {
               await supabaseAdmin.from('promo_codes').update({ current_uses: currentPromo.current_uses + 1 }).eq('code', booking.promo_code_applied)
           }
        }
        
        // Generate QR Code
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bookingId)}`
        
        // Send Receipt Email
        const activityTitle = booking.activities?.title || 'Your Activity'
        const tourOption = booking.tour_option ? ` (${booking.tour_option})` : ''
        
        await sendReceiptEmail({
          toEmail: booking.tourist_email,
          touristName: booking.tourist_name,
          activityTitle: `${activityTitle}${tourOption}`,
          date: booking.travel_date,
          guests: booking.pax_count,
          qrCodeUrl
        })
      }
    }
  }

  return new NextResponse('OK', { status: 200 })
}
