'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function SetupAccountPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isSessionReady, setIsSessionReady] = useState(false)

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsSessionReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setIsSessionReady(true)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push('/admin/tours')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Islandfull" width={180} height={40} className="object-contain" />
        </Link>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-zinc-900 tracking-tight">
          Complete Your Account Setup
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600">
          Please set your permanent password to access the Admin dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-zinc-100">
          <form className="space-y-6" onSubmit={handleSetup}>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    <AlertCircle className="h-5 w-5 text-rose-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-rose-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-emerald-800">Password updated! Redirecting...</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || success || !isSessionReady}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 transition-colors"
              >
                {!isSessionReady ? 'Verifying link...' : loading ? 'Saving...' : 'Save Password & Enter Dashboard'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
