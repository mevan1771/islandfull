import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default async function BookingSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams;
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center space-y-6">
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
              : "Your payment was successful and your reservation is locked in. We will reach out to you on WhatsApp shortly."}
          </p>
        </div>

        {params.session_id && (
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-left text-sm">
            <span className="text-zinc-500 font-medium block mb-1">Session ID:</span>
            <span className="font-mono text-zinc-900 break-all">{params.session_id}</span>
          </div>
        )}

        <Link 
          href="/" 
          className="block w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-rose-500/30"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
