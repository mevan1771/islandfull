"use client"

import { useState } from "react"
import { CalendarDays, Users, Phone, X, CheckCircle2, MapPin, FileText, Gem } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatUSD, formatLKR } from "@/lib/utils"
import { validatePromoCode } from "@/app/actions/promo"
import * as Popover from "@radix-ui/react-popover"
import { DayPicker, DateRange } from "react-day-picker"
import { format, parse, isBefore, startOfToday, addDays, differenceInDays } from "date-fns"
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
  minNoticeDays?: number
  bookingType?: 'single_day' | 'multi_day'
  pricingModel?: 'per_person' | 'per_day' | 'flat_rate'
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
  reviewCount = 0,
  minNoticeDays = 1,
  bookingType = 'single_day',
  pricingModel = 'per_person'
}: BookingDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<"details" | "processing" | "success">("details")
  
  // Form state
  const [date, setDate] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [guests, setGuests] = useState(1)
  const [whatsapp, setWhatsapp] = useState("")
  const [touristName, setTouristName] = useState("")
  const [touristEmail, setTouristEmail] = useState("")
  const [selectedOption, setSelectedOption] = useState<string>(tourOptions && tourOptions.length > 0 ? tourOptions[0].title : "")
  const [pickupLocation, setPickupLocation] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  
  // Promo state
  const [promoInput, setPromoInput] = useState("")
  const [promoError, setPromoError] = useState("")
  const [promoSuccess, setPromoSuccess] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [discountUsd, setDiscountUsd] = useState(0)
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)

  // Calculate Totals using Tiered Pricing if available
  const totalDays = (() => {
    if (bookingType !== 'multi_day') return 1;
    if (!dateRange?.from) return 0;
    const endDate = dateRange.to || dateRange.from;
    return differenceInDays(endDate, dateRange.from) + 1;
  })();

  let totalUsd = 0;
  if (pricingTiers && pricingTiers[guests.toString()]) {
    // The tier price IS the flat total price for this specific group size
    totalUsd = pricingTiers[guests.toString()];
  } else if (pricingModel === 'flat_rate') {
    totalUsd = priceUsd;
  } else {
    // Default fallback: base price * number of guests
    totalUsd = priceUsd * guests;
  }

  // Multiply by days if it's a rental (per_day model)
  if (pricingModel === 'per_day') {
    totalUsd = totalUsd * totalDays;
  }
  
  // Add Option Price Modifier (which is applied per person)
  if (selectedOption && tourOptions) {
    const opt = tourOptions.find(o => o.title === selectedOption)
    if (opt) {
      const optionModifier = opt.price_modifier * guests * (pricingModel === 'per_day' ? totalDays : 1);
      totalUsd += optionModifier
    }
  }

  let totalLkr = totalUsd * (priceUsd > 0 ? (priceLkrApprox / priceUsd) : 300);

  const handleStripeCheckout = async () => {
    const isMulti = bookingType === 'multi_day';
    const finalDate = isMulti ? (dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : "") : date;
    const resolvedEndDate = isMulti ? (dateRange?.to || dateRange?.from) : undefined;
    const finalEndDate = resolvedEndDate ? format(resolvedEndDate, 'yyyy-MM-dd') : "";

    if (!finalDate || !whatsapp || !touristName || !touristEmail || (isMulti && !finalEndDate)) return
    
    setStep("processing")
    
    try {
      const res = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          title,
          priceUsd,
          date: finalDate,
          endDate: finalEndDate,
          bookingType,
          pricingModel,
          guests,
          whatsapp,
          touristName,
          touristEmail,
          selectedOption,
          totalUsd,
          pickupLocation,
          specialRequests,
          paymentStrategy: priceUsd === 0 ? 'no_card' : paymentStrategy,
          promoCode: appliedPromo
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
    } catch (err: any) {
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
      setDateRange(undefined)
      setGuests(1)
      setWhatsapp("")
      setPickupLocation("")
      setSpecialRequests("")
      setPromoInput("")
      setPromoError("")
      setPromoSuccess("")
      setAppliedPromo(null)
      setDiscountUsd(0)
    }, 300)
  }

  return (
    <>
      {/* Sticky Bottom Widget Trigger */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-zinc-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-40 md:relative md:border border-zinc-200 md:rounded-3xl md:shadow-xl md:p-6 md:bg-white md:z-auto">
        <div className="max-w-md mx-auto flex flex-row md:flex-col items-center md:items-stretch justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                {priceUsd === 0 ? (
                  <span className="text-lg md:text-3xl font-black text-emerald-500 tracking-tight uppercase">Free</span>
                ) : (
                  <span className="text-lg md:text-3xl font-bold text-zinc-900">{formatUSD(pricingTiers && pricingTiers["1"] ? pricingTiers["1"] : priceUsd)}</span>
                )}
                {paymentStrategy === 'no_card' && priceUsd !== 0 && <span className="hidden md:inline-flex px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider">⚡️ No Card Needed</span>}
                {paymentStrategy === 'deposit_15' && <span className="hidden md:inline-flex px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider">🔥 Pay 15% Today</span>}
                {paymentStrategy === 'manual_hold' && <span className="hidden md:inline-flex px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider">🔒 Pay Later</span>}
              </div>
              {priceUsd !== 0 && <span className="text-[10px] md:text-sm text-zinc-500 font-medium">{pricingTiers && Object.keys(pricingTiers).length > 0 ? "starting price" : "per person"}</span>}
            </div>
            {/* Rating (Desktop Only) */}
            <div className="hidden md:flex flex-col items-end">
              {isHiddenGem ? (
                <div className="px-3 py-1 rounded-full bg-rose-50 border border-rose-100 flex items-center shadow-sm">
                  <span className="flex items-center gap-1 text-sm font-bold text-rose-500 tracking-wide">
                    <Gem className="w-4 h-4 text-blue-500 fill-blue-500" />
                    Gem
                  </span>
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
            
            {/* Mobile Button: Side-by-side with price */}
            <Button onClick={() => setIsOpen(true)} className="flex md:hidden w-auto h-[44px] px-5 text-sm font-bold rounded-xl shadow-lg shadow-rose-500/20">
              Reserve Now
            </Button>
          </div>

          {/* Desktop Only: Inline Calendar */}
          <div className="hidden md:flex justify-center border-t border-zinc-100 pt-4 mt-2">
            {bookingType === 'multi_day' ? (
              <DayPicker 
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                disabled={(d) => {
                  const minDate = addDays(startOfToday(), minNoticeDays > 0 ? minNoticeDays + 1 : 0);
                  if (isBefore(d, minDate)) return true;
                  const dateString = format(d, 'yyyy-MM-dd');
                  return blackoutDates.includes(dateString);
                }}
                modifiersClassNames={{
                  selected: 'bg-rose-500 text-white font-bold hover:bg-rose-600',
                  today: 'text-rose-500 font-bold',
                  range_start: 'bg-rose-500 text-white font-bold rounded-l-md rounded-r-none',
                  range_end: 'bg-rose-500 text-white font-bold rounded-r-md rounded-l-none',
                  range_middle: 'bg-rose-100 text-rose-900 rounded-none hover:bg-rose-200'
                }}
              />
            ) : (
              <DayPicker 
                mode="single"
                selected={date ? parse(date, 'yyyy-MM-dd', new Date()) : undefined}
                onSelect={(d) => setDate(d ? format(d, 'yyyy-MM-dd') : "")}
                disabled={(d) => {
                  const minDate = addDays(startOfToday(), minNoticeDays > 0 ? minNoticeDays + 1 : 0);
                  if (isBefore(d, minDate)) return true;
                  const dateString = format(d, 'yyyy-MM-dd');
                  return blackoutDates.includes(dateString);
                }}
                modifiersClassNames={{
                  selected: 'bg-rose-500 text-white font-bold hover:bg-rose-600',
                  today: 'text-rose-500 font-bold'
                }}
              />
            )}
          </div>

          {/* Desktop Button: Disabled if no date */}
          <Button onClick={() => setIsOpen(true)} disabled={bookingType === 'multi_day' ? !dateRange?.from : !date} size="lg" className="hidden md:flex w-full shadow-lg shadow-rose-500/20 py-6 text-lg font-bold">
            Reserve Now
          </Button>
          
          <p className="hidden md:block text-center text-sm font-medium text-zinc-400 mt-1">
            {priceUsd === 0 ? "Complete Reservation" :
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
                        {bookingType === 'multi_day' 
                          ? (dateRange?.from && dateRange?.to ? `${format(dateRange.from, 'PP')} - ${format(dateRange.to, 'PP')}` : "No dates selected")
                          : (date ? format(parse(date, 'yyyy-MM-dd', new Date()), 'PP') : "No date selected")}
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
                            {bookingType === 'multi_day' 
                              ? (dateRange?.from && dateRange?.to ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}` : <span className="text-zinc-400">Select dates</span>)
                              : (date ? format(parse(date, 'yyyy-MM-dd', new Date()), 'PP') : <span className="text-zinc-400">Select date</span>)}
                            <CalendarDays className="w-4 h-4 text-zinc-400" />
                          </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content align="start" className="z-[60] bg-white rounded-xl shadow-lg border border-zinc-200 p-3 outline-none">
                            {bookingType === 'multi_day' ? (
                              <DayPicker 
                                mode="range"
                                selected={dateRange}
                                onSelect={setDateRange}
                                disabled={(d) => {
                                  const minDate = addDays(startOfToday(), minNoticeDays > 0 ? minNoticeDays + 1 : 0);
                                  if (isBefore(d, minDate)) return true;
                                  const dateString = format(d, 'yyyy-MM-dd');
                                  return blackoutDates.includes(dateString);
                                }}
                                modifiersClassNames={{
                                  selected: 'bg-rose-500 text-white font-bold hover:bg-rose-600',
                                  today: 'text-rose-500 font-bold',
                                  range_start: 'bg-rose-500 text-white font-bold rounded-l-md rounded-r-none',
                                  range_end: 'bg-rose-500 text-white font-bold rounded-r-md rounded-l-none',
                                  range_middle: 'bg-rose-100 text-rose-900 rounded-none hover:bg-rose-200'
                                }}
                              />
                            ) : (
                              <DayPicker 
                                mode="single"
                                selected={date ? parse(date, 'yyyy-MM-dd', new Date()) : undefined}
                                onSelect={(d) => setDate(d ? format(d, 'yyyy-MM-dd') : "")}
                                disabled={(d) => {
                                  const minDate = addDays(startOfToday(), minNoticeDays > 0 ? minNoticeDays + 1 : 0);
                                  if (isBefore(d, minDate)) return true;
                                  const dateString = format(d, 'yyyy-MM-dd');
                                  return blackoutDates.includes(dateString);
                                }}
                                modifiersClassNames={{
                                  selected: 'bg-rose-500 text-white font-bold hover:bg-rose-600',
                                  today: 'text-rose-500 font-bold'
                                }}
                              />
                            )}
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
                        {bookingType === 'multi_day' ? 'Quantity' : 'Guests'}
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
                      placeholder="e.g. Hotel name, Address or Landmark"
                      className="w-full h-10 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-sm text-zinc-900"
                    />
                    <p className="text-[0.8rem] text-zinc-500 font-medium leading-relaxed">
                      If your activity includes pickup, please provide your hotel name or specific location. We will confirm details via WhatsApp.
                    </p>
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

              {priceUsd > 0 && (
                <div className="space-y-3 mt-4">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value.toUpperCase())
                        setPromoError("")
                        setPromoSuccess("")
                      }}
                      placeholder="Have a promo code?"
                      className="flex-1 h-10 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium text-sm text-zinc-900 uppercase placeholder:normal-case"
                      disabled={!!appliedPromo}
                    />
                    {appliedPromo ? (
                      <Button 
                        type="button" 
                        variant="outline"
                        className="h-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200"
                        onClick={() => {
                          setAppliedPromo(null)
                          setDiscountUsd(0)
                          setPromoInput("")
                          setPromoSuccess("")
                        }}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button 
                        type="button" 
                        variant="outline"
                        className="h-10"
                        disabled={!promoInput || isApplyingPromo}
                        onClick={async (e) => {
                          e.preventDefault()
                          setIsApplyingPromo(true)
                          setPromoError("")
                          setPromoSuccess("")
                          try {
                            const res = await validatePromoCode(promoInput, totalUsd)
                            if (res.success) {
                              setAppliedPromo(res.code || null)
                              setDiscountUsd(res.discountAmountUsd || 0)
                              setPromoSuccess(`-$${res.discountAmountUsd || 0} discount applied!`)
                            } else {
                              setPromoError(res.error || "Failed to apply promo")
                            }
                          } catch (err: any) {
                            setPromoError("Failed to validate promo code.")
                          }
                          setIsApplyingPromo(false)
                        }}
                      >
                        {isApplyingPromo ? "..." : "Apply"}
                      </Button>
                    )}
                  </div>
                  {promoError && <p className="text-xs text-rose-500 font-bold">{promoError}</p>}
                  {promoSuccess && <p className="text-xs text-emerald-500 font-bold">{promoSuccess}</p>}
                </div>
              )}

              {priceUsd > 0 && (
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-zinc-600 font-medium">
                      Subtotal {pricingModel === 'per_day' && totalDays > 0 ? <span className="text-xs text-zinc-400 ml-1">({totalDays} {totalDays === 1 ? 'day' : 'days'})</span> : ''}
                    </span>
                    <span className="font-medium text-lg text-zinc-900">{formatUSD(totalUsd)}</span>
                  </div>
                  {discountUsd > 0 && (
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-emerald-600 font-bold">Promo Discount</span>
                      <span className="font-bold text-lg text-emerald-600">-{formatUSD(discountUsd)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-200">
                    <span className="text-zinc-800 font-bold">Total (USD)</span>
                    <span className="font-black text-2xl text-zinc-900">{formatUSD(Math.max(0, totalUsd - discountUsd))}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-zinc-500 text-xs">≈ {formatLKR(Math.max(0, totalLkr - (discountUsd * (priceUsd > 0 ? priceLkrApprox / priceUsd : 300))))} LKR</span>
                    {paymentStrategy === 'deposit_15' && (
                      <span className="text-emerald-600 text-xs font-bold">15% Deposit Today</span>
                    )}
                  </div>
                </div>
              )}

              <Button 
                onClick={(e) => { e.preventDefault(); handleStripeCheckout(); }} 
                disabled={(bookingType === 'multi_day' ? !dateRange?.from : !date) || !whatsapp || !touristName || !touristEmail}
                className={`w-full h-14 text-lg font-bold rounded-xl transition-all shadow-xl shadow-rose-500/20`}
              >
                {priceUsd === 0 
                  ? "Complete Reservation" 
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
