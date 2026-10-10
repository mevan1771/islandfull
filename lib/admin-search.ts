export function matchesAdminQuery(query: string, ...values: Array<string | number | null | undefined>) {
  const raw = query.trim().toLowerCase()
  if (!raw) return true

  const compactQuery = raw.replace(/[\s\-()+]/g, "")
  const haystack = values
    .filter((value) => value !== null && value !== undefined && String(value).length > 0)
    .join(" ")
    .toLowerCase()
  const compactHaystack = haystack.replace(/[\s\-()+]/g, "")

  return haystack.includes(raw) || (compactQuery.length > 0 && compactHaystack.includes(compactQuery))
}
