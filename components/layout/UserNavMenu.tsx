"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SignInButton, useClerk, useUser } from "@clerk/nextjs"
import { CircleHelp, Heart, House, LogOut, MapPinned, MessageCircle, Settings, Store, X } from "lucide-react"
import { markHomeArriveTop } from "@/lib/home-scroll"

const menuItem =
  "flex items-center gap-3 min-h-11 w-full rounded-xl px-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors cursor-pointer"

function SupportLinks({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <Link href="/help" className={menuItem} onClick={onNavigate}>
        <CircleHelp className="w-4 h-4 text-zinc-400" />
        Help Center
      </Link>
      <Link href="/contact" className={menuItem} onClick={onNavigate}>
        <MessageCircle className="w-4 h-4 text-zinc-400" />
        Contact Us
      </Link>
      <Link href="/list-your-tour" className={menuItem} onClick={onNavigate}>
        <Store className="w-4 h-4 text-zinc-400" />
        List your tour
      </Link>
    </>
  )
}

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

function LoggedOutActions({ onNavigate }: { onNavigate: () => void }) {
  const redirectUrl = typeof window === "undefined" ? "/" : window.location.href

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-zinc-500">Save tours and keep your bookings in one place.</p>
      <SignInButton mode="modal" forceRedirectUrl={redirectUrl}>
        <button
          type="button"
          className="flex items-center justify-center gap-3 min-h-11 w-full rounded-full bg-zinc-900 text-white text-sm font-bold px-4 hover:bg-zinc-800 transition-colors"
        >
          <GoogleMark />
          Continue with Google
        </button>
      </SignInButton>
      <SignInButton mode="modal" forceRedirectUrl={redirectUrl}>
        <button
          type="button"
          className="flex items-center justify-center min-h-11 w-full rounded-full border border-zinc-200 bg-white text-zinc-800 text-sm font-semibold px-4 hover:bg-zinc-50 transition-colors"
        >
          Continue with Email
        </button>
      </SignInButton>
      <div className="mt-1 border-t border-zinc-100 pt-2">
        <Link
          href="/"
          scroll={false}
          className={menuItem}
          onClick={() => {
            markHomeArriveTop()
            onNavigate()
          }}
        >
          <House className="w-4 h-4 text-rose-500" />
          Home
        </Link>
        <SupportLinks onNavigate={onNavigate} />
      </div>
    </div>
  )
}

function LoggedInActions({ onNavigate }: { onNavigate: () => void }) {
  const { signOut } = useClerk()

  return (
    <nav className="flex flex-col gap-0.5">
      <Link
        href="/"
        scroll={false}
        className={menuItem}
        onClick={() => {
          markHomeArriveTop()
          onNavigate()
        }}
      >
        <House className="w-4 h-4 text-rose-500" />
        Home
      </Link>
      <Link href="/trips" className={menuItem} onClick={onNavigate}>
        <MapPinned className="w-4 h-4 text-rose-500" />
        My Trips
      </Link>
      <Link href="/trips?tab=wishlist" className={menuItem} onClick={onNavigate}>
        <Heart className="w-4 h-4 text-rose-500" />
        Wishlist
      </Link>
      <Link href="/account" className={menuItem} onClick={onNavigate}>
        <Settings className="w-4 h-4 text-zinc-400" />
        Account settings
      </Link>
      <div className="my-1.5 border-t border-zinc-100" />
      <SupportLinks onNavigate={onNavigate} />
      <div className="my-1.5 border-t border-zinc-100" />
      <button
        type="button"
        className={`${menuItem} text-left`}
        onClick={() => {
          onNavigate()
          void signOut({ redirectUrl: "/" })
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
  layout = "header",
}: {
  triggerClassName?: string
  iconClassName?: string
  layout?: "header" | "bar"
}) {
  const { user, isSignedIn } = useUser()
  const [open, setOpen] = useState(false)
  const isBar = layout === "bar"

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

  const firstName = user?.firstName || user?.fullName?.split(" ")[0]
  const imageUrl = user?.imageUrl

  const menuBody = isSignedIn ? (
    <LoggedInActions onNavigate={() => setOpen(false)} />
  ) : (
    <LoggedOutActions onNavigate={() => setOpen(false)} />
  )

  const personIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={isBar ? "1.75" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClassName || (isBar ? "w-[18px] h-[18px]" : "w-5 h-5")}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={isSignedIn ? "Account menu" : "Sign in"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={
          isBar
            ? `flex items-center justify-center w-full h-16 cursor-pointer touch-manipulation select-none active:scale-[0.88] transition-transform duration-75 ${open ? "text-zinc-900" : "text-zinc-700"}`
            : `overflow-hidden shrink-0 ${triggerClassName || "w-8 h-8 md:w-10 md:h-10"}`
        }
      >
        {imageUrl && isSignedIn ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className={isBar ? "w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm" : "w-full h-full rounded-full object-cover"}
          />
        ) : isBar ? (
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-100 text-zinc-700">
            {personIcon}
          </span>
        ) : (
          personIcon
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
              {isSignedIn ? firstName || "Account" : "Welcome"}
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
                  {isSignedIn ? firstName || "Account" : "Sign in"}
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
