import type { Metadata } from "next"
import { pageMeta } from "@/lib/seo"

export const metadata: Metadata = pageMeta({
  title: "Sri Lanka map — tours, hotels and transport on one island",
  description:
    "See IslandFull tours, stays, and places on a map of Sri Lanka. Filter by type and jump from a pin to booking.",
  path: "/map",
})

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children
}
