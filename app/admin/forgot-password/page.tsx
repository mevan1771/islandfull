'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://islandfull.com/admin/update-password',
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="mb-6">
          <Image src="/images/logo.png" alt="Islandfull" width={180} height={40} className="object-contain" priority />
        </Link>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-zinc-900">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600">
          Enter your email to receive a password reset link
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-zinc-100">
          {success ? (
            <div className="rounded-xl bg-emerald-50 p-6 border border-emerald-100 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-800">Check your email</h3>
              <p className="text-sm text-emerald-700">
                We've sent a password reset link to <span className="font-bold">{email}</span>. Please check your inbox.
              </p>
              <div className="pt-4">
                <Link href="/admin/login" className="text-sm font-bold text-emerald-700 hover:text-emerald-800 underline">
                  Return to login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleReset}>
              <div>
                <label className="block text-sm font-bold text-zinc-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-zinc-300 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                    placeholder="admin@islandfull.com"
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
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
              
              <div className="text-center">
                <Link href="/admin/login" className="text-sm font-semibold text-zinc-600 hover:text-zinc-900">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
