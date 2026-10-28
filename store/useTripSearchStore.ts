"use client"

import { create } from "zustand"
import {
  emptyTripSearch,
  loadTripSearch,
  saveTripSearch,
  type TripSearch,
} from "@/lib/trip-search"

type State = TripSearch & {
  setDate: (date: string) => void
  setGuests: (guests: number) => void
  hydrate: (partial: Partial<TripSearch>) => void
}

export const useTripSearchStore = create<State>((set, get) => ({
  ...emptyTripSearch(),
  setDate: (date) => {
    set({ date })
    saveTripSearch(get())
  },
  setGuests: (guests) => {
    set({ guests })
    saveTripSearch(get())
  },
  hydrate: (partial) => {
    set({
      date: partial.date ?? get().date,
      guests: partial.guests ?? get().guests,
    })
    saveTripSearch(get())
  },
}))

let didHydrate = false
export function ensureTripSearchHydrated() {
  if (didHydrate || typeof window === "undefined") return
  didHydrate = true
  const stored = loadTripSearch()
  if (stored.date || stored.guests) {
    useTripSearchStore.setState(stored)
  }
}
