import { X } from "lucide-react"

export function SheetGreetingHeader({
  title,
  subtitle,
  onClose,
  firstName,
  imageUrl,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  firstName?: string | null
  imageUrl?: string | null
}) {
  const greeting = firstName ? `${title}, ${firstName}` : title
  const initial = (firstName || "?").charAt(0).toUpperCase()

  return (
    <div className="shrink-0 p-4 border-b border-gray-100 flex justify-between items-center gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {firstName && (
          imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="w-9 h-9 rounded-full object-cover ring-2 ring-zinc-100 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-zinc-900 text-white text-sm font-bold flex items-center justify-center shrink-0">
              {initial}
            </div>
          )
        )}
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight truncate">{greeting}</h2>
          {subtitle ? <p className="text-sm text-zinc-500 line-clamp-1">{subtitle}</p> : null}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-full hover:bg-gray-100 text-zinc-500 shrink-0"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
