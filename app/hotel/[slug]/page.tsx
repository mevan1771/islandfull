import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Check, Clock, MapPin, Star, Users } from "lucide-react"
import { getPublishedHotel } from "@/app/actions/hotels"
import { formatUSD } from "@/lib/utils"
import { PROPERTY_TYPES } from "@/lib/hotels"
import type { Metadata } from "next"

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const hotel = await getPublishedHotel(slug)
  if (!hotel) return { title: "Hotel | IslandFull" }
  return {
    title: `${hotel.title} in ${hotel.location || "Sri Lanka"} | IslandFull`,
    description: hotel.description,
    openGraph: {
      title: `${hotel.title} | IslandFull`,
      description: hotel.description,
      images: hotel.cover_image_url ? [{ url: hotel.cover_image_url }] : undefined,
    },
  }
}

export default async function HotelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const hotel = await getPublishedHotel(slug)
  if (!hotel) notFound()

  const typeLabel = PROPERTY_TYPES.find((type) => type.slug === hotel.property_type)?.name || "Hotel"
  const fromPrice = (hotel.rooms || [])
    .map((room: any) => Number(room.nightly_rate_usd) || 0)
    .filter((n: number) => n > 0)
  const lowest = fromPrice.length ? Math.min(...fromPrice) : 0
  const whatsapp = String(hotel.contact_whatsapp || "").replace(/\D/g, "")
  const waHref = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi, I would like to stay at ${hotel.title}`)}`
    : null

  return (
    <div className="bg-zinc-50 min-h-screen pb-16">
      <div className="relative h-[42vh] min-h-[280px] w-full bg-zinc-200">
        {hotel.cover_image_url && (
          <Image src={hotel.cover_image_url} alt={hotel.title} fill className="object-cover" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 max-w-5xl mx-auto px-4 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">{typeLabel}</p>
          <h1 className="text-3xl md:text-5xl font-bold mt-1">{hotel.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            {hotel.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {hotel.location}
              </span>
            )}
            {hotel.star_rating && (
              <span className="inline-flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {hotel.star_rating} star
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-8">
          {hotel.description && (
            <section>
              <h2 className="text-xl font-bold mb-3">About this stay</h2>
              <p className="text-zinc-600 whitespace-pre-line leading-relaxed">{hotel.description}</p>
            </section>
          )}

          {hotel.amenities?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3">Amenities</h2>
              <div className="grid grid-cols-2 gap-2">
                {hotel.amenities.map((item: string) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-zinc-700">
                    <Check className="w-4 h-4 text-rose-500" />
                    {item}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xl font-bold mb-4">Rooms</h2>
            <div className="space-y-4">
              {(hotel.rooms || []).map((room: any) => (
                <article key={room.id} className="rounded-3xl border border-zinc-200 bg-white overflow-hidden flex flex-col sm:flex-row">
                  <div className="relative h-44 sm:h-auto sm:w-52 bg-zinc-100 shrink-0">
                    {room.cover_image_url || hotel.cover_image_url ? (
                      <Image src={room.cover_image_url || hotel.cover_image_url} alt={room.name} fill className="object-cover" />
                    ) : null}
                  </div>
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-lg">{room.name}</h3>
                        <p className="text-sm text-zinc-500 mt-1">
                          {room.bed_config}
                          {room.room_size_sqm ? ` · ${room.room_size_sqm} m²` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatUSD(Number(room.nightly_rate_usd) || 0)}</div>
                        <div className="text-xs text-zinc-500">/ night</div>
                      </div>
                    </div>
                    {room.description && <p className="text-sm text-zinc-600 mt-2">{room.description}</p>}
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {room.max_occupancy} guests
                      </span>
                      <span>{room.quantity} rooms of this type</span>
                    </div>
                    {room.amenities?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {room.amenities.map((item: string) => (
                          <span key={item} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-zinc-200 bg-white p-5 space-y-4 lg:sticky lg:top-24">
          <div>
            <div className="text-sm text-zinc-500">From</div>
            <div className="text-2xl font-bold">{lowest ? formatUSD(lowest) : "—"} <span className="text-sm font-medium text-zinc-500">/ night</span></div>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Clock className="w-4 h-4" />
            In {hotel.check_in_time} · Out {hotel.check_out_time}
          </div>
          {waHref ? (
            <a href={waHref} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center rounded-full bg-rose-500 px-4 text-sm font-bold text-white">
              Ask about dates
            </a>
          ) : (
            <p className="text-sm text-zinc-500">Online hotel booking is next. For now, message us from Contact.</p>
          )}
          <Link href="/?vertical=hotel" className="block text-center text-sm font-semibold text-zinc-500 hover:text-zinc-900">
            Browse more hotels
          </Link>
        </aside>
      </div>
    </div>
  )
}
