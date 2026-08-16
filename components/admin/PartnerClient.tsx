"use client"

import { useState } from "react"
import { Users, Plus, Edit, Trash2, X, Upload, Image as ImageIcon } from "lucide-react"
import { createPartner, updatePartner, deletePartner } from "@/app/actions/partner"
import toast from "react-hot-toast"
import Image from "next/image"

interface Partner {
    id: string
    name: string
    logo_url?: string | null
    details?: string | null
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

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        logo_url: "",
        details: ""
    })

    const handleOpenModal = (partner?: Partner) => {
        if (partner) {
            setEditingPartner(partner)
            setFormData({
                name: partner.name,
                logo_url: partner.logo_url || "",
                details: partner.details || ""
            })
        } else {
            setEditingPartner(null)
            setFormData({
                name: "",
                logo_url: "",
                details: ""
            })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingPartner(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const payload = {
            name: formData.name.trim(),
            logo_url: formData.logo_url.trim() || null,
            details: formData.details.trim() || null
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
                                <th className="px-6 py-4">Details</th>
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
                                            <span className="text-zinc-500 truncate max-w-[200px] block">{p.details || "-"}</span>
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
                                    <label className="text-sm font-bold text-zinc-900">Logo URL (Optional)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={formData.logo_url}
                                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                            className="flex-1 h-12 px-4 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            placeholder="https://example.com/logo.png"
                                        />
                                    </div>
                                    {formData.logo_url && (
                                        <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
                                            <img src={formData.logo_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-900">Details / Contact Info (Optional)</label>
                                    <textarea
                                        value={formData.details}
                                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none h-32"
                                        placeholder="e.g. Contact: John Doe (john@sunshine.com)"
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
