'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, FileText, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { acceptPolicy } from '@/app/actions/host-policies'

interface HostGatekeeperProps {
    latestPolicy: any
    hostId: string
}

export default function HostGatekeeper({ latestPolicy, hostId }: HostGatekeeperProps) {
    const [agreed, setAgreed] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleAccept = async () => {
        setLoading(true)
        setError('')
        const res = await acceptPolicy(hostId, latestPolicy.version)
        if (!res.success) {
            setError(res.error || 'Failed to accept policy. Please try again.')
            setLoading(false)
        } else {
            // The server action should revalidate the layout, which will remove this component
            window.location.reload()
        }
    }

    return (
        <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white shadow-2xl rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-zinc-200 bg-zinc-50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">Action Required: Updated Terms</h2>
                        <p className="text-sm text-zinc-500 font-medium">Please review and accept the latest Operator Agreement to continue using the platform.</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    <div className="prose prose-sm max-w-none text-zinc-600">
                        <ReactMarkdown>{latestPolicy.content}</ReactMarkdown>
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-200 bg-zinc-50 space-y-4">
                    <div className="flex items-start space-x-3">
                        <Checkbox
                            id="policy-agreement"
                            checked={agreed}
                            onCheckedChange={(checked) => setAgreed(checked as boolean)}
                            className="mt-1"
                        />
                        <label
                            htmlFor="policy-agreement"
                            className="text-sm font-medium leading-tight cursor-pointer text-zinc-700"
                        >
                            I have read and agree to the updated Operator Agreement (v{latestPolicy.version}). I understand that these terms govern my use of the Islandfull platform.
                        </label>
                    </div>

                    {error && <p className="text-sm text-rose-500 font-bold">{error}</p>}

                    <Button
                        onClick={handleAccept}
                        disabled={!agreed || loading}
                        className="w-full h-12 text-base font-bold"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <FileText className="w-5 h-5 mr-2" />}
                        Accept & Continue
                    </Button>
                </div>
            </Card>
        </div>
    )
}
