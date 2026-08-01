"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createTour, updateTour } from "@/app/actions/tours"
import { uploadToCloudinary } from "@/app/actions/upload"
import { ArrowLeft, Save, Image as ImageIcon, Loader2, MapPin, Compass, Tag, Clock, Users, DollarSign, Text, CheckSquare, Eye, Briefcase, X, Images, Plus, Trash2, List, Car, CalendarDays, Percent } from "lucide-react"
import Link from "next/link"
import { DayPicker } from "react-day-picker"
import { format, parse } from "date-fns"
import "react-day-picker/dist/style.css"
import CreatableSelect from "react-select/creatable"
import { ImageCropperModal } from "./ImageCropperModal"

const TOTAL_STEPS = 4;

export default function TourForm({ categories, initialData }: { categories: any[], initialData?: any }) {
  const router = useRouter()
  const isEditing = !!initialData
  
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [previewImage, setPreviewImage] = useState(initialData?.cover_image_url || "")
  const [galleryImages, setGalleryImages] = useState<string[]>(initialData?.gallery_urls || [])
  
  // Commission & Category State
  const [categoryType, setCategoryType] = useState<string>(initialData?.category_type || "tour")
  const [commissionRate, setCommissionRate] = useState<string>(initialData?.commission_rate?.toString() || "15")
  const [isCustomCommission, setIsCustomCommission] = useState<boolean>(initialData?.is_custom_commission || false)
  const [globalSettings, setGlobalSettings] = useState<Record<string, number>>({})
  const [hosts, setHosts] = useState<any[]>([])
  const [hostId, setHostId] = useState<string>(initialData?.host_id || "00000000-0000-0000-0000-000000000000")

  useEffect(() => {
    import("@/app/actions/finances").then(({ getCommissionSettings }) => {
      getCommissionSettings().then((settings) => {
        const rates: Record<string, number> = {}
        settings.forEach((s: any) => {
          rates[s.category_name] = s.default_rate
        })
        setGlobalSettings(rates)
        
        // If creating a new tour and no custom rate set yet, use the global default for 'tour'
        if (!initialData && rates["tour"]) {
          setCommissionRate(rates["tour"].toString())
        }
      })
    })

    import("@/app/actions/hosts").then(({ getHosts }) => {
      getHosts().then((fetchedHosts) => {
        setHosts(fetchedHosts)
      })
    })
  }, [initialData])

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value
    setCategoryType(newCategory)
    
    // Auto-fill commission rate if it's not custom
    if (!isCustomCommission && globalSettings[newCategory]) {
      setCommissionRate(globalSettings[newCategory].toString())
    }
  }

  const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommissionRate(e.target.value)
    setIsCustomCommission(true) // Mark as custom if user edits it
  }

  const resetToGlobalDefault = () => {
    if (globalSettings[categoryType]) {
      setCommissionRate(globalSettings[categoryType].toString())
      setIsCustomCommission(false)
    }
  }

  const [blackoutDates, setBlackoutDates] = useState<Date[]>(
    initialData?.blackout_dates 
      ? initialData.blackout_dates.map((d: string) => parse(d, 'yyyy-MM-dd', new Date())) 
      : []
  )

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isGalleryDragOver, setIsGalleryDragOver] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [useOriginalForCard, setUseOriginalForCard] = useState(true)
  const [originalCoverFile, setOriginalCoverFile] = useState<File | null>(null)
  const [cardImage, setCardImage] = useState<string>(initialData?.card_image_url || "")

  // Tiered Pricing State (array of {guests, price} for easy rendering)
  const [tiers, setTiers] = useState<{guests: string, price: string}[]>(() => {
    if (initialData?.pricing_tiers) {
      return Object.entries(initialData.pricing_tiers).map(([guests, price]) => ({
        guests,
        price: String(price)
      }))
    }
    return []
  })

  const addTier = () => setTiers([...tiers, { guests: "", price: "" }])
  const removeTier = (index: number) => setTiers(tiers.filter((_, i) => i !== index))
  const updateTier = (index: number, field: 'guests' | 'price', value: string) => {
    const newTiers = [...tiers]
    newTiers[index][field] = value
    setTiers(newTiers)
  }

  // Tour Options State (array of {title, price_modifier})
  const [options, setOptions] = useState<{title: string, price_modifier: string}[]>(() => {
    if (initialData?.tour_options && Array.isArray(initialData.tour_options)) {
      return initialData.tour_options.map((opt: any) => ({
        title: opt.title || "",
        price_modifier: String(opt.price_modifier || 0)
      }))
    }
    return []
  })

  const addOption = () => setOptions([...options, { title: "", price_modifier: "0" }])
  const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index))
  const updateOption = (index: number, field: 'title' | 'price_modifier', value: string) => {
    const newOptions = [...options]
    newOptions[index][field] = value
    setOptions(newOptions)
  }

  const nextStep = () => {
    const currentStepElement = document.getElementById(`step-${step}`);
    if (currentStepElement) {
      const inputs = currentStepElement.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea');
      for (const input of Array.from(inputs)) {
        if (!input.checkValidity()) {
          input.reportValidity();
          return; // Stop if invalid
        }
      }
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

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

  async function handleImageUpload(file: File) {
    if (!file) return;
    
    // Optional client-side check for 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit");
      return;
    }

    setOriginalCoverFile(file);

    if (file.type.startsWith('video/')) {
      // Direct upload for video files
      await uploadCroppedImage(file)
    } else {
      // Use FileReader to get base64 string for cropper
      const reader = new FileReader()
      reader.onload = () => {
        setCropImageSrc(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function uploadCroppedImage(file: File | Blob) {
    setIsUploadingImage(true);
    setError(null);

    try {
      if (useOriginalForCard && originalCoverFile) {
        // Upload the original uncropped file for the card
        const originalData = new FormData();
        originalData.append("file", originalCoverFile);
        const originalResult = await uploadToCloudinary(originalData);
        if (originalResult.success && originalResult.secure_url) {
          setCardImage(originalResult.secure_url);
        } else {
          throw new Error("Failed to upload uncropped card image");
        }
      }

      // Upload the cropped file for the banner
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadToCloudinary(formData);
      
      if (result.success && result.secure_url) {
        setPreviewImage(result.secure_url);
        setCropImageSrc(null); // Close modal on success
      } else {
        throw new Error(result.error || "Failed to upload cropped cover image");
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload image");
    }
    
    setIsUploadingImage(false);
  }

  async function handleGalleryUpload(files: FileList) {
    if (!files || files.length === 0) return;
    
    // Check limit
    if (galleryImages.length + files.length > 8) {
      alert("You can only upload a maximum of 8 gallery images.");
      return;
    }

    setIsUploadingGallery(true);
    setError(null);

    const uploadPromises = Array.from(files).map(async (file) => {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File ${file.name} exceeds 5MB limit`);
      }
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadToCloudinary(formData);
      if (!result.success || !result.secure_url) {
        throw new Error(result.error || `Failed to upload ${file.name}`);
      }
      return result.secure_url;
    });

    try {
      const urls = await Promise.all(uploadPromises);
      setGalleryImages((prev) => [...prev, ...urls]);
    } catch (err: any) {
      alert(err.message || "Failed to upload some images");
    }
    
    setIsUploadingGallery(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  }

  function handleGalleryDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsGalleryDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleGalleryUpload(e.dataTransfer.files);
    }
  }

  const removeGalleryImage = (indexToRemove: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    // Prevent Enter key from submitting the form, unless it's on a textarea or they are on the last step pressing Enter on the submit button itself
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      if (step < TOTAL_STEPS) {
        nextStep();
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header & Progress Indicator */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/tours" 
          className="p-3 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm group"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
        </Link>
        <div className="flex-1">
          <div className="flex justify-between items-end mb-2">
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
              {isEditing ? "Edit Tour" : "Create New Tour"}
            </h1>
            <span className="text-sm font-bold text-zinc-400 tracking-wider uppercase">Step {step} of {TOTAL_STEPS}</span>
          </div>
          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-rose-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <form onKeyDown={handleKeyDown} onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-zinc-200/40 border border-zinc-100 p-8 sm:p-12 min-h-[500px] flex flex-col relative overflow-hidden">
        {error && (
          <div className="mb-8 bg-red-50 text-red-600 p-5 rounded-2xl border border-red-100 font-semibold flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}

        <div className="flex-1">
          {/* STEP 1: BASICS */}
          <div id="step-1" className={step === 1 ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-zinc-900">The Basics</h2>
              <p className="text-zinc-500 text-sm mt-1">Start with the core identity of the experience.</p>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                  <Compass className="w-4 h-4 text-rose-500" />
                  Activity Title
                </label>
                <input 
                  name="title"
                  type="text" 
                  defaultValue={initialData?.title}
                  placeholder="e.g. Secret Sunset Surf Lesson"
                  className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-lg text-zinc-900 placeholder:text-zinc-300"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-rose-100 bg-rose-50 rounded-2xl cursor-pointer hover:bg-rose-100/50 transition-colors">
                  <input 
                    type="checkbox" 
                    name="is_featured" 
                    defaultChecked={initialData?.is_featured || false}
                    className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500 cursor-pointer"
                  />
                  <div>
                    <span className="block font-bold text-zinc-900">Feature this Activity (Pin to top of homepage)</span>
                    <span className="block text-sm text-zinc-600 font-medium">Prioritizes this activity for maximum visibility.</span>
                  </div>
                </label>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                  <Briefcase className="w-4 h-4 text-rose-500" />
                  Hosted By (Provider)
                </label>
                <select 
                  name="host_id"
                  value={hostId}
                  onChange={(e) => setHostId(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-lg text-zinc-900 bg-white"
                  required
                >
                  <option value="" disabled>Select a host...</option>
                  {hosts.map(host => (
                    <option key={host.id} value={host.id}>{host.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                    <List className="w-4 h-4 text-rose-500" />
                    MAIN VERTICAL
                  </label>
                  <select 
                    name="category_type"
                    value={categoryType}
                    onChange={handleCategoryChange}
                    className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-lg text-zinc-900 bg-white"
                    required
                  >
                    <option value="tour">Tour</option>
                    <option value="event">Event</option>
                    <option value="transport">Transport</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                    <Percent className="w-4 h-4 text-rose-500" />
                    Commission Rate (%)
                  </label>
                  <div className="relative">
                    <input 
                      name="commission_rate"
                      type="number" 
                      step="0.01"
                      value={commissionRate}
                      onChange={handleCommissionChange}
                      className="w-full h-14 pl-5 pr-24 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-lg text-zinc-900"
                      required
                    />
                    <input type="hidden" name="is_custom_commission" value={isCustomCommission.toString()} />
                    {isCustomCommission && (
                      <button
                        type="button"
                        onClick={resetToGlobalDefault}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                    <List className="w-4 h-4 text-rose-500" />
                    Booking Type
                  </label>
                  <select 
                    name="booking_type"
                    className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-lg text-zinc-900 bg-white"
                    defaultValue={initialData?.booking_type || "single_day"}
                    required
                  >
                    <option value="single_day">Single Day (Activity)</option>
                    <option value="multi_day">Multi-Day (Rental)</option>
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    Location
                  </label>
                  <input 
                    type="text"
                    name="location"
                    list="location-suggestions"
                    className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-lg text-zinc-900 bg-white placeholder:text-zinc-300"
                    placeholder="e.g. Ella or Tissamaharama"
                    required
                    defaultValue={initialData?.location || ""}
                  />
                  <datalist id="location-suggestions">
                    <option value="Ella" />
                    <option value="Mirissa" />
                    <option value="Hiriketiya" />
                    <option value="Sigiriya" />
                    <option value="Kandy" />
                    <option value="Arugam Bay" />
                    <option value="Colombo" />
                  </datalist>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                    <Tag className="w-4 h-4 text-rose-500" />
                    SUB-CATEGORY (TAG)
                  </label>
                  <CreatableSelect
                    isMulti
                    instanceId="tour-category-select"
                    name="category_ids"
                    placeholder="Select or type a new tag..."
                    options={categories.filter(c => !c.category_type || c.category_type === categoryType).map(c => ({ label: c.name, value: c.name }))}
                    defaultValue={
                      initialData?.categories
                        ? initialData.categories.map((c: any) => ({ label: c.name, value: c.name }))
                        : []
                    }
                    className="react-select-container font-medium text-lg text-zinc-900"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: '3.5rem',
                        borderRadius: '1rem',
                        border: state.isFocused ? '2px solid #f43f5e' : '2px solid #f4f4f5',
                        boxShadow: state.isFocused ? '0 0 0 4px rgba(244, 63, 94, 0.1)' : 'none',
                        '&:hover': {
                          border: state.isFocused ? '2px solid #f43f5e' : '2px solid #f4f4f5',
                        },
                        padding: '0 8px'
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        padding: '0 8px',
                      }),
                      input: (base) => ({
                        ...base,
                        margin: 0,
                        padding: 0,
                      }),
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    Rough Latitude
                  </label>
                  <input 
                    type="number"
                    step="any"
                    name="approx_lat"
                    className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-lg text-zinc-900 bg-white placeholder:text-zinc-300"
                    placeholder="e.g. 6.0123"
                    defaultValue={initialData?.approx_lat || ""}
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    Rough Longitude
                  </label>
                  <input 
                    type="number"
                    step="any"
                    name="approx_lng"
                    className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-lg text-zinc-900 bg-white placeholder:text-zinc-300"
                    placeholder="e.g. 80.2451"
                    defaultValue={initialData?.approx_lng || ""}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  Secret Meeting Instructions - Only shown after payment
                </label>
                <textarea 
                  name="private_meeting_instructions"
                  rows={3}
                  className="w-full p-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-lg text-zinc-900 bg-white placeholder:text-zinc-300 resize-none"
                  placeholder="e.g. Meet Guide Sam at the red gate near the southern entrance..."
                  defaultValue={initialData?.private_meeting_instructions || ""}
                />
              </div>
            </div>
          </div>

          {/* STEP 2: LOGISTICS */}
          <div id="step-2" className={step === 2 ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-zinc-900">Logistics & Pricing</h2>
              <p className="text-zinc-500 text-sm mt-1">Define the limits and the cost of the experience.</p>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                    <Clock className="w-4 h-4 text-rose-500" />
                    Duration
                  </label>
                  <input 
                    name="duration"
                    type="text" 
                    defaultValue={initialData?.duration}
                    placeholder="e.g. 2 Hours, Half Day"
                    className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-lg text-zinc-900 placeholder:text-zinc-300"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                    <Users className="w-4 h-4 text-rose-500" />
                    Max Guests
                  </label>
                  <input 
                    name="max_capacity"
                    type="number" 
                    min="1"
                    defaultValue={initialData?.max_capacity || 10}
                    className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-lg text-zinc-900 placeholder:text-zinc-300"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                    <CalendarDays className="w-4 h-4 text-rose-500" />
                    Lead Time
                  </label>
                  <select 
                    name="min_notice_days"
                    className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-lg text-zinc-900 bg-white"
                    defaultValue={initialData?.min_notice_days !== undefined ? initialData.min_notice_days : 1}
                  >
                    <option value="0">Same Day (0 hours)</option>
                    <option value="1">1 Day (24 hours)</option>
                    <option value="2">2 Days (48 hours)</option>
                    <option value="3">3 Days (72 hours)</option>
                    <option value="7">1 Week</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                    <DollarSign className="w-4 h-4 text-rose-500" />
                    Price (USD)
                  </label>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-rose-500 font-bold text-lg transition-colors">$</span>
                    <input 
                      name="price_usd"
                      type="number" 
                      step="0.01"
                      defaultValue={initialData?.price_usd}
                      placeholder="35.00"
                      className="w-full h-14 pl-9 pr-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-xl text-zinc-900 placeholder:text-zinc-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                    <Users className="w-4 h-4 text-rose-500" />
                    Pricing Model
                  </label>
                  <select 
                    name="pricing_model"
                    className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-lg text-zinc-900 bg-white"
                    defaultValue={initialData?.pricing_model || "per_person"}
                  >
                    <option value="per_person">Per Person</option>
                    <option value="per_day">Per Day</option>
                    <option value="flat_rate">Flat Rate (Per Group)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                    <DollarSign className="w-4 h-4 text-rose-500" />
                    Payment Strategy
                  </label>
                  <select 
                    name="payment_strategy"
                    className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-lg text-zinc-900 bg-white"
                    defaultValue={initialData?.payment_strategy || "full"}
                  >
                    <option value="full">Pay in Full (Stripe)</option>
                    <option value="deposit_15">15% Deposit (Cash on Arrival)</option>
                    <option value="manual_hold">Card Hold (Zero Charge)</option>
                    <option value="no_card">No Card Needed (Pay Later)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                    <Car className="w-4 h-4 text-rose-500" />
                    Pickup Options
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-2xl border-2 border-zinc-100 bg-white cursor-pointer hover:border-rose-500 transition-colors group">
                    <input 
                      type="checkbox" 
                      name="has_pickup" 
                      defaultChecked={initialData?.has_pickup || false}
                      className="w-5 h-5 rounded border-zinc-300 text-rose-500 focus:ring-rose-500 cursor-pointer" 
                    />
                    <div>
                      <div className="font-bold text-zinc-900">Provide Hotel Pickup</div>
                      <div className="text-xs font-medium text-zinc-500">Ask the customer for their hotel/location during checkout.</div>
                    </div>
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                    <Eye className="w-4 h-4 text-rose-500" />
                    Hidden Gem Status
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-2xl border-2 border-zinc-100 bg-white cursor-pointer hover:border-rose-500 transition-colors group">
                    <input 
                      type="checkbox" 
                      name="is_hidden_gem" 
                      defaultChecked={initialData?.is_hidden_gem || false}
                      className="w-5 h-5 rounded border-zinc-300 text-rose-500 focus:ring-rose-500 cursor-pointer" 
                    />
                    <div>
                      <div className="font-bold text-rose-500">Mark as Gem</div>
                      <div className="text-xs font-medium text-zinc-500">Highlight this tour with a special badge.</div>
                    </div>
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                    <CalendarDays className="w-4 h-4 text-rose-500" />
                    Availability & Blackout Dates
                  </label>
                  <p className="text-xs font-medium text-zinc-500 mb-2">Select dates when this tour is unavailable or fully booked.</p>
                  
                  <div className="p-4 bg-white border border-zinc-200 rounded-2xl w-fit shadow-sm">
                    <DayPicker 
                      mode="multiple"
                      selected={blackoutDates}
                      onSelect={(dates) => setBlackoutDates(dates || [])}
                      modifiersClassNames={{
                        selected: 'bg-zinc-900 text-white font-bold hover:bg-zinc-800',
                        today: 'text-rose-500 font-bold'
                      }}
                      styles={{
                        caption: { color: '#18181b', fontWeight: 'bold' },
                        head_cell: { color: '#71717a', fontWeight: 'bold', fontSize: '0.8rem' },
                        cell: { padding: '2px' },
                        day: { borderRadius: '0.5rem', width: '2.5rem', height: '2.5rem' }
                      } as any}
                    />
                  </div>
                  <input type="hidden" name="blackout_dates" value={JSON.stringify((blackoutDates || []).map(d => format(d, 'yyyy-MM-dd')))} />
                </div>
              </div>

              {/* Advanced: Tiered Pricing */}
              <div className="pt-8 border-t border-zinc-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-800 tracking-wide uppercase flex items-center gap-2">
                      <Users className="w-4 h-4 text-rose-500" />
                      Advanced: Tiered / Group Pricing
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Override the default per-person math with custom total prices for specific group sizes.</p>
                  </div>
                  <button type="button" onClick={addTier} className="text-sm font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-full transition-colors">
                    <Plus className="w-4 h-4" /> Add Tier
                  </button>
                </div>

                {/* Hidden input to store serialized JSON */}
                <input 
                  type="hidden" 
                  name="pricing_tiers" 
                  value={JSON.stringify(
                    tiers.reduce((acc, tier) => {
                      if (tier.guests && tier.price) {
                        acc[tier.guests] = parseFloat(tier.price);
                      }
                      return acc;
                    }, {} as Record<string, number>)
                  )} 
                />

                {tiers.length > 0 ? (
                  <div className="space-y-3">
                    {tiers.map((tier, idx) => (
                      <div key={idx} className="flex gap-4 items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex-1">
                          <input
                            type="number"
                            min="1"
                            value={tier.guests}
                            onChange={(e) => updateTier(idx, 'guests', e.target.value)}
                            placeholder="e.g. 2 (Total Guests)"
                            className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium"
                          />
                        </div>
                        <div className="flex-1 relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={tier.price}
                            onChange={(e) => updateTier(idx, 'price', e.target.value)}
                            placeholder="Total Price"
                            className="w-full h-12 pl-8 pr-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-bold"
                          />
                        </div>
                        <button type="button" onClick={() => removeTier(idx)} className="p-3 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
                    <p className="text-sm font-medium text-zinc-500">No custom tiers. The default Price (USD) will be multiplied by the guest count.</p>
                  </div>
                )}
              </div>

              {/* Tour Options & Timeslots */}
              <div className="pt-8 border-t border-zinc-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-800 tracking-wide uppercase flex items-center gap-2">
                      <List className="w-4 h-4 text-rose-500" />
                      Tour Options & Timeslots
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Add variations like "Morning Safari" or "Full-Day" that tourists must choose from.</p>
                  </div>
                  <button type="button" onClick={addOption} className="text-sm font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-full transition-colors">
                    <Plus className="w-4 h-4" /> Add Option
                  </button>
                </div>

                {/* Hidden input for JSON */}
                <input 
                  type="hidden" 
                  name="tour_options" 
                  value={JSON.stringify(
                    options.filter(o => o.title.trim() !== "").map(o => ({
                      title: o.title,
                      price_modifier: parseFloat(o.price_modifier) || 0
                    }))
                  )} 
                />

                {options.length > 0 ? (
                  <div className="space-y-3">
                    {options.map((opt, idx) => (
                      <div key={`opt-${idx}`} className="flex gap-4 items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex-[2]">
                          <input
                            type="text"
                            value={opt.title}
                            onChange={(e) => updateOption(idx, 'title', e.target.value)}
                            placeholder="e.g. Morning Safari (6:00 AM)"
                            className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium"
                          />
                        </div>
                        <div className="flex-1 relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">+$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={opt.price_modifier}
                            onChange={(e) => updateOption(idx, 'price_modifier', e.target.value)}
                            placeholder="Add-on Price"
                            className="w-full h-12 pl-10 pr-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-bold"
                          />
                        </div>
                        <button type="button" onClick={() => removeOption(idx)} className="p-3 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
                    <p className="text-sm font-medium text-zinc-500">No options added. The tour will not have a dropdown selector.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 3: STORYTELLING */}
          <div id="step-3" className={step === 3 ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}>
             <div className="mb-8">
              <h2 className="text-xl font-bold text-zinc-900">Storytelling</h2>
              <p className="text-zinc-500 text-sm mt-1">Sell the experience. What makes it special?</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                  <Text className="w-4 h-4 text-rose-500" />
                  Full Description
                </label>
                <textarea 
                  name="description"
                  defaultValue={initialData?.description}
                  placeholder="Describe the amazing experience..."
                  className="w-full h-40 p-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-base text-zinc-900 placeholder:text-zinc-300 resize-none leading-relaxed"
                  required
                />
                <p className="text-xs text-zinc-500 font-medium mt-1">Supports Markdown. Use '-' for bullet points and '**' for bold text.</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                  <CheckSquare className="w-4 h-4 text-rose-500" />
                  Inclusions (One per line)
                </label>
                <textarea 
                  name="inclusions"
                  defaultValue={initialData?.inclusions?.join('\n')}
                  placeholder="Surfboard Rental&#10;Rash Guard&#10;2 Hour Lesson"
                  className="w-full h-32 p-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-base text-zinc-900 placeholder:text-zinc-300 resize-none leading-relaxed"
                  required
                />
              </div>
            </div>
          </div>

          {/* STEP 4: MEDIA & PUBLISH */}
          <div id="step-4" className={step === 4 ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-zinc-900">Media & Launch</h2>
              <p className="text-zinc-500 text-sm mt-1">Make it look beautiful before going live.</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                  <ImageIcon className="w-4 h-4 text-rose-500" />
                  Cover Image / Video URL
                </label>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={previewImage}
                    onChange={(e) => setPreviewImage(e.target.value)}
                    placeholder="Paste Cloudinary URL (.jpg or .mp4) here..."
                    className="flex-1 h-12 px-4 rounded-xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-sm text-zinc-900 placeholder:text-zinc-400"
                  />
                  {previewImage && (
                    <button 
                      type="button"
                      onClick={() => setPreviewImage("")}
                      className="px-4 py-2 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 rounded-xl font-bold transition-colors text-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Hidden input to pass the secure_url string to the form submission action */}
                <input type="hidden" name="cover_image_url" value={previewImage} />
                <input type="hidden" name="card_image_url" value={cardImage} />

                <div className="flex items-center gap-3 mt-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  <input
                    type="checkbox"
                    id="useOriginalForCard"
                    checked={useOriginalForCard}
                    onChange={(e) => setUseOriginalForCard(e.target.checked)}
                    className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <label htmlFor="useOriginalForCard" className="text-sm font-bold text-zinc-900 cursor-pointer">
                      Use uncropped original for Tour Card
                    </label>
                    <p className="text-xs text-zinc-500">
                      If checked, the tall (uncropped) image is used on the home page grid.
                    </p>
                  </div>
                </div>
                
                {/* Media Dropzone Illusion */}
                <label 
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                  onDrop={handleDrop}
                  className={`mt-6 w-full aspect-[2/1] rounded-3xl border-2 overflow-hidden relative flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                    isDragOver ? 'border-rose-500 bg-rose-50' : 
                    previewImage ? 'border-transparent shadow-xl shadow-zinc-200/50 bg-zinc-900' : 
                    'border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-400'
                  }`}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                  />

                  {isUploadingImage ? (
                    <div className="flex flex-col items-center text-rose-500 z-10">
                      <Loader2 className="w-10 h-10 animate-spin mb-4" />
                      <span className="text-sm font-bold tracking-wide">UPLOADING...</span>
                    </div>
                  ) : previewImage ? (
                    <>
                      <Image 
                        src={previewImage} 
                        alt="Preview" 
                        fill 
                        className="object-cover animate-in fade-in duration-700" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold tracking-widest backdrop-blur-sm z-10">
                        CLICK TO REPLACE
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-zinc-400 z-10">
                      <div className={`w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 transition-transform ${isDragOver ? 'scale-110' : ''}`}>
                        <ImageIcon className="w-8 h-8 text-zinc-300" />
                      </div>
                      <span className="text-base font-bold text-zinc-500">
                        {isDragOver ? "Drop image here" : "Click or Drag to Upload"}
                      </span>
                      <span className="text-xs font-medium mt-1">JPEG, PNG up to 5MB</span>
                    </div>
                  )}
                </label>
              </div>

              {/* GALLERY DROPZONE */}
              <div className="space-y-3 pt-8 border-t border-zinc-100">
                <label className="flex items-center justify-between text-sm font-bold text-zinc-800 tracking-wide uppercase">
                  <span className="flex items-center gap-2">
                    <Images className="w-4 h-4 text-rose-500" />
                    Gallery Photos (Optional)
                  </span>
                  <span className="text-xs text-zinc-400">{galleryImages.length} / 8</span>
                </label>
                
                {galleryImages.map((url, idx) => (
                  <input key={`gallery-${idx}`} type="hidden" name="gallery_urls" value={url} />
                ))}
                
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    {galleryImages.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-200 group">
                        <Image src={url} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-rose-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {galleryImages.length < 8 && (
                  <label 
                    onDragOver={(e) => { e.preventDefault(); setIsGalleryDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsGalleryDragOver(false); }}
                    onDrop={handleGalleryDrop}
                    className={`w-full h-32 rounded-3xl border-2 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                      isGalleryDragOver ? 'border-rose-500 bg-rose-50' : 
                      'border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-400'
                    }`}
                  >
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      className="hidden" 
                      onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
                    />
                    {isUploadingGallery ? (
                      <div className="flex flex-col items-center text-rose-500">
                        <Loader2 className="w-6 h-6 animate-spin mb-2" />
                        <span className="text-xs font-bold tracking-wide">UPLOADING...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-zinc-400 pointer-events-none">
                        <Images className={`w-8 h-8 text-zinc-300 mb-2 transition-transform ${isGalleryDragOver ? 'scale-110' : ''}`} />
                        <span className="text-sm font-bold text-zinc-500">Click or Drag to add photos</span>
                      </div>
                    )}
                  </label>
                )}
              </div>

              <div className="space-y-3 pt-8 border-t border-zinc-100">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                  <Eye className="w-4 h-4 text-rose-500" />
                  Visibility Status
                </label>
                <select 
                  name="status"
                  className="w-full sm:w-1/2 h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-lg text-zinc-900 bg-white"
                  defaultValue={initialData?.status || "published"}
                >
                  <option value="published">Published (Live)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-zinc-100 flex items-center justify-between">
          <button 
            type="button"
            onClick={prevStep}
            className={`px-6 py-3.5 rounded-xl font-bold text-zinc-600 hover:bg-zinc-100 transition-colors ${step === 1 ? 'invisible' : 'visible'}`}
          >
            Previous
          </button>

          {step < TOTAL_STEPS && (
            <button 
              key="continue-btn"
              type="button" 
              onClick={nextStep}
              className="px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold shadow-lg shadow-zinc-900/20 transition-all active:scale-95"
            >
              Continue
            </button>
          )}
          
          {step === TOTAL_STEPS && (
            <button 
              key="submit-btn"
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 px-10 py-3.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:active:scale-100 text-white rounded-xl font-bold shadow-xl shadow-rose-500/20 transition-all active:scale-95"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSubmitting ? (isEditing ? "Updating..." : "Publishing...") : (isEditing ? "Save Changes" : "Publish Tour")}
            </button>
          )}
        </div>

        {cropImageSrc && (
          <ImageCropperModal
            imageSrc={cropImageSrc}
            isUploading={isUploadingImage}
            onCropComplete={uploadCroppedImage}
            onCancel={() => setCropImageSrc(null)}
          />
        )}
      </form>
    </div>
  )
}
