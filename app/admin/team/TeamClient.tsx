'use client'

import { useState } from "react"
import { inviteStaff, revokeAccess } from "@/app/actions/team"
import { formatDistanceToNow } from "date-fns"
import { UserPlus, Shield, Activity, XCircle, CheckCircle2 } from "lucide-react"

export default function TeamClient({ initialStaff, initialAuditLogs }: { initialStaff: any[], initialAuditLogs: any[] }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('staff')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setError('')
    
    const res = await inviteStaff(email, role)
    if (res.error) {
      setError(res.error)
    } else {
      setMessage(`Successfully sent invite to ${email}`)
      setEmail('')
    }
    setIsLoading(false)
  }

  const handleRevoke = async (userId: string) => {
    if (!confirm('Are you sure you want to revoke access for this user?')) return
    
    const res = await revokeAccess(userId)
    if (res.error) {
      alert(`Error revoking access: ${res.error}`)
    }
  }

  return (
    <div className="space-y-8">
      {/* Invite Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
            <UserPlus className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Invite Team Member</h2>
        </div>
        
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 max-w-3xl">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@islandfull.com"
            required
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-shadow"
          />
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-zinc-700"
          >
            <option value="staff">Staff (Data Entry)</option>
            <option value="admin">Admin (Full Access)</option>
          </select>
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl px-8 py-3 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {isLoading ? 'Inviting...' : 'Send Invite'}
          </button>
        </form>
        
        {message && <p className="mt-4 text-sm font-medium text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4"/> {message}</p>}
        {error && <p className="mt-4 text-sm font-medium text-rose-600 flex items-center gap-1.5"><XCircle className="w-4 h-4"/> {error}</p>}
      </section>

      {/* Active Team */}
      <section className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Active Staff</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 font-medium uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Last Sign In</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {initialStaff.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {user.last_sign_in ? formatDistanceToNow(new Date(user.last_sign_in), { addSuffix: true }) : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role === 'admin' ? (
                      <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-3 py-1.5 rounded-lg cursor-not-allowed">
                        Protected
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleRevoke(user.id)}
                        className="text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 transition-colors px-3 py-1.5 rounded-lg"
                      >
                        Revoke Access
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {initialStaff.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">No active staff members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Audit Logs */}
      <section className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Recent Activity</h2>
        </div>
        <div className="space-y-4">
          {initialAuditLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl border border-zinc-100 bg-zinc-50/50">
              <div className="w-8 h-8 rounded-full bg-zinc-200 flex-shrink-0 flex items-center justify-center font-bold text-zinc-500 text-xs">
                {log.auth_users?.email ? log.auth_users.email.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-900">
                  <span className="font-semibold">{log.auth_users?.email || 'Unknown User'}</span>{' '}
                  <span className="text-zinc-600">{log.action}</span>
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
          {initialAuditLogs.length === 0 && (
            <p className="text-zinc-500 text-sm text-center py-8">No recent activity found.</p>
          )}
        </div>
      </section>
    </div>
  )
}
