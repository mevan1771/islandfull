"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import { Heart, LogOut, MapPinned, Settings, X } from "lucide-react"
import toast from "react-hot-toast"

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function LoggedOutActions({ onDone }: { onDone: () => void }) {
  const [emailOpen, setEmailOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)

  const callbackUrl = typeof window === "undefined" ? "/" : window.location.href

  const google = () => {
    void signIn("google", { callbackUrl })
  }

  const sendMagicLink = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return
    setSending(true)
    try {
      const result = await signIn("resend", {
        email: email.trim(),
        callbackUrl,
        redirect: false,
      })
      if (result?.error) {
        toast.error("Could not send the sign-in email. Check Resend is set up.")
        return
      }
      toast.success("Check your inbox for a sign-in link.")
      onDone()
    } catch {
      toast.error("Could not send the sign-in email.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-zinc-500">Save tours and keep your bookings in one place.</p>
      <button
        type="button"
        onClick={google}
        className="flex items-center justify-center gap-3 min-h-11 w-full rounded-full bg-zinc-900 text-white text-sm font-bold px-4 hover:bg-zinc-800 transition-colors"
      >
        <GoogleMark />
        Continue with Google
      </button>
      {emailOpen ? (
        <form onSubmit={sendMagicLink} className="flex flex-col gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
            className="min-h-11 w-full rounded-full border border-zinc-200 px-4 text-sm text-zinc-900 outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={sending}
            className="flex items-center justify-center min-h-11 w-full rounded-full border border-zinc-200 bg-white text-zinc-800 text-sm font-semibold px-4 hover:bg-zinc-50 transition-colors disabled:opacity-60"
          >
            {sending ? "Sending…" : "Email me a link"}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setEmailOpen(true)}
          className="flex items-center justify-center min-h-11 w-full rounded-full border border-zinc-200 bg-white text-zinc-800 text-sm font-semibold px-4 hover:bg-zinc-50 transition-colors"
        >
          Continue with Email
        </button>
      )}
    </div>
  )
}

function LoggedInActions({ onNavigate }: { onNavigate: () => void }) {
  const item =
    "flex items-center gap-3 min-h-11 w-full rounded-xl px-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors"

  return (
    <nav className="flex flex-col gap-0.5">
      <Link href="/trips" className={item} onClick={onNavigate}>
        <MapPinned className="w-4 h-4 text-rose-500" />
        My Trips
      </Link>
      <Link href="/trips?tab=wishlist" className={item} onClick={onNavigate}>
        <Heart className="w-4 h-4 text-rose-500" />
        Wishlist
      </Link>
      <Link href="/account" className={item} onClick={onNavigate}>
        <Settings className="w-4 h-4 text-zinc-400" />
        Account settings
      </Link>
      <button
        type="button"
        className={`${item} text-left`}
        onClick={() => {
          onNavigate()
          void signOut({ callbackUrl: "/" })
        }}
      >
        <LogOut className="w-4 h-4 text-zinc-400" />
        Log out
      </button>
    </nav>
  )
}

export function UserNavMenu({
  triggerClassName,
  iconClassName,
}: {
  triggerClassName: string
  iconClassName: string
}) {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const user = session?.user
  const isSignedIn = status === "authenticated"

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  const menuBody = isSignedIn ? (
    <LoggedInActions onNavigate={() => setOpen(false)} />
  ) : (
    <LoggedOutActions onDone={() => setOpen(false)} />
  )

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={isSignedIn ? "Account menu" : "Sign in"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`min-w-11 min-h-11 md:min-w-10 md:min-h-10 overflow-hidden ${triggerClassName}`}
      >
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={iconClassName}
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div
            className="hidden md:block fixed inset-0 z-[70]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="hidden md:block absolute right-0 top-[calc(100%+10px)] z-[80] w-80 rounded-2xl bg-white p-5 shadow-2xl shadow-black/15 border border-zinc-100">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              {isSignedIn ? user?.name?.split(" ")[0] || "Account" : "Welcome"}
            </p>
            {menuBody}
          </div>

          <div className="md:hidden fixed inset-0 z-[80]">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl">
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-zinc-200" />
              <div className="flex items-center justify-between mb-4">
                <p className="text-base font-bold text-zinc-900">
                  {isSignedIn ? user?.name?.split(" ")[0] || "Account" : "Sign in"}
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center min-w-11 min-h-11 rounded-full hover:bg-zinc-50"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
              {menuBody}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
