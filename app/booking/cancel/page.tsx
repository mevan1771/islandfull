import { XCircle } from "lucide-react"
import Link from "next/link"

export default function BookingCancel() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Payment Cancelled</h1>
          <p className="text-zinc-500 font-medium">
            Your payment was not completed. You have not been charged.
          </p>
        </div>

        <Link 
          href="/" 
          className="block w-full py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-2xl font-bold transition-all"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
