"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, LogOut, MapPin, Menu, X, List } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CyberButton } from "@/components/ui/cyber-button"
import { ThemeToggle } from "@/components/theme-toggle"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface NavbarProps {
  user: SupabaseUser | null
  onMenuClick?: () => void
}

export function Navbar({ user, onMenuClick }: NavbarProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMobileMenuOpen(false)
    router.push("/")
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cyber-black/90 backdrop-blur-md border-b border-cyber-gray transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 glitch-hover">
            <div className="w-8 h-8 bg-cyber-cyan cyber-clip-sm flex items-center justify-center transition-colors duration-300">
              <MapPin className="w-5 h-5 text-cyber-black transition-colors duration-300" />
            </div>
            <span className="font-mono text-xl font-bold hidden sm:inline">
              <span className="neon-text-cyan transition-colors duration-300">VV</span>
              <span className="text-cyber-light transition-colors duration-300"> HOTSPOTS</span>
            </span>
          </Link>

          {/* Unified Menu Button - Visible if onMenuClick is provided */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="flex items-center gap-2 px-3 py-1.5 bg-cyber-dark border border-cyber-primary/50 text-cyber-primary rounded-md hover:bg-cyber-primary hover:text-cyber-black transition-all shadow-[0_0_10px_rgba(255,255,0,0.1)]"
            >
              <List className="w-5 h-5" />
              <span className="font-mono text-xs font-bold hidden sm:inline">MENU</span>
            </button>
          )}
        </div>

        {/* Standard Navigation (Hidden if using simplified dashboard menu) */}
        {!onMenuClick && (
          <div className="hidden md:flex items-center gap-4">
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
                <ThemeToggle />
                <CyberButton variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </CyberButton>
              </>
            ) : (
              <>
                <ThemeToggle />
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
        )}

        {/* Right Side: Theme Toggle + Hamburger (Always visible on mobile, or always if simplified menu) */}
        <div className={`flex items-center gap-2 ${!onMenuClick ? 'md:hidden' : ''}`}>
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-cyber-light hover:text-cyber-cyan transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-14 md:top-16 left-0 right-0 bg-cyber-dark border-b border-cyber-gray shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-colors duration-300 z-50">
          <div className="p-4 space-y-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full p-3 text-cyber-light hover:bg-cyber-cyan/10 hover:text-cyber-cyan rounded-lg transition-colors font-mono min-h-[44px]"
                >
                  <MapPin className="w-5 h-5" />
                  Explore
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full p-3 text-cyber-light hover:bg-cyber-cyan/10 hover:text-cyber-cyan rounded-lg transition-colors font-mono min-h-[44px]"
                >
                  <User className="w-5 h-5" />
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full p-3 text-cyber-primary border border-cyber-primary hover:bg-cyber-primary/10 rounded-lg transition-colors font-mono min-h-[44px]"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full p-3 text-cyber-light border border-cyber-gray hover:border-cyber-cyan rounded-lg transition-colors font-mono min-h-[44px]"
                >
                  Login
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full p-3 bg-cyber-cyan text-cyber-black rounded-lg font-mono font-bold min-h-[44px]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
