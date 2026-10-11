"use client"

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { useUser } from "@clerk/nextjs"
import { saveFavoriteIds } from "@/app/actions/favorites"

const STORAGE_KEY = "islandfull_favorites"
const LEGACY_KEY = "islandfull_liked_tours"

function asIds(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string") : []
}

function readKey(key: string): string[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return asIds(parsed)
  } catch {
    return []
  }
}

function readLocal(): string[] {
  return mergeIds(readKey(STORAGE_KEY), readKey(LEGACY_KEY))
}

function writeLocal(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

function mergeIds(primary: string[], extra: string[]) {
  const seen = new Set(primary)
  const out = [...primary]
  for (const id of extra) {
    if (!seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  return out
}

function sameIds(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  return a.every((id, i) => id === b[i])
}

type FavoritesContextValue = {
  favorites: string[]
  toggleFavorite: (activityId: string) => void
  isHydrated: boolean
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser()
  const [favorites, setFavorites] = useState<string[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const userRef = useRef(user)
  userRef.current = user
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const persistAccount = useCallback((ids: string[]) => {
    writeLocal(ids)
    if (!userRef.current) return
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => {
      void saveFavoriteIds(ids)
    }, 200)
  }, [])

  useLayoutEffect(() => {
    setFavorites(readLocal())
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isLoaded || !user) return
    const remote = asIds(user.unsafeMetadata?.favoriteIds)
    const merged = mergeIds(remote, readLocal())
    setFavorites(merged)
    writeLocal(merged)
    if (!sameIds(merged, remote)) void saveFavoriteIds(merged)
  }, [isLoaded, user?.id])

  const toggleFavorite = useCallback((activityId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
      queueMicrotask(() => {
        window.dispatchEvent(new Event("favoritesChanged"))
        persistAccount(next)
      })
      return next
    })
  }, [persistAccount])

  useEffect(() => {
    const applyLocal = () => setFavorites(readLocal())
    window.addEventListener("favoritesChanged", applyLocal)
    window.addEventListener("storage", applyLocal)
    return () => {
      window.removeEventListener("favoritesChanged", applyLocal)
      window.removeEventListener("storage", applyLocal)
    }
  }, [])

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isHydrated }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider")
  }
  return ctx
}
