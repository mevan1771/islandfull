import { supabase } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"
import { Plus, Eye, EyeOff, Pencil } from "lucide-react"
import { StatusToggle } from "@/components/admin/StatusToggle"
import { FeaturedToggle } from "@/components/admin/FeaturedToggle"
import { DeleteTourButton } from "@/components/admin/DeleteTourButton"

export const dynamic = 'force-dynamic';

export default async function AdminToursDashboard() {
  const { data: tours, error } = await supabase
    .from('activities')
    .select('*, categories(name)')
    .eq('category_type', 'event')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Events</h1>
            <p className="text-zinc-500 mt-1">Manage your event catalog and onboard new organizers.</p>
          </div>
          <Link
            href="/admin/tours/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Event
          </Link>
        </div>



        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-16">Image</th>
                  <th className="px-6 py-4">Title & Location</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {!tours || tours.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                      No events found. Click "Add New Event" to create one.
                    </td>
                  </tr>
                ) : (
                  tours.map((t: any) => (
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
                          <div className="font-bold text-zinc-900 max-w-[230px] truncate">{t.title}</div>
                          {t.reference_code && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200">
                              {t.reference_code}
                            </span>
                          )}
                          <FeaturedToggle id={t.id} initialStatus={t.is_featured} />
                        </div>
                        <div className="text-zinc-500 text-xs">{t.location}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600">
                          {t.categories?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 font-medium">
                        {t.duration}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-rose-500">${t.price_usd}</div>
                        <div className="text-zinc-400 text-[10px] mt-0.5 uppercase tracking-wide">LKR {t.price_lkr_approx}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusToggle id={t.id} initialStatus={t.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/tours/${t.id}/edit`}
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 transition-colors shadow-sm"
                            title="Edit Event"
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

