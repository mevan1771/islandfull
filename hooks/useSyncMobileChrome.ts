"use client"

import { useEffect, useRef } from "react"
import { useMobileChromeStore } from "@/store/useMobileChromeStore"
import { isChromeHideSuppressed, peekHomeListingsPin } from "@/lib/home-scroll"

const THRESHOLD = 48
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
    })
  }, [])

  useEffect(() => {
    let lastY = window.scrollY
    let acc = 0
    let ticking = false
    let hidden = false

    const compute = () => {
      ticking = false
      const y = Math.max(0, window.scrollY)
      const delta = y - lastY
      lastY = y

      if (
        lockedRef.current ||
        !stuckRef.current ||
        y <= TOP_SHOW ||
        peekHomeListingsPin() ||
        isChromeHideSuppressed()
      ) {
        acc = 0
        if (hidden) {
          hidden = false
          setHidden(false)
        }
        return
      }

      const maxY = document.documentElement.scrollHeight - window.innerHeight
      if (maxY > 0 && y >= maxY - 24) {
        acc = 0
        if (hidden) {
          hidden = false
          setHidden(false)
        }
        return
      }

      if (Math.abs(delta) < 4) return

      if (delta > 0) {
        acc = acc > 0 ? acc + delta : delta
        if (acc > THRESHOLD && !hidden) {
          hidden = true
          acc = 0
          setHidden(true)
        }
        return
      }

      acc = acc < 0 ? acc + delta : delta
      if (acc < -THRESHOLD && hidden) {
        hidden = false
        acc = 0
        setHidden(false)
      }
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
