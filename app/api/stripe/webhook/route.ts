import { NextResponse } from "next/server"
import Stripe from "stripe"
import { fulfillPaidBooking } from "@/lib/fulfill-booking"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20" as any,
})

function bookingIdFromSession(session: Stripe.Checkout.Session) {
  return session.client_reference_id || session.metadata?.booking_id || null
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature") as string

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  let bookingId: string | null = null

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session
    if (event.type === "checkout.session.completed" && session.payment_status !== "paid") {
      return new NextResponse("OK", { status: 200 })
    }
    bookingId = bookingIdFromSession(session)
  } else if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice
    bookingId = invoice.metadata?.booking_id || null
  } else if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent
    bookingId = intent.metadata?.booking_id || null
  }

  if (bookingId) {
    const result = await fulfillPaidBooking(bookingId)
    if (!result.success) {
      console.error("fulfillPaidBooking failed:", result.error, bookingId, event.type)
      return new NextResponse(result.error || "Fulfillment failed", { status: 500 })
    }
  } else if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    console.error("Paid Stripe event with no booking id", event.type, event.id)
  }

  return new NextResponse("OK", { status: 200 })
}
