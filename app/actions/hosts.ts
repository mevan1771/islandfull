"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

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
    const name = formData.get("name") as string
    const email = formData.get("email") as string | null
    const phone = formData.get("phone") as string | null
    const contact_name = formData.get("contact_name") as string | null
    const address = formData.get("address") as string | null
    const payout_notes = formData.get("payout_notes") as string | null
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
    const name = formData.get("name") as string
    const email = formData.get("email") as string | null
    const phone = formData.get("phone") as string | null
    const contact_name = formData.get("contact_name") as string | null
    const address = formData.get("address") as string | null
    const payout_notes = formData.get("payout_notes") as string | null
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
