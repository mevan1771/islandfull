import Image from "next/image"
import { notFound } from "next/navigation"
import { Check, MapPin, Star } from "lucide-react"
import { getPublishedHotel } from "@/app/actions/hotels"
import { formatUSD } from "@/lib/utils"
import { PROPERTY_TYPES } from "@/lib/hotels"
import { ActivityHeroCollage } from "@/components/activity/ActivityHeroCollage"
import { ActivityMap } from "@/components/activity/ActivityMap"
import { ActivityGallery } from "@/components/activity/ActivityGallery"
import { MobilePaddingSetter } from "@/components/activity/MobilePaddingSetter"
import { ScrollToTop } from "@/components/activity/ScrollToTop"
import { HotelStayWidget } from "@/components/hotel/HotelStayWidget"
import type { Metadata } from "next"

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const hotel = await getPublishedHotel(slug)
  if (!hotel) return { title: "Hotel | IslandFull" }
  const description = hotel.description
    ? String(hotel.description).slice(0, 160)
    : `Stay at ${hotel.title} in ${hotel.location || "Sri Lanka"}. Book with IslandFull.`
  return {
    title: { absolute: `${hotel.title} in ${hotel.location || "Sri Lanka"} | IslandFull` },
    description,
    alternates: { canonical: `https://islandfull.com/hotel/${slug}` },
    openGraph: {
      title: `${hotel.title} | IslandFull`,
      description,
      images: hotel.cover_image_url ? [{ url: hotel.cover_image_url }] : undefined,
      url: `https://islandfull.com/hotel/${slug}`,
    },
  }
}

export default async function HotelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const hotel = await getPublishedHotel(slug)
  if (!hotel) notFound()

  const typeLabel = PROPERTY_TYPES.find((type) => type.slug === hotel.property_type)?.name || "Hotel"
  const rooms = hotel.rooms || []
  const gallery = [
    ...(Array.isArray(hotel.gallery_urls) ? hotel.gallery_urls : []),
    ...rooms.map((room: any) => room.cover_image_url).filter(Boolean),
  ]
  const cover = hotel.cover_image_url || gallery[0] || "/placeholder.jpg"
  const host = hotel.hosts
  const lat = hotel.latitude != null ? Number(hotel.latitude) : NaN
  const lng = hotel.longitude != null ? Number(hotel.longitude) : NaN

  return (
    <div className="bg-white min-h-screen">
      <ScrollToTop />
      <MobilePaddingSetter />

      <ActivityHeroCollage coverUrl={cover} galleryUrls={gallery} title={hotel.title} />

      <div className="max-w-7xl mx-auto px-4 pt-3 pb-6 md:py-12 flex flex-col md:flex-row gap-4 md:gap-12">
        <div className="flex-1 space-y-6 md:space-y-12">
          <div className="space-y-2.5 md:space-y-3">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-700 leading-tight">
              {hotel.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {hotel.location && (
                <span className="inline-flex items-center gap-1 bg-[#fa385f] text-white text-[11px] md:text-sm font-bold tracking-wide uppercase px-2.5 py-1 md:px-5 md:py-2.5 rounded-full">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                  {hotel.location}
                </span>
              )}
              <span className="inline-flex items-center bg-white border border-gray-200 text-gray-700 text-[11px] md:text-sm font-bold tracking-wide uppercase px-2.5 py-1 md:px-5 md:py-2.5 rounded-full">
                {typeLabel}
              </span>
              {hotel.star_rating ? (
                <span className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-700 text-[11px] md:text-sm font-bold tracking-wide uppercase px-2.5 py-1 md:px-5 md:py-2.5 rounded-full">
                  <Star className="w-3 h-3 md:w-4 md:h-4 fill-amber-400 text-amber-400" />
                  {hotel.star_rating} star
                </span>
              ) : null}
            </div>
          </div>

          {hotel.description && (
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">About this stay</h2>
              <p className="text-slate-600/80 leading-relaxed text-sm md:text-lg font-medium whitespace-pre-line">
                {hotel.description}
              </p>
              {host?.name && (
                <div className="mt-6 flex items-start gap-3 p-4 bg-zinc-50 rounded-2xl w-fit border border-zinc-100">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden relative shadow-sm border border-zinc-200 shrink-0">
                    {host.image_url || host.avatar_url ? (
                      <Image src={host.image_url || host.avatar_url} alt={host.name} fill className="object-cover" />
                    ) : (
                      <span className="font-bold text-zinc-500">{host.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Hosted by</span>
                    <span className="font-bold text-slate-700/80 text-sm md:text-base">{host.name}</span>
                  </div>
                </div>
              )}
            </section>
          )}

          {Number.isFinite(lat) && Number.isFinite(lng) && <ActivityMap lat={lat} lng={lng} />}

          {hotel.amenities?.length > 0 && (
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">What this place offers</h2>
              <ul className="grid grid-cols-2 gap-y-3 gap-x-4 w-full">
                {hotel.amenities.map((item: string) => (
                  <li key={item} className="flex items-start gap-2">
                    <div className="mt-0.5 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-gray-700 text-sm font-medium leading-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Where you&apos;ll sleep</h2>
            <div className="space-y-4">
              {rooms.map((room: any) => (
                <article
                  key={room.id}
                  className="rounded-3xl border border-zinc-200 bg-white overflow-hidden flex flex-col sm:flex-row"
                >
                  <div className="relative h-44 sm:h-auto sm:w-52 bg-zinc-100 shrink-0">
                    {room.cover_image_url || cover ? (
                      <Image
                        src={room.cover_image_url || cover}
                        alt={room.name}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-lg text-zinc-900">{room.name}</h3>
                        <p className="text-sm text-zinc-500 mt-1">
                          {[room.bed_config, room.room_size_sqm ? `${room.room_size_sqm} m²` : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatUSD(Number(room.nightly_rate_usd) || 0)}</div>
                        <div className="text-xs text-zinc-500">/ night</div>
                      </div>
                    </div>
                    {room.description && <p className="text-sm text-zinc-600 mt-2">{room.description}</p>}
                    <p className="mt-3 text-xs text-zinc-500">
                      Up to {room.max_occupancy} guests
                      {room.quantity ? ` · ${room.quantity} of this type` : ""}
                    </p>
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

          <ActivityGallery galleryUrls={gallery.length ? gallery : [cover]} />
        </div>

        <div className="hidden lg:block w-full max-w-[420px]">
          <div className="sticky top-28">
            <HotelStayWidget
              hotelId={hotel.id}
              title={hotel.title}
              rooms={rooms}
              checkInTime={hotel.check_in_time}
              checkOutTime={hotel.check_out_time}
              whatsapp={hotel.contact_whatsapp || hotel.contact_phone}
              hostName={host?.name}
              hostAvatar={host?.avatar_url || host?.image_url}
              allowOffers={!!hotel.allow_offers}
              slot="desktop"
            />
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <HotelStayWidget
          hotelId={hotel.id}
          title={hotel.title}
          rooms={rooms}
          checkInTime={hotel.check_in_time}
          checkOutTime={hotel.check_out_time}
          whatsapp={hotel.contact_whatsapp || hotel.contact_phone}
          hostName={host?.name}
          hostAvatar={host?.avatar_url || host?.image_url}
          allowOffers={!!hotel.allow_offers}
          slot="mobile"
        />
      </div>
    </div>
  )
}
