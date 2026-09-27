const SCROLL_KEY = "islandfull:home-scroll"
const RESTORE_KEY = "islandfull:home-scroll-restore"

export function markHomeScrollForRestore() {
  if (typeof window === "undefined") return
  if (window.location.pathname !== "/") return
  sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)))
  sessionStorage.setItem(RESTORE_KEY, "1")
}

export function consumeHomeScrollRestore(): number | null {
  if (typeof window === "undefined") return null
  if (sessionStorage.getItem(RESTORE_KEY) !== "1") return null
  sessionStorage.removeItem(RESTORE_KEY)
  const raw = sessionStorage.getItem(SCROLL_KEY)
  sessionStorage.removeItem(SCROLL_KEY)
  const y = raw ? Number.parseInt(raw, 10) : 0
  return Number.isFinite(y) ? y : 0
}

export function shouldReturnViaHistory() {
  if (typeof window === "undefined") return false
  if (sessionStorage.getItem(RESTORE_KEY) === "1") return true
  try {
    return Boolean(document.referrer && new URL(document.referrer).origin === window.location.origin)
  } catch {
    return false
  }
}
