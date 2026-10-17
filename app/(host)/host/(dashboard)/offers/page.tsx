import { getHostOffers } from "@/app/actions/offers"
import HostOffersClient from "./HostOffersClient"

export default async function HostOffersPage() {
  const offers = await getHostOffers()
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 pb-24">
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Offers</h2>
          <p className="text-zinc-500">
            Accept or decline bids on your listings. If you accept, the guest has 24 hours to pay. Dates stay open until they pay.
          </p>
        </div>
        <HostOffersClient initialOffers={offers} />
      </main>
    </div>
  )
}
