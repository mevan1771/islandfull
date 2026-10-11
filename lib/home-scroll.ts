const SCROLL_KEY = "islandfull:home-scroll"
const RESTORE_KEY = "islandfull:home-scroll-restore"

export function markHomeScrollForRestore() {
  if (typeof window === "undefined") return
  if (window.location.pathname !== "/") return
  try {
    sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)))
    sessionStorage.setItem(RESTORE_KEY, "1")
  } catch {
    // Ignore private-mode storage failures.
  }
}

export function peekHomeScrollRestore(): number | null {
  if (typeof window === "undefined") return null
  try {
    if (sessionStorage.getItem(RESTORE_KEY) !== "1") return null
    const raw = sessionStorage.getItem(SCROLL_KEY)
    const y = raw ? Number.parseInt(raw, 10) : 0
    return Number.isFinite(y) ? y : 0
  } catch {
    return null
  }
}

export function consumeHomeScrollRestore(): number | null {
  const y = peekHomeScrollRestore()
  if (y == null) return null
  try {
    sessionStorage.removeItem(RESTORE_KEY)
    sessionStorage.removeItem(SCROLL_KEY)
  } catch {
    // Ignore private-mode storage failures.
  }
  return y
}

export function jumpHomeScroll(y: number) {
  if (typeof window === "undefined") return

  try {
    window.scrollTo(0, y)
  } catch {
    // Ignore browsers that reject programmatic scroll.
  }

  try {
    const lenis = (
      window as unknown as {
        __islandfullLenis?: {
          scrollTo?: (top: number, options?: { immediate?: boolean; force?: boolean }) => void
        }
      }
    ).__islandfullLenis
    lenis?.scrollTo?.(y, { immediate: true, force: true })
  } catch {
    // Lenis can throw if it is mid-destroy during route changes.
  }
}
