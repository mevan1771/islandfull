"use client"

import { useState } from "react"
import { CalendarDays, Users, Phone, X, CheckCircle2, MapPin, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatUSD, formatLKR } from "@/lib/utils"
import * as Popover from "@radix-ui/react-popover"
import { DayPicker } from "react-day-picker"
import { format, parse, isBefore, startOfToday } from "date-fns"
import "react-day-picker/dist/style.css"

interface BookingDrawerProps {
  activityId: string
  title: string
  priceUsd: number
  priceLkrApprox: number
  maxCapacity: number
  pricingTiers?: Record<string, number> | null
  tourOptions?: {title: string, price_modifier: number}[] | null
  paymentStrategy?: 'no_card' | 'deposit_15' | 'manual_hold' | 'full' | string
  hasPickup?: boolean
  blackoutDates?: string[]
  isHiddenGem?: boolean
  rating?: number
  reviewCount?: number
}

export function BookingDrawer({
  activityId,
  title,
  priceUsd,
  priceLkrApprox,
  maxCapacity,
  pricingTiers,
  tourOptions,
  paymentStrategy = 'full',
  hasPickup = false,
  blackoutDates = [],
  isHiddenGem = false,
  rating,
  reviewCount = 0
}: BookingDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<"details" | "processing" | "success">("details")
  
  // Form state
  const [date, setDate] = useState("")
  const [guests, setGuests] = useState(1)
  const [whatsapp, setWhatsapp] = useState("")
  const [touristName, setTouristName] = useState("")
  const [touristEmail, setTouristEmail] = useState("")
  const [selectedOption, setSelectedOption] = useState<string>(tourOptions && tourOptions.length > 0 ? tourOptions[0].title : "")
  const [pickupLocation, setPickupLocation] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [donationAmount, setDonationAmount] = useState<number>(0)

  // Calculate Totals using Tiered Pricing if available
  let totalUsd = priceUsd * guests
  let totalLkr = priceLkrApprox * guests

  if (pricingTiers && pricingTiers[guests.toString()]) {
    totalUsd = pricingTiers[guests.toString()]
    const exchangeRate = priceLkrApprox / priceUsd
    totalLkr = totalUsd * exchangeRate
  }

  // Add Option Price Modifier (per person)
  if (selectedOption && tourOptions) {
    const opt = tourOptions.find(o => o.title === selectedOption)
    if (opt) {
      totalUsd += (opt.price_modifier * guests)
      const exchangeRate = priceLkrApprox / priceUsd
      totalLkr = totalUsd * exchangeRate
    }
  }

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
          touristEmail,
          selectedOption,
          totalUsd: priceUsd === 0 && donationAmount > 0 ? donationAmount : totalUsd,
          pickupLocation,
          specialRequests,
          paymentStrategy: priceUsd === 0 && donationAmount === 0 ? 'no_card' : (priceUsd === 0 && donationAmount > 0 ? 'full' : paymentStrategy)
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
      setPickupLocation("")
      setSpecialRequests("")
    }, 300)
  }

  return (
    <>
      {/* Sticky Bottom Widget Trigger */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 md:relative md:border border-zinc-200 md:rounded-3xl md:shadow-xl md:p-6 md:bg-white md:z-auto">
        <div className="max-w-md mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                {priceUsd === 0 ? (
                  <span className="text-3xl font-black text-emerald-500 tracking-tight uppercase">Free</span>
                ) : (
                  <span className="text-3xl font-bold text-zinc-900">{formatUSD(pricingTiers && pricingTiers["1"] ? pricingTiers["1"] : priceUsd)}</span>
                )}
                {paymentStrategy === 'no_card' && priceUsd !== 0 && <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider">⚡️ No Card Needed</span>}
                {paymentStrategy === 'deposit_15' && <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider">🔥 Pay 15% Today</span>}
                {paymentStrategy === 'manual_hold' && <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider">🔒 Pay Later</span>}
              </div>
              {priceUsd !== 0 && <span className="text-sm text-zinc-500 font-medium">{pricingTiers && Object.keys(pricingTiers).length > 0 ? "starting price" : "per person"}</span>}
            </div>
            {/* Rating */}
            <div className="flex flex-col items-end">
              {isHiddenGem ? (
                <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 flex items-center shadow-sm">
                  <span className="text-sm font-bold text-emerald-600 tracking-wide">💎 Hidden Gem</span>
                </div>
              ) : reviewCount === 0 || !rating ? (
                <div className="flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                  <span className="text-rose-500">★</span>
                  <span className="font-bold text-rose-500 text-sm">New</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{rating.toFixed(1)}</span>
                    <span className="text-yellow-400">★</span>
                  </div>
                  <a href="#reviews-section" className="text-sm text-zinc-500 hover:text-zinc-800 hover:underline transition-colors cursor-pointer">
                    {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Desktop Only: Inline Calendar */}
          <div className="hidden md:flex justify-center border-t border-zinc-100 pt-4 mt-2">
            <DayPicker 
              mode="single"
              selected={date ? parse(date, 'yyyy-MM-dd', new Date()) : undefined}
              onSelect={(d) => setDate(d ? format(d, 'yyyy-MM-dd') : "")}
              disabled={(d) => {
                if (isBefore(d, startOfToday())) return true;
                const dateString = format(d, 'yyyy-MM-dd');
                return blackoutDates.includes(dateString);
              }}
              modifiersClassNames={{
                selected: 'bg-rose-500 text-white font-bold hover:bg-rose-600',
                today: 'text-rose-500 font-bold'
              }}
            />
          </div>

          {/* Desktop Button: Disabled if no date */}
          <Button onClick={() => setIsOpen(true)} disabled={!date} size="lg" className="hidden md:flex w-full shadow-lg shadow-rose-500/20 py-6 text-lg font-bold">
            Reserve Now
          </Button>

          {/* Mobile Button: Always enabled, opens drawer */}
          <Button onClick={() => setIsOpen(true)} size="lg" className="flex md:hidden w-full shadow-lg shadow-rose-500/20 py-6 text-lg font-bold">
            Reserve Now
          </Button>
          <p className="text-center text-sm font-medium text-zinc-400 mt-1">
            {priceUsd === 0 ? "Optional tip available during checkout." :
             paymentStrategy === 'no_card' ? "Reserve now. We'll send your invoice later." :
             paymentStrategy === 'deposit_15' ? "Pay 15% now, rest in cash to your guide." :
             paymentStrategy === 'manual_hold' ? "Zero charge today. Card held for 24 hours." :
             "Secure checkout with Stripe."}
          </p>
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
        <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Complete Reservation</h2>
            <button 
              onClick={resetAndClose}
              className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors bg-zinc-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === "details" && (
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <CalendarDays className="w-3.5 h-3.5 text-rose-500" />
                      Travel Date
                    </label>
                    {/* Desktop View: Static Readonly Date */}
                    <div className="hidden md:flex w-full h-10 px-4 rounded-xl border border-zinc-200 bg-zinc-50 items-center justify-between cursor-not-allowed">
                      <span className="font-medium text-sm text-zinc-900">
                        {date ? format(parse(date, 'yyyy-MM-dd', new Date()), 'PP') : "No date selected"}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>

                    {/* Mobile View: Interactive Popover Calendar */}
                    <div className="md:hidden">
                      <Popover.Root>
                        <Popover.Trigger asChild>
                          <button 
                            className="w-full h-10 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-sm text-zinc-900 bg-white flex items-center justify-between"
                          >
                            {date ? format(parse(date, 'yyyy-MM-dd', new Date()), 'PP') : <span className="text-zinc-400">Select date</span>}
                            <CalendarDays className="w-4 h-4 text-zinc-400" />
                          </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content align="start" className="z-[60] bg-white rounded-xl shadow-lg border border-zinc-200 p-3 outline-none">
                            <DayPicker 
                              mode="single"
                              selected={date ? parse(date, 'yyyy-MM-dd', new Date()) : undefined}
                              onSelect={(d) => setDate(d ? format(d, 'yyyy-MM-dd') : "")}
                              disabled={(d) => {
                                if (isBefore(d, startOfToday())) return true;
                                const dateString = format(d, 'yyyy-MM-dd');
                                return blackoutDates.includes(dateString);
                              }}
                              modifiersClassNames={{
                                selected: 'bg-rose-500 text-white font-bold hover:bg-rose-600',
                                today: 'text-rose-500 font-bold'
                              }}
                            />
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>
                    </div>
                  </div>

                  {tourOptions && tourOptions.length > 0 && (
                    <div className="space-y-1 col-span-1 md:col-span-2">
                      <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                        Timeslot / Package
                      </label>
                      <select 
                        value={selectedOption}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="w-full h-10 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-sm text-zinc-900 bg-white"
                        required
                      >
                        {tourOptions.map((opt, idx) => (
                          <option key={idx} value={opt.title}>
                            {opt.title} {opt.price_modifier > 0 ? `(+$${opt.price_modifier} pp)` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-[115px_1fr] gap-3 col-span-1 md:col-span-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <Users className="w-3.5 h-3.5 text-rose-500" />
                        Guests
                      </label>
                      <div className="flex items-center gap-2 p-1 bg-zinc-50 rounded-xl border border-zinc-200 w-fit h-10">
                        <button 
                          onClick={(e) => { e.preventDefault(); setGuests(Math.max(1, guests - 1)); }}
                          className="w-8 h-8 rounded-lg bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-900 font-medium active:scale-95 transition-all disabled:opacity-50"
                          disabled={guests <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-base">{guests}</span>
                        <button 
                          onClick={(e) => { e.preventDefault(); setGuests(Math.min(maxCapacity, guests + 1)); }}
                          className="w-8 h-8 rounded-lg bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-900 font-medium active:scale-95 transition-all disabled:opacity-50"
                          disabled={guests >= maxCapacity}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                        Full Name
                      </label>
                      <input 
                        type="text" 
                        value={touristName}
                        onChange={(e) => setTouristName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full h-10 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-sm text-zinc-900"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      value={touristEmail}
                      onChange={(e) => setTouristEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full h-10 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-sm text-zinc-900"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <Phone className="w-3.5 h-3.5 text-rose-500" />
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full h-10 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-sm text-zinc-900"
                      required
                    />
                  </div>
                </div>

                {hasPickup && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      Pickup Hotel / Location (Optional)
                    </label>
                    <input 
                      type="text" 
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full h-10 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-sm text-zinc-900"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <FileText className="w-3.5 h-3.5 text-rose-500" />
                    Special Requests / Notes (Optional)
                  </label>
                  <textarea 
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={2}
                    className="w-full h-auto p-3 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-sm text-zinc-900 resize-none"
                  />
                </div>
              </div>

              {priceUsd === 0 ? (
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 mb-6">
                  <div className="mb-4 text-center">
                    <h4 className="font-black text-emerald-900 text-lg mb-1">Support this free guide 🌴</h4>
                    <p className="text-sm text-emerald-600 font-medium">Tips are 100% optional but keep these hidden gems accessible to everyone.</p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    {[0, 3, 5, 10].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDonationAmount(amount)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                          donationAmount === amount 
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                            : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
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
              )}

              <Button 
                onClick={(e) => { e.preventDefault(); handleStripeCheckout(); }} 
                disabled={!date || !whatsapp || !touristName || !touristEmail}
                className={`w-full h-14 text-lg font-bold rounded-xl transition-all ${priceUsd === 0 ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'shadow-xl shadow-rose-500/20'}`}
              >
                {priceUsd === 0 
                  ? (donationAmount === 0 ? "Get Guide for Free" : `Donate $${donationAmount} & Get Guide`) 
                  : "Proceed to Payment"}
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
                  {selectedOption && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-medium">Option</span>
                      <span className="font-bold text-zinc-900">{selectedOption}</span>
                    </div>
                  )}
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
