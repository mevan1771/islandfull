"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { getFavoriteIds, saveFavoriteIds } from "@/app/actions/favorites"

const STORAGE_KEY = "islandfull_favorites"
const LEGACY_KEY = "islandfull_liked_tours"

function readKey(key: string): string[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []
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

export function useFavorites() {
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

  useEffect(() => {
    if (!isLoaded) return
    let cancelled = false

    async function hydrate() {
      const local = readLocal()
      if (!user) {
        if (!cancelled) {
          setFavorites(local)
          setIsHydrated(true)
        }
        return
      }
      const remote = await getFavoriteIds()
      if (cancelled) return
      const merged = mergeIds(remote, local)
      setFavorites(merged)
      writeLocal(merged)
      setIsHydrated(true)
      if (!sameIds(merged, remote)) void saveFavoriteIds(merged)
    }

    void hydrate()
    return () => {
      cancelled = true
    }
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

  return { favorites, toggleFavorite, isHydrated }
}
