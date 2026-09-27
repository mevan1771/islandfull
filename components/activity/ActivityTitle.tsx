export function ActivityTitle({ title, location }: { title: string; location?: string }) {
  const place = location?.replace(", Sri Lanka", "")

  return (
    <h1 className="flex items-center w-full md:w-fit max-w-full gap-2 md:gap-3 bg-white border border-zinc-200 shadow-sm rounded-full pl-1 pr-3.5 py-1 md:pl-1.5 md:pr-5 md:py-1.5">
      {place && (
        <span className="shrink-0 rounded-full bg-[#fa385f] text-white text-[11px] md:text-sm font-bold uppercase tracking-wider px-2.5 md:px-5 py-1 md:py-2">
          {place}
        </span>
      )}
      <span className="min-w-0 text-base sm:text-lg md:text-2xl font-bold tracking-tight text-slate-700 leading-snug">
        {title}
      </span>
    </h1>
  )
}
