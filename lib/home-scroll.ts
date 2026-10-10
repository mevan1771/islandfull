const SCROLL_KEY = "islandfull:home-scroll"
const RESTORE_KEY = "islandfull:home-scroll-restore"

export function markHomeScrollForRestore() {
  if (typeof window === "undefined") return
  if (window.location.pathname !== "/") return
  sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)))
  sessionStorage.setItem(RESTORE_KEY, "1")
}

export function peekHomeScrollRestore(): number | null {
  if (typeof window === "undefined") return null
  if (sessionStorage.getItem(RESTORE_KEY) !== "1") return null
  const raw = sessionStorage.getItem(SCROLL_KEY)
  const y = raw ? Number.parseInt(raw, 10) : 0
  return Number.isFinite(y) ? y : 0
}

export function consumeHomeScrollRestore(): number | null {
  const y = peekHomeScrollRestore()
  if (y == null) return null
  sessionStorage.removeItem(RESTORE_KEY)
  sessionStorage.removeItem(SCROLL_KEY)
  return y
}

export function jumpHomeScroll(y: number) {
  if (typeof window === "undefined") return

  document.documentElement.scrollTop = y
  document.body.scrollTop = y
  window.scrollTo({ top: y, left: 0, behavior: "instant" })

  const lenis = (window as Window & { lenis?: { scrollTo?: Function; scroll?: number; animatedScroll?: number; targetScroll?: number } }).lenis
    || (document.documentElement as HTMLElement & { __lenis?: { scrollTo?: Function; scroll?: number; animatedScroll?: number; targetScroll?: number } }).__lenis

  if (lenis) {
    if (typeof lenis.scrollTo === "function") {
      lenis.scrollTo(y, { immediate: true, force: true })
    }
    if ("scroll" in lenis) lenis.scroll = y
    if ("animatedScroll" in lenis) lenis.animatedScroll = y
    if ("targetScroll" in lenis) lenis.targetScroll = y
  }
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
