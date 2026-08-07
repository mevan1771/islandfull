"use client"

import { useState } from "react"
import { manualCheckIn, revertBookingToPending } from "@/app/actions/host-dashboard"
import { Loader2, CheckCircle2, RotateCcw } from "lucide-react"
import toast from "react-hot-toast"

export default function ManualCheckInButton({ bookingId, status }: { bookingId: string, status: string }) {
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isReverting, setIsReverting] = useState(false)
  
  const isRedeemed = status === 'redeemed'
  const canRevert = ['confirmed', 'paid', 'completed'].includes(status)

  if (isRedeemed) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleRevert}
          disabled={isReverting}
          title="Mark as Unpaid"
          className="flex items-center justify-center w-9 h-9 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-xl border border-transparent hover:border-rose-100 disabled:opacity-50"
        >
          {isReverting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
        </button>
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 h-9">
          <CheckCircle2 className="w-4 h-4" />
          Checked In
        </div>
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

  const handleRevert = async () => {
    if (!confirm("Are you sure you want to mark this booking as unpaid?")) return;
    setIsReverting(true)
    const res = await revertBookingToPending(bookingId)
    if (res.success) {
      toast.success("Booking marked as unpaid!")
    } else {
      toast.error(res.error || "Failed to revert booking")
    }
    setIsReverting(false)
  }

  return (
    <div className="flex items-center gap-2">
      {canRevert && (
        <button
          onClick={handleRevert}
          disabled={isReverting || isCheckingIn}
          title="Mark as Unpaid"
          className="flex items-center justify-center w-9 h-9 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-xl border border-transparent hover:border-rose-100 disabled:opacity-50"
        >
          {isReverting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
        </button>
      )}
      <button
        onClick={handleCheckIn}
        disabled={isCheckingIn || isReverting}
        className="flex items-center gap-2 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors px-4 py-2 rounded-xl shadow-sm disabled:opacity-50"
      >
        {isCheckingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check In"}
      </button>
    </div>
  )
}

