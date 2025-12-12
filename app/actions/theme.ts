'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserTheme(theme: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    const { error } = await supabase
        .from('profiles')
        .update({ theme })
        .eq('id', user.id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    return { success: true }
}
