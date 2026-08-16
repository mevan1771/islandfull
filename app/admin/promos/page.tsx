import { supabase } from "@/lib/supabase"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PromoClient } from "@/components/admin/PromoClient"

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
    .select('*, affiliate_partners(name)')
    .order('created_at', { ascending: false });

  const { data: partners } = await supabase
    .from('affiliate_partners')
    .select('id, name')
    .order('name', { ascending: true });

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <PromoClient initialPromos={promos || []} partners={partners || []} />
      </div>
    </div>
  )
}
