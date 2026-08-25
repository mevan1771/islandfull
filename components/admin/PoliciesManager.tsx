'use client'

import { useState, useEffect } from 'react'
import { getLatestPolicy, savePolicy, getCancellationTiers, saveCancellationTier, deleteCancellationTier } from '@/app/actions/policies'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Plus, Trash2, Save, FileText, AlertCircle } from 'lucide-react'

export default function PoliciesManager({ initialTiers = [] }: { initialTiers?: any[] }) {
    const [operatorAgreement, setOperatorAgreement] = useState('')
    const [operatorVersion, setOperatorVersion] = useState(0)
    const [touristTerms, setTouristTerms] = useState('')
    const [touristVersion, setTouristVersion] = useState(0)

    const [tiers, setTiers] = useState<any[]>(initialTiers)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [opPolicy, touristPolicy, tiersData] = await Promise.all([
                getLatestPolicy('operator_agreement'),
                getLatestPolicy('tourist_terms'),
                getCancellationTiers()
            ])

            if (opPolicy) {
                setOperatorAgreement(opPolicy.content)
                setOperatorVersion(opPolicy.version)
            }
            if (touristPolicy) {
                setTouristTerms(touristPolicy.content)
                setTouristVersion(touristPolicy.version)
            }
            if (tiersData) {
                setTiers(tiersData)
            }
        } catch (error) {
            console.error('Error loading policies:', error)
            showMessage('Failed to load data', 'error')
        }
        setLoading(false)
    }

    const showMessage = (text: string, type: 'success' | 'error') => {
        setMessage({ text, type })
        setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    }

    const handleSavePolicy = async (type: string, content: string) => {
        setSaving(true)
        const res = await savePolicy(type, content)
        if (res.success) {
            showMessage(`${type.replace('_', ' ')} saved successfully. New version: ${res.data.version}`, 'success')
            if (type === 'operator_agreement') setOperatorVersion(res.data.version)
            if (type === 'tourist_terms') setTouristVersion(res.data.version)
        } else {
            showMessage(`Failed to save ${type}: ${res.error}`, 'error')
        }
        setSaving(false)
    }

    const handleSaveTier = async (tier: any, index: number) => {
        setSaving(true)
        const res = await saveCancellationTier(tier)
        if (res.success) {
            showMessage('Tier saved successfully', 'success')
            const newTiers = [...tiers]
            newTiers[index] = res.data
            setTiers(newTiers)
        } else {
            showMessage(`Failed to save tier: ${res.error}`, 'error')
        }
        setSaving(false)
    }

    const handleDeleteTier = async (id: string, index: number) => {
        if (!confirm('Are you sure you want to delete this tier? It might be in use by activities.')) return

        setSaving(true)
        const res = await deleteCancellationTier(id)
        if (res.success) {
            showMessage('Tier deleted successfully', 'success')
            const newTiers = [...tiers]
            newTiers.splice(index, 1)
            setTiers(newTiers)
        } else {
            showMessage(`Failed to delete tier: ${res.error}`, 'error')
        }
        setSaving(false)
    }

    const addEmptyTier = () => {
        setTiers([...tiers, { name: '', cutoff_hours: 24, refund_percentage: 100 }])
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        )
    }

    return (
        <div className="space-y-12">
            {message.text && (
                <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-lg z-50 font-bold text-sm ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {message.text}
                </div>
            )}

            {/* Policies Section */}
            <section className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">Platform Policies</h2>
                    <p className="text-zinc-500 font-medium">Manage the legal agreements for hosts and tourists. Saving a new version will require users to re-accept.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Operator Agreement */}
                    <Card className="p-6 border-zinc-200 shadow-sm flex flex-col h-[600px]">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-rose-500" />
                                <h3 className="text-lg font-bold text-zinc-900">Host Operator Agreement</h3>
                            </div>
                            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold">
                                v{operatorVersion}
                            </span>
                        </div>
                        <p className="text-sm text-zinc-500 mb-4 font-medium">
                            This is the contract hosts must agree to before publishing activities.
                        </p>
                        <textarea
                            className="flex-1 w-full p-4 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none font-mono text-sm mb-4"
                            value={operatorAgreement}
                            onChange={(e) => setOperatorAgreement(e.target.value)}
                            placeholder="Enter markdown or plain text..."
                        />
                        <Button
                            onClick={() => handleSavePolicy('operator_agreement', operatorAgreement)}
                            disabled={saving || !operatorAgreement.trim()}
                            className="w-full font-bold"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save New Version
                        </Button>
                    </Card>

                    {/* Tourist Terms */}
                    <Card className="p-6 border-zinc-200 shadow-sm flex flex-col h-[600px]">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-rose-500" />
                                <h3 className="text-lg font-bold text-zinc-900">Tourist Global Terms</h3>
                            </div>
                            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold">
                                v{touristVersion}
                            </span>
                        </div>
                        <p className="text-sm text-zinc-500 mb-4 font-medium">
                            This is the global terms and conditions tourists agree to at checkout.
                        </p>
                        <textarea
                            className="flex-1 w-full p-4 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none font-mono text-sm mb-4"
                            value={touristTerms}
                            onChange={(e) => setTouristTerms(e.target.value)}
                            placeholder="Enter markdown or plain text..."
                        />
                        <Button
                            onClick={() => handleSavePolicy('tourist_terms', touristTerms)}
                            disabled={saving || !touristTerms.trim()}
                            className="w-full font-bold"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save New Version
                        </Button>
                    </Card>
                </div>
            </section>

            {/* Cancellation Tiers Section */}
            <section className="space-y-6 pt-8 border-t border-zinc-200">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Cancellation Tiers</h2>
                        <p className="text-zinc-500 font-medium">Manage the dynamic cancellation rules available for activities.</p>
                    </div>
                    <Button onClick={addEmptyTier} variant="outline" className="font-bold">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Tier
                    </Button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 font-medium leading-relaxed">
                        <strong>Warning:</strong> Modifying existing tiers will immediately affect all activities using them. If you want to change rules for new activities only, create a new tier instead.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tiers.map((tier, index) => (
                        <Card key={tier.id || index} className="p-5 border-zinc-200 shadow-sm space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Tier Name</label>
                                <input
                                    type="text"
                                    value={tier.name}
                                    onChange={(e) => {
                                        const newTiers = [...tiers]
                                        newTiers[index].name = e.target.value
                                        setTiers(newTiers)
                                    }}
                                    placeholder="e.g. STRICT"
                                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium text-zinc-900 uppercase"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Cutoff (Hours)</label>
                                    <input
                                        type="number"
                                        value={tier.cutoff_hours}
                                        onChange={(e) => {
                                            const newTiers = [...tiers]
                                            newTiers[index].cutoff_hours = parseInt(e.target.value) || 0
                                            setTiers(newTiers)
                                        }}
                                        className="w-full h-10 px-3 rounded-lg border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium text-zinc-900"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Refund %</label>
                                    <input
                                        type="number"
                                        value={tier.refund_percentage}
                                        onChange={(e) => {
                                            const newTiers = [...tiers]
                                            newTiers[index].refund_percentage = parseInt(e.target.value) || 0
                                            setTiers(newTiers)
                                        }}
                                        className="w-full h-10 px-3 rounded-lg border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium text-zinc-900"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    onClick={() => handleSaveTier(tier, index)}
                                    disabled={saving || !tier.name}
                                    className="flex-1 font-bold"
                                >
                                    Save
                                </Button>
                                {tier.id && (
                                    <Button
                                        onClick={() => handleDeleteTier(tier.id, index)}
                                        disabled={saving}
                                        variant="outline"
                                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    )
}
