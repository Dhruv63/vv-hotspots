"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function AuthCodeRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  useEffect(() => {
    if (code) {
      console.log('[Auth Code Redirect] Found code in root URL, redirecting to callback...')
      // Preserve other params like 'next' if needed, but the callback route handles 'next'
      // We manually construct the URL to ensure it goes to the API route
      window.location.href = `/auth/callback?code=${code}&next=/dashboard`
    }
  }, [code, router])

  return null
}
