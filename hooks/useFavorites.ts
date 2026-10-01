"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"

const STORAGE_KEY = "islandfull_favorites"

function readLocal(): string[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []
  } catch {
    return []
  }
}

function writeLocal(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

function readRemote(metadata: Record<string, unknown> | undefined): string[] {
  const raw = metadata?.favoriteIds
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string") : []
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
  const mergedUserId = useRef<string | null>(null)
  const userRef = useRef(user)
  userRef.current = user

  const persistAccount = useCallback(async (ids: string[]) => {
    const current = userRef.current
    if (!current) return
    if (sameIds(readRemote(current.unsafeMetadata), ids)) return
    await current.update({
      unsafeMetadata: {
        ...current.unsafeMetadata,
        favoriteIds: ids,
      },
    })
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    const local = readLocal()

    if (!user) {
      mergedUserId.current = null
      setFavorites(local)
      setIsHydrated(true)
      return
    }

    if (mergedUserId.current === user.id) {
      setIsHydrated(true)
      return
    }

    mergedUserId.current = user.id
    const remote = readRemote(user.unsafeMetadata)
    const merged = mergeIds(remote, local)
    setFavorites(merged)
    writeLocal(merged)
    setIsHydrated(true)
    void persistAccount(merged)
  }, [isLoaded, user, persistAccount])

  const toggleFavorite = useCallback((activityId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
      writeLocal(next)
      queueMicrotask(() => {
        window.dispatchEvent(new Event("favoritesChanged"))
        void persistAccount(next)
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
