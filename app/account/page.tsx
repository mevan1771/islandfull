"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"

export default function AccountPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="min-h-screen bg-zinc-50 pt-28 px-4">Loading…</div>
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-28 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
          <h1 className="text-xl font-bold text-zinc-900 mb-2">Account</h1>
          <p className="text-sm text-zinc-500 mb-4">Sign in from the profile icon to manage your account.</p>
          <Link href="/" className="text-sm font-semibold text-rose-500">
            Back home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-28 px-4 pb-12">
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
        <h1 className="text-xl font-bold text-zinc-900 mb-4">Account settings</h1>
        <p className="text-sm text-zinc-600">{session.user.name}</p>
        <p className="text-sm text-zinc-500">{session.user.email}</p>
      </div>
    </div>
  )
}
