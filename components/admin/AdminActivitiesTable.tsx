"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Pencil } from "lucide-react"
import { StatusToggle } from "@/components/admin/StatusToggle"
import { FeaturedToggle } from "@/components/admin/FeaturedToggle"
import { DeleteTourButton } from "@/components/admin/DeleteTourButton"
import { AdminSearchInput } from "@/components/admin/AdminSearchInput"
import { matchesAdminQuery } from "@/lib/admin-search"

type CatalogKind = "tour" | "event" | "transport" | "place"

function categoryNames(activity: any): string[] {
  if (Array.isArray(activity.categories)) {
    return activity.categories.map((category: any) => category?.name).filter(Boolean)
  }
  if (activity.categories?.name) return [activity.categories.name]
  return []
}

function hostRecord(activity: any) {
  const host = activity.hosts
  return Array.isArray(host) ? host[0] : host
}

export function AdminActivitiesTable({
  items,
  kind,
  emptyMessage,
}: {
  items: any[]
  kind: CatalogKind
  emptyMessage: string
}) {
  const [query, setQuery] = useState("")
  const isPlace = kind === "place"
  const colSpan = isPlace ? 5 : 7

  const filtered = useMemo(() => {
    return (items || []).filter((item) => {
      const host = hostRecord(item)
      return matchesAdminQuery(
        query,
        item.title,
        item.location,
        item.reference_code,
        item.provider_name,
        item.duration,
        host?.name,
        host?.phone,
        host?.email,
        host?.contact_name,
        ...categoryNames(item)
      )
    })
  }, [items, query])

  const placeholder =
    kind === "place"
      ? "Search by name or location"
      : "Search by name, phone, or location"

  return (
    <>
      <AdminSearchInput value={query} onChange={setQuery} placeholder={placeholder} />
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 w-16">Image</th>
                <th className="px-6 py-4">Title & Location</th>
                {isPlace ? (
                  <th className="px-6 py-4">Time needed</th>
                ) : (
                  <>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Price</th>
                  </>
                )}
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-6 py-12 text-center text-zinc-500">
                    {items.length === 0 ? emptyMessage : "No matches for that search."}
                  </td>
                </tr>
              ) : (
                filtered.map((item: any) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-zinc-100 border border-zinc-200">
                        {item.cover_image_url ? (
                          <Image
                            src={item.cover_image_url}
                            alt={item.title}
                            width={120}
                            height={120}
                            className="w-full h-full object-cover"
                            quality={75}
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-200" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="font-bold text-zinc-900 max-w-[230px] truncate">{item.title}</div>
                        {item.reference_code && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200">
                            {item.reference_code}
                          </span>
                        )}
                        {!isPlace && <FeaturedToggle id={item.id} initialStatus={item.is_featured} />}
                      </div>
                      <div className="text-zinc-500 text-xs">{item.location}</div>
                    </td>
                    {isPlace ? (
                      <td className="px-6 py-4 text-zinc-600 font-medium">{item.duration}</td>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          {categoryNames(item).length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {categoryNames(item).map((name) => (
                                <span
                                  key={name}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200"
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600">
                              Uncategorized
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-zinc-600 font-medium">{item.duration}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-rose-500">${item.price_usd}</div>
                          <div className="text-zinc-400 text-[10px] mt-0.5 uppercase tracking-wide">
                            LKR {item.price_lkr_approx}
                          </div>
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 text-center">
                      <StatusToggle id={item.id} initialStatus={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/tours/${item.id}/edit`}
                          className="inline-flex items-center justify-center p-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 transition-colors shadow-sm"
                          title={`Edit ${kind}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteTourButton id={item.id} />
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
