"use client"

import { useState } from "react"
import { updateGlobalSetting } from "@/app/actions/settings"
import { uploadToCloudinary } from "@/app/actions/upload"
import { Save, Loader2, ImagePlus, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import toast from "react-hot-toast"

export interface SpotlightConfig {
  id?: string; // local id for keys
  title: string;
  description: string;
  image_url_1: string;
  image_url_2: string;
  button_text: string;
  target_url: string;
  badge_text?: string;
  location?: string;
  category_tags?: string[];
}

export function SpotlightClient({ initialConfig, locations = [], categories = [] }: { initialConfig: SpotlightConfig[], locations?: string[], categories?: any[] }) {
  // Ensure we have at least one slide and they all have an ID
  const [configs, setConfigs] = useState<SpotlightConfig[]>(
    Array.isArray(initialConfig) && initialConfig.length > 0
      ? initialConfig.map(c => ({ ...c, id: c.id || Math.random().toString(36).substring(7) }))
      : [{
        id: Math.random().toString(36).substring(7),
        title: "Our Story: Driven By Wanderlust, Powered By Experience",
        description: "We believe that travel is more than just visiting a new place—it's about creating lasting memories. From the hidden waterfalls to the breathtaking coastline, we provide exclusive access to authentic Sri Lankan adventures.",
        image_url_1: "https://images.unsplash.com/photo-1549366021-9f761d450615?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        image_url_2: "https://images.unsplash.com/photo-1588825121118-20d0f7a73155?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        button_text: "Find More",
        target_url: ""
      }]
  )

  const [activeIndex, setActiveIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading1, setIsUploading1] = useState(false)
  const [isUploading2, setIsUploading2] = useState(false)

  const activeConfig = configs[activeIndex]

  const updateActiveConfig = (updates: Partial<SpotlightConfig>) => {
    setConfigs(prev => prev.map((c, i) => i === activeIndex ? { ...c, ...updates } : c))
  }

  const handleAddSlide = () => {
    setConfigs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      title: "New Spotlight Slide",
      description: "Description for the new slide goes here.",
      image_url_1: "https://images.unsplash.com/photo-1549366021-9f761d450615?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      image_url_2: "https://images.unsplash.com/photo-1588825121118-20d0f7a73155?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      button_text: "Find More",
      target_url: ""
    }])
    setActiveIndex(configs.length) // jump to new slide
  }

  const handleRemoveSlide = () => {
    if (configs.length <= 1) {
      toast.error("You must have at least one slide")
      return
    }
    const newConfigs = configs.filter((_, i) => i !== activeIndex)
    setConfigs(newConfigs)
    setActiveIndex(Math.max(0, activeIndex - 1))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const res = await updateGlobalSetting('featured_spotlight', configs)
    if (res.success) {
      toast.success("Spotlight carousel saved!")
    } else {
      toast.error(res.error || "Failed to save carousel settings")
    }
    setIsSaving(false)
  }

  const handleImageUpload = async (file: File, imageSlot: 1 | 2) => {
    if (!file) return;

    if (imageSlot === 1) setIsUploading1(true)
    else setIsUploading2(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'spotlight')

      const result = await uploadToCloudinary(formData)
      if (result.success && result.secure_url) {
        updateActiveConfig({ [`image_url_${imageSlot}`]: result.secure_url })
        toast.success(`Image ${imageSlot} uploaded successfully!`)
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (err: any) {
      console.error("Image upload error:", err)
      toast.error(err.message || "Failed to upload image")
    } finally {
      if (imageSlot === 1) setIsUploading1(false)
      else setIsUploading2(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-8">

      {/* Top Bar for Carousel Slide Management */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-zinc-100 pb-4 gap-4">
        <h2 className="text-xl font-bold text-zinc-900">Spotlight Carousel Slides</h2>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className="p-1 rounded hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-sm px-2 text-zinc-700">
              Slide {activeIndex + 1} of {configs.length}
            </span>
            <button
              onClick={() => setActiveIndex(Math.min(configs.length - 1, activeIndex + 1))}
              disabled={activeIndex === configs.length - 1}
              className="p-1 rounded hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleAddSlide}
            className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Slide
          </button>

          <button
            onClick={handleRemoveSlide}
            disabled={configs.length <= 1}
            className="flex items-center gap-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Remove
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12" key={activeConfig.id}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Linked Location</label>
              <select
                value={activeConfig.location || ""}
                onChange={(e) => updateActiveConfig({ location: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium bg-white"
              >
                <option value="">None (Show everywhere)</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Badge Text (Optional Override)</label>
              <input
                type="text"
                value={activeConfig.badge_text || ""}
                onChange={(e) => updateActiveConfig({ badge_text: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
                placeholder="e.g. 🌴 Featured"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Headline Title</label>
              <input
                type="text"
                value={activeConfig.title}
                onChange={(e) => updateActiveConfig({ title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
                placeholder="e.g. Our Story: Driven By Wanderlust..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Description</label>
            <textarea
              value={activeConfig.description}
              onChange={(e) => updateActiveConfig({ description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
              placeholder="Write a compelling story or description..."
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Linked Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => {
                const isSelected = activeConfig.category_tags?.includes(cat.slug);
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => {
                      const currentTags = activeConfig.category_tags || [];
                      const newTags = isSelected
                        ? currentTags.filter(t => t !== cat.slug)
                        : [...currentTags, cat.slug];
                      updateActiveConfig({ category_tags: newTags });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${isSelected ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-zinc-600 border-zinc-200 hover:border-rose-500'}`}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Button Text</label>
              <input
                type="text"
                value={activeConfig.button_text}
                onChange={(e) => updateActiveConfig({ button_text: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                placeholder="e.g. Find More"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Target URL</label>
              <input
                type="text"
                value={activeConfig.target_url}
                onChange={(e) => updateActiveConfig({ target_url: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                placeholder="e.g. /activity/sunset-safari"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center w-full gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save All Carousel Slides
            </button>
          </div>
        </div>

        {/* Image Uploads */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-6">Slide Images</h2>
          <div className="grid grid-cols-2 gap-4 h-[400px]">
            {/* Image 1 Slot */}
            <div className="relative rounded-2xl border-2 border-dashed border-zinc-200 overflow-hidden group bg-zinc-50 flex items-center justify-center">
              {activeConfig.image_url_1 ? (
                <Image src={activeConfig.image_url_1} alt="Image 1" fill className="object-cover" />
              ) : null}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center cursor-pointer">
                {isUploading1 ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8 mb-2" />
                    <span className="font-bold text-sm">Upload Left Image</span>
                    <span className="text-xs opacity-70 mt-1">Aspect Ratio 4:3 or Vertical</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 1)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isUploading1}
                />
              </div>
            </div>

            {/* Image 2 Slot */}
            <div className="relative rounded-2xl border-2 border-dashed border-zinc-200 overflow-hidden group bg-zinc-50 flex items-center justify-center">
              {activeConfig.image_url_2 ? (
                <Image src={activeConfig.image_url_2} alt="Image 2" fill className="object-cover" />
              ) : null}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center cursor-pointer">
                {isUploading2 ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8 mb-2" />
                    <span className="font-bold text-sm">Upload Right Image</span>
                    <span className="text-xs opacity-70 mt-1">Aspect Ratio 4:3 or Vertical</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 2)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isUploading2}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
