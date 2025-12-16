"use client"

import { X, SlidersHorizontal, Users, Shield, Settings, LogOut, User as UserIcon, List as ListIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ThemeSelector } from "@/app/(main)/settings/theme-selector"
import Link from "next/link"

interface UnifiedMenuDrawerProps {
  isOpen: boolean
  onClose: () => void
  currentView: string
  currentCategories: string[]
  showFriendsOnly: boolean
  onToggleFriendsOnly: (show: boolean) => void
  onApply: (view: string, categories: string[]) => void
  onClear: () => void
}

const CATEGORIES = [
  { id: "cafe", label: "Cafes", emoji: "☕" },
  { id: "park", label: "Parks", emoji: "🌳" },
  { id: "food", label: "Food", emoji: "🍔" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "hangout", label: "Hangout", emoji: "🍻" },
]

export function UnifiedMenuDrawer({
  isOpen,
  onClose,
  currentView,
  currentCategories,
  showFriendsOnly,
  onToggleFriendsOnly,
  onApply,
  onClear,
}: UnifiedMenuDrawerProps) {
  const router = useRouter()
  const supabase = createClient()

  // We are removing the internal state for categories and view,
  // relying on props to be "controlled" or just simple actions.
  // Actually, the previous implementation likely had local state for "Apply" button pattern.
  // Requirement: "Menu: Profile, Friends, Settings, Sign Out"
  // "The UnifiedMenuDrawer is a controlled component that applies filter and view changes instantly via the onApply prop, eliminating the need for a manual 'Apply' button." (From Memory)

  // However, since this is now the "Menu" from the bottom nav, it should probably show Menu items primarily,
  // and maybe filters as a subsection or separate tab?
  // The prompt says "Menu: Profile, Friends, Settings, Sign Out".
  // But also "Search component... Quick filter pills". So filters are on the search bar now.
  // Do we still need filters in the drawer?
  // The DashboardClient uses this drawer for "Menu" click.
  // Let's transform this into a proper User Menu + Settings, and keep Filters maybe as a "Filter Settings" or remove them if they are fully covered by the Smart Search Bar.
  // Wait, the Smart Search Bar is only on List/Grid. Map view needs filters too?
  // "Map View Enhancements... Floating search button... opens search overlay modal".
  // Maybe the floating search button should open the Search Bar in a modal/sheet, OR this drawer.

  // Let's make this drawer a comprehensive "More" menu.
  // It can have sections: "User", "Navigation", "Filters" (optional or minimal).

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[101] w-[300px] bg-card border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-heading text-lg font-bold text-foreground">MENU</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">

            {/* User Navigation Section */}
            <div className="space-y-2">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Account</p>
                <Link
                    href="/profile"
                    prefetch={true}
                    onTouchStart={() => router.prefetch("/profile")}
                    onClick={onClose}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted transition-colors text-foreground font-medium"
                >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <UserIcon className="w-4 h-4" />
                    </div>
                    Profile
                </Link>
                <Link
                    href="/profile/friends"
                    prefetch={true}
                    onTouchStart={() => router.prefetch("/profile/friends")}
                    onClick={onClose}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted transition-colors text-foreground font-medium"
                >
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                        <Users className="w-4 h-4" />
                    </div>
                    Friends
                </Link>
                <Link
                    href="/settings"
                    prefetch={true}
                    onTouchStart={() => router.prefetch("/settings")}
                    onClick={onClose}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted transition-colors text-foreground font-medium"
                >
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                        <Settings className="w-4 h-4" />
                    </div>
                    Settings
                </Link>
            </div>

            <div className="border-t border-border my-2" />

            {/* Filters Section (Still useful for Map View or specific toggles like Friends Only) */}
            <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Map Filters</p>
                 </div>

                 <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium">Friends Only</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={showFriendsOnly}
                            onChange={(e) => onToggleFriendsOnly(e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                 </div>
            </div>

            <div className="border-t border-border my-2" />

            {/* Theme Selector Section (Quick Access) */}
            <div className="space-y-2">
                 <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Appearance</p>
                 <ThemeSelector />
            </div>

          </div>

          <div className="p-4 border-t border-border bg-muted/30">
             <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 w-full p-3 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors font-bold"
            >
                <LogOut className="w-4 h-4" />
                Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
