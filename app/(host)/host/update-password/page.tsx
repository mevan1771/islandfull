"use client"

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
    } else {
      toast.success("Password updated successfully!")
      router.push('/host')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center px-4 relative overflow-hidden">
      <div className="w-full max-w-sm mx-auto relative z-10">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Update Password</h1>
          <p className="text-zinc-400">Please enter your new secure password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-zinc-100">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-4 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || password.length < 6}
            className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  )
}
