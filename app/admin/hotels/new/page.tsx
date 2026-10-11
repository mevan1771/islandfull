import HotelForm from "@/components/admin/HotelForm"
import { getHosts } from "@/app/actions/hosts"
import { fetchExistingLocations } from "@/lib/admin-locations"

export const dynamic = "force-dynamic"

export default async function NewHotelPage() {
  const [hosts, existingLocations] = await Promise.all([getHosts(), fetchExistingLocations()])
  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <HotelForm hosts={hosts || []} existingLocations={existingLocations} />
      </div>
    </div>
  )
}
