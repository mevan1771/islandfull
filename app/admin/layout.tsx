import SignOutButton from "@/components/host/SignOutButton"
import AdminNav from "@/components/admin/AdminNav"
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
    <div className="relative w-full">
      {/* Top right flex container for the sign out button and identity badge */}
      <div className="absolute top-0 left-0 right-0 w-full flex justify-end items-start gap-3 p-6 md:p-8 z-50 pointer-events-none">
        {userEmail && (
          <div className="pointer-events-auto bg-gray-100 text-xs px-3 py-1.5 rounded-full flex flex-col text-right shadow-sm border border-gray-200">
            <span className="font-bold text-gray-900">{userEmail}</span>
            <span className="text-gray-500 uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>{displayRole}</span>
          </div>
        )}
        <div className="pointer-events-auto">
          <SignOutButton />
        </div>
      </div>
      
      <div className="w-full bg-zinc-50 pt-24 pb-0 z-10 relative">
        <div className="max-w-7xl mx-auto px-4">
          <AdminNav isAdmin={isAdmin} />
        </div>
      </div>
      
      <div className="-mt-24 relative z-0">
        {children}
      </div>
    </div>
  )
}
