"use server"

import { supabase, supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import type { HotelRoomTypeInput } from "@/lib/hotels"
import { uniqueLocations } from "@/lib/locations"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

function parseRooms(raw: string): HotelRoomTypeInput[] {
  try {
    const parsed = JSON.parse(raw || "[]")
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function jsonStringList(raw: FormDataEntryValue | null): string[] {
  try {
    const parsed = JSON.parse(String(raw || "[]"))
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []
  } catch {
    return []
  }
}

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = generateSlug(base) || "hotel"
  let n = 1
  while (true) {
    let q = supabaseAdmin.from("hotels").select("id").eq("slug", slug)
    if (excludeId) q = q.neq("id", excludeId)
    const { data } = await q.maybeSingle()
    if (!data) return slug
    n += 1
    slug = `${generateSlug(base)}-${n}`
  }
}

async function generateSKU(): Promise<string> {
  const { data } = await supabaseAdmin
    .from("hotels")
    .select("reference_code")
    .not("reference_code", "is", null)
    .order("reference_code", { ascending: false })
    .limit(1)

  let next = 1
  const latest = data?.[0]?.reference_code as string | undefined
  if (latest) {
    const match = latest.match(/\d+$/)
    if (match) next = parseInt(match[0], 10) + 1
  }
  return `HT${next.toString().padStart(4, "0")}`
}

function hotelPayload(formData: FormData) {
  const starRaw = formData.get("star_rating") as string
  const latRaw = formData.get("latitude") as string
  const lngRaw = formData.get("longitude") as string
  return {
    title: String(formData.get("title") || "").trim(),
    host_id: (formData.get("host_id") as string) || null,
    location: uniqueLocations([String(formData.get("location") || "")])[0] || String(formData.get("location") || "").trim(),
    address: String(formData.get("address") || "").trim() || null,
    description: String(formData.get("description") || "").trim(),
    property_type: String(formData.get("property_type") || "boutique"),
    star_rating: starRaw ? parseInt(starRaw, 10) : null,
    cover_image_url: (formData.get("cover_image_url") as string) || null,
    gallery_urls: jsonStringList(formData.get("gallery_urls_json")),
    amenities: formData.getAll("amenities").map(String).filter(Boolean),
    check_in_time: String(formData.get("check_in_time") || "14:00"),
    check_out_time: String(formData.get("check_out_time") || "11:00"),
    latitude: latRaw ? parseFloat(latRaw) : null,
    longitude: lngRaw ? parseFloat(lngRaw) : null,
    contact_phone: String(formData.get("contact_phone") || "").trim() || null,
    contact_whatsapp: String(formData.get("contact_whatsapp") || "").trim() || null,
    commission_rate: parseFloat(String(formData.get("commission_rate") || "15")),
    is_custom_commission: formData.get("is_custom_commission") === "true",
    status: (formData.get("status") as string) === "published" ? "published" : "draft",
    is_featured: formData.get("is_featured") === "on",
  }
}

function roomRow(hotelId: string, room: HotelRoomTypeInput, index: number) {
  const occupancy = Math.max(1, Number(room.max_occupancy) || Number(room.max_adults) || 1)
  return {
    hotel_id: hotelId,
    name: room.name.trim() || `Room ${index + 1}`,
    description: room.description?.trim() || null,
    cover_image_url: room.cover_image_url || null,
    bed_config: room.bed_config?.trim() || null,
    room_size_sqm: room.room_size_sqm ? Number(room.room_size_sqm) : null,
    max_adults: Math.max(1, Number(room.max_adults) || 1),
    max_children: Math.max(0, Number(room.max_children) || 0),
    max_occupancy: occupancy,
    quantity: Math.max(1, Number(room.quantity) || 1),
    nightly_rate_usd: Math.max(0, Number(room.nightly_rate_usd) || 0),
    extra_adult_rate_usd: room.extra_adult_rate_usd ? Number(room.extra_adult_rate_usd) : null,
    amenities: Array.isArray(room.amenities) ? room.amenities : [],
    is_active: room.is_active !== false,
    sort_order: index,
    updated_at: new Date().toISOString(),
  }
}

async function syncRooms(hotelId: string, rooms: HotelRoomTypeInput[]) {
  const { data: existing } = await supabaseAdmin
    .from("hotel_room_types")
    .select("id")
    .eq("hotel_id", hotelId)

  const keep = new Set(rooms.map((r) => r.id).filter(Boolean))
  const toDelete = (existing || []).map((r) => r.id).filter((id) => !keep.has(id))
  if (toDelete.length) {
    await supabaseAdmin.from("hotel_room_types").delete().in("id", toDelete)
  }

  for (const [index, room] of rooms.entries()) {
    const row = roomRow(hotelId, room, index)
    if (room.id) {
      const { error } = await supabaseAdmin.from("hotel_room_types").update(row).eq("id", room.id)
      if (error) throw error
    } else {
      const { error } = await supabaseAdmin.from("hotel_room_types").insert(row)
      if (error) throw error
    }
  }
}

function revalidateHotels(slug?: string) {
  revalidatePath("/admin/hotels")
  revalidatePath("/", "layout")
  if (slug) revalidatePath(`/hotel/${slug}`)
}

export async function createHotel(formData: FormData) {
  try {
    const payload = hotelPayload(formData)
    if (!payload.title) return { success: false, error: "Hotel name is required" }
    const slug = await uniqueSlug(payload.title)
    const reference_code = await generateSKU()
    const { data, error } = await supabaseAdmin
      .from("hotels")
      .insert({ ...payload, slug, reference_code })
      .select("id, slug")
      .single()
    if (error || !data) return { success: false, error: error?.message || "Failed to create hotel" }
    await syncRooms(data.id, parseRooms(String(formData.get("rooms_json") || "[]")))
    revalidateHotels(data.slug)
    return { success: true, id: data.id }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create hotel" }
  }
}

export async function updateHotel(id: string, formData: FormData) {
  try {
    const payload = hotelPayload(formData)
    if (!payload.title) return { success: false, error: "Hotel name is required" }
    const slug = await uniqueSlug(payload.title, id)
    const { data, error } = await supabaseAdmin
      .from("hotels")
      .update({ ...payload, slug, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, slug")
      .single()
    if (error || !data) return { success: false, error: error?.message || "Failed to update hotel" }
    await syncRooms(id, parseRooms(String(formData.get("rooms_json") || "[]")))
    revalidateHotels(data.slug)
    return { success: true, id }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update hotel" }
  }
}

export async function deleteHotel(id: string) {
  const { error } = await supabaseAdmin.from("hotels").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidateHotels()
  return { success: true }
}

export async function toggleHotelStatus(id: string, currentStatus: string) {
  const next = currentStatus === "published" ? "draft" : "published"
  const { error } = await supabaseAdmin.from("hotels").update({ status: next }).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidateHotels()
  return { success: true }
}

export async function toggleHotelFeatured(id: string, isFeatured: boolean) {
  const { error } = await supabaseAdmin.from("hotels").update({ is_featured: isFeatured }).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidateHotels()
  return { success: true }
}

export async function getHotelForAdmin(id: string) {
  const { data: hotel, error } = await supabaseAdmin
    .from("hotels")
    .select("*, hosts(name, phone, email, contact_name)")
    .eq("id", id)
    .single()
  if (error || !hotel) return null
  const { data: rooms } = await supabaseAdmin
    .from("hotel_room_types")
    .select("*")
    .eq("hotel_id", id)
    .order("sort_order")
  return { ...hotel, rooms: rooms || [] }
}

export async function getPublishedHotel(slug: string) {
  const { data: hotel, error } = await supabase
    .from("hotels")
    .select("*, hosts(name, image_url, avatar_url)")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("is_paused", false)
    .maybeSingle()
  if (error || !hotel) return null
  const { data: rooms } = await supabase
    .from("hotel_room_types")
    .select("*")
    .eq("hotel_id", hotel.id)
    .eq("is_active", true)
    .order("sort_order")
  return { ...hotel, rooms: rooms || [] }
}
