"use client"

import { useState } from "react"
import { updateGlobalSetting } from "@/app/actions/settings"
import toast from "react-hot-toast"
import { Save, Loader2 } from "lucide-react"

export function IntroSlideConfig({ initialData }: { initialData: any }) {
  const [data, setData] = useState({
    title: initialData?.title || "",
    subtitle: initialData?.subtitle || "",
    cover_image_url: initialData?.cover_image_url || ""
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const res = await updateGlobalSetting("hero_intro_slide", data)
    if (res.success) {
      toast.success("Intro slide settings saved!")
    } else {
      toast.error("Failed to save: " + res.error)
    }
    setSaving(false)
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-bold text-zinc-900">Static Intro Slide</h2>
        <p className="text-sm text-zinc-500">Configure the very first slide that appears in the carousel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700 uppercase">Title</label>
          <input 
            type="text" 
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Your Journey Starts Before You Go"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700 uppercase">Subtitle</label>
          <input 
            type="text" 
            value={data.subtitle}
            onChange={(e) => setData({ ...data, subtitle: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Inspiration, planning, and booking—all in one place."
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-semibold text-zinc-700 uppercase">Background Image URL</label>
          <input 
            type="text" 
            value={data.cover_image_url}
            onChange={(e) => setData({ ...data, cover_image_url: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-sm"
            placeholder="https://images.unsplash.com/photo-..."
          />
          {data.cover_image_url && (
            <div className="mt-3 relative w-full h-32 rounded-lg overflow-hidden border border-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.cover_image_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-zinc-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Intro Slide"}
        </button>
      </div>
    </div>
  )
}
