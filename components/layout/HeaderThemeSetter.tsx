"use client"

import { useEffect } from "react"
import { useHeaderStore } from "@/store/useHeaderStore"

export function HeaderThemeSetter({ useDarkTextDesktop, useDarkTextMobile }: { useDarkTextDesktop: boolean, useDarkTextMobile: boolean }) {
    const { setUseDarkTextDesktop, setUseDarkTextMobile } = useHeaderStore()

    useEffect(() => {
        setUseDarkTextDesktop(useDarkTextDesktop)
        setUseDarkTextMobile(useDarkTextMobile)

        // Reset on unmount
        return () => {
            setUseDarkTextDesktop(false)
            setUseDarkTextMobile(false)
        }
    }, [useDarkTextDesktop, useDarkTextMobile, setUseDarkTextDesktop, setUseDarkTextMobile])

    return null
}
