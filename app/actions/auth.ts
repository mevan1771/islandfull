"use server"

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function hostLogin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Verify the role is provider or admin
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'provider' && profile?.role !== 'admin') {
      await supabase.auth.signOut()
      return { error: "Unauthorized. You do not have operator access." }
    }
  }

  redirect('/host')
}

export async function hostLogout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/host/login')
}
