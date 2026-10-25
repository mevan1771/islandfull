import Link from "next/link"
import { TransportGuideLayout } from "@/components/transport/TransportGuideLayout"
import { pageMeta } from "@/lib/seo"
import { AIRPORT_FAQS, planUrl } from "@/lib/transport-seo"

export const metadata = pageMeta({
  title: "Colombo airport transfers (CMB) — private pickup in Sri Lanka",
  description:
    "Book a private transfer from Bandaranaike International Airport (CMB) to Colombo, Galle, Kandy, Ella, Sigiriya, and the south coast. Local hosts meet you at arrivals.",
  path: "/transport/airport-transfers",
  keywords: [
    "Colombo airport transfer",
    "CMB airport taxi",
    "Bandaranaike airport to Ella",
    "airport pickup Sri Lanka",
  ],
})

export default function AirportTransfersPage() {
  return (
    <TransportGuideLayout
      title="Colombo airport transfers (CMB)"
      lede="Bandaranaike International Airport sits in Katunayake, not downtown Colombo. A pre-booked host is the calmest way to start—or end—the trip."
      crumbs={[
        { name: "Home", path: "/" },
        { name: "Transport", path: "/transport" },
        { name: "Airport transfers", path: "/transport/airport-transfers" },
      ]}
      path="/transport/airport-transfers"
      serviceType="Airport transfer"
      planStops={["cmb"]}
      faqs={AIRPORT_FAQS}
      related={[
        { href: "/transport/routes/colombo-airport-to-galle", label: "CMB to Galle", note: "2–3 hours" },
        { href: "/transport/routes/colombo-airport-to-kandy", label: "CMB to Kandy", note: "3–4 hours" },
        { href: "/transport/routes/colombo-airport-to-ella", label: "CMB to Ella", note: "6–8 hours" },
        { href: "/transport/routes/colombo-airport-to-sigiriya", label: "CMB to Sigiriya", note: "4–5 hours" },
      ]}
    >
      <p>
        If you searched “taxi Colombo airport” you are in the right place. Official counters exist. Unofficial touts
        exist. Ride-hail pickup bays confuse people at 02:00. IslandFull lets you send the trip before you fly: airport
        as stop one, hotel as stop two, flight number in requests.
      </p>
      <h2 className="pt-4 text-xl font-black text-zinc-900">Typical times from CMB</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Negombo beach hotels — about 20–40 minutes (tell the host if this is you; it is not Colombo)</li>
        <li>Colombo city — 45–90 minutes</li>
        <li>Galle Fort / Hikkaduwa — 2–3 hours on the expressway</li>
        <li>Mirissa / Weligama — 3–4 hours</li>
        <li>Kandy — 3–4 hours</li>
        <li>Sigiriya — 4–5 hours</li>
        <li>Ella — 6–8 hours (consider breaking the journey if you land late)</li>
        <li>Arugam Bay — a full day</li>
      </ul>
      <p>
        Times move with rain and Friday traffic. They are planning numbers, not guarantees.{" "}
        <Link href="/transport/plan" className="font-semibold text-zinc-900 underline">
          Open the planner
        </Link>{" "}
        with CMB already in mind, or jump straight to{" "}
        <Link href={planUrl(["cmb", "galle"])} className="font-semibold text-zinc-900 underline">
          CMB → Galle
        </Link>
        .
      </p>
      <h2 className="pt-4 text-xl font-black text-zinc-900">Arrivals tips that actually help</h2>
      <p>
        Buy a local SIM in the hall if you want data before you meet the host. ATMs are there too. Keep a screenshot of
        the trip. If immigration is slow, message the host—do not start a second booking with someone at the barrier.
      </p>
      <h2 className="pt-4 text-xl font-black text-zinc-900">Going home</h2>
      <p>
        Add Colombo Airport as the last pin. For a morning long-haul, leave the south coast the afternoon before or
        sleep near the airport / Colombo. Hill country to CMB on the same morning as a 10:00 flight is how people miss
        planes.
      </p>
    </TransportGuideLayout>
  )
}
