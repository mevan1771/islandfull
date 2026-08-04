"use client"

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Explicitly set redirectTo to our custom update-password page
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://islandfull.com'
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/host/update-password`,
    })

    if (error) {
      toast.error(error.message)
    } else {
      setIsSent(true)
      toast.success("Password reset link sent!")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center px-4 relative overflow-hidden">
      <div className="w-full max-w-sm mx-auto relative z-10">
        
        <Link href="/host/login" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-zinc-400">Enter your email to receive a reset link.</p>
        </div>

        {isSent ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
            <h3 className="text-emerald-400 font-bold mb-2">Check your email</h3>
            <p className="text-emerald-400/80 text-sm">
              We've sent a password reset link to <span className="text-white font-medium">{email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-zinc-100">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guide@example.com"
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-4 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
