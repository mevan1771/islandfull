const SCROLL_KEY = "islandfull:home-scroll"
const RESTORE_KEY = "islandfull:home-scroll-restore"
const HREF_KEY = "islandfull:home-return-href"
const SLUG_KEY = "islandfull:home-scroll-slug"
const HIST_KEY = "islandfull:home-scroll-hist"
const HEADER_KEY = "islandfull:home-header-hidden"
const TOP_KEY = "islandfull:home-scroll-top"
const PATH_FROM_KEY = "islandfull:path-from"
const LISTINGS_PIN_KEY = "islandfull:home-listings-pin"

let rememberedPath = ""
let rememberedFrom = ""

export function rememberPathname(pathname: string) {
  if (typeof window === "undefined" || !pathname) return
  if (!rememberedPath) {
    rememberedPath = pathname
    try {
      rememberedFrom = sessionStorage.getItem(PATH_FROM_KEY) || pathname
    } catch {
      rememberedFrom = pathname
    }
    return
  }
  if (pathname === rememberedPath) return
  rememberedFrom = rememberedPath
  rememberedPath = pathname
  try {
    sessionStorage.setItem(PATH_FROM_KEY, rememberedFrom)
  } catch {
    // Ignore private-mode storage failures.
  }
}

export function getPathFrom() {
  if (rememberedFrom) return rememberedFrom
  try {
    return sessionStorage.getItem(PATH_FROM_KEY) || ""
  } catch {
    return ""
  }
}

export function shouldResetHomeToTop() {
  if (peekHomeArriveTop()) return true
  const from = getPathFrom()
  if (!from || from === "/") return false
  return !from.startsWith("/activity")
}

let homeHeaderSuppressed = false

function safeHomeHref(href: string | null): string {
  if (!href || !href.startsWith("/") || href.startsWith("//") || href.includes("://")) {
    return "/"
  }
  const path = href.split("?")[0]
  if (path !== "/") return "/"
  return href
}

function lenisScrollY() {
  try {
    const value = (
      window as unknown as {
        __islandfullLenis?: { scroll?: number }
      }
    ).__islandfullLenis?.scroll
    return typeof value === "number" && Number.isFinite(value) ? value : 0
  } catch {
    return 0
  }
}

function currentScrollY() {
  return Math.round(
    Math.max(
      window.scrollY || 0,
      window.pageYOffset || 0,
      document.documentElement.scrollTop || 0,
      document.body.scrollTop || 0,
      lenisScrollY()
    )
  )
}

export function markHomeScrollForRestore(slug?: string) {
  if (typeof window === "undefined") return
  if (window.location.pathname !== "/") return
  try {
    sessionStorage.setItem(SCROLL_KEY, String(currentScrollY()))
    sessionStorage.setItem(RESTORE_KEY, "1")
    sessionStorage.setItem(HREF_KEY, safeHomeHref(window.location.pathname + window.location.search))
    if (slug) sessionStorage.setItem(SLUG_KEY, slug)
    else sessionStorage.removeItem(SLUG_KEY)
    sessionStorage.setItem(HIST_KEY, String(window.history.length))
    suppressHomeHeader()
  } catch {
    suppressHomeHeader()
  }
}

export function suppressHomeHeader() {
  homeHeaderSuppressed = true
  try {
    sessionStorage.setItem(HEADER_KEY, "1")
  } catch {
    // Ignore private-mode storage failures.
  }
}

export function isHomeHeaderSuppressed() {
  if (homeHeaderSuppressed) return true
  try {
    return sessionStorage.getItem(HEADER_KEY) === "1"
  } catch {
    return false
  }
}

export function revealHomeHeader() {
  homeHeaderSuppressed = false
  try {
    sessionStorage.removeItem(HEADER_KEY)
  } catch {
    // Ignore private-mode storage failures.
  }
}

export function markHomeArriveTop() {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(TOP_KEY, "1")
    sessionStorage.removeItem(RESTORE_KEY)
    sessionStorage.removeItem(SCROLL_KEY)
    sessionStorage.removeItem(SLUG_KEY)
  } catch {
    // Ignore private-mode storage failures.
  }
  jumpHomeScroll(0)
}

export function peekHomeArriveTop() {
  try {
    return sessionStorage.getItem(TOP_KEY) === "1"
  } catch {
    return false
  }
}

export function consumeHomeArriveTop() {
  const marked = peekHomeArriveTop()
  try {
    sessionStorage.removeItem(TOP_KEY)
  } catch {
    // Ignore private-mode storage failures.
  }
  return marked
}

export function hasHomeScrollRestore() {
  try {
    return sessionStorage.getItem(RESTORE_KEY) === "1"
  } catch {
    return false
  }
}

export function canBackToHomeScroll() {
  try {
    if (sessionStorage.getItem(RESTORE_KEY) !== "1") return false
    const marked = Number.parseInt(sessionStorage.getItem(HIST_KEY) || "", 10)
    if (!Number.isFinite(marked)) return window.history.length > 1
    return window.history.length >= marked && window.history.length > 1
  } catch {
    return false
  }
}

export function peekHomeReturnHref(): string {
  try {
    return safeHomeHref(sessionStorage.getItem(HREF_KEY))
  } catch {
    return "/"
  }
}

export function consumeHomeReturnHref(): string {
  try {
    const href = sessionStorage.getItem(HREF_KEY)
    sessionStorage.removeItem(HREF_KEY)
    return safeHomeHref(href)
  } catch {
    return "/"
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

export function peekHomeScrollSlug(): string | null {
  try {
    if (sessionStorage.getItem(RESTORE_KEY) !== "1") return null
    return sessionStorage.getItem(SLUG_KEY)
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
    sessionStorage.removeItem(SLUG_KEY)
  } catch {
    // Ignore private-mode storage failures.
  }
  return y
}

let clicksBlockedUntil = 0

export function blockHomeClicks(ms = 800) {
  clicksBlockedUntil = Date.now() + ms
}

export function homeClicksBlocked() {
  return Date.now() < clicksBlockedUntil
}

export function clearHomeScrollRestore() {
  try {
    sessionStorage.removeItem(RESTORE_KEY)
    sessionStorage.removeItem(SCROLL_KEY)
    sessionStorage.removeItem(SLUG_KEY)
    sessionStorage.removeItem(TOP_KEY)
  } catch {
    // Ignore private-mode storage failures.
  }
}

export function markHomeListingsPin() {
  if (typeof window === "undefined") return
  clearHomeScrollRestore()
  try {
    sessionStorage.setItem(LISTINGS_PIN_KEY, "1")
  } catch {
    // Ignore private-mode storage failures.
  }
}

export function peekHomeListingsPin() {
  try {
    return sessionStorage.getItem(LISTINGS_PIN_KEY) === "1"
  } catch {
    return false
  }
}

export function consumeHomeListingsPin() {
  const marked = peekHomeListingsPin()
  try {
    sessionStorage.removeItem(LISTINGS_PIN_KEY)
  } catch {
    // Ignore private-mode storage failures.
  }
  return marked
}

export function scrollHomeListingsToStart(options?: { blockClicks?: boolean }) {
  if (typeof window === "undefined") return
  const grid = document.getElementById("activity-grid-container")
  if (!grid) {
    jumpHomeScroll(0, options)
    return
  }
  const sticky = document.querySelector<HTMLElement>("[data-home-sticky]")
  const offset = sticky ? Math.ceil(sticky.getBoundingClientRect().height) : 0
  const y = Math.max(0, Math.round(window.scrollY + grid.getBoundingClientRect().top - offset - 8))
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  jumpHomeScroll(Math.min(y, max), options)
}

export function jumpHomeScroll(y: number, options?: { blockClicks?: boolean }) {
  if (typeof window === "undefined") return
  const top = Math.max(0, Math.round(y))
  if (options?.blockClicks !== false) blockHomeClicks()

  try {
    window.scrollTo({ top, left: 0, behavior: "instant" })
    document.documentElement.scrollTop = top
    document.body.scrollTop = top
  } catch {
    try {
      window.scrollTo(0, top)
    } catch {
      // Ignore browsers that reject programmatic scroll.
    }
  }

  try {
    const lenis = (
      window as unknown as {
        __islandfullLenis?: {
          scrollTo?: (value: number, options?: { immediate?: boolean; force?: boolean }) => void
          stop?: () => void
          start?: () => void
        }
      }
    ).__islandfullLenis
    lenis?.scrollTo?.(top, { immediate: true, force: true })
  } catch {
    // Lenis can throw if it is mid-destroy during route changes.
  }
}

export function restoreHomeScroll(): boolean {
  if (typeof window === "undefined") return false
  const y = peekHomeScrollRestore()
  if (y == null) return false
  jumpHomeScroll(y)
  return Math.abs(currentScrollY() - y) < 48
}

export function installHomeScrollPopstate() {
  if (typeof window === "undefined") return
  const win = window as unknown as { __islandfullHomePopstate?: boolean }
  if (win.__islandfullHomePopstate) return
  win.__islandfullHomePopstate = true
  window.addEventListener("popstate", () => {
    if (window.location.pathname !== "/") return
    const y = peekHomeScrollRestore()
    if (y != null) jumpHomeScroll(y)
  })
}

const PAGE_RETURN_KEY = "islandfull:page-return-stack"

function safeAppHref(href: string | null): string | null {
  if (!href || !href.startsWith("/") || href.startsWith("//") || href.includes("://")) return null
  const path = href.split("?")[0]
  if (path.startsWith("/admin") || path.startsWith("/host") || path.startsWith("/login")) return null
  return href
}

function readReturnStack(): string[] {
  try {
    const raw = sessionStorage.getItem(PAGE_RETURN_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((h): h is string => typeof h === "string") : []
  } catch {
    return []
  }
}

export function markPageReturn(href?: string) {
  if (typeof window === "undefined") return
  const value = safeAppHref(href || `${window.location.pathname}${window.location.search}`)
  if (!value) return
  const path = value.split("?")[0]
  if (path.startsWith("/activity")) return
  try {
    const stack = readReturnStack().filter((h) => h !== value)
    stack.push(value)
    sessionStorage.setItem(PAGE_RETURN_KEY, JSON.stringify(stack.slice(-8)))
  } catch {
    // Ignore private-mode storage failures.
  }
}

export function consumePageReturn(): string | null {
  try {
    const stack = readReturnStack()
    const href = stack.pop() || null
    sessionStorage.setItem(PAGE_RETURN_KEY, JSON.stringify(stack))
    return safeAppHref(href)
  } catch {
    return null
  }
}
