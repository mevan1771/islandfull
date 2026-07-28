"use client"

import { useState, useEffect } from "react"
import { updateSettings, getPlatformSettings } from "@/app/actions/settings"
import { Save, Loader2, Globe, DollarSign, Activity } from "lucide-react"
import Link from "next/link"

export default function AdminSettingsPage() {
  const [isLiveRate, setIsLiveRate] = useState(false)
  const [manualRate, setManualRate] = useState(300)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', msg: string} | null>(null)

  useEffect(() => {
    async function loadData() {
      const data = await getPlatformSettings();
      setIsLiveRate(data.use_live_rate);
      setManualRate(data.manual_usd_lkr_rate);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg(null);
    
    const res = await updateSettings(isLiveRate, manualRate);
    
    if (res.success) {
      setStatusMsg({ type: 'success', msg: "Settings saved successfully! Site updated instantly." })
      setTimeout(() => setStatusMsg(null), 3000);
    } else {
      setStatusMsg({ type: 'error', msg: res.error || "Failed to save settings." })
    }
    
    setIsSaving(false);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Admin Operations</h1>
            <p className="text-zinc-500 mt-1">Manage platform-wide configuration and behavior.</p>
          </div>
        </div>

        <div className="flex gap-6 border-b border-zinc-200 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/admin" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Bookings</Link>
          <Link href="/admin/tours" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Tours Database</Link>
          <Link href="/admin/reviews" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Reviews</Link>
          <Link href="/admin/promos" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Promo Codes</Link>
          <Link href="/admin/finances" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Finances</Link>
          <Link href="/admin/earnings" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Earnings</Link>
          <Link href="/admin/hosts" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Hosts</Link>
          <Link href="/admin/settings" className="pb-3 border-b-2 border-zinc-900 font-bold text-zinc-900 px-1">Global Settings</Link>
        </div>

        <div className="max-w-4xl space-y-8">

      <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Currency & Localization</h2>
            <p className="text-sm text-zinc-500">Control the exact USD to LKR exchange rate used across all tours.</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Toggle Area */}
          <div className="flex items-center justify-between p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div className="space-y-1">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                Live Market Rate API
              </h3>
              <p className="text-sm text-zinc-500 max-w-sm">
                Automatically fetch and cache the live exchange rate daily from open API. Turn off to manually set a fixed rate.
              </p>
            </div>
            
            {/* Custom Toggle Switch */}
            <button 
              onClick={() => setIsLiveRate(!isLiveRate)}
              className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${isLiveRate ? 'bg-rose-500' : 'bg-zinc-300'}`}
            >
              <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 shadow-sm ${isLiveRate ? 'translate-x-8' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Manual Rate Input - Transitions cleanly */}
          <div className={`transition-all duration-500 overflow-hidden ${!isLiveRate ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 border-2 border-indigo-100 bg-indigo-50/50 rounded-2xl space-y-4">
              <label className="text-sm font-bold text-indigo-900 tracking-wide uppercase flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Manual Fixed Rate (1 USD = X LKR)
              </label>
              <div className="relative max-w-sm">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">Rs.</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={manualRate}
                  onChange={(e) => setManualRate(parseFloat(e.target.value) || 0)}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none font-bold text-xl text-zinc-900 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-10 pt-6 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex-1">
            {statusMsg && (
              <span className={`text-sm font-bold ${statusMsg.type === 'success' ? 'text-green-600' : 'text-red-500'} animate-in fade-in`}>
                {statusMsg.msg}
              </span>
            )}
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold shadow-lg shadow-zinc-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>
        </div>
      </div>
    </div>
  )
}
