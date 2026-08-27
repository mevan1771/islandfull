import { create } from 'zustand'

interface HeaderState {
    useDarkTextDesktop: boolean
    useDarkTextMobile: boolean
    setUseDarkTextDesktop: (value: boolean) => void
    setUseDarkTextMobile: (value: boolean) => void
}

export const useHeaderStore = create<HeaderState>((set) => ({
    useDarkTextDesktop: false,
    useDarkTextMobile: false,
    setUseDarkTextDesktop: (value) => set({ useDarkTextDesktop: value }),
    setUseDarkTextMobile: (value) => set({ useDarkTextMobile: value }),
}))
