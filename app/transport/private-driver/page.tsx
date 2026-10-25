import { TransportGuideLayout } from "@/components/transport/TransportGuideLayout"
import { pageMeta } from "@/lib/seo"
import { PRIVATE_DRIVER_FAQS } from "@/lib/transport-seo"

export const metadata = pageMeta({
  title: "Private driver in Sri Lanka — car & van with local hosts",
  description:
    "Hire a car or van with a driver in Sri Lanka. Map your route, send your own price, and match with local hosts. Better than guessing taxi rates at the airport.",
  path: "/transport/private-driver",
  keywords: [
    "private driver Sri Lanka",
    "car with driver Sri Lanka",
    "van hire Sri Lanka with driver",
    "Sri Lanka chauffeur",
  ],
})

export default function PrivateDriverPage() {
  return (
    <TransportGuideLayout
      title="Private driver in Sri Lanka"
      lede="A named local host, a vehicle that fits your group, and a price you send—not a mystery quote on the expressway."
      crumbs={[
        { name: "Home", path: "/" },
        { name: "Transport", path: "/transport" },
        { name: "Private driver", path: "/transport/private-driver" },
      ]}
      path="/transport/private-driver"
      serviceType="Chauffeur-driven car and van hire"
      faqs={PRIVATE_DRIVER_FAQS}
      related={[
        { href: "/transport/airport-transfers", label: "Airport transfers", note: "CMB pickup" },
        { href: "/transport/getting-around-sri-lanka", label: "All options", note: "Train, bus, tuk-tuk" },
        { href: "/transport/routes", label: "Route guides", note: "Times and distances" },
      ]}
    >
      <p>
        “Car with driver Sri Lanka” is one of the most searched travel phrases for this island, and for good reason.
        Distances are modest; driving conditions are not. Visitors who wanted to self-drive often switch after one day
        of overtaking on blind bends.
      </p>
      <h2 className="pt-4 text-xl font-black text-zinc-900">What you are hiring</h2>
      <p>
        You are hiring a person who knows the island, plus a car (about 3–4 guests) or van (families and surfboards).
        IslandFull also lists tuk-tuk and scooter hosts for short ranges. Optional guide is a separate toggle when you
        want commentary, not only driving.
      </p>
      <h2 className="pt-4 text-xl font-black text-zinc-900">Why send your own offer</h2>
      <p>
        Airport queues and hotel desks often quote one number to foreigners and another to locals. Our planner shows a
        distance-based guide price, then lets you send what you are willing to pay. Hosts who can do the trip accept.
        You do not pay until then.
      </p>
      <h2 className="pt-4 text-xl font-black text-zinc-900">Multi-day trips</h2>
      <p>
        Put every overnight town on the map, including a return to Colombo Airport. Mention in requests: child seats,
        extra luggage, a slow tea-country day, or a driver who is happy to wait during a safari jeep (the jeep is
        usually separate). Trip length on the form is 1–14 days.
      </p>
      <h2 className="pt-4 text-xl font-black text-zinc-900">Etiquette that keeps things smooth</h2>
      <p>
        Share the real hotel names. Do not add surprise extra cities after the host has already driven 200 km. On long
        days, a meal stop for the driver is normal. English level varies; the written route on IslandFull is the shared
        source of truth.
      </p>
    </TransportGuideLayout>
  )
}
