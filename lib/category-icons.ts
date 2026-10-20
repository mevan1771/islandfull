const DEFAULT_ICONS: Record<string, string> = {
  adventure: "/images/categories/adventure.jpg",
  hiking: "/images/categories/hiking.jpg",
  "hiking-treks": "/images/categories/hiking.jpg",
  "hiking treks": "/images/categories/hiking.jpg",
  history: "/images/categories/history.jpg",
  "culture-history": "/images/categories/history.jpg",
  "culture history": "/images/categories/history.jpg",
  surf: "/images/categories/surf.jpg",
  safari: "/images/categories/safari.jpg",
  safaris: "/images/categories/safari.jpg",
  "wildlife-safaris": "/images/categories/safari.jpg",
  "wildlife safaris": "/images/categories/safari.jpg",
  wildlife: "/images/categories/wildlife.jpg",
  diving: "/images/categories/diving.jpg",
  cooking: "/images/categories/cooking.jpg",
  spicy: "/images/categories/spicy.jpg",
  spices: "/images/categories/spicy.jpg",
  spice: "/images/categories/spicy.jpg",
  sightseeing: "/images/categories/sightseeing.jpg",
  siteseeing: "/images/categories/sightseeing.jpg",
  "boat-ride": "/images/categories/boat-ride.jpg",
  "boat ride": "/images/categories/boat-ride.jpg",
  "boat rides": "/images/categories/boat-ride.jpg",
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
  if (category.icon_url) return category.icon_url

  const slug = keyFrom(category.slug).replace(/ /g, "-")
  const name = keyFrom(category.name)
  return DEFAULT_ICONS[slug] || DEFAULT_ICONS[name] || DEFAULT_ICONS[name.replace(/s$/, "")] || null
}
