'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function getLatestPolicy(type: string) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    const { data, error } = await supabase
        .from('platform_policies')
        .select('*')
        .eq('type', type)
        .order('version', { ascending: false })
        .limit(1)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching policy:', error)
        return null
    }

    return data
}

export async function savePolicy(type: string, content: string) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    // Get current version
    const currentPolicy = await getLatestPolicy(type)
    const newVersion = currentPolicy ? currentPolicy.version + 1 : 1

    const { data, error } = await supabase
        .from('platform_policies')
        .insert({
            type,
            version: newVersion,
            content
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving policy:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/policies')
    return { success: true, data }
}

export async function getCancellationTiers() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    const { data, error } = await supabase
        .from('cancellation_tiers')
        .select('*')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching cancellation tiers:', error)
        return []
    }

    return data
}

export async function saveCancellationTier(tier: any) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    let result;
    if (tier.id) {
        result = await supabase
            .from('cancellation_tiers')
            .update({
                name: tier.name,
                cutoff_hours: tier.cutoff_hours,
                refund_percentage: tier.refund_percentage
            })
            .eq('id', tier.id)
            .select()
            .single()
    } else {
        const newId = tier.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
        result = await supabase
            .from('cancellation_tiers')
            .upsert({
                id: newId,
                name: tier.name,
                cutoff_hours: tier.cutoff_hours,
                refund_percentage: tier.refund_percentage
            }, { onConflict: 'id' })
            .select()
            .single()
    }

    if (result.error) {
        console.error('Error saving cancellation tier:', result.error)
        return { success: false, error: result.error.message }
    }

    revalidatePath('/admin/policies')
    return { success: true, data: result.data }
}

export async function deleteCancellationTier(id: string) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    const { error } = await supabase
        .from('cancellation_tiers')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting cancellation tier:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/policies')
    return { success: true }
}
