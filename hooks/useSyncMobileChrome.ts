"use client"

import { useEffect, useRef } from "react"
import { useMobileChromeStore } from "@/store/useMobileChromeStore"

const THRESHOLD = 10
const TOP_SHOW = 16

export function useSyncMobileChrome() {
  const setHidden = useMobileChromeStore((s) => s.setHidden)
  const lockedRef = useRef(false)
  const stuckRef = useRef(false)

  useEffect(() => {
    lockedRef.current = useMobileChromeStore.getState().locked
    stuckRef.current = useMobileChromeStore.getState().stuck
    return useMobileChromeStore.subscribe((state) => {
      lockedRef.current = state.locked
      stuckRef.current = state.stuck
      if (state.locked || !state.stuck) setHidden(false)
    })
  }, [setHidden])

  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false

    const compute = () => {
      ticking = false
      const y = Math.max(0, window.scrollY)
      const delta = y - lastY
      lastY = y

      if (lockedRef.current || !stuckRef.current || y <= TOP_SHOW) {
        setHidden(false)
        return
      }

      const maxY = document.documentElement.scrollHeight - window.innerHeight
      if (maxY > 0 && y >= maxY - 24) {
        setHidden(false)
        return
      }

      if (delta > THRESHOLD) setHidden(true)
      else if (delta < -THRESHOLD) setHidden(false)
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(compute)
    }

    const onPin = () => {
      lastY = Math.max(0, window.scrollY)
      setHidden(false)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("islandfull:listings-pin", onPin)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("islandfull:listings-pin", onPin)
      setHidden(false)
    }
  }, [setHidden])
}
