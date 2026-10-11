import { notFound } from "next/navigation"
import HotelForm from "@/components/admin/HotelForm"
import { getHotelForAdmin } from "@/app/actions/hotels"
import { getHosts } from "@/app/actions/hosts"
import { fetchExistingLocations } from "@/lib/admin-locations"

export const dynamic = "force-dynamic"

export default async function EditHotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [hotel, hosts, existingLocations] = await Promise.all([
    getHotelForAdmin(id),
    getHosts(),
    fetchExistingLocations(),
  ])
  if (!hotel) notFound()
  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <HotelForm initialData={hotel} hosts={hosts || []} existingLocations={existingLocations} />
      </div>
    </div>
  )
}
