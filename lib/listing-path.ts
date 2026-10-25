import { publicVertical, type PublicVertical } from "@/lib/homepage-feed"

export function verticalFromLocation(pathname: string, searchVertical?: string | null): PublicVertical {
  if (pathname === "/transport" || pathname.startsWith("/transport/")) return "transport"
  return publicVertical(searchVertical)
}

export function listingsHref(
  pathname: string,
  currentSearch: URLSearchParams,
  patch?: Record<string, string | null>
) {
  const next = new URLSearchParams(currentSearch.toString())
  if (pathname === "/transport") next.set("vertical", "transport")
  if (patch) {
    for (const [key, value] of Object.entries(patch)) {
      if (!value) next.delete(key)
      else next.set(key, value)
    }
  }
  const vertical = publicVertical(next.get("vertical"))
  if (vertical === "transport") {
    next.delete("vertical")
    const query = next.toString()
    return query ? `/transport?${query}` : "/transport"
  }
  if (vertical === "tour") next.delete("vertical")
  else next.set("vertical", vertical)
  const query = next.toString()
  return query ? `/?${query}` : "/"
}
