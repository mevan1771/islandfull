import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Stripe from "stripe"
import { QrCode } from "lucide-react"

export default async function BookingSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams;
  let bookingId: string | null = null;

  if (params.session_id && !params.session_id.startsWith("no_card_")) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2024-06-20' as any,
      })
      const session = await stripe.checkout.sessions.retrieve(params.session_id)
      bookingId = session.client_reference_id
    } catch (e) {
      console.error("Error retrieving session:", e)
    }
  }

  // Also support no_card_ booking_id parsing if they pass it
  if (params.session_id?.startsWith("no_card_")) {
    bookingId = params.session_id.split('_')[2] || null; // assuming format no_card_UUID
  }

  const formatBookingReference = (rawId: string) => {
    const cleanId = rawId.replace(/^(no_card_|cs_test_|cs_live_)/, '');
    return `BKG-${cleanId.substring(0, 8).toUpperCase()}`;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 pt-32 pb-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
            {params.session_id?.startsWith("no_card_") ? "Booking Request Received!" : "Booking Confirmed!"}
          </h1>
          <p className="text-zinc-500 font-medium">
            {params.session_id?.startsWith("no_card_")
              ? "Your request has been successfully submitted. We have sent a confirmation to your email. Please keep an eye out for your invoice—your official digital ticket will be issued once payment is completed."
              : "Your payment was successful and your reservation is locked in. A confirmation email containing your booking details and QR code ticket has been sent to your inbox."}
          </p>
        </div>

        {bookingId && !params.session_id?.startsWith("no_card_") && (
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 mt-6">
            <h3 className="font-bold text-zinc-900 mb-4 flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5" />
              Your Ticket
            </h3>
            <div className="bg-white p-4 rounded-xl shadow-sm inline-block mx-auto mb-3">
              {/* Using the internal QR generator API route */}
              <img
                src={`/api/qr?id=${encodeURIComponent(bookingId)}`}
                alt="QR Code Ticket"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-sm text-zinc-500">
              Take a screenshot of this ticket or check your email. Show this to your guide upon arrival.
            </p>
          </div>
        )}

        {params.session_id && (
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-left text-sm mt-4 text-center">
            <span className="text-zinc-500 font-medium block mb-1">Booking Reference:</span>
            <span className="font-mono text-zinc-900 font-bold text-lg">{formatBookingReference(params.session_id)}</span>
          </div>
        )}

        <Link
          href="/"
          className="block w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-rose-500/30 mt-6"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
