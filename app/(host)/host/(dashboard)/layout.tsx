import { Toaster } from "react-hot-toast"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import SignOutButton from '@/components/host/SignOutButton'
import HostNavigation from '@/components/host/HostNavigation'

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/host/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'provider' && profile?.role !== 'admin') {
    redirect('/host/login')
  }

  const { data: host } = await supabase
    .from('hosts')
    .select('id, name, image_url')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <header className="bg-zinc-900 text-white p-6 shadow-md flex justify-between items-start w-full">
        <div className="flex gap-4 items-center">
          {host?.image_url ? (
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shrink-0">
              <Image src={host.image_url} alt="Logo" fill className="object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full border-2 border-white/20 bg-zinc-800 flex items-center justify-center font-bold text-xl shrink-0">
              {host?.name?.charAt(0) || 'H'}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{host?.name || "Operations"}</h1>
            <p className="text-sm text-zinc-400">Welcome back, {profile?.full_name}</p>
          </div>
        </div>
        <div>
          <SignOutButton />
        </div>
      </header>

      <HostNavigation />

      <div className="flex-1">
        {children}
      </div>
      <Toaster position="top-center" />
    </div>
  )
}
