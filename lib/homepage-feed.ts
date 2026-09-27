export const HOMEPAGE_PAGE_SIZE = 36

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
}

export type HomepageActivityFilters = {
  vertical?: string
  category?: string
  location?: string
  sort?: string
}
