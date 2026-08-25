'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function acceptPolicy(hostId: string, version: number) {
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
        .from('hosts')
        .update({ agreed_policy_version: version })
        .eq('id', hostId)

    if (error) {
        console.error('Error accepting policy:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/host', 'layout')
    return { success: true }
}
