"use client"

import { useState } from "react"
import dynamic from 'next/dynamic'
import { QrCode } from "lucide-react"
import { useRouter } from "next/navigation"

const QRScanner = dynamic(() => import('@/components/host/QRScanner'), {
  ssr: false,
})

export default function HostDashboardClient() {
  const [showScanner, setShowScanner] = useState(false)
  const router = useRouter()

  const handleClose = () => {
    setShowScanner(false)
    // Refresh the page data so metrics update after a scan
    router.refresh()
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-40 pointer-events-none flex justify-center">
        <button 
          onClick={() => setShowScanner(true)}
          className="w-full bg-black hover:bg-zinc-800 text-white font-bold rounded-2xl p-5 shadow-2xl shadow-black/30 flex items-center justify-center gap-3 transition-transform active:scale-95 pointer-events-auto"
        >
          <QrCode className="w-7 h-7" />
          <span className="text-xl">Launch QR Scanner</span>
        </button>
      </div>

      {showScanner && (
        <QRScanner onClose={handleClose} />
      )}
    </>
  )
}
