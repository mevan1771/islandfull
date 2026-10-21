export const HOMEPAGE_PAGE_SIZE = 36

export const PUBLIC_VERTICALS = ["tour", "transport", "hotel"] as const
export type PublicVertical = (typeof PUBLIC_VERTICALS)[number]

export function publicVertical(value?: string | null): PublicVertical {
  if (value === "transport" || value === "hotel") return value
  return "tour"
}

export type HomepageActivity = {
  id: string
  title: string
  slug: string
  location: string
  duration: string
  priceUsd: number
  price_suffix: string | null
  discount_price: number | null
  deal_end_date: string | null
  coverImage: string
  isHiddenGem: boolean
  rating?: number
  reviewCount: number
  pricingModel: string
  maxGuests: number
  pricingTiers: unknown
  allowOffers?: boolean
  listingHref?: string
}

export type HomepageActivityFilters = {
  vertical?: string
  category?: string
  location?: string
  sort?: string
}

export type HomepageCategory = {
  name: string
  slug: string
  icon_url?: string | null
  category_type?: string
}

export type HomepageCategoryMap = Record<PublicVertical, HomepageCategory[]>

export function emptyHomepageCategoryMap(): HomepageCategoryMap {
  return { tour: [], transport: [], hotel: [] }
}
