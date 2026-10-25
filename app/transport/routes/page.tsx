import Link from "next/link"
import { JsonLd } from "@/components/seo/JsonLd"
import { pageMeta, breadcrumbJsonLd } from "@/lib/seo"
import { TRANSPORT_ROUTES, planUrl } from "@/lib/transport-seo"

export const metadata = pageMeta({
  title: "Sri Lanka transport routes — times, distances, private transfers",
  description:
    "CMB to Ella, Kandy, Galle, Sigiriya, Yala, Arugam Bay, and more. Typical drive times and a one-tap planner for private car or van hosts.",
  path: "/transport/routes",
  keywords: ["Sri Lanka routes", "Colombo to Ella", "airport to Kandy", "Galle to Yala"],
})

export default function RoutesIndexPage() {
  return (
    <div className="bg-zinc-50">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Transport", path: "/transport" },
          { name: "Routes", path: "/transport/routes" },
        ])}
      />
      <header className="border-b border-zinc-200 bg-zinc-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFC72C]">Sri Lanka transport</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Popular routes</h1>
          <p className="mt-4 max-w-2xl text-white/80">
            These are the corridors visitors actually search. Times are typical private-car ranges, not railway
            timetables. Tap a guide to read the caveats, or send the route straight to hosts.
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <ul className="grid gap-3 md:grid-cols-2">
          {TRANSPORT_ROUTES.map((route) => (
            <li key={route.slug} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-lg font-bold text-zinc-900">
                <Link href={`/transport/routes/${route.slug}`} className="hover:underline">
                  {route.h1}
                </Link>
              </h2>
              <p className="mt-1 text-xs font-semibold text-zinc-500">
                {route.hours} · {route.km}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{route.intro}</p>
              <div className="mt-3 flex gap-3 text-sm font-bold">
                <Link href={`/transport/routes/${route.slug}`} className="text-zinc-900">
                  Read guide
                </Link>
                <Link href={planUrl([route.fromId, ...(route.viaIds || []), route.toId])} className="text-[#9a7b10]">
                  Plan this
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
