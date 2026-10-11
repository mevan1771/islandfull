"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Pencil, Star, Trash2, Loader2, Eye, EyeOff } from "lucide-react"
import { AdminSearchInput } from "@/components/admin/AdminSearchInput"
import { matchesAdminQuery } from "@/lib/admin-search"
import { deleteHotel, toggleHotelFeatured, toggleHotelStatus } from "@/app/actions/hotels"
import { PROPERTY_TYPES } from "@/lib/hotels"

function fromPrice(hotel: any) {
  const rates = (hotel.hotel_room_types || [])
    .filter((room: any) => room.is_active)
    .map((room: any) => Number(room.nightly_rate_usd) || 0)
  return rates.length ? Math.min(...rates) : 0
}

export function AdminHotelsTable({ items }: { items: any[] }) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => {
    return (items || []).filter((item) =>
      matchesAdminQuery(query, item.title, item.location, item.reference_code, item.property_type, item.address)
    )
  }, [items, query])

  return (
    <>
      <AdminSearchInput value={query} onChange={setQuery} placeholder="Search hotels by name or location" />
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 w-16">Image</th>
                <th className="px-6 py-4">Hotel</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Rooms</th>
                <th className="px-6 py-4">From</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    {items.length === 0 ? "No hotels yet. Click Add hotel." : "No matches for that search."}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-zinc-100 border border-zinc-200">
                        {item.cover_image_url ? (
                          <Image src={item.cover_image_url} alt="" width={120} height={120} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-zinc-200" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-zinc-900 max-w-[230px] truncate">{item.title}</div>
                        {item.reference_code && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200">
                            {item.reference_code}
                          </span>
                        )}
                        <HotelFeatured id={item.id} initial={!!item.is_featured} />
                      </div>
                      <div className="text-zinc-500 text-xs">{item.location}</div>
                    </td>
                    <td className="px-6 py-4 capitalize text-zinc-600">
                      {PROPERTY_TYPES.find((type) => type.slug === item.property_type)?.name || item.property_type}
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{(item.hotel_room_types || []).length}</td>
                    <td className="px-6 py-4 font-bold text-rose-500">${fromPrice(item)}</td>
                    <td className="px-6 py-4 text-center">
                      <HotelStatus id={item.id} initial={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/hotels/${item.id}/edit`} className="inline-flex items-center justify-center p-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <HotelDelete id={item.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function HotelStatus({ id, initial }: { id: string; initial: string }) {
  const [status, setStatus] = useState(initial)
  const [pending, setPending] = useState(false)
  const published = status === "published"
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        const next = published ? "draft" : "published"
        setStatus(next)
        const result = await toggleHotelStatus(id, status)
        if (!result.success) setStatus(status)
        setPending(false)
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
        published ? "bg-green-50 text-green-700 border-green-200" : "bg-zinc-50 text-zinc-600 border-zinc-200"
      }`}
    >
      {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      {published ? "PUBLISHED" : "DRAFT"}
    </button>
  )
}

function HotelFeatured({ id, initial }: { id: string; initial: boolean }) {
  const [on, setOn] = useState(initial)
  return (
    <button
      type="button"
      title="Feature"
      onClick={async () => {
        const next = !on
        setOn(next)
        const result = await toggleHotelFeatured(id, next)
        if (!result.success) setOn(on)
      }}
      className="flex items-center justify-center w-6 h-6 rounded-full border border-zinc-200"
    >
      <Star className={`w-3.5 h-3.5 ${on ? "fill-yellow-500 text-yellow-500" : "text-zinc-300"}`} />
    </button>
  )
}

function HotelDelete({ id }: { id: string }) {
  const [pending, setPending] = useState(false)
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        if (!window.confirm("Delete this hotel and its rooms?")) return
        setPending(true)
        const result = await deleteHotel(id)
        if (!result.success) alert(result.error)
        setPending(false)
      }}
      className="inline-flex items-center justify-center p-2 rounded-xl bg-white border border-zinc-200 hover:bg-rose-50 text-zinc-600 hover:text-rose-500"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
