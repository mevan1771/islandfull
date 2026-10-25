import { TransportGuideLayout } from "@/components/transport/TransportGuideLayout"
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
      <h2 className="pt-4 text-xl font-black text-zinc-900">Private car or van with a driver</h2>
      <p>
        This is the default for most international visitors moving between regions. You get hotel-to-hotel pickup,
        space for bags, and the right to change the order of stops. IslandFull is built for this: you draw the itinerary,
        pick a vehicle, and send a USD offer to local hosts. Fuel and the driver’s time are what you are buying—not a
        rental car you have to drive yourself.
      </p>
      <h2 className="pt-4 text-xl font-black text-zinc-900">Train</h2>
      <p>
        Worth it on a handful of lines, especially in the highlands (Kandy / Nanu Oya / Haputale / Ella). It is not a
        complete national network for tourists. Seats on the pretty carriages sell out. Stations are rarely next to your
        hotel. Use the train as a highlight, not as your only logistics plan.
      </p>
      <h2 className="pt-4 text-xl font-black text-zinc-900">Intercity bus</h2>
      <p>
        Cheap, frequent, and how many Sri Lankans travel. Also standing-room, limited luggage space, and little English
        on some routes. Fine if you are backpacking on a tight budget and have time. Poor fit for a 10-day trip with
        safari jeeps at dawn.
      </p>
      <h2 className="pt-4 text-xl font-black text-zinc-900">Tuk-tuk</h2>
      <p>
        Perfect inside Galle Fort, Ella town, or a beach strip. Agree the fare before you sit down, or use a host you
        already priced. Do not take a tuk-tuk from Colombo Airport to Ella.
      </p>
      <h2 className="pt-4 text-xl font-black text-zinc-900">Scooter and self-drive</h2>
      <p>
        Common in Weligama, Mirissa, and Hikkaduwa if you already ride. Insurance, horns, dogs, and sudden buses are
        real. If you have never ridden in South Asia, pay for a driver for the intercity days.
      </p>
      <h2 className="pt-4 text-xl font-black text-zinc-900">A pattern that works</h2>
      <p>
        Land at CMB → private transfer to your first region → one scenic train in the hills → private van for Yala or
        the east → return transfer to the airport. That mix shows up on almost every well-reviewed itinerary because it
        respects both the landscape and your time.
      </p>
    </TransportGuideLayout>
  )
}
