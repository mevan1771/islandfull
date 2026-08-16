"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/utils/auditLogger"
import { createClient } from "@/utils/supabase/server"

export async function createPartner(data: any) {
    try {
        const { error } = await supabaseAdmin.from('affiliate_partners').insert(data)
        if (error) throw error

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        await logActivity(user?.id, `Created Affiliate Partner: ${data.name}`, 'affiliate_partners', null)

        revalidatePath('/admin/partners')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function updatePartner(id: string, data: any) {
    try {
        const { error } = await supabaseAdmin.from('affiliate_partners').update(data).eq('id', id)
        if (error) throw error

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        await logActivity(user?.id, `Updated Affiliate Partner: ${data.name || id}`, 'affiliate_partners', id)

        revalidatePath('/admin/partners')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function deletePartner(id: string, name: string) {
    try {
        const { error } = await supabaseAdmin.from('affiliate_partners').delete().eq('id', id)
        if (error) throw error

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        await logActivity(user?.id, `Deleted Affiliate Partner: ${name}`, 'affiliate_partners', id)

        revalidatePath('/admin/partners')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
