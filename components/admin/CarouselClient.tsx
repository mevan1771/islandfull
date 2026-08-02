"use client"

import { useState } from "react"
import { updateCarouselOrder } from "@/app/actions/carousel"
import toast from "react-hot-toast"
import { Save, Loader2, Plus, Trash2 } from "lucide-react"

export function CarouselClient({ initialTours, allTours }: { initialTours: any[], allTours: any[] }) {
  const [tours, setTours] = useState(initialTours)
  const [saving, setSaving] = useState(false)
  const [selectedTourToAdd, setSelectedTourToAdd] = useState("")

  const handleOrderChange = (id: string, newOrder: number) => {
    setTours(tours.map(t => t.id === id ? { ...t, featured_order: newOrder } : t))
  }

  const handleRemove = (id: string) => {
    setTours(tours.filter(t => t.id !== id))
  }

  const handleAdd = () => {
    if (!selectedTourToAdd) return
    const tourToAdd = allTours.find(t => t.id === selectedTourToAdd)
    if (!tourToAdd) return
    
    // Check if already in list
    if (tours.find(t => t.id === selectedTourToAdd)) {
      setSelectedTourToAdd("")
      return
    }

    setTours([...tours, { 
      id: tourToAdd.id, 
      title: tourToAdd.title, 
      cover_image_url: tourToAdd.cover_image_url || "",
      is_featured: true,
      featured_order: tours.length + 1 
    }])
    setSelectedTourToAdd("")
  }

  const handleSave = async () => {
    setSaving(true)
    
    // Sort them by featured_order locally first, to assign clean 1,2,3...
    const sorted = [...tours].sort((a, b) => a.featured_order - b.featured_order)
    
    // We need to send the updates. 
    // Also we should ideally set is_featured=false for removed tours, but 
    // since we only track current ones, removed ones won't be updated.
    // So let's track removed ones too.
    const currentIds = new Set(tours.map(t => t.id))
    const removedIds = initialTours.filter(t => !currentIds.has(t.id)).map(t => t.id)
    
    const updates: { id: string; is_featured: boolean; featured_order: number }[] = []
    
    // Add current active ones
    sorted.forEach((tour, index) => {
      updates.push({
        id: tour.id,
        is_featured: true,
        featured_order: index + 1
      })
    })
    
    // Add removed ones to set is_featured = false
    removedIds.forEach(id => {
      updates.push({
        id,
        is_featured: false,
        featured_order: 0
      })
    })

    const res = await updateCarouselOrder(updates)
    if (res.success) {
      toast.success("Carousel order saved successfully!")
      // update state to have clean 1,2,3 order
      setTours(sorted.map((t, idx) => ({...t, featured_order: idx + 1})))
    } else {
      toast.error("Failed to save: " + res.error)
    }
    setSaving(false)
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-6">
      
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-semibold text-zinc-700">Add Tour to Carousel</label>
          <select 
            value={selectedTourToAdd}
            onChange={(e) => setSelectedTourToAdd(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="">Select a tour...</option>
            {allTours.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleAdd}
          disabled={!selectedTourToAdd}
          className="bg-zinc-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="space-y-3">
        {tours.length === 0 ? (
          <p className="text-zinc-500 italic text-sm">No featured tours yet. Add one above.</p>
        ) : (
          tours.sort((a, b) => a.featured_order - b.featured_order).map((tour) => (
            <div key={tour.id} className="flex items-center gap-4 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
              <div className="w-20 font-medium">
                <input 
                  type="number" 
                  value={tour.featured_order}
                  onChange={(e) => handleOrderChange(tour.id, parseInt(e.target.value) || 0)}
                  className="w-16 p-2 rounded-md border border-zinc-300 text-center"
                  min={1}
                />
              </div>
              <div className="flex-1 font-semibold text-zinc-900">
                {tour.title}
              </div>
              <button 
                onClick={() => handleRemove(tour.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="pt-4 border-t border-zinc-100 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving || tours.length === 0}
          className="bg-rose-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-rose-600 disabled:opacity-50 flex items-center gap-2 transition-all"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? "Saving..." : "Save Order"}
        </button>
      </div>
    </div>
  )
}
