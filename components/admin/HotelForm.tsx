"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import CreatableSelect from "react-select/creatable"
import { ArrowLeft, Loader2, Plus, Save, Trash2, Upload } from "lucide-react"
import imageCompression from "browser-image-compression"
import { createHotel, updateHotel } from "@/app/actions/hotels"
import { uploadToCloudinary } from "@/app/actions/upload"
import { emptyRoomType, HOTEL_AMENITIES, PROPERTY_TYPES, ROOM_AMENITIES, type HotelRoomTypeInput } from "@/lib/hotels"
import { locationSelectOptions } from "@/lib/locations"

async function uploadImage(file: File) {
  const compressed = await imageCompression(file, {
    maxSizeMB: 3,
    maxWidthOrHeight: 2500,
    initialQuality: 0.92,
    useWebWorker: true,
  })
  const data = new FormData()
  data.append("file", compressed)
  const result = await uploadToCloudinary(data)
  if (!result.success || !result.secure_url) throw new Error(result.error || "Upload failed")
  return result.secure_url as string
}

function AmenityPicks({
  options,
  selected,
  name,
  onToggle,
}: {
  options: readonly string[]
  selected: string[]
  name?: string
  onToggle?: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((item) => {
        const on = selected.includes(item)
        return (
          <label
            key={item}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium ${
              on ? "border-rose-500 bg-rose-50 text-rose-700" : "border-zinc-200 bg-white text-zinc-600"
            }`}
          >
            {name ? <input type="checkbox" name={name} value={item} defaultChecked={on} className="sr-only" /> : (
              <input type="checkbox" checked={on} onChange={() => onToggle?.(item)} className="sr-only" />
            )}
            {item}
          </label>
        )
      })}
    </div>
  )
}

const locationSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: "3rem",
    borderRadius: "1rem",
    border: state.isFocused ? "2px solid #f43f5e" : "2px solid #f4f4f5",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(244, 63, 94, 0.1)" : "none",
    "&:hover": {
      border: state.isFocused ? "2px solid #f43f5e" : "2px solid #f4f4f5",
    },
    padding: "0 8px",
  }),
  valueContainer: (base: any) => ({ ...base, padding: "0 8px" }),
  input: (base: any) => ({ ...base, margin: 0, padding: 0 }),
}

export default function HotelForm({
  initialData,
  hosts = [],
  existingLocations = [],
}: {
  initialData?: any
  hosts?: any[]
  existingLocations?: string[]
}) {
  const router = useRouter()
  const isEditing = !!initialData
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cover, setCover] = useState(initialData?.cover_image_url || "")
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery_urls || [])
  const [uploading, setUploading] = useState(false)
  const [location, setLocation] = useState(
    initialData?.location ? { label: initialData.location, value: initialData.location } : null
  )
  const [rooms, setRooms] = useState<HotelRoomTypeInput[]>(
    initialData?.rooms?.length
      ? initialData.rooms.map((room: any) => ({
          id: room.id,
          name: room.name || "",
          description: room.description || "",
          cover_image_url: room.cover_image_url || "",
          bed_config: room.bed_config || "1 King",
          room_size_sqm: room.room_size_sqm?.toString() || "",
          max_adults: room.max_adults || 2,
          max_children: room.max_children || 0,
          max_occupancy: room.max_occupancy || 2,
          quantity: room.quantity || 1,
          nightly_rate_usd: Number(room.nightly_rate_usd) || 0,
          extra_adult_rate_usd: room.extra_adult_rate_usd?.toString() || "",
          amenities: room.amenities || [],
          is_active: room.is_active !== false,
        }))
      : [emptyRoomType()]
  )

  const updateRoom = (index: number, patch: Partial<HotelRoomTypeInput>) => {
    setRooms((prev) => prev.map((room, i) => (i === index ? { ...room, ...patch } : room)))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    if (!location?.value) {
      setError("Choose a location, or type a new one")
      setIsSubmitting(false)
      return
    }
    formData.set("location", location.value)
    formData.set("cover_image_url", cover)
    formData.set("gallery_urls_json", JSON.stringify(gallery))
    formData.set("rooms_json", JSON.stringify(rooms))
    const result = isEditing ? await updateHotel(initialData.id, formData) : await createHotel(formData)
    if (result.success) {
      router.push("/admin/hotels")
      router.refresh()
    } else {
      setError(result.error || "Could not save hotel")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/hotels" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="w-4 h-4" />
          Hotels
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditing ? "Save hotel" : "Publish hotel"}
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-zinc-900">{isEditing ? "Edit hotel" : "Add hotel"}</h1>
        <p className="text-zinc-500 mt-1">Property details first, then each room type and nightly rate.</p>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 space-y-5">
        <h2 className="text-lg font-bold">Property</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Hotel name</span>
            <input name="title" required defaultValue={initialData?.title || ""} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4 font-medium" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Location</span>
            <CreatableSelect
              instanceId="hotel-location-select"
              placeholder="e.g. Ella or Tissamaharama"
              options={locationSelectOptions(existingLocations)}
              value={location}
              onChange={(next) => setLocation(next as { label: string; value: string } | null)}
              isClearable
              className="react-select-container font-medium text-zinc-900"
              classNamePrefix="react-select"
              styles={locationSelectStyles}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Property type</span>
            <select name="property_type" defaultValue={initialData?.property_type || "boutique"} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4 bg-white">
              {PROPERTY_TYPES.map((type) => (
                <option key={type.slug} value={type.slug}>{type.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Address</span>
            <input name="address" defaultValue={initialData?.address || ""} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4" />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Description</span>
            <textarea name="description" rows={5} defaultValue={initialData?.description || ""} className="w-full rounded-2xl border-2 border-zinc-100 px-4 py-3" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Star rating</span>
            <select name="star_rating" defaultValue={initialData?.star_rating || ""} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4 bg-white">
              <option value="">Unrated</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} star</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Host</span>
            <select name="host_id" defaultValue={initialData?.host_id || ""} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4 bg-white">
              <option value="">No host linked yet</option>
              {hosts.map((host: any) => (
                <option key={host.id} value={host.id}>{host.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Check-in</span>
            <input name="check_in_time" type="time" defaultValue={initialData?.check_in_time || "14:00"} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Check-out</span>
            <input name="check_out_time" type="time" defaultValue={initialData?.check_out_time || "11:00"} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Phone</span>
            <input name="contact_phone" defaultValue={initialData?.contact_phone || ""} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">WhatsApp</span>
            <input name="contact_whatsapp" defaultValue={initialData?.contact_whatsapp || ""} placeholder="9477..." className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4" />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-bold">Photos</h2>
        <div className="flex flex-wrap gap-3">
          <label className="relative flex h-28 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50">
            {cover ? <Image src={cover} alt="Cover" fill className="object-cover" /> : <Upload className="w-5 h-5 text-zinc-400" />}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setUploading(true)
                try {
                  setCover(await uploadImage(file))
                } catch (err: any) {
                  alert(err.message)
                }
                setUploading(false)
              }}
            />
          </label>
          {gallery.map((url) => (
            <button key={url} type="button" className="relative h-28 w-40 overflow-hidden rounded-2xl" onClick={() => setGallery((prev) => prev.filter((item) => item !== url))}>
              <Image src={url} alt="" fill className="object-cover" />
            </button>
          ))}
          <label className="flex h-28 w-40 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 text-sm font-semibold text-zinc-500">
            {uploading ? "Uploading…" : "Add gallery"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={async (e) => {
                const files = Array.from(e.target.files || [])
                setUploading(true)
                try {
                  const urls = await Promise.all(files.map(uploadImage))
                  setGallery((prev) => [...prev, ...urls].slice(0, 12))
                } catch (err: any) {
                  alert(err.message)
                }
                setUploading(false)
              }}
            />
          </label>
        </div>
        <p className="text-xs text-zinc-400">Cover is the first tile. Click a gallery photo to remove it.</p>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-bold">Hotel amenities</h2>
        <AmenityPicks options={HOTEL_AMENITIES} selected={initialData?.amenities || []} name="amenities" />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Room types</h2>
          <button
            type="button"
            onClick={() => setRooms((prev) => [...prev, emptyRoomType()])}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add room type
          </button>
        </div>
        {rooms.map((room, index) => (
          <div key={room.id || index} className="rounded-3xl border border-zinc-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Room {index + 1}</h3>
              {rooms.length > 1 && (
                <button type="button" onClick={() => setRooms((prev) => prev.filter((_, i) => i !== index))} className="text-zinc-400 hover:text-rose-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Name</span>
                <input value={room.name} onChange={(e) => updateRoom(index, { name: e.target.value })} placeholder="Deluxe Double" className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Nightly rate USD</span>
                <input type="number" min="0" step="1" value={room.nightly_rate_usd} onChange={(e) => updateRoom(index, { nightly_rate_usd: Number(e.target.value) })} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">How many rooms</span>
                <input type="number" min="1" value={room.quantity} onChange={(e) => updateRoom(index, { quantity: Number(e.target.value) })} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Beds</span>
                <input value={room.bed_config} onChange={(e) => updateRoom(index, { bed_config: e.target.value })} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Size m²</span>
                <input value={room.room_size_sqm} onChange={(e) => updateRoom(index, { room_size_sqm: e.target.value })} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Adults</span>
                <input type="number" min="1" value={room.max_adults} onChange={(e) => updateRoom(index, { max_adults: Number(e.target.value) })} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Children</span>
                <input type="number" min="0" value={room.max_children} onChange={(e) => updateRoom(index, { max_children: Number(e.target.value) })} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Max occupancy</span>
                <input type="number" min="1" value={room.max_occupancy} onChange={(e) => updateRoom(index, { max_occupancy: Number(e.target.value) })} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Extra adult USD</span>
                <input type="number" min="0" value={room.extra_adult_rate_usd} onChange={(e) => updateRoom(index, { extra_adult_rate_usd: e.target.value })} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4" />
              </label>
              <label className="space-y-1.5 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Room notes</span>
                <textarea value={room.description} onChange={(e) => updateRoom(index, { description: e.target.value })} rows={3} className="w-full rounded-2xl border-2 border-zinc-100 px-4 py-3" />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={room.is_active} onChange={(e) => updateRoom(index, { is_active: e.target.checked })} />
              Bookable
            </label>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-600 mb-2">Room amenities</p>
              <AmenityPicks
                options={ROOM_AMENITIES}
                selected={room.amenities}
                onToggle={(value) =>
                  updateRoom(index, {
                    amenities: room.amenities.includes(value)
                      ? room.amenities.filter((item) => item !== value)
                      : [...room.amenities, value],
                  })
                }
              />
            </div>
            <label className="relative flex h-24 w-36 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50">
              {room.cover_image_url ? (
                <Image src={room.cover_image_url} alt="" fill className="object-cover" />
              ) : (
                <span className="text-xs font-semibold text-zinc-500">Room photo</span>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    updateRoom(index, { cover_image_url: await uploadImage(file) })
                  } catch (err: any) {
                    alert(err.message)
                  }
                }}
              />
            </label>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 grid gap-4 md:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Status</span>
          <select name="status" defaultValue={initialData?.status || "published"} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4 bg-white">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-zinc-600">Commission %</span>
          <input name="commission_rate" type="number" step="0.01" defaultValue={initialData?.commission_rate ?? 15} className="w-full h-12 rounded-2xl border-2 border-zinc-100 px-4" />
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm font-semibold">
          <input type="checkbox" name="is_featured" defaultChecked={!!initialData?.is_featured} />
          Featured
        </label>
      </section>
    </form>
  )
}
