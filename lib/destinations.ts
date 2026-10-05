export type Destination = {
  id: number
  name: string
  image: string
  coordinates: { lat: number; lng: number }
  span: string
  comingSoon?: boolean
}

export type NearbyLink = {
  name: string
  note: string
}

export const DESTINATIONS: Destination[] = [
  {
    id: 1,
    name: "Galle",
    image: "https://images.pexels.com/photos/319892/pexels-photo-319892.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 6.0535, lng: 80.221 },
    span: "col-span-2 row-span-2 md:col-span-2 md:row-span-2",
  },
  {
    id: 2,
    name: "Sigiriya",
    image: "https://images.pexels.com/photos/35606860/pexels-photo-35606860.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 7.957, lng: 80.7603 },
    span: "col-span-1 row-span-2 md:col-span-2 md:row-span-1",
  },
  {
    id: 3,
    name: "Kandy",
    image: "https://images.pexels.com/photos/322437/pexels-photo-322437.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 7.2906, lng: 80.6337 },
    span: "col-span-1 row-span-1",
  },
  {
    id: 4,
    name: "Hikkaduwa",
    image: "https://images.pexels.com/photos/7400676/pexels-photo-7400676.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 6.1408, lng: 80.1014 },
    span: "col-span-1 row-span-1",
  },
  {
    id: 5,
    name: "Weligama",
    image: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 5.9735, lng: 80.4297 },
    span: "col-span-1 row-span-1",
  },
  {
    id: 6,
    name: "Yala",
    image: "https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 6.369, lng: 81.518 },
    span: "col-span-2 row-span-2 md:col-span-2 md:row-span-1",
  },
  {
    id: 7,
    name: "Ella",
    image: "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 6.8667, lng: 81.0466 },
    span: "col-span-1 row-span-1 md:col-span-1 md:row-span-1",
    comingSoon: true,
  },
  {
    id: 8,
    name: "Mirissa",
    image: "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 5.9483, lng: 80.4714 },
    span: "col-span-1 row-span-1",
    comingSoon: true,
  },
  {
    id: 9,
    name: "Colombo",
    image: "https://images.pexels.com/photos/1549326/pexels-photo-1549326.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 6.9271, lng: 79.8612 },
    span: "col-span-1 row-span-1",
    comingSoon: true,
  },
  {
    id: 10,
    name: "Trincomalee",
    image: "https://images.pexels.com/photos/1078983/pexels-photo-1078983.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 8.5874, lng: 81.2152 },
    span: "col-span-1 row-span-1",
    comingSoon: true,
  },
  {
    id: 11,
    name: "Nuwara Eliya",
    image: "https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 6.9497, lng: 80.7891 },
    span: "col-span-1 row-span-1",
    comingSoon: true,
  },
  {
    id: 12,
    name: "Arugam Bay",
    image: "https://images.pexels.com/photos/390051/surfer-wave-sunset-the-indian-ocean-390051.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 6.8404, lng: 81.8363 },
    span: "col-span-1 row-span-1",
    comingSoon: true,
  },
]

export function destinationSlug(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-")
}

export function destinationFromSlug(slug: string | null | undefined) {
  if (!slug) return null
  const key = slug.trim().toLowerCase()
  return DESTINATIONS.find((d) => destinationSlug(d.name) === key) ?? null
}

/** Curated travel corridors, not raw GPS nearest-neighbour. */
const NEARBY: Record<string, NearbyLink[]> = {
  Galle: [
    { name: "Hikkaduwa", note: "40 min north" },
    { name: "Weligama", note: "45 min east" },
    { name: "Mirissa", note: "1 hr east" },
    { name: "Colombo", note: "2 hr north" },
  ],
  Hikkaduwa: [
    { name: "Galle", note: "40 min south" },
    { name: "Colombo", note: "1.5 hr north" },
    { name: "Weligama", note: "1 hr south" },
  ],
  Weligama: [
    { name: "Mirissa", note: "15 min east" },
    { name: "Galle", note: "45 min west" },
    { name: "Hikkaduwa", note: "1 hr north" },
    { name: "Yala", note: "2.5 hr east" },
  ],
  Mirissa: [
    { name: "Weligama", note: "15 min west" },
    { name: "Galle", note: "1 hr west" },
    { name: "Yala", note: "2.5 hr east" },
  ],
  Yala: [
    { name: "Ella", note: "2 hr north" },
    { name: "Arugam Bay", note: "2 hr east" },
    { name: "Mirissa", note: "2.5 hr west" },
  ],
  Ella: [
    { name: "Nuwara Eliya", note: "2 hr west" },
    { name: "Yala", note: "2 hr south" },
    { name: "Kandy", note: "3 hr north" },
    { name: "Arugam Bay", note: "3 hr east" },
  ],
  Kandy: [
    { name: "Sigiriya", note: "2.5 hr north" },
    { name: "Nuwara Eliya", note: "2 hr south" },
    { name: "Ella", note: "3 hr south" },
    { name: "Colombo", note: "3 hr west" },
  ],
  Sigiriya: [
    { name: "Kandy", note: "2.5 hr south" },
    { name: "Trincomalee", note: "3 hr east" },
    { name: "Nuwara Eliya", note: "3.5 hr south" },
  ],
  Colombo: [
    { name: "Galle", note: "2 hr south" },
    { name: "Kandy", note: "3 hr east" },
    { name: "Hikkaduwa", note: "1.5 hr south" },
  ],
  Trincomalee: [
    { name: "Sigiriya", note: "3 hr west" },
    { name: "Arugam Bay", note: "4 hr south" },
  ],
  "Nuwara Eliya": [
    { name: "Ella", note: "2 hr east" },
    { name: "Kandy", note: "2 hr north" },
    { name: "Sigiriya", note: "3.5 hr north" },
  ],
  "Arugam Bay": [
    { name: "Yala", note: "2 hr west" },
    { name: "Ella", note: "3 hr west" },
    { name: "Trincomalee", note: "4 hr north" },
  ],
}

const byName = new Map(DESTINATIONS.map((d) => [d.name, d]))

/** Town names that count as “in this destination’s area” on listings. */
const AREA_ALIASES: Record<string, string[]> = {
  Galle: ["galle", "unawatuna"],
  Sigiriya: ["sigiriya", "habarana", "dambulla", "pidurangala", "minneriya", "polonnaruwa", "kandalama", "hurulu"],
  Kandy: ["kandy", "peradeniya"],
  Hikkaduwa: ["hikkaduwa"],
  Weligama: ["weligama"],
  Yala: ["yala", "tissamaharama", "tissa", "kataragama", "palatupana"],
  Ella: ["ella", "bandarawela"],
  Mirissa: ["mirissa", "dickwella", "dikwella", "kudawella", "hummanaya"],
  Colombo: ["colombo", "mount lavinia"],
  Trincomalee: ["trincomalee", "nilaveli", "uppuveli"],
  "Nuwara Eliya": ["nuwara eliya", "horton"],
  "Arugam Bay": ["arugam", "pottuvil"],
}

const AREA_RADIUS_KM = 55

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(s)))
}

function aliasesFor(name: string) {
  return AREA_ALIASES[name] ?? [name.toLowerCase()]
}

function locationHitsAliases(location: string, aliases: string[]) {
  return aliases.some((alias) => location.includes(alias))
}

export function activityBelongsToDestination(
  dest: Destination,
  location: string,
  coords?: { lat: number; lng: number } | null
) {
  const loc = (location || "").toLowerCase()
  if (locationHitsAliases(loc, aliasesFor(dest.name))) return true

  const labeledElsewhere = DESTINATIONS.some(
    (other) => other.name !== dest.name && locationHitsAliases(loc, aliasesFor(other.name))
  )
  if (labeledElsewhere) return false

  if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
    return haversineKm(coords, dest.coordinates) <= AREA_RADIUS_KM
  }
  return false
}

export function getNearbyDestinations(name: string) {
  return (NEARBY[name] || [])
    .map((link) => {
      const dest = byName.get(link.name)
      if (!dest) return null
      return { dest, note: link.note }
    })
    .filter((row): row is { dest: Destination; note: string } => Boolean(row))
}
