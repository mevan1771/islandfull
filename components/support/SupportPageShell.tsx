import Image from "next/image"
import { SupportSubnav } from "@/components/support/SupportSubnav"

export function SupportPageShell({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  children,
}: {
  title: string
  subtitle: string
  imageSrc: string
  imageAlt: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="relative h-[42vh] min-h-[280px] max-h-[460px] overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-zinc-900/25" />
        <div className="relative h-full max-w-5xl mx-auto px-4 md:px-8 flex flex-col justify-end pb-8 md:pb-12">
          <p className="text-rose-300 text-[11px] font-bold tracking-[0.22em] uppercase mb-2">
            IslandFull
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            {title}
          </h1>
          <p className="mt-3 text-white/85 max-w-2xl text-sm md:text-lg leading-relaxed">
            {subtitle}
          </p>
        </div>
      </section>

      <SupportSubnav />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16">{children}</div>
    </div>
  )
}
