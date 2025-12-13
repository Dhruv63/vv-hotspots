"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Filter, List, Grid, Zap, Star, X, MessageSquare, Loader2, Clock, Coffee, Trees, Gamepad2, Utensils, Beer, MapPin } from "lucide-react"
import { HotspotCard } from "@/components/hotspot-card"
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

  return (
    <div className="flex flex-col h-full bg-muted">
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-base text-foreground">
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
              className="pl-12 pr-12 h-14 text-lg rounded-xl bg-card border-border text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:border-primary focus:ring-primary/20 focus:shadow-lg shadow-inner"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background border border-muted-foreground/30 text-[10px] font-mono text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>

            {/* Autocomplete / Recent Searches Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-primary/30 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-[300px] overflow-y-auto z-50">
                {search.trim() === '' ? (
                  recentSearches.length > 0 && (
                    <div className="p-2">
                      <p className="text-xs font-mono text-muted-foreground px-2 py-1">RECENT SEARCHES</p>
                      {recentSearches.map(term => (
                        <button
                          key={term}
                          onClick={() => { setSearch(term); }}
                          className="w-full text-left px-3 py-2 hover:bg-muted/50 rounded flex items-center gap-2 text-foreground transition-colors"
                        >
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{term}</span>
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
                          className="w-full text-left px-3 py-2 hover:bg-muted/50 rounded flex items-center gap-3 text-foreground group/item transition-colors"
                        >
                          <div className={`p-1.5 rounded-full bg-background border border-border group-hover/item:border-primary transition-colors`}>
                              {getCategoryIcon(hotspot.category)}
                          </div>
                          <div className="flex-1 overflow-hidden">
                              <p className="font-bold font-mono text-sm truncate">{hotspot.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{hotspot.address}</p>
                          </div>
                        </button>
                    ))}
                    {filteredHotspots.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground text-sm font-mono">
                          No matches found
                        </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {onOpenFilter && (
            <button
              onClick={onOpenFilter}
              className={`
                h-14 px-4 rounded-xl border border-border
                flex items-center gap-2 transition-all duration-200
                ${activeFilterCount > 0
                  ? "bg-primary/10 text-primary border-primary shadow-lg"
                  : "bg-card text-muted-foreground hover:text-foreground hover:border-foreground"
                }
              `}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden md:inline font-mono text-sm font-bold">
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

      <div className={viewMode === "grid" ? "flex-1 overflow-y-auto" : "flex-1 overflow-y-auto p-4"}>
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 min-[400px]:grid-cols-2 gap-[12px] p-[12px] auto-rows-fr"
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
                >
                  <div className="flex justify-between w-full gap-2 mt-2">
                    {onCheckIn && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onCheckIn(hotspot)
                        }}
                        disabled={isLoading}
                        className={`flex-1 py-2.5 px-2 font-mono text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
                          isCheckedInHere
                            ? "bg-secondary text-secondary-foreground shadow-lg"
                            : "bg-primary text-primary-foreground hover:bg-primary/80 hover:shadow-[0_0_15px_var(--color-primary)]"
                        } disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
                      >
                        {isCheckedInHere ? (
                          <>
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            HERE
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" />
                            CHECK IN
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
                        className={`flex-1 py-2.5 px-2 font-mono text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
                          userRating
                            ? "bg-accent text-accent-foreground shadow-lg"
                            : "bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_15px_var(--color-secondary)]"
                        } active:scale-95 disabled:opacity-50`}
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
