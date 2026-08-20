"use client"

import { createBrowserClient } from '@supabase/ssr'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminSignOutButton() {
    const router = useRouter()

    const handleSignOut = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        await supabase.auth.signOut()
        router.refresh()
        router.push('/admin/login')
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
