import Image from "next/image"
import Link from "next/link"

export function TransportPlanEntry() {
  return (
    <Link href="/transport/plan" className="block group h-full">
      <div className="flex flex-col gap-2 h-full">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl md:rounded-3xl bg-[#FFC72C] shadow-md md:shadow-lg group-hover:shadow-xl transition-shadow duration-300">
          <Image
            src="/images/transport-icon/travel-points.jpg"
            alt="Map of Sri Lanka for planning a private transport route"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
        <div className="flex flex-col flex-1 pb-1 mt-1.5 px-1 sm:px-0">
          <h3 className="text-xs sm:text-sm md:text-base font-semibold text-zinc-900 mb-1 leading-tight line-clamp-2 group-hover:text-rose-500 transition-colors">
            Plan a custom route
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 truncate mb-1">Pick stops, send your price</p>
        </div>
      </div>
    </Link>
  )
}
