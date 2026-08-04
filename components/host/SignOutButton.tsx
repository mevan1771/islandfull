"use client"

import { createClient } from '@/utils/supabase/client'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/host/login')
  }

  return (
    <button 
      onClick={handleSignOut}
      className="p-2 bg-zinc-800 rounded-full text-zinc-300 hover:text-white transition-colors"
      title="Sign Out"
    >
      <LogOut className="w-5 h-5" />
    </button>
  )
}
