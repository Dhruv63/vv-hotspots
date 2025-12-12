'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserTheme(themeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ theme: themeId })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/')
  return { success: true }
}

export async function getUserTheme() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return 'cyberpunk'

  const { data } = await supabase
    .from('profiles')
    .select('theme')
    .eq('id', user.id)
    .single()

  return data?.theme || 'cyberpunk'
}
