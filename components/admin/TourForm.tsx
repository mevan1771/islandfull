"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createTour, updateTour } from "@/app/actions/tours"
import { ArrowLeft, Save, Image as ImageIcon, Loader2 } from "lucide-react"
import Link from "next/link"

export default function TourForm({ categories, initialData }: { categories: any[], initialData?: any }) {
  const router = useRouter()
  const isEditing = !!initialData
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState(initialData?.cover_image_url || "")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    let result;
    if (isEditing) {
      result = await updateTour(initialData.id, formData)
    } else {
      result = await createTour(formData)
    }

    if (result.success) {
      alert(isEditing ? "Tour updated successfully!" : "Tour published successfully to IslandFull!")
      router.push("/admin/tours")
    } else {
      setError(result.error || (isEditing ? "Failed to update tour" : "Failed to create tour"))
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/tours" 
          className="p-2.5 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{isEditing ? "Edit Tour" : "Create New Tour"}</h1>
          <p className="text-zinc-500 mt-1">{isEditing ? "Update existing activity details." : "Publish a new activity to the live website."}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-8 space-y-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-800 tracking-wide uppercase">Activity Title</label>
              <input 
                name="title"
                type="text" 
                defaultValue={initialData?.title}
                placeholder="Secret Sunset Surf Lesson in Hiriketiya"
                className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-zinc-900"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-800 tracking-wide uppercase">Location</label>
                <select 
                  name="location"
                  className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-zinc-900 bg-white"
                  required
                  defaultValue={initialData?.location || ""}
                >
                  <option value="" disabled>Select City</option>
                  <option value="Ella">Ella</option>
                  <option value="Mirissa">Mirissa</option>
                  <option value="Hiriketiya">Hiriketiya</option>
                  <option value="Sigiriya">Sigiriya</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Arugam Bay">Arugam Bay</option>
                  <option value="Colombo">Colombo</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-800 tracking-wide uppercase">Category</label>
                <select 
                  name="category_id"
                  className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-zinc-900 bg-white"
                  required
                  defaultValue={initialData?.category_id || ""}
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-800 tracking-wide uppercase">Duration</label>
                <input 
                  name="duration"
                  type="text" 
                  defaultValue={initialData?.duration}
                  placeholder="e.g., 2 Hours, Half Day"
                  className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-zinc-900"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-800 tracking-wide uppercase">Max Guests</label>
                <input 
                  name="max_capacity"
                  type="number" 
                  min="1"
                  defaultValue={initialData?.max_capacity || 10}
                  className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-zinc-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-800 tracking-wide uppercase">Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                  <input 
                    name="price_usd"
                    type="number" 
                    step="0.01"
                    defaultValue={initialData?.price_usd}
                    placeholder="35.00"
                    className="w-full h-12 pl-8 pr-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-zinc-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-800 tracking-wide uppercase">Price (LKR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">LKR</span>
                  <input 
                    name="price_lkr_approx"
                    type="number" 
                    step="100"
                    defaultValue={initialData?.price_lkr_approx}
                    placeholder="10500"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-zinc-900"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-800 tracking-wide uppercase">Status</label>
                <select 
                  name="status"
                  className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-zinc-900 bg-white"
                  defaultValue={initialData?.status || "published"}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-800 tracking-wide uppercase">Cover Image URL</label>
              <input 
                name="cover_image_url"
                type="url" 
                placeholder="https://images.unsplash.com/..."
                value={previewImage}
                onChange={(e) => setPreviewImage(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-zinc-900"
                required
              />
              {/* Image Preview Box */}
              <div className="mt-4 w-full aspect-video rounded-xl border-2 border-dashed border-zinc-200 overflow-hidden relative bg-zinc-50 flex items-center justify-center">
                {previewImage ? (
                  <Image 
                    src={previewImage} 
                    alt="Preview" 
                    fill 
                    className="object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center text-zinc-400">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Image Preview</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-800 tracking-wide uppercase">Full Description</label>
              <textarea 
                name="description"
                defaultValue={initialData?.description}
                placeholder="Describe the amazing experience..."
                className="w-full h-32 p-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-zinc-900 resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-800 tracking-wide uppercase">Inclusions (One per line)</label>
              <textarea 
                name="inclusions"
                defaultValue={initialData?.inclusions?.join('\n')}
                placeholder="Surfboard Rental&#10;Rash Guard&#10;2 Hour Lesson"
                className="w-full h-32 p-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-zinc-900 resize-none"
                required
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-100 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl font-bold shadow-xl shadow-rose-500/20 transition-all active:scale-95 text-lg"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSubmitting ? (isEditing ? "Updating..." : "Publishing...") : (isEditing ? "Save Changes" : "Publish Tour")}
          </button>
        </div>
      </form>
    </div>
  )
}
