"use client"

import { useState, useEffect } from "react"
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/app/actions/categories"
import { Loader2, Plus, Edit2, Trash2, Tag, ArrowDownUp } from "lucide-react"
import Link from "next/link"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [formData, setFormData] = useState({ name: "", slug: "", category_type: "tour", sort_order: "0" })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setIsLoading(true)
    const data = await getCategories()
    setCategories(data)
    setIsLoading(false)
  }

  const openModal = (category?: any) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ 
        name: category.name, 
        slug: category.slug,
        category_type: category.category_type || "tour",
        sort_order: category.sort_order?.toString() || "0"
      })
    } else {
      setEditingCategory(null)
      setFormData({ name: "", slug: "", category_type: "tour", sort_order: "0" })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const data = new FormData()
    data.append("name", formData.name)
    data.append("slug", formData.slug)
    data.append("category_type", formData.category_type)
    data.append("sort_order", formData.sort_order)

    let res;
    if (editingCategory) {
      res = await updateCategory(editingCategory.id, data)
    } else {
      res = await createCategory(data)
    }

    if (res.success) {
      closeModal()
      await loadCategories()
    } else {
      alert("Error saving category: " + res.error)
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setIsLoading(true)
      const res = await deleteCategory(id)
      if (res.success) {
        await loadCategories()
      } else {
        alert(res.error)
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 flex items-center gap-2">
            <Tag className="w-8 h-8 text-rose-500" />
            Categories & Tags
          </h1>
          <p className="text-zinc-500 mt-2">Manage the filter pills and tags used across the platform.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md shadow-rose-500/20"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Category</span>
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 text-xs uppercase font-bold text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4">Sort Order</th>
                <th className="px-6 py-4">Name (Emoji Supported)</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No categories found. Create one to get started.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-zinc-900 w-24 text-center">
                      <div className="flex items-center justify-center gap-1 bg-zinc-100 text-zinc-700 px-2 py-1 rounded-md border border-zinc-200 text-xs">
                        <ArrowDownUp className="w-3 h-3" />
                        {cat.sort_order || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900">{cat.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">{cat.slug}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-semibold capitalize border border-blue-100">
                        {cat.category_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(cat)}
                          className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-1">Name (Emoji Supported)</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
                    placeholder="e.g. 🏄 Surfing"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all font-mono text-sm"
                    placeholder="e.g. surfing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-1">Vertical Type</label>
                  <select
                    value={formData.category_type}
                    onChange={(e) => setFormData({...formData, category_type: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
                  >
                    <option value="tour">Tour</option>
                    <option value="event">Event</option>
                    <option value="transport">Transport</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
                    placeholder="0"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Lower numbers appear first (e.g. 1 shows before 2). Default is 0.</p>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
