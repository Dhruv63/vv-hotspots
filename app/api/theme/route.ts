import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ theme: 'cyberpunk' })
  }

  const { data } = await supabase
    .from('profiles')
    .select('theme')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ theme: data?.theme || 'cyberpunk' })
}
