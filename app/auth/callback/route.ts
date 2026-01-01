import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  // ADD THESE LOGS
  console.log('========================================')
  console.log('AUTH CALLBACK ROUTE HIT')
  console.log('Timestamp:', new Date().toISOString())
  console.log('Code received:', code ? 'YES' : 'NO')
  console.log('Code (first 20 chars):', code?.substring(0, 20))
  console.log('Next param:', next)
  console.log('Origin:', requestUrl.origin)
  console.log('========================================')

  if (code) {
    const supabase = await createServerSupabaseClient()

    console.log('Supabase client created, attempting exchange...')

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    // ADD DETAILED ERROR LOGGING
    if (error) {
      console.error('========================================')
      console.error('EXCHANGE CODE FOR SESSION FAILED')
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error status:', error.status)
      console.error('Full error object:', JSON.stringify(error, null, 2))
      console.error('========================================')

      // Redirect with error details in URL for debugging
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}&code=exchange_failed`
      )
    }

    console.log('Exchange successful!')
    console.log('Session data:', data.session ? 'Session exists' : 'No session')
    console.log('User:', data.user ? data.user.email : 'No user')
  } else {
    console.error('No code parameter in callback URL')
  }

  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
