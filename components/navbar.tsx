"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { User, LogOut, MapPin, Menu, X, List, Settings, ChevronDown, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CyberButton } from "@/components/ui/cyber-button"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { cn } from "@/lib/utils"

interface NavbarProps {
  user: SupabaseUser | null
  onMenuClick?: () => void
}

export function Navbar({ user, onMenuClick }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)

    // Prefetch main routes on mount
    router.prefetch("/dashboard")
    router.prefetch("/profile")
    router.prefetch("/settings")
    router.prefetch("/profile/friends")

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMobileMenuOpen(false)
    setUserDropdownOpen(false)
    router.push("/")
    router.refresh()
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
      isScrolled
        ? "glass shadow-lg"
        : "bg-background/40 backdrop-blur-sm border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 glitch-hover group">
            <div className="w-8 h-8 bg-accent/20 border border-accent rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-accent group-hover:scale-110 group-hover:shadow-[0_0_15px_var(--color-accent)]">
              <MapPin className="w-5 h-5 text-accent transition-colors duration-300 group-hover:text-black" />
            </div>
            <span className="text-xl font-bold hidden sm:inline">
              <span className="text-accent text-glow transition-colors duration-300 group-hover:text-primary">VV</span>
              <span className="text-foreground transition-colors duration-300"> HOTSPOTS</span>
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        {user && (
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              prefetch={true}
              onMouseEnter={() => router.prefetch("/dashboard")}
              className={`text-sm font-bold tracking-wider transition-all py-1 border-b-2 ${isActive("/dashboard")
                  ? "border-primary text-primary shadow-[var(--shadow-hover)]"
                  : "border-transparent text-foreground hover:text-accent hover:border-accent/50"
                }`}
            >
              EXPLORE
            </Link>
            <Link
              href="/profile"
              prefetch={true}
              onMouseEnter={() => router.prefetch("/profile")}
              className={`text-sm font-bold tracking-wider transition-all py-1 border-b-2 ${isActive("/profile")
                  ? "border-primary text-primary shadow-[var(--shadow-hover)]"
                  : "border-transparent text-foreground hover:text-accent hover:border-accent/50"
                }`}
            >
              PROFILE
            </Link>
            <Link
              href="/profile/friends"
              prefetch={true}
              onMouseEnter={() => router.prefetch("/profile/friends")}
              className={`text-sm font-bold tracking-wider transition-all py-1 border-b-2 ${isActive("/profile/friends")
                  ? "border-primary text-primary shadow-[var(--shadow-hover)]"
                  : "border-transparent text-foreground hover:text-accent hover:border-accent/50"
                }`}
            >
              FRIENDS
            </Link>
          </div>
        )}

        {/* Right: Theme Toggle + User Dropdown */}
        <div className="flex items-center gap-4">
          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-border/50" />

          {/* Notifications Dropdown */}
          {user && <NotificationsDropdown userId={user.id} />}

          {/* Unified Menu Button (Mobile Only usually) */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden flex items-center gap-2 px-2 py-1.5 bg-muted/50 border border-primary/50 text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-all active:scale-95"
            >
              <List className="w-5 h-5" />
            </button>
          )}

          {user ? (
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 hover:bg-white/5 rounded-full pr-2 transition-colors border border-transparent hover:border-white/10"
              >
                <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent overflow-hidden shadow-[0_0_10px_rgba(var(--accent),0.3)]">
                  <User className="w-5 h-5" />
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 glass-panel rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      href="/profile/friends"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Friends
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <div className="h-px bg-white/10 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <CyberButton variant="ghost" size="sm">
                  Login
                </CyberButton>
              </Link>
              <Link href="/auth/sign-up">
                <CyberButton variant="cyan" size="sm">
                  Sign Up
                </CyberButton>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger (Always visible on mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-foreground hover:text-accent transition-colors active:scale-90"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-14 md:top-16 left-0 right-0 glass-panel border-b border-border shadow-2xl transition-all duration-300 z-50 md:hidden animate-in slide-in-from-top-2">
          <div className="p-4 space-y-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  prefetch={true}
                  onTouchStart={() => router.prefetch("/dashboard")}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors min-h-[44px] ${isActive("/dashboard") ? "bg-primary/10 text-primary border border-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]" : "text-foreground hover:bg-accent/10"
                    }`}
                >
                  <MapPin className="w-5 h-5" />
                  Explore
                </Link>
                <Link
                  href="/profile"
                  prefetch={true}
                  onTouchStart={() => router.prefetch("/profile")}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors min-h-[44px] ${isActive("/profile") ? "bg-primary/10 text-primary border border-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]" : "text-foreground hover:bg-accent/10"
                    }`}
                >
                  <User className="w-5 h-5" />
                  Profile
                </Link>
                <Link
                  href="/profile/friends"
                  prefetch={true}
                  onTouchStart={() => router.prefetch("/profile/friends")}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors min-h-[44px] ${isActive("/profile/friends") ? "bg-primary/10 text-primary border border-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]" : "text-foreground hover:bg-accent/10"
                    }`}
                >
                  <Users className="w-5 h-5" />
                  Friends
                </Link>
                <Link
                  href="/settings"
                  prefetch={true}
                  onTouchStart={() => router.prefetch("/settings")}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors min-h-[44px] ${isActive("/settings") ? "bg-primary/10 text-primary border border-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]" : "text-foreground hover:bg-accent/10"
                    }`}
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full p-3 text-red-400 border border-red-500/50 hover:bg-red-500/10 rounded-xl transition-colors min-h-[44px]"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full p-3 text-foreground border border-border hover:border-accent rounded-xl transition-colors min-h-[44px]"
                >
                  Login
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full p-3 bg-accent text-accent-foreground rounded-xl font-bold min-h-[44px] shadow-[0_0_15px_var(--color-accent)]"
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
