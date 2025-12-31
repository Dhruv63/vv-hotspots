import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'
    const origin = requestUrl.origin

    console.log('[Auth Callback] Start', {
      code: code ? 'PRESENT' : 'MISSING',
      next,
      origin
    })

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[Auth Callback] Missing Supabase environment variables')
      return NextResponse.redirect(`${origin}/login?error=server_configuration_error`)
    }

    if (code) {
      const supabase = await createServerSupabaseClient()

      console.log('[Auth Callback] Exchanging code for session...')
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        console.log('[Auth Callback] Session exchange successful, redirecting to', next)
        return NextResponse.redirect(`${origin}${next}`)
      } else {
        console.error('[Auth Callback] Session exchange error:', error)
        return NextResponse.redirect(`${origin}/login?error=auth_callback_error&message=${encodeURIComponent(error.message)}`)
      }
    }

    console.warn('[Auth Callback] No code found in URL')
    return NextResponse.redirect(`${origin}/login?error=no_code`)

  } catch (err) {
    console.error('[Auth Callback] Unexpected error:', err)
    // Fallback to origin from request if possible, otherwise hardcode or relative
    const fallbackOrigin = request.headers.get('origin') || request.headers.get('host') || 'http://localhost:3000'
    // Ensure protocol is present
    const redirectBase = fallbackOrigin.startsWith('http') ? fallbackOrigin : `http://${fallbackOrigin}`
    return NextResponse.redirect(`${redirectBase}/login?error=server_error`)
  }
}
