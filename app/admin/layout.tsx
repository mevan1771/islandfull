import SignOutButton from "@/components/host/SignOutButton"
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
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

  const { data: { user } } = await supabase.auth.getUser()
  
  let isAdmin = false
  let displayRole = 'staff'
  let userEmail = ''
  if (user) {
    userEmail = user.email || ''
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    const { data: userRole } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
    isAdmin = (profile?.role === 'admin') || (userRole?.role === 'admin')
    displayRole = isAdmin ? 'admin' : (userRole?.role || 'staff')
  }

  return (
    <AdminLayoutWrapper 
      isAdmin={isAdmin} 
      userEmail={userEmail} 
      displayRole={displayRole}
    >
      {children}
    </AdminLayoutWrapper>
  )
}
