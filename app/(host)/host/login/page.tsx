"use client"

import { useState } from "react"
import Link from "next/link"
import { hostLogin } from "@/app/actions/auth"
import { Loader2, ArrowRight } from "lucide-react"

export default function HostLogin() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await hostLogin(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // if successful, the action will redirect
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-900">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Operator Portal</h1>
          <p className="text-zinc-400">Sign in to view schedules and scan tickets.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-4 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all" 
              placeholder="guide@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-4 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all" 
              placeholder="••••••••"
            />
            <div className="flex justify-end mt-2">
              <Link href="/host/forgot-password" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Forgot Password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl p-4 flex items-center justify-center gap-2 transition-colors mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
