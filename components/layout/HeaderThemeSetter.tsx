"use client"

import { useEffect } from "react"
import { useHeaderStore } from "@/store/useHeaderStore"

export function HeaderThemeSetter({ useDarkText }: { useDarkText: boolean }) {
    const { setUseDarkText } = useHeaderStore()

    useEffect(() => {
        setUseDarkText(useDarkText)

        // Reset on unmount
        return () => setUseDarkText(false)
    }, [useDarkText, setUseDarkText])

    return null
}
