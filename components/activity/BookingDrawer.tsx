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
  const [touristName, setTouristName] = useState("")
  const [touristEmail, setTouristEmail] = useState("")

  const totalUsd = priceUsd * guests
  const totalLkr = priceLkrApprox * guests

  const handleStripeCheckout = async () => {
    if (!date || !whatsapp || !touristName || !touristEmail) return
    
    setStep("processing")
    
    try {
      const res = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          title,
          priceUsd,
          date,
          guests,
          whatsapp,
          touristName,
          touristEmail
        })
      })
      
      const text = await res.text()
      let data;
      try {
        data = JSON.parse(text)
      } catch (e) {
        throw new Error(text || 'Failed to parse server response')
      }
      
      if (data && data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error(err)
      setStep("details")
      alert(`Checkout failed: ${err.message}`)
    }
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
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 md:relative md:border border-zinc-200 md:rounded-3xl md:shadow-xl md:p-6 md:bg-white md:z-auto">
        <div className="max-w-md mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-zinc-900">{formatUSD(priceUsd)}</span>
              <span className="text-sm text-zinc-500 font-medium">per person</span>
            </div>
            {/* Mock Rating */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="font-bold">4.9</span>
                <span className="text-rose-500">★</span>
              </div>
              <span className="text-sm text-zinc-500 underline">128 reviews</span>
            </div>
          </div>

          <Button onClick={() => setIsOpen(true)} size="lg" className="w-full shadow-lg shadow-rose-500/20 py-6 text-lg font-bold">
            Reserve Now
          </Button>
          <p className="text-center text-sm font-medium text-zinc-400 mt-1">You won't be charged yet</p>
        </div>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 transition-opacity" 
          onClick={resetAndClose}
        />
      )}

      {/* Mobile Drawer (Bottom on mobile, Center modal on desktop) */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col md:w-full md:max-w-lg md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:h-auto max-h-[90vh] overflow-hidden ${
          isOpen ? "translate-y-0" : "translate-y-full md:translate-y-[150%]"
        }`}
      >
        <div className="p-8 overflow-y-auto flex-1 overscroll-contain">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Complete Reservation</h2>
            <button 
              onClick={resetAndClose}
              className="p-2.5 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors bg-zinc-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === "details" && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800 flex items-center gap-2 uppercase tracking-wide">
                      <CalendarDays className="w-4 h-4 text-rose-500" />
                      Travel Date
                    </label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-12 px-5 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-zinc-900"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800 flex items-center gap-2 uppercase tracking-wide">
                      <Users className="w-4 h-4 text-rose-500" />
                      Number of Guests
                    </label>
                    <div className="flex items-center gap-4 p-1 bg-zinc-50 rounded-xl border border-zinc-200 w-fit h-12">
                      <button 
                        onClick={(e) => { e.preventDefault(); setGuests(Math.max(1, guests - 1)); }}
                        className="w-10 h-10 rounded-lg bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-900 font-medium active:scale-95 transition-all disabled:opacity-50"
                        disabled={guests <= 1}
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-lg">{guests}</span>
                      <button 
                        onClick={(e) => { e.preventDefault(); setGuests(Math.min(maxCapacity, guests + 1)); }}
                        className="w-10 h-10 rounded-lg bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-900 font-medium active:scale-95 transition-all disabled:opacity-50"
                        disabled={guests >= maxCapacity}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800 flex items-center gap-2 uppercase tracking-wide">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      value={touristName}
                      onChange={(e) => setTouristName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full h-12 px-5 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-zinc-900"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800 flex items-center gap-2 uppercase tracking-wide">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      value={touristEmail}
                      onChange={(e) => setTouristEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full h-12 px-5 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-zinc-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-800 flex items-center gap-2 uppercase tracking-wide">
                    <Phone className="w-4 h-4 text-rose-500" />
                    WhatsApp Number
                  </label>
                  <input 
                    type="tel" 
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full h-12 px-5 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-zinc-900"
                    required
                  />
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-zinc-600 font-medium">Total (USD)</span>
                  <span className="font-black text-2xl text-zinc-900">{formatUSD(totalUsd)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-medium text-xs">Est. Local LKR</span>
                  <span className="font-bold text-xs text-zinc-400">{formatLKR(totalLkr)}</span>
                </div>
              </div>

              <Button 
                onClick={(e) => { e.preventDefault(); handleStripeCheckout(); }} 
                disabled={!date || !whatsapp || !touristName || !touristEmail}
                className="w-full h-14 text-lg shadow-xl shadow-rose-500/20 rounded-xl"
              >
                Proceed to Payment
              </Button>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-16 space-y-8">
              <div className="w-20 h-20 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin"></div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Secure Checkout</h3>
                <p className="text-zinc-500 font-medium">Connecting to Stripe securely...</p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center text-center py-12 space-y-8">
              <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-12 h-12 text-rose-500" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-zinc-900 mb-3 tracking-tight">Confirmed!</h3>
                <p className="text-zinc-500 mb-8 font-medium px-4">
                  Your reservation is locked in. We've sent the details to your WhatsApp.
                </p>
                <div className="bg-zinc-50 rounded-3xl p-6 w-full max-w-sm mx-auto text-left space-y-4 border border-zinc-100">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Booking ID</span>
                    <span className="font-bold text-zinc-900">#IF-{Math.floor(Math.random() * 10000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Date</span>
                    <span className="font-bold text-zinc-900">{date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Guests</span>
                    <span className="font-bold text-zinc-900">{guests}</span>
                  </div>
                </div>
              </div>
              <Button onClick={resetAndClose} className="w-full h-16 rounded-2xl font-bold text-lg" variant="outline">
                Back to Activity
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
