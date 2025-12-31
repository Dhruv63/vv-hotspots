import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log("OAuth callback route hit")

  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log("Code received:", code ? "Yes" : "No")

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log("Exchange successful")
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error("Exchange failed:", error.message)
    }
  } else {
    console.error("No code received in callback")
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
