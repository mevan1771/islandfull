import { Check } from "lucide-react"
import type { InclusionItem } from "@/lib/inclusions"

function IconMark({ icon_url }: { icon_url: string | null }) {
  if (icon_url) {
    return (
      <img
        src={icon_url}
        alt=""
        className="h-14 w-14 shrink-0 object-contain md:h-16 md:w-16"
      />
    )
  }
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500 shadow-sm">
      <Check className="h-3.5 w-3.5 text-white" />
    </div>
  )
}

export function InclusionBullets({
  items,
  variant = "tour",
}: {
  items: InclusionItem[]
  variant?: "tour" | "place"
}) {
  if (!items.length) return null

  if (variant === "place") {
    return (
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={`${item.text}-${i}`} className="flex items-start gap-2.5 text-sm md:text-[15px] text-gray-700 leading-relaxed">
            {item.icon_url ? (
              <img src={item.icon_url} alt="" className="mt-0.5 h-7 w-7 shrink-0 object-contain" />
            ) : (
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
            )}
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="grid w-full grid-cols-2 gap-x-6 gap-y-5">
      {items.map((item, i) => (
        <li key={`${item.text}-${i}`} className="flex items-center gap-3">
          <IconMark icon_url={item.icon_url} />
          <span className="text-base font-semibold leading-snug text-gray-800 md:text-lg">{item.text}</span>
        </li>
      ))}
    </ul>
  )
}
