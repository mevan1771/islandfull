'use server'

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function inviteStaff(email: string, role: string) {
  try {
    const { data: user, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)
    
    if (inviteError) throw inviteError

    if (user && user.user) {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: user.user.id, role })

      if (roleError) throw roleError
    }

    revalidatePath('/admin/team')
    return { success: true }
  } catch (error: any) {
    console.error('Error inviting staff:', error)
    return { error: error.message }
  }
}

export async function revokeAccess(userId: string) {
  try {
    const { error: deleteRoleError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (deleteRoleError) throw deleteRoleError
    
    // We also delete the auth user to truly revoke access
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteAuthError) throw deleteAuthError

    revalidatePath('/admin/team')
    return { success: true }
  } catch (error: any) {
    console.error('Error revoking access:', error)
    return { error: error.message }
  }
}
