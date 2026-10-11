import { getOffers } from "@/app/actions/offers"
import { OffersClient } from "@/components/admin/OffersClient"

export const dynamic = "force-dynamic"

export default async function AdminOffersPage() {
  const offers = await getOffers()
  return <OffersClient initialOffers={offers} />
}
