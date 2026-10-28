import { TransportGuideLayout } from "@/components/transport/TransportGuideLayout"
import { TransportModeCard } from "@/components/transport/TransportModeCard"
import { pageMeta } from "@/lib/seo"
import { GETTING_AROUND_FAQS } from "@/lib/transport-seo"

export const metadata = pageMeta({
  title: "How to get around Sri Lanka (2026): train, driver, bus, tuk-tuk",
  description:
    "Clear comparison of Sri Lanka transport for visitors: private driver vs train vs bus vs tuk-tuk, typical times, and when each is worth it. Plan a custom route on IslandFull.",
  path: "/transport/getting-around-sri-lanka",
  keywords: [
    "how to get around Sri Lanka",
    "Sri Lanka public transport",
    "Sri Lanka train vs taxi",
    "best way to travel Sri Lanka",
  ],
})

export default function GettingAroundPage() {
  return (
    <TransportGuideLayout
      title="How to get around Sri Lanka"
      lede="A straight comparison for first-time visitors: what locals use, what tourists actually enjoy, and how to book a private route when public transport will eat your holiday."
      crumbs={[
        { name: "Home", path: "/" },
        { name: "Transport", path: "/transport" },
        { name: "Getting around", path: "/transport/getting-around-sri-lanka" },
      ]}
      path="/transport/getting-around-sri-lanka"
      serviceType="Visitor transport advice and private transfers"
      faqs={GETTING_AROUND_FAQS}
      heroImage={{
        src: "https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=1600",
        alt: "Hill country road in Sri Lanka, the kind of stretch visitors cover by private car or train",
      }}
      related={[
        { href: "/transport/private-driver", label: "Private driver", note: "Car or van with a local host" },
        { href: "/transport/airport-transfers", label: "Airport transfers", note: "CMB arrivals and returns" },
        { href: "/transport/routes", label: "Popular routes", note: "Times and booking links" },
        { href: "/transport/plan", label: "Route planner", note: "Map your own days" },
      ]}
    >
      <p>
        Sri Lanka is small on a map and slow on the road. Distances that look like a two-hour hop can take four once you
        add hills, trucks, rain, and town centres. That is why “what is the best transport in Sri Lanka?” has more than
        one answer.
      </p>

      <div className="grid gap-4 pt-2 sm:grid-cols-2">
        <TransportModeCard
          src="https://images.pexels.com/photos/322437/pexels-photo-322437.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Kandy, a typical first overnight with a private driver from Colombo"
          eyebrow="Best for most visitors"
          title="Private car or van with a driver"
          href="/transport/plan"
        >
          Hotel-to-hotel pickup, space for bags, and you can change the order of stops. You are buying fuel and the
          driver’s time—not a rental you have to drive yourself. Draw the itinerary, pick a vehicle, send a USD offer.
        </TransportModeCard>
        <TransportModeCard
          src="https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Green hills of Sri Lanka, home of the Kandy to Ella train"
          eyebrow="One scenic day"
          title="Train"
        >
          Worth it on a handful of highland lines (Kandy / Nanu Oya / Haputale / Ella). Seats on the pretty carriages
          sell out. Stations are rarely next to your hotel. Use the train as a highlight, not as your only logistics plan.
        </TransportModeCard>
        <TransportModeCard
          src="https://images.pexels.com/photos/1549326/pexels-photo-1549326.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Colombo street, typical of intercity bus and city traffic"
          eyebrow="Cheapest, slowest"
          title="Intercity bus"
        >
          How many Sri Lankans travel: cheap and frequent. Also standing-room, limited luggage, and little English on
          some routes. Fine for backpackers with time. Poor fit for a 10-day trip with a safari at dawn.
        </TransportModeCard>
        <TransportModeCard
          src="https://images.pexels.com/photos/319892/pexels-photo-319892.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Galle, where tuk-tuks are the right scale"
          eyebrow="In town only"
          title="Tuk-tuk"
        >
          Perfect inside Galle Fort, Ella town, or a beach strip. Agree the fare before you sit down, or use a host you
          already priced. Do not take a tuk-tuk from Colombo Airport to Ella.
        </TransportModeCard>
        <TransportModeCard
          src="https://images.pexels.com/photos/7400676/pexels-photo-7400676.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Hikkaduwa beach road, where visitors sometimes ride scooters"
          eyebrow="Beach towns if you already ride"
          title="Scooter and self-drive"
        >
          Common in Weligama, Mirissa, and Hikkaduwa. Insurance, horns, dogs, and sudden buses are real. If you have
          never ridden in South Asia, pay for a driver for the intercity days.
        </TransportModeCard>
        <TransportModeCard
          src="https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Airport-style departure scene for Colombo Bandaranaike arrivals"
          eyebrow="The mix that works"
          title="A pattern that works"
          href="/transport/plan?stops=cmb,kandy,ella"
        >
          Land at CMB → private transfer to your first region → one scenic train in the hills → private van for Yala or
          the east → return transfer to the airport. That mix shows up on almost every well-reviewed itinerary.
        </TransportModeCard>
      </div>
    </TransportGuideLayout>
  )
}
