import Link from "next/link"
import { ArrowRight, Route } from "lucide-react"

export function TransportPlanEntry() {
  return (
    <Link
      href="/transport/plan"
      className="flex items-center gap-3 rounded-2xl bg-white border border-zinc-100 shadow-sm px-4 py-3 hover:border-rose-200 transition-colors"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500 shrink-0">
        <Route className="w-5 h-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-zinc-900">Plan a route</span>
        <span className="block text-sm text-zinc-500 truncate">Pick stops, send your price to car or van hosts</span>
      </span>
      <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
    </Link>
  )
}
