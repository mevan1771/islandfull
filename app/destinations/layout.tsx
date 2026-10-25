import type { Metadata } from "next"
import { pageMeta } from "@/lib/seo"

export const metadata: Metadata = pageMeta({
  title: "Sri Lanka destinations — Galle, Ella, Kandy, Sigiriya & more",
  description:
    "Explore Sri Lanka by region: Galle Fort, Ella, Kandy, Sigiriya, Yala, the south coast, and the east. Pair each place with tours, stays, and private transport.",
  path: "/destinations",
})

export default function DestinationsLayout({ children }: { children: React.ReactNode }) {
  return children
}
