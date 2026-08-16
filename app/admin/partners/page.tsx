import { supabase } from "@/lib/supabase"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PartnerClient } from "@/components/admin/PartnerClient"

export const dynamic = 'force-dynamic';

export default async function AdminPartnersPage() {
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
        .from('affiliate_partners')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4">
                <PartnerClient initialPartners={partners || []} />
            </div>
        </div>
    )
}
