import { create } from 'zustand'

interface HeaderState {
    useDarkText: boolean
    setUseDarkText: (value: boolean) => void
}

export const useHeaderStore = create<HeaderState>((set) => ({
    useDarkText: false,
    setUseDarkText: (value) => set({ useDarkText: value }),
}))
