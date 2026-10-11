"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { updateOfferStatus } from "@/app/actions/offers"
import { formatUSD } from "@/lib/utils"
import toast from "react-hot-toast"

function waLink(phone?: string | null) {
  if (!phone) return null
  const cleaned = phone.replace(/\D/g, "")
  if (!cleaned) return null
  return `https://wa.me/${cleaned}`
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  countered: "bg-sky-50 text-sky-700 border-sky-200",
  declined: "bg-zinc-100 text-zinc-600 border-zinc-200",
}

export function OffersClient({ initialOffers }: { initialOffers: any[] }) {
  const [offers, setOffers] = useState(initialOffers)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [counterFor, setCounterFor] = useState<string | null>(null)
  const [counterAmount, setCounterAmount] = useState("")

  const runUpdate = async (id: string, status: "accepted" | "declined" | "countered", amount?: number) => {
    setBusyId(id)
    const res = await updateOfferStatus(id, status, amount)
    setBusyId(null)
    if (!res.success) {
      toast.error(res.error || "Update failed")
      return
    }
    setOffers((current) =>
      current.map((offer) =>
        offer.id === id
          ? { ...offer, status, admin_counter_amount: status === "countered" ? amount : offer.admin_counter_amount }
          : offer
      )
    )
    setCounterFor(null)
    setCounterAmount("")
    toast.success("Offer updated")
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Offers</h1>
        <p className="text-zinc-500 mt-1 mb-6">Guest bids on tours and transport. No payment is taken until you confirm.</p>

        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-4">Submitted</th>
                  <th className="px-5 py-4">Listing</th>
                  <th className="px-5 py-4">Guest</th>
                  <th className="px-5 py-4">Travel</th>
                  <th className="px-5 py-4">Offer vs list</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {offers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-zinc-500">
                      No offers yet.
                    </td>
                  </tr>
                ) : (
                  offers.map((offer) => {
                    const listing = offer.activities
                    const phoneLink = waLink(offer.guest_phone)
                    return (
                      <tr key={offer.id} className="align-top">
                        <td className="px-5 py-4 whitespace-nowrap text-zinc-600">
                          {new Date(offer.created_at).toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-zinc-900 max-w-[200px]">{listing?.title || "Listing"}</div>
                          <div className="text-[11px] uppercase text-zinc-400 mt-0.5">{listing?.category_type}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-zinc-900">{offer.guest_name}</div>
                          <div className="text-zinc-500">{offer.guest_email}</div>
                          {offer.guest_phone && <div className="text-zinc-500">{offer.guest_phone}</div>}
                          {phoneLink && (
                            <a
                              href={`${phoneLink}?text=${encodeURIComponent(`Hi ${offer.guest_name}, this is IslandFull about your offer for ${listing?.title || "the listing"}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-1 text-xs font-bold text-emerald-600 hover:underline"
                            >
                              Chat on WhatsApp
                            </a>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div>{offer.travel_date}</div>
                          <div className="text-zinc-500">{offer.guest_count} guests</div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-bold text-rose-500">{formatUSD(Number(offer.offer_amount))}</div>
                          <div className="text-zinc-400 text-xs">List {formatUSD(Number(listing?.price_usd || 0))}</div>
                          {offer.admin_counter_amount != null && (
                            <div className="text-sky-700 text-xs mt-1">Counter {formatUSD(Number(offer.admin_counter_amount))}</div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border uppercase ${STATUS_STYLES[offer.status] || STATUS_STYLES.pending}`}>
                            {offer.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {offer.status === "pending" ? (
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  disabled={busyId === offer.id}
                                  onClick={() => runUpdate(offer.id, "accepted")}
                                  className="h-9 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-50"
                                >
                                  {busyId === offer.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Accept"}
                                </button>
                                <button
                                  type="button"
                                  disabled={busyId === offer.id}
                                  onClick={() => runUpdate(offer.id, "declined")}
                                  className="h-9 px-3 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-bold disabled:opacity-50"
                                >
                                  Decline
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCounterFor(offer.id)
                                    setCounterAmount(String(listing?.price_usd || offer.offer_amount || ""))
                                  }}
                                  className="h-9 px-3 rounded-lg border border-zinc-200 text-xs font-bold"
                                >
                                  Counter
                                </button>
                              </div>
                              {counterFor === offer.id && (
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={counterAmount}
                                    onChange={(e) => setCounterAmount(e.target.value)}
                                    className="h-9 w-24 px-2 rounded-lg border border-zinc-200 text-sm"
                                  />
                                  <button
                                    type="button"
                                    disabled={busyId === offer.id}
                                    onClick={() => runUpdate(offer.id, "countered", Number(counterAmount))}
                                    className="h-9 px-3 rounded-lg bg-zinc-900 text-white text-xs font-bold"
                                  >
                                    Send
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
