export const SYSTEM_DEFAULT_LOCATIONS = [
  "Ella",
  "Mirissa",
  "Hiriketiya",
  "Sigiriya",
  "Kandy",
  "Arugam Bay",
  "Colombo",
] as const

function titleCaseLocation(loc: string) {
  return loc
    .trim()
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())
}

export function uniqueLocations(raw: Array<string | null | undefined>) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of raw) {
    const loc = titleCaseLocation(String(value || ""))
    if (!loc) continue
    const key = loc.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(loc)
  }
  return out
}

export function locationSelectOptions(existingLocations: string[] = []) {
  const defaults = SYSTEM_DEFAULT_LOCATIONS.map((loc) => ({ label: loc, value: loc }))
  const others = uniqueLocations(existingLocations)
    .filter((loc) => !SYSTEM_DEFAULT_LOCATIONS.includes(loc as (typeof SYSTEM_DEFAULT_LOCATIONS)[number]))
    .map((loc) => ({ label: loc, value: loc }))

  return [
    { label: "System Defaults", options: defaults },
    ...(others.length ? [{ label: "Other Locations", options: others }] : []),
  ]
}
