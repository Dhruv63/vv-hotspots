"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, LogOut, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CyberButton } from "@/components/ui/cyber-button"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface NavbarProps {
  user: SupabaseUser | null
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cyber-black/90 backdrop-blur-md border-b border-cyber-gray">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 glitch-hover">
          <div className="w-8 h-8 bg-cyber-cyan cyber-clip-sm flex items-center justify-center">
            <MapPin className="w-5 h-5 text-cyber-black" />
          </div>
          <span className="font-mono text-xl font-bold">
            <span className="neon-text-cyan">VV</span>
            <span className="text-cyber-light"> HOTSPOTS</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <CyberButton variant="ghost" size="sm">
                  Explore
                </CyberButton>
              </Link>
              <Link href="/profile">
                <CyberButton variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </CyberButton>
              </Link>
              <CyberButton variant="pink" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </CyberButton>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <CyberButton variant="ghost" size="sm">
                  Login
                </CyberButton>
              </Link>
              <Link href="/auth/sign-up">
                <CyberButton variant="cyan" size="sm">
                  Sign Up
                </CyberButton>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
