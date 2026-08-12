import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function logActivity(userId: string | undefined, action: string, entityName: string, entityId: string | null = null) {
  try {
    if (!userId) {
      console.warn('Audit logger warning: No user ID provided. Logging action as anonymous/system.')
    }

    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: userId || null,
        action,
        entity_name: entityName,
        entity_id: entityId
      })

    if (error) {
      console.error('Failed to log audit activity:', error)
    }
  } catch (err) {
    console.error('Audit logger exception:', err)
  }
}
