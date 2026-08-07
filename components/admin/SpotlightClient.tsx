"use client"

import { useState } from "react"
import { updateGlobalSetting } from "@/app/actions/settings"
import { uploadToCloudinary } from "@/app/actions/upload"
import { Save, Loader2, ImagePlus } from "lucide-react"
import Image from "next/image"
import toast from "react-hot-toast"

interface SpotlightConfig {
  title: string;
  description: string;
  image_url_1: string;
  image_url_2: string;
  button_text: string;
  target_url: string;
}

export function SpotlightClient({ initialConfig }: { initialConfig: SpotlightConfig }) {
  const [config, setConfig] = useState<SpotlightConfig>(initialConfig)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading1, setIsUploading1] = useState(false)
  const [isUploading2, setIsUploading2] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    const res = await updateGlobalSetting('featured_spotlight', config)
    if (res.success) {
      toast.success("Spotlight settings saved!")
    } else {
      toast.error(res.error || "Failed to save settings")
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
        setConfig(prev => ({
          ...prev,
          [`image_url_${imageSlot}`]: result.secure_url
        }))
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
      <div className="grid md:grid-cols-2 gap-12">
        {/* Form Fields */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">Spotlight Content</h2>
          
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Headline Title</label>
            <input 
              type="text" 
              value={config.title}
              onChange={(e) => setConfig({...config, title: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
              placeholder="e.g. Our Story: Driven By Wanderlust..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Description</label>
            <textarea 
              value={config.description}
              onChange={(e) => setConfig({...config, description: e.target.value})}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
              placeholder="Write a compelling story or description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Button Text</label>
              <input 
                type="text" 
                value={config.button_text}
                onChange={(e) => setConfig({...config, button_text: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                placeholder="e.g. Find More"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Target URL</label>
              <input 
                type="text" 
                value={config.target_url}
                onChange={(e) => setConfig({...config, target_url: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                placeholder="e.g. /activity/sunset-safari"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Spotlight Settings
            </button>
          </div>
        </div>

        {/* Image Uploads */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-6">Vertical Images</h2>
          <div className="grid grid-cols-2 gap-4 h-[400px]">
            {/* Image 1 Slot */}
            <div className="relative rounded-2xl border-2 border-dashed border-zinc-200 overflow-hidden group bg-zinc-50 flex items-center justify-center">
              {config.image_url_1 ? (
                <Image src={config.image_url_1} alt="Image 1" fill className="object-cover" />
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
              {config.image_url_2 ? (
                <Image src={config.image_url_2} alt="Image 2" fill className="object-cover" />
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
