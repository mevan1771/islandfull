"use client"

import { useState } from "react"
import { manualCheckIn } from "@/app/actions/host-dashboard"
import { Loader2, CheckCircle2 } from "lucide-react"
import toast from "react-hot-toast"

export default function ManualCheckInButton({ bookingId, status }: { bookingId: string, status: string }) {
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const isRedeemed = status === 'redeemed'

  if (isRedeemed) {
    return (
      <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
        <CheckCircle2 className="w-4 h-4" />
        Checked In
      </div>
    )
  }

  const handleCheckIn = async () => {
    setIsCheckingIn(true)
    const res = await manualCheckIn(bookingId)
    if (res.success) {
      toast.success("Guest checked in manually!")
    } else {
      toast.error(res.error || "Failed to check in guest")
    }
    setIsCheckingIn(false)
  }

  return (
    <button
      onClick={handleCheckIn}
      disabled={isCheckingIn}
      className="flex items-center gap-2 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors px-4 py-2 rounded-xl shadow-sm disabled:opacity-50"
    >
      {isCheckingIn && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isCheckingIn && "Check In"}
    </button>
  )
}
