import { createClient } from "@supabase/supabase-js"
import TeamClient from "./TeamClient"

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function TeamPage() {
  // Fetch users and their roles
  const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
  
  const { data: userRoles, error: rolesError } = await supabaseAdmin
    .from('user_roles')
    .select('*')

  const { data: legacyUsers, error: legacyError } = await supabaseAdmin
    .from('users')
    .select('id, role')

  // Fetch recent audit logs
  const { data: auditLogs, error: auditError } = await supabaseAdmin
    .from('audit_logs')
    .select('*, auth_users:user_id(email)')
    .order('created_at', { ascending: false })
    .limit(20)

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
