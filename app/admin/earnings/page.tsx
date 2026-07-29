"use client"

import { useState, useEffect } from "react"
import { getFinancialLedger, markPayoutAsPaid } from "@/app/actions/finances"
import { Loader2, DollarSign, Activity, Wallet, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default function EarningsDashboard() {
  const [metrics, setMetrics] = useState<any>(null)
  const [ledger, setLedger] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    const data = await getFinancialLedger()
    if (data.success) {
      setMetrics(data.metrics)
      setLedger(data.ledger || [])
    } else {
      alert("Error loading financial data")
    }
    setIsLoading(false)
  }

  const handleMarkPaid = async (bookingId: string) => {
    setIsProcessing(bookingId)
    const res = await markPayoutAsPaid(bookingId)
    if (res.success) {
      // Reload to update KPIs and status
      await loadData()
    } else {
      alert("Error: " + res.error)
    }
    setIsProcessing(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-24 pb-12 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Admin Operations</h1>
            <p className="text-zinc-500 mt-1">Track revenue, platform profits, and host payouts.</p>
          </div>
        </div>

        <div className="flex gap-6 border-b border-zinc-200 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/admin" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Bookings</Link>
          <Link href="/admin/tours" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Tours Database</Link>
          <Link href="/admin/reviews" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Reviews</Link>
          <Link href="/admin/promos" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Promo Codes</Link>
          <Link href="/admin/finances" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Finances</Link>
          <Link href="/admin/earnings" className="pb-3 border-b-2 border-zinc-900 font-bold text-zinc-900 px-1">Earnings</Link>
          <Link href="/admin/hosts" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Hosts</Link>
          <Link href="/admin/settings" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Global Settings</Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Gross Volume</span>
            </div>
            <div>
              <div className="text-3xl font-black text-zinc-900">${metrics?.total_gross_volume?.toFixed(2)}</div>
              <p className="text-sm text-zinc-500 mt-1 font-medium">Customer payments</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Platform Profit</span>
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-black text-emerald-600">${metrics?.total_platform_profit?.toFixed(2)}</div>
              <p className="text-sm text-zinc-500 mt-1 font-medium">IslandFull's cut</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-amber-500" />
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pending Payouts</span>
            </div>
            <div>
              <div className="text-3xl font-black text-amber-600">${metrics?.total_pending_payouts?.toFixed(2)}</div>
              <p className="text-sm text-zinc-500 mt-1 font-medium">Owed to operators</p>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900">Financial Ledger (Confirmed)</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Date & ID</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Tour & Host</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Customer Paid</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Host Payout</th>
                  <th className="p-4 text-xs font-bold text-emerald-500 uppercase tracking-wider">Our Cut</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {ledger.map((booking) => (
                  <tr key={booking.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4 align-top">
                      <div className="font-bold text-zinc-900 text-sm">
                        {format(new Date(booking.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-zinc-500 font-mono mt-1">
                        {booking.id.split('-')[0]}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-bold text-zinc-900 text-sm">{booking.activities?.title}</div>
                      <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                        By {booking.activities?.provider_name}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-bold text-zinc-900 text-sm">${booking.total_usd?.toFixed(2)}</div>
                      {booking.discount_amount_usd > 0 && (
                        <div className="text-xs text-rose-500 mt-1 font-medium bg-rose-50 px-2 py-0.5 rounded inline-block">
                          -{booking.discount_amount_usd} ({booking.promo_code_applied})
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-bold text-zinc-900 text-sm">${booking.host_payout_usd?.toFixed(2)}</div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-bold text-emerald-600 text-sm">${booking.platform_fee_usd?.toFixed(2)}</div>
                    </td>
                    <td className="p-4 align-top text-right">
                      {booking.payout_status === 'paid' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs">
                          <CheckCircle className="w-3.5 h-3.5" />
                          PAID
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 font-bold text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            PENDING
                          </div>
                          <button
                            onClick={() => handleMarkPaid(booking.id)}
                            disabled={isProcessing === booking.id}
                            className="text-xs font-bold text-zinc-500 hover:text-zinc-900 underline transition-colors disabled:opacity-50"
                          >
                            {isProcessing === booking.id ? "Updating..." : "Mark as Paid"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                
                {ledger.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500">
                      No confirmed bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
