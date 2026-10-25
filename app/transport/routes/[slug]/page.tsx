import { notFound } from "next/navigation"
import Link from "next/link"
import { TransportGuideLayout } from "@/components/transport/TransportGuideLayout"
import { pageMeta } from "@/lib/seo"
import { TRANSPORT_ROUTES, planUrl, routeBySlug } from "@/lib/transport-seo"
import { stopById } from "@/lib/transport-route"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return TRANSPORT_ROUTES.map((route) => ({ slug: route.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const route = routeBySlug(slug)
  if (!route) return { title: "Route" }
  return pageMeta({
    title: route.title,
    description: route.description,
    path: `/transport/routes/${route.slug}`,
  })
}

export default async function TransportRoutePage({ params }: Props) {
  const { slug } = await params
  const route = routeBySlug(slug)
  if (!route) notFound()

  const from = stopById(route.fromId)?.name || route.fromId
  const to = stopById(route.toId)?.name || route.toId
  const stopIds = [route.fromId, ...(route.viaIds || []), route.toId]
  const related = TRANSPORT_ROUTES.filter((item) => item.slug !== route.slug)
    .slice(0, 4)
    .map((item) => ({
      href: `/transport/routes/${item.slug}`,
      label: item.h1,
      note: item.hours,
    }))

  return (
    <TransportGuideLayout
      title={route.h1}
      lede={route.intro}
      crumbs={[
        { name: "Home", path: "/" },
        { name: "Transport", path: "/transport" },
        { name: "Routes", path: "/transport/routes" },
        { name: route.h1, path: `/transport/routes/${route.slug}` },
      ]}
      path={`/transport/routes/${route.slug}`}
      serviceType={`Private transfer ${from} to ${to}`}
      faqs={route.faqs}
      planStops={stopIds}
      related={[
        ...related,
        { href: "/transport/plan", label: "Custom route", note: "Add more stops" },
      ]}
    >
      <div className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-zinc-200 sm:grid-cols-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">Time</p>
          <p className="text-sm font-semibold text-zinc-900">{route.hours}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">Distance</p>
          <p className="text-sm font-semibold text-zinc-900">{route.km}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">Best for</p>
          <p className="text-sm font-semibold text-zinc-900">{route.bestFor}</p>
        </div>
      </div>
      {route.body.map((paragraph) => (
        <p key={paragraph.slice(0, 40)}>{paragraph}</p>
      ))}
      <h2 className="pt-4 text-xl font-black text-zinc-900">Before you go</h2>
      <ul className="list-disc space-y-1 pl-5">
        {route.tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
      <p>
        Ready?{" "}
        <Link href={planUrl(stopIds)} className="font-semibold text-zinc-900 underline">
          Open the planner with {from} → {to}
        </Link>{" "}
        already pinned, then add extra towns if you need them.
      </p>
    </TransportGuideLayout>
  )
}
