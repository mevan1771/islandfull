"use client"

import { useState } from "react"
import { Tag, CheckCircle2, XCircle, Plus, Edit, Trash2, X } from "lucide-react"
import { createPromoCode, updatePromoCode, deletePromoCode } from "@/app/actions/promo"
import toast from "react-hot-toast"

interface PromoCode {
    id: string
    code: string
    discount_amount_usd: number
    min_order_value_usd: number
    current_uses: number
    max_uses: number
    expires_at: string
    is_active: boolean
    partner_name?: string | null
    partner_commission?: number | null
    total_partner_earnings?: number | null
}

interface PromoClientProps {
    initialPromos: PromoCode[]
}

export function PromoClient({ initialPromos }: PromoClientProps) {
    const [promos, setPromos] = useState<PromoCode[]>(initialPromos)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        code: "",
        discount_amount_usd: 0,
        min_order_value_usd: 0,
        max_uses: 100,
        expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        is_active: true,
        partner_name: "",
        partner_commission: 0
    })

    const handleOpenModal = (promo?: PromoCode) => {
        if (promo) {
            setEditingPromo(promo)
            setFormData({
                code: promo.code,
                discount_amount_usd: promo.discount_amount_usd,
                min_order_value_usd: promo.min_order_value_usd,
                max_uses: promo.max_uses,
                expires_at: new Date(promo.expires_at).toISOString().split('T')[0],
                is_active: promo.is_active,
                partner_name: promo.partner_name || "",
                partner_commission: promo.partner_commission || 0
            })
        } else {
            setEditingPromo(null)
            setFormData({
                code: "",
                discount_amount_usd: 0,
                min_order_value_usd: 0,
                max_uses: 100,
                expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                is_active: true,
                partner_name: "",
                partner_commission: 0
            })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingPromo(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const payload = {
            ...formData,
            code: formData.code.toUpperCase().trim(),
            partner_name: formData.partner_name.trim() || null,
            partner_commission: formData.partner_commission > 0 ? formData.partner_commission : null
        }

        try {
            if (editingPromo) {
                const res = await updatePromoCode(editingPromo.id, payload)
                if (res.success) {
                    toast.success("Promo code updated successfully")
                    setPromos(promos.map(p => p.id === editingPromo.id ? { ...p, ...payload } : p))
                    handleCloseModal()
                } else {
                    toast.error(res.error || "Failed to update promo code")
                }
            } else {
                const res = await createPromoCode(payload)
                if (res.success) {
                    toast.success("Promo code created successfully")
                    // Optimistic update (requires refresh for real ID, but good enough for UI)
                    setPromos([{ ...payload, id: Math.random().toString(), current_uses: 0, total_partner_earnings: 0 } as PromoCode, ...promos])
                    handleCloseModal()
                } else {
                    toast.error(res.error || "Failed to create promo code")
                }
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Are you sure you want to delete promo code ${code}?`)) return

        try {
            const res = await deletePromoCode(id, code)
            if (res.success) {
                toast.success("Promo code deleted successfully")
                setPromos(promos.filter(p => p.id !== id))
            } else {
                toast.error(res.error || "Failed to delete promo code")
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred")
        }
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Admin Operations</h1>
                    <p className="text-zinc-500 mt-1">Manage active promo codes and affiliate partners.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-rose-50 rounded-lg text-rose-600 font-semibold border border-rose-100 shadow-sm text-sm">
                        Total Promos: {promos.length}
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Create Promo
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[11px] font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Discount</th>
                                <th className="px-6 py-4">Min Order</th>
                                <th className="px-6 py-4">Usage</th>
                                <th className="px-6 py-4">Expires At</th>
                                <th className="px-6 py-4">Partner</th>
                                <th className="px-6 py-4">Commission</th>
                                <th className="px-6 py-4">Earnings</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {promos.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-12 text-center text-zinc-500">
                                        No promo codes found.
                                    </td>
                                </tr>
                            ) : (
                                promos.map((p) => {
                                    const isExpired = new Date(p.expires_at) < new Date();
                                    const isExhausted = p.current_uses >= p.max_uses;
                                    const isActive = p.is_active && !isExpired && !isExhausted;

                                    return (
                                        <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                {isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        ACTIVE
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        {isExpired ? 'EXPIRED' : isExhausted ? 'EXHAUSTED' : 'DISABLED'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-md">{p.code}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-rose-500">${p.discount_amount_usd}</span>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500 font-medium">
                                                ${p.min_order_value_usd}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-zinc-900">{p.current_uses}</span>
                                                <span className="text-zinc-400"> / {p.max_uses}</span>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500">
                                                {new Date(p.expires_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {p.partner_name ? (
                                                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{p.partner_name}</span>
                                                ) : (
                                                    <span className="text-zinc-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {p.partner_commission ? (
                                                    <span className="font-bold text-emerald-600">${p.partner_commission}</span>
                                                ) : (
                                                    <span className="text-zinc-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {p.partner_name ? (
                                                    <span className="font-bold text-zinc-900">${p.total_partner_earnings || 0}</span>
                                                ) : (
                                                    <span className="text-zinc-400">-</span>
                                                )}
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
                                                        onClick={() => handleDelete(p.id, p.code)}
                                                        className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                            <h2 className="text-xl font-bold text-zinc-900">
                                {editingPromo ? "Edit Promo Code" : "Create Promo Code"}
                            </h2>
                            <button onClick={handleCloseModal} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="promo-form" onSubmit={handleSubmit} className="space-y-6">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-900">Promo Code</label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none uppercase"
                                            placeholder="e.g. SUMMER20"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-900">Discount Amount (USD)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.discount_amount_usd}
                                            onChange={(e) => setFormData({ ...formData, discount_amount_usd: parseFloat(e.target.value) || 0 })}
                                            className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-900">Min Order Value (USD)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.min_order_value_usd}
                                            onChange={(e) => setFormData({ ...formData, min_order_value_usd: parseFloat(e.target.value) || 0 })}
                                            className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-900">Max Uses</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.max_uses}
                                            onChange={(e) => setFormData({ ...formData, max_uses: parseInt(e.target.value) || 1 })}
                                            className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-900">Expires At</label>
                                        <input
                                            type="date"
                                            value={formData.expires_at}
                                            onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2 flex flex-col justify-center">
                                        <label className="flex items-center gap-3 cursor-pointer mt-6">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                className="w-5 h-5 rounded border-zinc-300 text-rose-500 focus:ring-rose-500"
                                            />
                                            <span className="text-sm font-bold text-zinc-900">Is Active</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-zinc-100">
                                    <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-indigo-500" />
                                        Affiliate Partner (Optional)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-zinc-900">Partner Name</label>
                                            <input
                                                type="text"
                                                value={formData.partner_name}
                                                onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                                                className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                placeholder="e.g. Hotel Sunshine"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-zinc-900">Partner Commission (USD)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.partner_commission}
                                                onChange={(e) => setFormData({ ...formData, partner_commission: parseFloat(e.target.value) || 0 })}
                                                className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                placeholder="e.g. 2.00"
                                            />
                                        </div>
                                    </div>
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
                                form="promo-form"
                                className="px-6 py-3 rounded-xl font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : "Save Promo Code"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
