"use client"

import { useState, useEffect } from "react"
import { getCommissionSettings, updateGlobalCommissionRate } from "@/app/actions/finances"
import { Loader2, Save, Percent } from "lucide-react"
import Link from "next/link"

export default function FinancesPage() {
  const [settings, setSettings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<string | null>(null)
  
  const [rates, setRates] = useState<Record<string, number>>({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    const data = await getCommissionSettings()
    setSettings(data)
    
    const initialRates: Record<string, number> = {}
    data.forEach((s: any) => {
      initialRates[s.category_name] = s.default_rate
    })
    setRates(initialRates)
    setIsLoading(false)
  }

  const handleSave = async (categoryName: string) => {
    setIsSaving(categoryName)
    const newRate = rates[categoryName]
    const res = await updateGlobalCommissionRate(categoryName, newRate)
    setIsSaving(null)
    if (res.success) {
      alert("Successfully updated global commission rate and synced all relevant activities!")
      loadSettings()
    } else {
      alert("Error: " + res.error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Admin Operations</h1>
            <p className="text-zinc-500 mt-1">Manage global commission rates across all categories.</p>
          </div>
        </div>

        <div className="flex gap-6 border-b border-zinc-200 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/admin" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Bookings</Link>
          <Link href="/admin/tours" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Tours Database</Link>
          <Link href="/admin/reviews" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Reviews</Link>
          <Link href="/admin/promos" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Promo Codes</Link>
          <Link href="/admin/finances" className="pb-3 border-b-2 border-zinc-900 font-bold text-zinc-900 px-1">Finances</Link>
          <Link href="/admin/earnings" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Earnings</Link>
          <Link href="/admin/hosts" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Hosts</Link>
          <Link href="/admin/categories" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Categories</Link>
          <Link href="/admin/settings" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Global Settings</Link>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
          <Percent className="w-5 h-5 text-rose-500" />
          Global Commission Rates
        </h2>
        
        <div className="space-y-6">
          {settings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between p-4 border border-zinc-100 rounded-2xl bg-zinc-50">
              <div>
                <h3 className="font-bold text-zinc-900 capitalize">{setting.category_name}</h3>
                <p className="text-sm text-zinc-500">Base rate for {setting.category_name} activities.</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="number"
                    value={rates[setting.category_name] || 0}
                    onChange={(e) => setRates({ ...rates, [setting.category_name]: parseFloat(e.target.value) })}
                    className="w-24 pl-4 pr-8 py-2 rounded-xl border border-zinc-200 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    step="0.01"
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                </div>
                
                <button
                  onClick={() => handleSave(setting.category_name)}
                  disabled={isSaving === setting.category_name || rates[setting.category_name] === setting.default_rate}
                  className="bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors min-w-[100px] justify-center"
                >
                  {isSaving === setting.category_name ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm">
          <strong>Note:</strong> Updating a global rate will immediately update the commission rate for all existing activities in that category, <strong>except</strong> those that have a custom negotiated rate.
        </div>
        </div>
        </div>
      </div>
    </div>
  )
}
