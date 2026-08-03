"use client"

import { Scanner } from '@yudiel/react-qr-scanner'
import { useState } from 'react'
import { X, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface QRScannerProps {
  onClose: () => void
}

export default function QRScanner({ onClose }: QRScannerProps) {
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; name?: string; pax?: number } | null>(null)

  const handleScan = async (data: string) => {
    if (scannedData || loading || result) return // Prevent multiple scans

    setScannedData(data)
    setLoading(true)

    try {
      const res = await fetch('/api/host/verify-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: data }),
      })

      const responseData = await res.json()

      if (!res.ok) {
        setResult({ success: false, message: responseData.error || 'Invalid ticket' })
      } else {
        setResult({ 
          success: true, 
          message: 'Ticket Validated!', 
          name: responseData.name, 
          pax: responseData.pax 
        })
      }
    } catch (err: any) {
      setResult({ success: false, message: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const resetScanner = () => {
    setScannedData(null)
    setResult(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-white z-10 bg-gradient-to-b from-black/80 to-transparent">
        <h2 className="font-bold text-lg">Scan Ticket</h2>
        <button onClick={onClose} className="p-2 bg-white/20 rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Scanner or Result */}
      <div className="flex-1 relative flex items-center justify-center">
        {!result && !loading && (
          <div className="absolute inset-0">
            <Scanner 
              onScan={(result) => handleScan(result[0].rawValue)} 
              onError={(error) => console.log(error?.message)}
            />
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white z-20">
            <Loader2 className="w-12 h-12 animate-spin text-rose-500 mb-4" />
            <p className="font-medium text-lg">Verifying Ticket...</p>
          </div>
        )}

        {/* Result Overlay */}
        {result && (
          <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center p-6 z-20 text-center">
            {result.success ? (
              <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-3xl w-full max-w-sm">
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">{result.message}</h3>
                <div className="bg-black/30 rounded-xl p-4 mb-6">
                  <p className="text-zinc-300 text-sm mb-1">Guest Name</p>
                  <p className="text-white font-bold text-lg">{result.name}</p>
                  <p className="text-zinc-300 text-sm mt-3 mb-1">Total Guests</p>
                  <p className="text-white font-bold text-lg">{result.pax} Pax</p>
                </div>
                <button 
                  onClick={resetScanner}
                  className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors"
                >
                  Scan Next Ticket
                </button>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl w-full max-w-sm">
                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Verification Failed</h3>
                <p className="text-red-400 mb-8">{result.message}</p>
                <button 
                  onClick={resetScanner}
                  className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
