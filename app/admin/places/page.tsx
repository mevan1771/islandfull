import { supabase } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"
import { Plus, Pencil } from "lucide-react"
import { StatusToggle } from "@/components/admin/StatusToggle"
import { DeleteTourButton } from "@/components/admin/DeleteTourButton"

export const dynamic = "force-dynamic"

export default async function AdminPlacesDashboard() {
  const { data: places } = await supabase
    .from("activities")
    .select("*, categories(name)")
    .eq("category_type", "place")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Places / Must see</h1>
            <p className="text-zinc-500 mt-1">Free landmarks and sights. No calendar, no booking.</p>
          </div>
          <Link
            href="/admin/tours/new?type=place"
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Place
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-16">Image</th>
                  <th className="px-6 py-4">Title & Location</th>
                  <th className="px-6 py-4">Time needed</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {!places || places.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      No places yet. Add Hummanaya, Sigiriya Rock, Galle Fort, and other must-sees here.
                    </td>
                  </tr>
                ) : (
                  places.map((t: any) => (
                    <tr key={t.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-zinc-100 border border-zinc-200">
                          {t.cover_image_url ? (
                            <Image
                              src={t.cover_image_url}
                              alt={t.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-200" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="font-bold text-zinc-900 max-w-[280px] truncate">{t.title}</div>
                          {t.reference_code && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200">
                              {t.reference_code}
                            </span>
                          )}
                        </div>
                        <div className="text-zinc-500 text-xs">{t.location}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 font-medium">{t.duration}</td>
                      <td className="px-6 py-4 text-center">
                        <StatusToggle id={t.id} initialStatus={t.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/tours/${t.id}/edit`}
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 transition-colors shadow-sm"
                            title="Edit Place"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <DeleteTourButton id={t.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
