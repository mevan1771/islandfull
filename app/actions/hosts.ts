"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const hostSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").or(z.literal("")).nullable().optional(),
  phone: z.string().nullable().optional(),
  contact_name: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  payout_notes: z.string().nullable().optional(),
})

export async function getHosts() {
  const { data, error } = await supabaseAdmin
    .from('hosts')
    .select('*')
    .order('name')

  if (error) {
    console.error("Error fetching hosts:", error)
    return []
  }

  return data
}

export async function createHost(formData: FormData) {
  try {
    const { createClient } = await import('@/utils/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    let normalizedRole = '';
    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
    if (roleData?.role) {
      normalizedRole = roleData.role.toLowerCase();
    } else {
      const { data: profileData } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (profileData?.role) {
        normalizedRole = profileData.role.toLowerCase();
      }
    }

    if (!['admin', 'staff'].includes(normalizedRole)) {
      return { success: false, error: "Unauthorized: Admins and Staff only" }
    }

    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string | null,
      phone: formData.get("phone") as string | null,
      contact_name: formData.get("contact_name") as string | null,
      address: formData.get("address") as string | null,
      payout_notes: formData.get("payout_notes") as string | null,
    }

    const parsed = hostSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: "Invalid data payload" }
    }
    const { name, email, phone, contact_name, address, payout_notes } = parsed.data
    let image_url = formData.get("image_url") as string
    const imageFile = formData.get("image_file") as File
    let avatar_url = formData.get("avatar_url") as string
    const avatarFile = formData.get("avatar_file") as File

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { data, error } = await supabaseAdmin.storage
        .from('images') // fallback bucket
        .upload(`hosts/${fileName}`, imageFile)

      if (error) throw error

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(`hosts/${fileName}`)

      image_url = publicUrlData.publicUrl
    }

    if (avatarFile && avatarFile.size > 0) {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `avatar_${Math.random()}.${fileExt}`
      const { data, error } = await supabaseAdmin.storage
        .from('images')
        .upload(`hosts/${fileName}`, avatarFile)

      if (error) throw error

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(`hosts/${fileName}`)

      avatar_url = publicUrlData.publicUrl
    }

    const { error } = await supabaseAdmin
      .from('hosts')
      .insert([{ name, email, phone, contact_name, address, payout_notes, image_url: image_url || null, avatar_url: avatar_url || null }])

    if (error) throw error

    revalidatePath('/admin/hosts')
    return { success: true }
  } catch (error: any) {
    console.error("Error creating host:", error)
    return { success: false, error: error.message }
  }
}

export async function updateHost(id: string, formData: FormData) {
  try {
    const { createClient } = await import('@/utils/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    let normalizedRole = '';
    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
    if (roleData?.role) {
      normalizedRole = roleData.role.toLowerCase();
    } else {
      const { data: profileData } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (profileData?.role) {
        normalizedRole = profileData.role.toLowerCase();
      }
    }

    if (!['admin', 'staff'].includes(normalizedRole)) {
      return { success: false, error: "Unauthorized: Admins and Staff only" }
    }

    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string | null,
      phone: formData.get("phone") as string | null,
      contact_name: formData.get("contact_name") as string | null,
      address: formData.get("address") as string | null,
      payout_notes: formData.get("payout_notes") as string | null,
    }

    const parsed = hostSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: "Invalid data payload" }
    }
    const { name, email, phone, contact_name, address, payout_notes } = parsed.data
    let image_url = formData.get("image_url") as string
    const imageFile = formData.get("image_file") as File
    let avatar_url = formData.get("avatar_url") as string
    const avatarFile = formData.get("avatar_file") as File

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { data, error } = await supabaseAdmin.storage
        .from('images')
        .upload(`hosts/${fileName}`, imageFile)

      if (error) throw error

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(`hosts/${fileName}`)

      image_url = publicUrlData.publicUrl
    }

    if (avatarFile && avatarFile.size > 0) {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `avatar_${Math.random()}.${fileExt}`
      const { data, error } = await supabaseAdmin.storage
        .from('images')
        .upload(`hosts/${fileName}`, avatarFile)

      if (error) throw error

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(`hosts/${fileName}`)

      avatar_url = publicUrlData.publicUrl
    }

    const updateData: any = { name, email, phone, contact_name, address, payout_notes }
    if (image_url) {
      updateData.image_url = image_url
    }
    if (avatar_url) {
      updateData.avatar_url = avatar_url
    }

    const { error } = await supabaseAdmin
      .from('hosts')
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/hosts')
    return { success: true }
  } catch (error: any) {
    console.error("Error updating host:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteHost(id: string) {
  try {
    const { createClient } = await import('@/utils/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    let normalizedRole = '';
    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
    if (roleData?.role) {
      normalizedRole = roleData.role.toLowerCase();
    } else {
      const { data: profileData } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (profileData?.role) {
        normalizedRole = profileData.role.toLowerCase();
      }
    }

    if (normalizedRole !== 'admin') return { success: false, error: "Unauthorized: Admins only" }

    // 1. Guard Rail: Check if the host has associated activities
    const { data: activities, error: activityError } = await supabaseAdmin
      .from('activities')
      .select('id')
      .eq('host_id', id)
      .limit(1)

    if (activityError && activityError.code !== 'PGRST116') throw activityError

    if (activities && activities.length > 0) {
      return { success: false, error: 'Cannot delete host while they have associated tours or bookings. Please reassign or remove their tours first.' }
    }

    // 2. Guard Rail: Check if the host has associated bookings
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('host_id', id)
      .limit(1)

    if (bookingsError && bookingsError.code !== 'PGRST116') throw bookingsError

    if (bookings && bookings.length > 0) {
      return { success: false, error: 'Cannot delete host while they have associated tours or bookings. Please reassign or remove their tours first.' }
    }

    // If no associations, proceed with deletion
    const { error } = await supabaseAdmin
      .from('hosts')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/hosts')
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting host:", error)
    return { success: false, error: error.message }
  }
}
