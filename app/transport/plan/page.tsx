import { TransportPlanClient } from "@/components/transport/TransportPlanClient"
import { HomeVerticalBar } from "@/components/home/HomeVerticalBar"

export const metadata = {
  title: "Plan a transport route | IslandFull",
  description: "Pick the places you’ll visit and send your price to car or van hosts in Sri Lanka.",
}

export default function TransportPlanPage() {
  return (
    <>
      <TransportPlanClient />
      <HomeVerticalBar />
    </>
  )
}
