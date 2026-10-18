import { create } from "zustand"

interface MobileChromeState {
  hidden: boolean
  locked: boolean
  stuck: boolean
  locks: number
  setHidden: (hidden: boolean) => void
  setStuck: (stuck: boolean) => void
  lock: () => void
  unlock: () => void
}

export const useMobileChromeStore = create<MobileChromeState>((set) => ({
  hidden: false,
  locked: false,
  stuck: false,
  locks: 0,
  setHidden: (hidden) =>
    set((state) => (state.hidden === hidden ? state : { hidden })),
  setStuck: (stuck) =>
    set((state) => (state.stuck === stuck ? state : { stuck })),
  lock: () =>
    set((state) => ({
      locks: state.locks + 1,
      locked: true,
      hidden: false,
    })),
  unlock: () =>
    set((state) => {
      const locks = Math.max(0, state.locks - 1)
      return { locks, locked: locks > 0 }
    }),
}))
