'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Lock, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function UpdatePasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSessionReady, setIsSessionReady] = useState(false)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Check if we already have a session from the URL hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsSessionReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsSessionReady(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.')
    }
    
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters.')
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Force full reload to update server cookies
      window.location.href = '/admin'
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="mb-6 text-3xl font-black text-rose-500 tracking-tight">
          IslandFull
        </Link>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-zinc-900">
          Update Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600">
          Please enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-zinc-100">
          <form className="space-y-6" onSubmit={handleUpdate}>
            <div>
              <label className="block text-sm font-bold text-zinc-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-zinc-300 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-zinc-300 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 p-4 border border-rose-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-rose-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-rose-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !isSessionReady}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {!isSessionReady ? 'Verifying link...' : loading ? 'Saving...' : 'Update Password & Enter Dashboard'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
