import { Suspense } from "react"
import { TransportPlanClient } from "@/components/transport/TransportPlanClient"
import { JsonLd } from "@/components/seo/JsonLd"
import { pageMeta, breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo"

export const metadata = pageMeta({
  title: "Plan a Sri Lanka route — send your price to local drivers",
  description:
    "Map Colombo Airport, Kandy, Ella, Galle, Sigiriya and more. Choose car, van, tuk-tuk or scooter, then send an offer to local transport hosts in Sri Lanka. Pay only if a host accepts.",
  path: "/transport/plan",
  keywords: ["Sri Lanka route planner", "custom driver Sri Lanka", "send offer taxi Sri Lanka"],
})

export default function TransportPlanPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Transport", path: "/transport" },
            { name: "Plan a route", path: "/transport/plan" },
          ]),
          serviceJsonLd({
            name: "Custom Sri Lanka transport route planner",
            description:
              "Build a multi-stop trip and send your price to local car and van hosts.",
            path: "/transport/plan",
            serviceType: "Private driver booking",
          }),
        ]}
      />
      <h1 className="sr-only">Plan a private transport route in Sri Lanka</h1>
      <p className="sr-only">
        Pick pickup at Colombo Airport or any town, add stops, choose a vehicle, and send your offer to local hosts.
        Read how to get around Sri Lanka, private drivers, and airport transfers on IslandFull.
      </p>
      <Suspense fallback={null}>
        <TransportPlanClient />
      </Suspense>
    </>
  )
}
