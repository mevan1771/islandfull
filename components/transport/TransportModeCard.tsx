import Image from "next/image"
import Link from "next/link"

export function TransportModeCard({
  src,
  alt,
  eyebrow,
  title,
  href,
  children,
}: {
  src: string
  alt: string
  eyebrow: string
  title: string
  href?: string
  children: React.ReactNode
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_24px_rgba(15,15,15,0.04)]">
      <div className="relative aspect-[16/10] bg-zinc-100">
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 360px" />
      </div>
      <div className="p-4 md:p-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-black tracking-tight text-zinc-900">{title}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">{children}</p>
        {href ? (
          <Link href={href} className="mt-3 inline-block text-sm font-bold text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900">
            Plan this route
          </Link>
        ) : null}
      </div>
    </article>
  )
}
