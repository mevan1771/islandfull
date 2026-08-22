"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { backfillAndSyncAll } from "@/app/actions/tours"

export function SyncAllButton() {
    const [isSyncing, setIsSyncing] = useState(false)

    const handleSync = async (actionType: 'SYNC' | 'FORCE_SYNC') => {
        if (actionType === 'FORCE_SYNC') {
            if (!confirm("Are you sure? This will permanently overwrite all Planned drafts in your Google Sheet.")) return;
        } else {
            if (!confirm("Are you sure you want to sync all records to Google Sheets? This may take a moment.")) return;
        }

        setIsSyncing(true)
        try {
            const res = await backfillAndSyncAll(actionType)
            if (res.success) {
                alert(`Successfully synced ${res.count} records!`)
            } else {
                alert("Failed to sync: " + res.error)
            }
        } catch (err) {
            alert("An error occurred during sync.")
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => handleSync('SYNC')}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl font-medium shadow-sm transition-all active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync All to Sheets'}
            </button>
            <button
                onClick={() => handleSync('FORCE_SYNC')}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl font-bold transition-all active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Force Overwrite Sheets'}
            </button>
        </div>
    )
}
