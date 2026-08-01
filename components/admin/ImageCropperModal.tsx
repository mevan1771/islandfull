import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '@/utils/cropImage'
import { Loader2, X } from 'lucide-react'

interface ImageCropperModalProps {
  imageSrc: string
  onCropComplete: (croppedFile: File) => void
  onCancel: () => void
  isUploading: boolean
}

export function ImageCropperModal({
  imageSrc,
  onCropComplete,
  onCancel,
  isUploading
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (!croppedAreaPixels) return
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      const croppedFile = new File([croppedBlob], 'cropped_image.jpg', { type: 'image/jpeg' })
      onCropComplete(croppedFile)
    } catch (e) {
      console.error(e)
      alert('Failed to crop image')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden flex flex-col h-full max-h-[90vh] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-xl font-bold text-zinc-900">Crop Cover Image</h2>
          <button 
            type="button"
            onClick={onCancel}
            disabled={isUploading}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
        
        <div className="relative flex-1 bg-zinc-900 w-full min-h-[300px]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
            objectFit="contain"
          />
        </div>

        <div className="p-6 bg-white border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-1/2">
            <span className="text-sm font-bold text-zinc-500">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={isUploading}
              className="flex-1 sm:flex-none px-6 py-3 font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isUploading}
              className="flex-1 sm:flex-none px-8 py-3 font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Crop & Upload'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
