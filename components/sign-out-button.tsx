"use client"

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/landing')
    router.refresh()
  }

  return (
    <button onClick={handleSignOut} className="text-sm text-red-600">
      Sign Out
    </button>
  )
}
