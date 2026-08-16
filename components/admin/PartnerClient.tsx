"use client"

import { useState } from "react"
import { Users, Plus, Edit, Trash2, X, Upload, Image as ImageIcon } from "lucide-react"
import { createPartner, updatePartner, deletePartner } from "@/app/actions/partner"
import { uploadToCloudinary } from "@/app/actions/upload"
import toast from "react-hot-toast"
import Image from "next/image"

interface Partner {
    id: string
    name: string
    logo_url?: string | null
    partner_type?: string | null
    company_name?: string | null
    email?: string | null
    telephone?: string | null
    address?: string | null
    bank_details?: string | null
    created_at: string
}

interface PartnerClientProps {
    initialPartners: Partner[]
}

export function PartnerClient({ initialPartners }: PartnerClientProps) {
    const [partners, setPartners] = useState<Partner[]>(initialPartners)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        logo_url: "",
        partner_type: "Other",
        company_name: "",
        email: "",
        telephone: "",
        address: "",
        bank_details: ""
    })

    const handleOpenModal = (partner?: Partner) => {
        if (partner) {
            setEditingPartner(partner)
            setFormData({
                name: partner.name,
                logo_url: partner.logo_url || "",
                partner_type: partner.partner_type || "Other",
                company_name: partner.company_name || "",
                email: partner.email || "",
                telephone: partner.telephone || "",
                address: partner.address || "",
                bank_details: partner.bank_details || ""
            })
        } else {
            setEditingPartner(null)
            setFormData({
                name: "",
                logo_url: "",
                partner_type: "Other",
                company_name: "",
                email: "",
                telephone: "",
                address: "",
                bank_details: ""
            })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingPartner(null)
        setIsUploading(false)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const uploadData = new FormData()
        uploadData.append('file', file)

        try {
            const res = await uploadToCloudinary(uploadData)
            if (res.success && res.secure_url) {
                setFormData(prev => ({ ...prev, logo_url: res.secure_url }))
                toast.success("Logo uploaded successfully")
            } else {
                toast.error(res.error || "Failed to upload logo")
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred during upload")
        } finally {
            setIsUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const payload = {
            name: formData.name.trim(),
            logo_url: formData.logo_url.trim() || null,
            partner_type: formData.partner_type,
            company_name: formData.company_name.trim() || null,
            email: formData.email.trim() || null,
            telephone: formData.telephone.trim() || null,
            address: formData.address.trim() || null,
            bank_details: formData.bank_details.trim() || null
        }

        try {
            if (editingPartner) {
                const res = await updatePartner(editingPartner.id, payload)
                if (res.success) {
                    toast.success("Partner updated successfully")
                    setPartners(partners.map(p => p.id === editingPartner.id ? { ...p, ...payload } : p))
                    handleCloseModal()
                } else {
                    toast.error(res.error || "Failed to update partner")
                }
            } else {
                const res = await createPartner(payload)
                if (res.success) {
                    toast.success("Partner created successfully")
                    // Optimistic update (requires refresh for real ID, but good enough for UI)
                    setPartners([{ ...payload, id: Math.random().toString(), created_at: new Date().toISOString() } as Partner, ...partners])
                    handleCloseModal()
                } else {
                    toast.error(res.error || "Failed to create partner")
                }
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete partner ${name}?`)) return

        try {
            const res = await deletePartner(id, name)
            if (res.success) {
                toast.success("Partner deleted successfully")
                setPartners(partners.filter(p => p.id !== id))
            } else {
                toast.error(res.error || "Failed to delete partner")
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred")
        }
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Affiliate Partners</h1>
                    <p className="text-zinc-500 mt-1">Manage your affiliate partners and their profiles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-indigo-50 rounded-lg text-indigo-600 font-semibold border border-indigo-100 shadow-sm text-sm">
                        Total Partners: {partners.length}
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Partner
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[11px] font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Logo</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Created At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {partners.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        No affiliate partners found.
                                    </td>
                                </tr>
                            ) : (
                                partners.map((p) => (
                                    <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            {p.logo_url ? (
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center">
                                                    <Image src={p.logo_url} alt={p.name} width={40} height={40} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400">
                                                    <ImageIcon className="w-4 h-4" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-zinc-900">{p.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {p.partner_type || 'Other'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-zinc-900 font-medium">{p.email || "-"}</span>
                                                <span className="text-zinc-500 text-xs">{p.telephone || ""}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">
                                            {new Date(p.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(p)}
                                                    className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id, p.name)}
                                                    className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                            <h2 className="text-xl font-bold text-zinc-900">
                                {editingPartner ? "Edit Partner" : "Add Partner"}
                            </h2>
                            <button onClick={handleCloseModal} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="partner-form" onSubmit={handleSubmit} className="space-y-6">

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-900">Partner Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        placeholder="e.g. Hotel Sunshine"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-900">Logo (Optional)</label>
                                    <div className="flex items-start gap-4">
                                        {formData.logo_url ? (
                                            <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 flex-shrink-0 group">
                                                <img src={formData.logo_url} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, logo_url: "" })}
                                                        className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center text-zinc-400 flex-shrink-0">
                                                <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                                                <span className="text-[10px] font-medium uppercase tracking-wider">No Logo</span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isUploading ? 'border-indigo-300 bg-indigo-50' : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300'}`}>
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    {isUploading ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                                            <p className="text-xs font-semibold text-indigo-600">Uploading...</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-5 h-5 mb-2 text-zinc-400" />
                                                            <p className="text-sm font-semibold text-zinc-700">Click to upload</p>
                                                            <p className="text-xs text-zinc-500 mt-1">PNG, JPG up to 5MB</p>
                                                        </>
                                                    )}
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-900">Partner Type</label>
                                        <select
                                            value={formData.partner_type}
                                            onChange={(e) => setFormData({ ...formData, partner_type: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none bg-white"
                                        >
                                            <option value="Hotel/Resort">Hotel/Resort</option>
                                            <option value="Cafe/Restaurant">Cafe/Restaurant</option>
                                            <option value="Influencer/Creator">Influencer/Creator</option>
                                            <option value="Tour Guide">Tour Guide</option>
                                            <option value="Shop/Retail">Shop/Retail</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-900">Company Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.company_name}
                                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            placeholder="e.g. Sunshine Holdings"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-900">Email Address (Optional)</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            placeholder="e.g. contact@sunshine.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-900">Telephone (Optional)</label>
                                        <input
                                            type="tel"
                                            value={formData.telephone}
                                            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            placeholder="e.g. +94 77 123 4567"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-900">Address (Optional)</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none h-24"
                                        placeholder="e.g. 123 Beach Road, Colombo"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-900">Bank Details (Optional)</label>
                                    <textarea
                                        value={formData.bank_details}
                                        onChange={(e) => setFormData({ ...formData, bank_details: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none h-24"
                                        placeholder="e.g. Bank Name, Account Name, Account Number, Branch"
                                    />
                                </div>

                            </form>
                        </div>

                        <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-6 py-3 rounded-xl font-bold text-zinc-600 hover:bg-zinc-200 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="partner-form"
                                className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : "Save Partner"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
