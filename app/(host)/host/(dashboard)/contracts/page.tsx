import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default async function HostContractsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/host/login')

    const { data: host } = await supabase
        .from('hosts')
        .select('id, agreed_policy_version')
        .eq('user_id', user.id)
        .single()

    const { data: latestPolicy } = await supabase
        .from('platform_policies')
        .select('*')
        .eq('type', 'operator_agreement')
        .order('version', { ascending: false })
        .limit(1)
        .single()

    const isUpToDate = host && latestPolicy && host.agreed_policy_version >= latestPolicy.version

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Contracts & Agreements</h1>
                <p className="text-zinc-500 mt-2 font-medium">Review the legal agreements governing your use of the Islandfull platform.</p>
            </div>

            <Card className="p-6 border-zinc-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6 text-rose-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900">Host Operator Agreement</h2>
                            <p className="text-sm text-zinc-500 font-medium">Version {latestPolicy?.version || 1}</p>
                        </div>
                    </div>

                    {isUpToDate ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Accepted</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Action Required</span>
                        </div>
                    )}
                </div>

                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200 h-[500px] overflow-y-auto">
                    {latestPolicy ? (
                        <div className="prose prose-sm max-w-none text-zinc-600">
                            <ReactMarkdown>{latestPolicy.content}</ReactMarkdown>
                        </div>
                    ) : (
                        <p className="text-zinc-500 italic">No policy found.</p>
                    )}
                </div>
            </Card>
        </div>
    )
}
