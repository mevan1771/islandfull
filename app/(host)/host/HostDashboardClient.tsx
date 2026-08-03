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
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-50 via-zinc-50 to-transparent pb-8">
        <button 
          onClick={() => setShowScanner(true)}
          className="w-full bg-black hover:bg-zinc-800 text-white font-bold rounded-2xl p-5 shadow-xl shadow-black/20 flex items-center justify-center gap-3 transition-transform active:scale-95"
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
