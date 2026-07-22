"use client"

import { useState } from "react"
import { CalendarDays, Users, Phone, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatUSD, formatLKR } from "@/lib/utils"

interface BookingDrawerProps {
  activityId: string
  title: string
  priceUsd: number
  priceLkrApprox: number
  maxCapacity: number
}

export function BookingDrawer({
  activityId,
  title,
  priceUsd,
  priceLkrApprox,
  maxCapacity
}: BookingDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<"details" | "processing" | "success">("details")
  
  // Form state
  const [date, setDate] = useState("")
  const [guests, setGuests] = useState(1)
  const [whatsapp, setWhatsapp] = useState("")

  const totalUsd = priceUsd * guests
  const totalLkr = priceLkrApprox * guests

  const handleSimulatePayment = () => {
    if (!date || !whatsapp) return
    
    setStep("processing")
    
    // Simulate API call and PayHere redirect
    setTimeout(() => {
      setStep("success")
    }, 2000)
  }

  const resetAndClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      setStep("details")
      setDate("")
      setGuests(1)
      setWhatsapp("")
    }, 300)
  }

  return (
    <>
      {/* Sticky Bottom Widget Trigger */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 md:relative md:border-t-0 md:shadow-none md:p-0 md:bg-transparent md:z-auto">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-zinc-500 font-medium">Price per person</span>
            <span className="text-2xl font-bold text-zinc-900">{formatUSD(priceUsd)}</span>
          </div>
          <Button onClick={() => setIsOpen(true)} size="lg" className="flex-1 shadow-lg shadow-emerald-600/20">
            Book Now
          </Button>
        </div>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 transition-opacity" 
          onClick={resetAndClose}
        />
      )}

      {/* Mobile Drawer (Bottom on mobile, Center modal on desktop) */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl md:rounded-3xl shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col md:w-full md:max-w-lg md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:h-auto max-h-[90vh] overflow-hidden ${
          isOpen ? "translate-y-0" : "translate-y-full md:translate-y-[150%]"
        }`}
      >
        <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zinc-900">Request Booking</h2>
            <button 
              onClick={resetAndClose}
              className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === "details" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-zinc-100">
                <h3 className="font-semibold text-zinc-800 line-clamp-1">{title}</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-emerald-600" />
                    Travel Date
                  </label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Number of Guests
                  </label>
                  <div className="flex items-center gap-4 p-1 bg-zinc-50 rounded-xl border border-zinc-200 w-fit">
                    <button 
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-zinc-600 font-medium active:scale-95 transition-all disabled:opacity-50"
                      disabled={guests <= 1}
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold text-lg">{guests}</span>
                    <button 
                      onClick={() => setGuests(Math.min(maxCapacity, guests + 1))}
                      className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-zinc-600 font-medium active:scale-95 transition-all disabled:opacity-50"
                      disabled={guests >= maxCapacity}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    WhatsApp Number
                  </label>
                  <input 
                    type="tel" 
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    required
                  />
                  <p className="text-xs text-zinc-500">We will send your confirmation here.</p>
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-zinc-600">Total (USD)</span>
                  <span className="font-bold text-xl text-zinc-900">{formatUSD(totalUsd)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Approx. LKR</span>
                  <span className="font-medium text-zinc-500">{formatLKR(totalLkr)}</span>
                </div>
              </div>

              <Button 
                onClick={handleSimulatePayment} 
                disabled={!date || !whatsapp}
                className="w-full h-14 text-lg shadow-lg shadow-emerald-600/20 rounded-2xl"
              >
                Proceed to Payment
              </Button>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-zinc-900 mb-1">Connecting to PayHere</h3>
                <p className="text-zinc-500 text-sm">Please wait while we process your request...</p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center text-center py-8 space-y-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Booking Confirmed!</h3>
                <p className="text-zinc-600 mb-6 px-4">
                  Your payment was successful. We've sent the details to your WhatsApp number.
                </p>
                <div className="bg-zinc-50 rounded-2xl p-4 w-full max-w-sm mx-auto text-left space-y-3 border border-zinc-100">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-sm">Booking ID</span>
                    <span className="font-medium text-sm text-zinc-900">#IF-{Math.floor(Math.random() * 10000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-sm">Date</span>
                    <span className="font-medium text-sm text-zinc-900">{date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-sm">Guests</span>
                    <span className="font-medium text-sm text-zinc-900">{guests}</span>
                  </div>
                </div>
              </div>
              <Button onClick={resetAndClose} className="w-full h-14 rounded-2xl" variant="outline">
                Back to Activity
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
