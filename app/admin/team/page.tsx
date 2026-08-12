import { createClient } from "@supabase/supabase-js"
import TeamClient from "./TeamClient"

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ staff?: string }> }) {
  const resolvedSearchParams = await searchParams;

  // Fetch users and their roles
  const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
  
  const { data: userRoles, error: rolesError } = await supabaseAdmin
    .from('user_roles')
    .select('*')

  const { data: legacyUsers, error: legacyError } = await supabaseAdmin
    .from('users')
    .select('id, role')

  // Build the query for recent audit logs
  let query = supabaseAdmin
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (resolvedSearchParams?.staff) {
    query = query.eq('user_id', resolvedSearchParams.staff)
  }

  // Fetch recent audit logs (bypassing RLS via Service Role)
  const { data: rawAuditLogs, error: auditError } = await query

  // Manually attach user emails to avoid cross-schema RLS issues
  const auditLogs = (rawAuditLogs || []).map((log: any) => {
    const userMatch = users?.find(u => u.id === log.user_id)
    return {
      ...log,
      auth_users: userMatch ? { email: userMatch.email } : null
    }
  })

  // Map auth users with their roles
  const staffMembers = (users || []).map(u => {
    const roleRecord = userRoles?.find(r => r.user_id === u.id)
    const legacyRecord = legacyUsers?.find(l => l.id === u.id)
    
    let currentRole = 'user'
    if (roleRecord) currentRole = roleRecord.role
    else if (legacyRecord?.role === 'admin') currentRole = 'admin'

    return {
      id: u.id,
      email: u.email,
      role: currentRole,
      last_sign_in: u.last_sign_in_at,
      created_at: u.created_at
    }
  }).filter(u => u.role === 'admin' || u.role === 'staff')

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Team & Access Control</h1>
      </div>
      <TeamClient initialStaff={staffMembers} initialAuditLogs={auditLogs || []} />
    </div>
  )
}
