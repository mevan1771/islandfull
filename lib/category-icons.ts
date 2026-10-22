const ICON_V = "20261022png"

const tour = (file: string) => `/images/categories/${file}?v=${ICON_V}`
const transport = (file: string) => `/images/transport/${file}?v=${ICON_V}`
const hotel = (file: string) => `/images/hotels/${file}?v=${ICON_V}`

const DEFAULT_ICONS: Record<string, string> = {
  adventure: tour("adventure.png"),
  hiking: tour("hiking.png"),
  "hiking-treks": tour("hiking.png"),
  "hiking treks": tour("hiking.png"),
  history: tour("history.png"),
  "culture-history": tour("history.png"),
  "culture history": tour("history.png"),
  surf: tour("surf.png"),
  safari: tour("safari.png"),
  safaris: tour("safari.png"),
  "wildlife-safaris": tour("safari.png"),
  "wildlife safaris": tour("safari.png"),
  wildlife: tour("wildlife.png"),
  wild: tour("wildlife.png"),
  diving: tour("diving.png"),
  cooking: tour("cooking.png"),
  spicy: tour("spicy.png"),
  spices: tour("spicy.png"),
  spice: tour("spicy.png"),
  sightseeing: tour("sightseeing.png"),
  siteseeing: tour("sightseeing.png"),
  "boat-ride": tour("boat-ride.png"),
  "boat ride": tour("boat-ride.png"),
  "boat rides": tour("boat-ride.png"),
  boat: tour("boat-ride.png"),

  air: transport("air.jpg"),
  helicopter: transport("air.jpg"),
  bus: transport("bus.jpg"),
  buses: transport("bus.jpg"),
  car: transport("car.jpg"),
  cars: transport("car.jpg"),
  "e-bike": transport("e-bike.jpg"),
  ebike: transport("e-bike.jpg"),
  "e bike": transport("e-bike.jpg"),
  scooter: transport("scooter.jpg"),
  scooters: transport("scooter.jpg"),
  train: transport("train.jpg"),
  trains: transport("train.jpg"),
  van: transport("van.jpg"),
  vans: transport("van.jpg"),
  "tuk-tuk": transport("tuk-tuk.jpg"),
  tuktuk: transport("tuk-tuk.jpg"),
  "tuk tuk": transport("tuk-tuk.jpg"),

  boutique: hotel("boutique.jpg"),
  beach: hotel("beach.jpg"),
  city: hotel("city.jpg"),
  villa: hotel("villa.jpg"),
  villas: hotel("villa.jpg"),
  resort: hotel("resort.jpg"),
  resorts: hotel("resort.jpg"),
  homestay: hotel("homestay.jpg"),
  "home-stay": hotel("homestay.jpg"),
  "home stay": hotel("homestay.jpg"),
  guesthouse: hotel("guesthouse.jpg"),
  "guest-house": hotel("guesthouse.jpg"),
  "guest house": hotel("guesthouse.jpg"),
}

function keyFrom(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

export function resolveCategoryIcon(category: {
  slug?: string | null
  name?: string | null
  icon_url?: string | null
}) {
  const slug = keyFrom(category.slug).replace(/ /g, "-")
  const name = keyFrom(category.name)
  return (
    DEFAULT_ICONS[slug] ||
    DEFAULT_ICONS[name] ||
    DEFAULT_ICONS[name.replace(/s$/, "")] ||
    category.icon_url ||
    null
  )
}

export const ALL_CATEGORY_ICON = tour("all.png")
export const SAVED_CATEGORY_ICON = tour("heart.png")
