export const HOTEL_AMENITIES = [
  "WiFi",
  "Pool",
  "Breakfast",
  "Restaurant",
  "Parking",
  "Air conditioning",
  "Spa",
  "Beach access",
  "Airport transfer",
  "Family rooms",
  "Bar",
  "Gym",
  "Garden",
  "Room service",
] as const

export const ROOM_AMENITIES = [
  "WiFi",
  "Air conditioning",
  "Ensuite bathroom",
  "Hot water",
  "Balcony",
  "Sea view",
  "Garden view",
  "TV",
  "Mini fridge",
  "Safe",
  "Workspace",
] as const

export const PROPERTY_TYPES = [
  { slug: "boutique", name: "Boutique" },
  { slug: "beach", name: "Beach" },
  { slug: "city", name: "City" },
  { slug: "villa", name: "Villa" },
  { slug: "resort", name: "Resort" },
  { slug: "homestay", name: "Homestay" },
  { slug: "guesthouse", name: "Guesthouse" },
] as const

export type HotelRoomTypeInput = {
  id?: string
  name: string
  description: string
  cover_image_url: string
  bed_config: string
  room_size_sqm: string
  max_adults: number
  max_children: number
  max_occupancy: number
  quantity: number
  nightly_rate_usd: number
  extra_adult_rate_usd: string
  amenities: string[]
  is_active: boolean
}

export function emptyRoomType(): HotelRoomTypeInput {
  return {
    name: "",
    description: "",
    cover_image_url: "",
    bed_config: "1 King",
    room_size_sqm: "",
    max_adults: 2,
    max_children: 0,
    max_occupancy: 2,
    quantity: 1,
    nightly_rate_usd: 0,
    extra_adult_rate_usd: "",
    amenities: ["WiFi", "Air conditioning"],
    is_active: true,
  }
}
