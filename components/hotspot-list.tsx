"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, Filter, List, Grid, Zap, Star, X, MessageSquare, Loader2, Clock, Coffee, Trees, Gamepad2, Utensils, Beer, MapPin } from "lucide-react"
import { HotspotCard } from "@/components/hotspot-card"
import { TrendingHotspots } from "@/components/trending-hotspots"
import { Input } from "@/components/ui/input"
import type { Hotspot } from "@/lib/types"
import { cn, calculateDistance } from "@/lib/utils"

interface HotspotListProps {
  hotspots: Hotspot[]
  selectedHotspot: Hotspot | null
  onHotspotSelect: (hotspot: Hotspot) => void
  activeCheckins: Record<string, number>
  averageRatings: Record<string, number>
  userCurrentCheckin?: string | null
  onCheckIn?: (hotspot: Hotspot) => void
  onRate?: (hotspot: Hotspot) => void
  userRatings?: Record<string, number>
  userReviews?: Record<string, string>
  isLoading?: boolean
  viewMode?: "list" | "grid"
  userLocation?: [number, number] | null
  savedHotspotIds?: string[]
  onToggleSave?: (id: string) => void
  onOpenFilter?: () => void
  activeFilterCount?: number
}

export function HotspotList({
  hotspots,
  selectedHotspot,
  onHotspotSelect,
  activeCheckins,
  averageRatings,
  userCurrentCheckin,
  onCheckIn,
  onRate,
  userRatings = {},
  userReviews = {},
  isLoading,
  viewMode = "list",
  userLocation,
  savedHotspotIds = [],
  onToggleSave,
  onOpenFilter,
  activeFilterCount = 0,
}: HotspotListProps) {
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('vv-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        // ignore error
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSuggestionClick = (hotspot: Hotspot) => {
    setSearch(hotspot.name)
    setShowSuggestions(false)
    onHotspotSelect(hotspot)

    const newRecents = [hotspot.name, ...recentSearches.filter(s => s !== hotspot.name)].slice(0, 5)
    setRecentSearches(newRecents)
    localStorage.setItem('vv-recent-searches', JSON.stringify(newRecents))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cafe': return <Coffee className="w-4 h-4 text-[var(--color-cat-cafe)]" />
      case 'park': return <Trees className="w-4 h-4 text-[var(--color-cat-park)]" />
      case 'gaming': return <Gamepad2 className="w-4 h-4 text-[var(--color-cat-gaming)]" />
      case 'food': return <Utensils className="w-4 h-4 text-[var(--color-cat-food)]" />
      case 'hangout': return <Beer className="w-4 h-4 text-[var(--color-cat-hangout)]" />
      default: return <MapPin className="w-4 h-4 text-muted-foreground" />
    }
  }

  // Scroll to selected hotspot
  useEffect(() => {
    if (selectedHotspot) {
      const el = document.getElementById(`hotspot-card-${selectedHotspot.id}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }, [selectedHotspot])

  const filteredHotspots = hotspots.filter((hotspot) => {
    const matchesSearch =
      hotspot.name.toLowerCase().includes(search.toLowerCase()) ||
      hotspot.address.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  // Determine if we are on desktop based on styling - but here we rely on viewMode prop usually passed by parent.
  // We'll hide the desktop search bar if we are in mobile view mode and the parent renders MobileSearchBar.
  // However, HotspotList is reused in Desktop Sidebar.
  // Let's keep the desktop search bar logic but make it hidden on mobile if needed via CSS classes in parent?
  // Or simpler: HotspotList is primarily the sidebar content.
  // If used as full screen mobile list, we might want to hide the internal search bar if there's an external one.
  // But typically the Sidebar HAS the search bar.

  return (
    <div className="flex flex-col h-full bg-muted">
      {/* Desktop/Sidebar Search - Hidden on mobile if we use the top MobileSearchBar instead,
          but usually this component IS the sidebar content.
          Let's assume this component renders the search bar.
          On mobile full-screen view, we might hide this header via CSS if we have the new MobileSearchBar.
          For now, I'll keep it but add md:block hidden if I want to replace it.
          Actually, the requirement is "Smart Search Bar... visible in List, Grid, and All Places views".
          If I use MobileSearchBar in DashboardClient, I should probably HIDE this header on mobile.
      */}
      <div className="p-4 border-b border-border space-y-4 hidden md:block">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-foreground">
            <span className="text-primary">{">"}</span> HOTSPOTS
          </h2>
        </div>

        <div className="flex gap-2">
          <div className="relative group z-20 flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:scale-110 group-focus-within:text-primary transition-all duration-200 pointer-events-none" />
            <Input
              ref={inputRef}
              placeholder="Search cafes, beaches, parks..."
              value={search}
              onChange={(e) => {
                  setSearch(e.target.value)
                  setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-12 pr-12 h-14 text-lg rounded-xl bg-background/50 border-white/10 text-foreground placeholder:text-muted-foreground/50 transition-all duration-300 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:shadow-[0_0_20px_rgba(var(--primary),0.2)] backdrop-blur-sm"
            />
            {/* ... key shortcut ... */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-background border border-muted-foreground/30 text-[10px] text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
             {/* ... autocomplete ... */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-primary/30 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-[300px] overflow-y-auto z-50">
                 {/* ... existing logic ... */}
                 {search.trim() === '' ? (
                  recentSearches.length > 0 && (
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground px-2 py-1">RECENT SEARCHES</p>
                      {recentSearches.map(term => (
                        <button
                          key={term}
                          onClick={() => { setSearch(term); }}
                          className="w-full text-left px-3 py-2 hover:bg-muted/50 rounded-lg flex items-center gap-2 text-foreground transition-colors"
                        >
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{term}</span>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="p-2">
                     {filteredHotspots.slice(0, 5).map(hotspot => (
                        <button
                          key={hotspot.id}
                          onClick={() => handleSuggestionClick(hotspot)}
                          className="w-full text-left px-3 py-2 hover:bg-muted/50 rounded-lg flex items-center gap-3 text-foreground group/item transition-colors"
                        >
                          <div className={`p-1.5 rounded-full bg-background border border-border group-hover/item:border-primary transition-colors`}>
                              {getCategoryIcon(hotspot.category)}
                          </div>
                          <div className="flex-1 overflow-hidden">
                              <p className="font-bold text-sm truncate">{hotspot.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{hotspot.address}</p>
                          </div>
                        </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {onOpenFilter && (
            <button
              onClick={onOpenFilter}
              className={`
                h-14 px-4 rounded-lg border border-border
                flex items-center gap-2 transition-all duration-200
                ${activeFilterCount > 0
                  ? "bg-primary/10 text-primary border-primary shadow-lg"
                  : "bg-card text-muted-foreground hover:text-foreground hover:border-foreground"
                }
              `}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden md:inline font-bold text-sm">
                {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
              </span>
              {activeFilterCount > 0 && (
                <span className="md:hidden w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="px-3 pt-3 md:px-4 md:pt-4">
        {(!search && activeFilterCount === 0) && (
           <TrendingHotspots />
        )}

        <Link
          href="/ai-planner"
          className="block glass-panel rounded-2xl p-6 hover-float group relative overflow-hidden"
        >
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 rounded-2xl p-[2px] opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10"
               style={{background: 'linear-gradient(135deg, #00D9FF, #FF006E)'}} />
          <div className="absolute inset-[2px] bg-card/80 rounded-[14px] -z-10" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="text-6xl group-hover:scale-110 transition-transform animate-float">🤖</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gradient-animated bg-clip-text text-transparent">
                AI Day Planner
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">Let AI plan your perfect day in Vasai-Virar</p>
              <div className="mt-2 inline-flex items-center gap-1 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-0.5 animate-pulse">
                <span className="text-green-400 text-xs font-bold">✨ NEW FEATURE</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className={viewMode === "grid" ? "flex-1 overflow-y-auto pb-20 md:pb-0" : "flex-1 overflow-y-auto p-3 pb-20 md:p-4 md:pb-4"}>
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 gap-[12px] p-[12px] auto-rows-fr"
              : "space-y-3"
          }
        >
          {filteredHotspots.map((hotspot) => {
            const isCheckedInHere = userCurrentCheckin === hotspot.id
            const userRating = userRatings[hotspot.id]

            let distance: number | null = null
            if (userLocation) {
                distance = calculateDistance(
                    userLocation[0],
                    userLocation[1],
                    Number(hotspot.latitude),
                    Number(hotspot.longitude)
                )
            }

            return (
              <div key={hotspot.id} id={`hotspot-card-${hotspot.id}`} className="h-full">
                <HotspotCard
                  hotspot={hotspot}
                  activeCheckins={activeCheckins[hotspot.id] || 0}
                  averageRating={averageRatings[hotspot.id] || 0}
                  onClick={() => onHotspotSelect(hotspot)}
                  isSelected={selectedHotspot?.id === hotspot.id}
                  distance={distance}
                  isSaved={savedHotspotIds.includes(hotspot.id)}
                  onToggleSave={onToggleSave}
                  variant={viewMode}
                >
                  <div className={cn("flex justify-between w-full gap-2 mt-2", viewMode === "grid" ? "flex-col" : "")}>
                    {onCheckIn && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onCheckIn(hotspot)
                        }}
                        disabled={isLoading}
                        className={cn(
                          "flex-1 font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 min-h-[40px] active:scale-95",
                          viewMode === "grid" ? "text-[10px] py-1.5" : "text-[11px] py-2.5 px-2",
                          isCheckedInHere
                            ? "bg-secondary text-secondary-foreground shadow-lg"
                            : "bg-primary text-primary-foreground hover:bg-primary/80 hover:shadow-[0_0_15px_var(--color-primary)]",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {isCheckedInHere ? (
                          <>
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            {viewMode === "grid" ? "HERE" : "HERE"}
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" />
                            {viewMode === "grid" ? "CHECK IN" : "CHECK IN"}
                          </>
                        )}
                      </button>
                    )}

                    {onRate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRate(hotspot)
                        }}
                        disabled={isLoading}
                        className={cn(
                          "flex-1 font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 min-h-[40px] active:scale-95",
                          viewMode === "grid" ? "text-[10px] py-1.5" : "text-[11px] py-2.5 px-2",
                          userRating
                            ? "bg-accent text-accent-foreground shadow-lg"
                            : "bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_15px_var(--color-secondary)]",
                          "disabled:opacity-50"
                        )}
                      >
                        <Star className={`w-3.5 h-3.5 ${userRating ? "fill-current" : ""}`} />
                        {userRating ? `${userRating}★` : "RATE"}
                      </button>
                    )}
                  </div>
                </HotspotCard>
              </div>
            )
          })}
        </div>

        {filteredHotspots.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-mono">No hotspots found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
