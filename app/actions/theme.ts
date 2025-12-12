'use server'

import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Internal cached function to fetch theme from DB
const getCachedUserTheme = unstable_cache(
  async (userId: string) => {
    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('theme')
      .eq('id', userId)
      .single()

    return data?.theme || 'cyberpunk'
  },
  ['user-theme'],
  { revalidate: 60, tags: ['theme'] }
)

export const getUserTheme = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return 'cyberpunk'

  return getCachedUserTheme(user.id)
}
