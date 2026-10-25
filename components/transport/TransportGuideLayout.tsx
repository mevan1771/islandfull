import Link from "next/link"
import { FaqList } from "@/components/seo/FaqList"
import { JsonLd } from "@/components/seo/JsonLd"
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/seo"
import { planUrl } from "@/lib/transport-seo"

type Crumb = { name: string; path: string }

export function TransportGuideLayout({
  title,
  lede,
  crumbs,
  path,
  serviceType,
  faqs,
  related,
  planStops,
  children,
}: {
  title: string
  lede: string
  crumbs: Crumb[]
  path: string
  serviceType: string
  faqs: { question: string; answer: string }[]
  related?: { href: string; label: string; note?: string }[]
  planStops?: string[]
  children: React.ReactNode
}) {
  const cta = planUrl(planStops || [])
  return (
    <article className="bg-zinc-50">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          serviceJsonLd({ name: title, description: lede, path, serviceType }),
          faqJsonLd(faqs),
        ]}
      />
      <header className="border-b border-zinc-200 bg-zinc-900 text-white">
        <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
          <nav aria-label="Breadcrumb" className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-white/50">
            {crumbs.map((crumb, index) => (
              <span key={crumb.path}>
                {index > 0 ? <span className="mx-1.5 text-white/30">/</span> : null}
                {index === crumbs.length - 1 ? (
                  <span className="text-white/80">{crumb.name}</span>
                ) : (
                  <Link href={crumb.path} className="hover:text-white">
                    {crumb.name}
                  </Link>
                )}
              </span>
            ))}
          </nav>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFC72C]">Sri Lanka transport</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">{lede}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={cta}
              className="inline-flex h-11 items-center rounded-xl bg-[#FFC72C] px-5 text-sm font-bold text-zinc-900 hover:bg-[#f0b820]"
            >
              Plan this route
            </Link>
            <Link
              href="/transport"
              className="inline-flex h-11 items-center rounded-xl border border-white/20 px-5 text-sm font-semibold text-white hover:bg-white/10"
            >
              All transport options
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
        <div className="space-y-5 text-[15px] leading-relaxed text-zinc-700 md:text-base">{children}</div>
        <FaqList faqs={faqs} />
        {related && related.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-2xl font-black tracking-tight text-zinc-900">Keep planning</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-2xl border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400"
                  >
                    <span className="font-semibold text-zinc-900">{item.label}</span>
                    {item.note ? <span className="mt-0.5 block text-xs text-zinc-500">{item.note}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <div className="sticky bottom-0 z-20 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <Link
          href={cta}
          className="flex h-11 items-center justify-center rounded-xl bg-[#FFC72C] text-sm font-bold text-zinc-900"
        >
          Send an offer to local drivers
        </Link>
      </div>
    </article>
  )
}
