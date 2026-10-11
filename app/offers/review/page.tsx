import { confirmOfferFromEmail } from "@/app/actions/offers"
import { verifyOfferActionToken } from "@/lib/offer-token"
import { supabaseAdmin } from "@/lib/supabase"
import { formatUSD } from "@/lib/utils"
import { redirect } from "next/navigation"

export default async function OfferReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; action?: string; token?: string }>
}) {
  const { id, action, token } = await searchParams
  const validAction = action === "accept" || action === "decline" ? action : null

  if (!id || !validAction || !token || !verifyOfferActionToken(id, validAction, token)) {
    redirect("/offers/processed?status=invalid")
  }

  const { data: offer } = await supabaseAdmin
    .from("offers")
    .select("id, status, guest_name, offer_amount, travel_date, guest_count, activities(title)")
    .eq("id", id)
    .maybeSingle()

  if (!offer || offer.status !== "pending") {
    redirect("/offers/processed?status=invalid")
  }

  const listing = Array.isArray(offer.activities) ? offer.activities[0] : offer.activities
  const isAccept = validAction === "accept"

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-zinc-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          {isAccept ? "Accept this offer?" : "Decline this offer?"}
        </h1>
        <p className="text-zinc-500 mt-2">{listing?.title || "Listing"}</p>
        <ul className="mt-6 space-y-2 text-sm text-zinc-700">
          <li><span className="text-zinc-400">Guest</span> {offer.guest_name}</li>
          <li><span className="text-zinc-400">Offer</span> {formatUSD(Number(offer.offer_amount))}</li>
          <li><span className="text-zinc-400">Date</span> {offer.travel_date}</li>
          <li><span className="text-zinc-400">Guests</span> {offer.guest_count}</li>
        </ul>
        <form action={confirmOfferFromEmail} className="mt-8">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="action" value={validAction} />
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className={`w-full h-12 rounded-xl font-bold text-white ${isAccept ? "bg-emerald-600 hover:bg-emerald-700" : "bg-zinc-900 hover:bg-zinc-800"}`}
          >
            {isAccept ? "Confirm accept" : "Confirm decline"}
          </button>
        </form>
      </div>
    </div>
  )
}
