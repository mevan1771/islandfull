import { supabase } from "@/lib/supabase"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Users } from "lucide-react"

export const dynamic = 'force-dynamic';

export default async function AdminLedgerPage() {
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

    const { data: partners } = await supabase
        .from('promo_codes')
        .select('*, affiliate_partners(name, logo_url)')
        .not('partner_id', 'is', null)
        .order('total_partner_earnings', { ascending: false });

    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Partner Ledger</h1>
                        <p className="text-zinc-500 mt-1">Track affiliate partner earnings and commissions.</p>
                    </div>
                    <div className="px-4 py-2 bg-indigo-50 rounded-lg text-indigo-600 font-semibold border border-indigo-100 shadow-sm text-sm">
                        Total Partners: {partners?.length || 0}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            Affiliate Earnings
                        </h2>
                        <p className="text-sm text-zinc-500 mt-1">
                            This ledger automatically tracks earnings for promo codes assigned to partners. Earnings increment automatically when a booking is paid.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[11px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Partner</th>
                                    <th className="px-6 py-4">Promo Code</th>
                                    <th className="px-6 py-4">Commission Rate</th>
                                    <th className="px-6 py-4">Total Uses</th>
                                    <th className="px-6 py-4">Total Earnings Owed</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {!partners || partners.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                            No affiliate partners found.
                                        </td>
                                    </tr>
                                ) : (
                                    partners.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {p.affiliate_partners?.logo_url ? (
                                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-200 bg-zinc-50 flex-shrink-0">
                                                            <img src={p.affiliate_partners.logo_url} alt={p.affiliate_partners.name} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-500 font-bold text-xs flex-shrink-0">
                                                            {p.affiliate_partners?.name?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                    <span className="font-bold text-indigo-600">{p.affiliate_partners?.name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-md">{p.code}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-emerald-600">${p.partner_commission || 0}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-zinc-900">{p.current_uses}</span>
                                                <span className="text-zinc-400"> / {p.max_uses}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-zinc-900 text-lg">${p.total_partner_earnings || 0}</span>
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
