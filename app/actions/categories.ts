"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function getCategories() {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }
  return data || []
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const category_type = formData.get("category_type") as string || "tour"
  const sort_order = parseInt((formData.get("sort_order") as string) || "0", 10)

  if (!name || !slug) return { success: false, error: "Name and slug are required" }

  const { error } = await supabaseAdmin
    .from('categories')
    .insert([{ name, slug, category_type, sort_order }])

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/')
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const category_type = formData.get("category_type") as string || "tour"
  const sort_order = parseInt((formData.get("sort_order") as string) || "0", 10)

  if (!name || !slug) return { success: false, error: "Name and slug are required" }

  const { error } = await supabaseAdmin
    .from('categories')
    .update({ name, slug, category_type, sort_order })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/')
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteCategory(id: string) {
  // SAFETY CATCH: Check if category is used in activity_categories
  const { count, error: countError } = await supabaseAdmin
    .from('activity_categories')
    .select('activity_id', { count: 'exact', head: true })
    .eq('category_id', id)

  if (countError) return { success: false, error: countError.message }

  if (count && count > 0) {
    return { success: false, error: `Cannot delete: This tag is currently used by ${count} tour(s). Remove it from the tours first.` }
  }

  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/')
  revalidatePath('/admin/categories')
  return { success: true }
}
