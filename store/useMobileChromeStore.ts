import { create } from "zustand"

interface MobileChromeState {
  hidden: boolean
  locked: boolean
  stuck: boolean
  setHidden: (hidden: boolean) => void
  setLocked: (locked: boolean) => void
  setStuck: (stuck: boolean) => void
}

export const useMobileChromeStore = create<MobileChromeState>((set) => ({
  hidden: false,
  locked: false,
  stuck: false,
  setHidden: (hidden) => set({ hidden }),
  setLocked: (locked) => set({ locked }),
  setStuck: (stuck) => set({ stuck }),
}))
