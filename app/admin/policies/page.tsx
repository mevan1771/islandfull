import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PoliciesManager from '@/components/admin/PoliciesManager'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPoliciesPage() {
    const cookieStore = await cookies()
    const supabaseSSR = createServerClient(
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

    const { data: { user } } = await supabaseSSR.auth.getUser()
    if (!user) {
        redirect('/admin/login')
    }

    const { data: profile } = await supabaseSSR.from('users').select('role').eq('id', user.id).single()
    const { data: userRole } = await supabaseSSR.from('user_roles').select('role').eq('user_id', user.id).single()
    const isAdmin = (profile?.role === 'admin') || (userRole?.role === 'admin')

    if (!isAdmin) {
        redirect('/admin')
    }

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: tiers, error } = await supabaseAdmin
        .from('cancellation_tiers')
        .select('*')
        .order('cutoff_hours', { ascending: true })

    console.log('Fetched Tiers:', tiers, error)

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Policies & Contracts</h1>
                <p className="text-zinc-500 mt-2 font-medium">Manage global platform policies and cancellation tiers.</p>
            </div>

            <PoliciesManager initialTiers={tiers || []} />
        </div>
    )
}
