"use client"

import { create } from "zustand"
import {
  emptyTripSearch,
  loadTripSearch,
  saveTripSearch,
  setPartyCounts,
  type TripSearch,
} from "@/lib/trip-search"

type State = TripSearch & {
  setDate: (date: string) => void
  setGuests: (guests: number) => void
  setParty: (patch: { adults?: number; children?: number; infants?: number }) => void
  clearParty: () => void
  hydrate: (partial: Partial<TripSearch>) => void
}

export const useTripSearchStore = create<State>((set, get) => ({
  ...emptyTripSearch(),
  setDate: (date) => {
    set({ date })
    saveTripSearch(get())
  },
  setGuests: (guests) => {
    const next = setPartyCounts(get(), { adults: Math.max(1, guests), children: 0, infants: 0 })
    set({ guests: next.guests, children: 0, infants: 0 })
    saveTripSearch(get())
  },
  setParty: (patch) => {
    set(setPartyCounts(get(), patch))
    saveTripSearch(get())
  },
  clearParty: () => {
    set({ guests: 0, children: 0, infants: 0 })
    saveTripSearch(get())
  },
  hydrate: (partial) => {
    set({
      date: partial.date ?? get().date,
      guests: partial.guests ?? get().guests,
      children: partial.children ?? get().children,
      infants: partial.infants ?? get().infants,
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
