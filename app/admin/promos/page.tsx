import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Tag, CheckCircle2, XCircle } from "lucide-react"

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic';

export default async function AdminPromosPage() {
  const cookieStore = await cookies()
  const supabaseClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabaseClient.from('users').select('role').eq('id', user.id).single()
  const { data: roleData } = await supabaseClient.from('user_roles').select('role').eq('user_id', user.id).single()
  const isAdmin = (profile?.role === 'admin') || (roleData?.role === 'admin')

  if (!isAdmin) {
    redirect('/admin')
  }

  const { data: promos } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Admin Operations</h1>
            <p className="text-zinc-500 mt-1">Manage active promo codes and discounts.</p>
          </div>
          <div className="px-4 py-2 bg-rose-50 rounded-lg text-rose-600 font-semibold border border-rose-100 shadow-sm text-sm">
            Total Promos: {promos?.length || 0}
          </div>
        </div>

        

        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-rose-500" />
              Promo Code Management
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Currently, you must create and edit promo codes directly in the Supabase Dashboard. This page displays a read-only list of all codes.
            </p>
          </div>
          <a 
            href="https://supabase.com/dashboard/project/_/editor" 
            target="_blank" 
            rel="noreferrer"
            className="px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors text-sm whitespace-nowrap"
          >
            Open Supabase
          </a>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Min Order Value</th>
                  <th className="px-6 py-4">Usage</th>
                  <th className="px-6 py-4">Expires At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {!promos || promos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      No promo codes found.
                    </td>
                  </tr>
                ) : (
                  promos.map((p: any) => {
                    const isExpired = new Date(p.expires_at) < new Date();
                    const isExhausted = p.current_uses >= p.max_uses;
                    const isActive = p.is_active && !isExpired && !isExhausted;

                    return (
                      <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                              <XCircle className="w-3.5 h-3.5" />
                              {isExpired ? 'EXPIRED' : isExhausted ? 'EXHAUSTED' : 'DISABLED'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-md">{p.code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-rose-500">${p.discount_amount_usd}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 font-medium">
                          ${p.min_order_value_usd}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-zinc-900">{p.current_uses}</span>
                          <span className="text-zinc-400"> / {p.max_uses}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500">
                          {new Date(p.expires_at).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

