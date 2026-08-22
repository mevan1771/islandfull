"use server"

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { createClient as createServerClient } from '@/utils/supabase/server'

// Initialize the admin client using the service role key to bypass RLS and not log the current user out
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function adminCreateHostAccount(formData: FormData) {
  try {
    // 1. Verify the caller is an admin
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    let normalizedRole = '';
    const { data: profile } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role) {
      normalizedRole = profile.role.toLowerCase();
    } else {
      const { data: userProfile } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (userProfile?.role) {
        normalizedRole = userProfile.role.toLowerCase();
      }
    }

    if (!['admin', 'staff'].includes(normalizedRole)) {
      return { success: false, error: "Unauthorized: Admins and Staff only" }
    }

    // 2. Extract form data
    let email = formData.get('login_email') as string
    const password = formData.get('login_password') as string
    const name = formData.get('name') as string

    if (!email || !password || !name) {
      return { success: false, error: "Missing required login credentials or host name" }
    }

    if (email && !email.includes('@')) {
      email = `${email}@islandfull.com`
    }

    // 3. Create the Auth User securely
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto confirm so they can log in immediately
      user_metadata: { name: name }
    })

    if (authError || !authUser.user) {
      return { success: false, error: authError?.message || "Failed to create auth user" }
    }

    const userId = authUser.user.id

    // 4. Insert into custom `users` table
    const { error: userTableError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email,
        full_name: name,
        role: 'provider'
      })

    if (userTableError) {
      // Cleanup if failed
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return { success: false, error: "Failed to create user profile: " + userTableError.message }
    }

    // 5. Upload image if provided (Note: Using regular supabase client for storage since we have policies, or use admin if needed)
    // Actually, we should extract the rest of the form fields to insert into `hosts`
    const contact_name = formData.get('contact_name') as string || name
    const contact_email = formData.get('email') as string || email // fallback to login email
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const payout_notes = formData.get('payout_notes') as string
    let image_url = formData.get('image_url') as string
    const image_file = formData.get('image_file') as File

    if (image_file && image_file.size > 0) {
      const fileExt = image_file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError, data } = await supabaseAdmin.storage
        .from('images')
        .upload(`hosts/${fileName}`, image_file)

      if (!uploadError && data) {
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('images')
          .getPublicUrl(`hosts/${fileName}`)
        image_url = publicUrl
      }
    }

    // 6. Insert into `hosts` table
    const { error: hostError } = await supabaseAdmin
      .from('hosts')
      .insert({
        user_id: userId,
        name,
        contact_name,
        email: contact_email,
        phone,
        address,
        payout_notes,
        image_url
      })

    if (hostError) {
      // Cleanup
      await supabaseAdmin.from('users').delete().eq('id', userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return { success: false, error: "Failed to create host record: " + hostError.message }
    }

    revalidatePath('/admin/hosts')
    return { success: true }

  } catch (error: any) {
    console.error("Admin Host Creation Error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function adminProvisionLegacyHost(hostId: string, formData: FormData) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    let normalizedRole = '';
    const { data: profile } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
    if (profile?.role) {
      normalizedRole = profile.role.toLowerCase();
    } else {
      const { data: userProfile } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (userProfile?.role) {
        normalizedRole = userProfile.role.toLowerCase();
      }
    }

    if (!['admin', 'staff'].includes(normalizedRole)) return { success: false, error: "Unauthorized: Admins and Staff only" }

    let email = formData.get('login_email') as string
    const password = formData.get('login_password') as string
    const name = formData.get('name') as string

    if (!email || !password) {
      return { success: false, error: "Missing required login credentials" }
    }

    if (email && !email.includes('@')) {
      email = `${email}@islandfull.com`
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { name: name }
    })

    if (authError || !authUser.user) {
      return { success: false, error: authError?.message || "Failed to create auth user" }
    }

    const userId = authUser.user.id

    const { error: userTableError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email,
        full_name: name,
        role: 'provider'
      })

    if (userTableError) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return { success: false, error: "Failed to create user profile: " + userTableError.message }
    }

    const { error: updateError } = await supabaseAdmin
      .from('hosts')
      .update({ user_id: userId })
      .eq('id', hostId)

    if (updateError) {
      await supabaseAdmin.from('users').delete().eq('id', userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return { success: false, error: "Failed to link host record: " + updateError.message }
    }

    revalidatePath('/admin/hosts')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function adminResetHostPassword(userId: string, newPassword: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    let normalizedRole = '';
    const { data: profile } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
    if (profile?.role) {
      normalizedRole = profile.role.toLowerCase();
    } else {
      const { data: userProfile } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (userProfile?.role) {
        normalizedRole = userProfile.role.toLowerCase();
      }
    }

    if (!['admin', 'staff'].includes(normalizedRole)) return { success: false, error: "Unauthorized: Admins and Staff only" }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" }
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
