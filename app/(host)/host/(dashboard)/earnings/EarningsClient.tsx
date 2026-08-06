"use client"

import { useMemo } from "react"
import { format, isThisMonth, parseISO, isAfter } from "date-fns"
import { DollarSign, ArrowUpRight, Wallet, Activity } from "lucide-react"

interface Booking {
  id: string
  tourist_name: string
  travel_date: string
  status: string
  total_usd: number
  platform_fee_usd: number
  host_payout_usd: number
  exchange_rate_used?: number | null
  activities: { title: string }
}

interface EarningsClientProps {
  initialBookings: Booking[]
  currentGlobalRate: number
}

function formatRs(amount: number) {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(amount)
}

function formatUsd(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export default function EarningsClient({ initialBookings, currentGlobalRate }: EarningsClientProps) {
  
  const { thisMonthLkr, thisMonthUsd, pendingLkr, pendingUsd, lifetimeLkr, lifetimeUsd } = useMemo(() => {
    let tMonthLkr = 0
    let tMonthUsd = 0
    let pLkr = 0
    let pUsd = 0
    let ltfLkr = 0
    let ltfUsd = 0
    
    const today = new Date()

    initialBookings.forEach(booking => {
      const rate = booking.exchange_rate_used || currentGlobalRate
      const netUsd = booking.host_payout_usd || 0
      const netLkr = netUsd * rate
      
      const travelDate = parseISO(booking.travel_date)
      
      // Lifetime (All Confirmed/Completed/Redeemed)
      ltfLkr += netLkr
      ltfUsd += netUsd
      
      // This Month
      if (isThisMonth(travelDate)) {
        tMonthLkr += netLkr
        tMonthUsd += netUsd
      }
      
      // Pending Payouts (Upcoming Confirmed)
      // Usually payouts happen after travel_date, so future bookings are pending
      if (booking.status === 'confirmed' && isAfter(travelDate, today)) {
        pLkr += netLkr
        pUsd += netUsd
      }
    })

    return { 
      thisMonthLkr: tMonthLkr, 
      thisMonthUsd: tMonthUsd, 
      pendingLkr: pLkr, 
      pendingUsd: pUsd, 
      lifetimeLkr: ltfLkr, 
      lifetimeUsd: ltfUsd 
    }
  }, [initialBookings, currentGlobalRate])

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 flex flex-col">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Activity className="w-4 h-4" />
            <span className="font-semibold text-sm">This Month</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">{formatRs(thisMonthLkr)}</div>
          <div className="text-sm font-medium text-zinc-400 mt-1">~ {formatUsd(thisMonthUsd)}</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 flex flex-col">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <ArrowUpRight className="w-4 h-4" />
            <span className="font-semibold text-sm">Pending Payouts</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">{formatRs(pendingLkr)}</div>
          <div className="text-sm font-medium text-zinc-400 mt-1">~ {formatUsd(pendingUsd)}</div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-800 flex flex-col">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Wallet className="w-4 h-4" />
            <span className="font-semibold text-sm">Lifetime Revenue</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatRs(lifetimeLkr)}</div>
          <div className="text-sm font-medium text-zinc-500 mt-1">~ {formatUsd(lifetimeUsd)}</div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="font-bold text-zinc-900">Transaction Ledger</h3>
        </div>
        
        {initialBookings.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            No transactions found.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {initialBookings.map((booking) => {
              const rate = booking.exchange_rate_used || currentGlobalRate
              const isFallback = !booking.exchange_rate_used
              
              const grossUsd = booking.total_usd || 0
              const feeUsd = booking.platform_fee_usd || 0
              const netUsd = booking.host_payout_usd || 0
              
              const netLkr = netUsd * rate

              return (
                <div key={booking.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-zinc-900">
                        {format(parseISO(booking.travel_date), 'MMM d, yyyy')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-semibold uppercase tracking-wider">
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-zinc-600 font-medium text-sm">
                      {booking.activities?.title || 'Unknown Activity'}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">
                      Guest: {booking.tourist_name}
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                    <div className="text-right">
                      <div className="text-sm text-zinc-500 mb-0.5">Gross: {formatUsd(grossUsd)}</div>
                      <div className="text-sm text-rose-500 mb-1">- Fee: {formatUsd(feeUsd)}</div>
                      <div className="text-lg font-bold text-emerald-600">{formatRs(netLkr)}</div>
                      <div className="text-xs font-medium text-emerald-600/70 mt-0.5 text-right">
                        ~ {formatUsd(netUsd)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto text-xs text-zinc-400 bg-zinc-50 p-2 rounded-lg text-center md:text-right border border-zinc-100">
                    <span className="font-semibold block mb-0.5">Rate Used</span>
                    Converted at Rs. {rate} / $1
                    {isFallback && <span className="block text-amber-500 mt-0.5">(Current Market Fallback)</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
