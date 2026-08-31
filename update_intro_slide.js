const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'admin', 'IntroSlideConfig.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports
content = content.replace(
    `import { Save, Loader2 } from "lucide-react"`,
    `import { Save, Loader2, UploadCloud } from "lucide-react"\nimport { uploadToCloudinary } from "@/app/actions/upload"`
);

// 2. Add upload state and handler
const stateHook = `  const [saving, setSaving] = useState(false)`;
const newHooks = `  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const res = await uploadToCloudinary(formData)
    if (res.success) {
      setData({ ...data, cover_image_url: res.url })
      toast.success("Image uploaded successfully!")
    } else {
      toast.error(res.error || "Failed to upload image")
    }
    setUploading(false)
  }`;
content = content.replace(stateHook, newHooks);

// 3. Update UI
const oldUI = `<div className="space-y-1 md:col-span-2">
          <label className="text-xs font-semibold text-zinc-700 uppercase">Background Image URL</label>
          <input 
            type="text" 
            value={data.cover_image_url}
            onChange={(e) => setData({ ...data, cover_image_url: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-sm"
            placeholder="https://images.unsplash.com/photo-..."
          />`;

const newUI = `<div className="space-y-1 md:col-span-2">
          <label className="text-xs font-semibold text-zinc-700 uppercase">Background Image URL</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={data.cover_image_url}
              onChange={(e) => setData({ ...data, cover_image_url: e.target.value })}
              className="flex-1 p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-sm"
              placeholder="https://images.unsplash.com/photo-..."
            />
            <div className="relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <button 
                type="button"
                disabled={uploading}
                className="h-full px-4 bg-zinc-100 border border-zinc-300 rounded-lg text-zinc-700 font-medium hover:bg-zinc-200 flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>`;

content = content.replace(oldUI, newUI);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated IntroSlideConfig.tsx');
