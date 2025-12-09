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
      case 'cafe': return <Coffee className="w-4 h-4 text-orange-400" />
      case 'park': return <Trees className="w-4 h-4 text-green-400" />
      case 'gaming': return <Gamepad2 className="w-4 h-4 text-purple-400" />
      case 'food': return <Utensils className="w-4 h-4 text-red-400" />
      case 'hangout': return <Beer className="w-4 h-4 text-pink-400" />
      default: return <MapPin className="w-4 h-4 text-gray-400" />
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

  // Sort by distance if available? Or leave order? The prompt doesn't specify sort.
  // "make search bar prominent..."

  return (
    <div className="flex flex-col h-full bg-cyber-dark">
      <div className="p-4 border-b border-cyber-gray space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-base text-cyber-light">
            <span className="text-cyber-primary">{">"}</span> HOTSPOTS
          </h2>
        </div>

        <div className="relative group z-20">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-gray group-focus-within:scale-110 group-focus-within:text-cyber-primary transition-all duration-200 pointer-events-none" />
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
            className="pl-12 pr-12 h-14 text-lg rounded-xl bg-cyber-navy border-cyber-gray text-cyber-light placeholder:text-cyber-gray/50 transition-all duration-200 focus:border-cyber-primary focus:ring-cyber-primary/20 focus:shadow-[0_0_12px_rgba(232,255,0,0.3)] shadow-inner"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
             <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyber-black border border-cyber-gray text-[10px] font-mono text-cyber-gray">
               <span className="text-xs">⌘</span>K
             </kbd>
          </div>

          {/* Autocomplete / Recent Searches Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-cyber-navy border border-cyber-primary/30 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-[300px] overflow-y-auto">
               {search.trim() === '' ? (
                 recentSearches.length > 0 && (
                   <div className="p-2">
                     <p className="text-xs font-mono text-cyber-gray px-2 py-1">RECENT SEARCHES</p>
                     {recentSearches.map(term => (
                       <button
                         key={term}
                         onClick={() => { setSearch(term); }}
                         className="w-full text-left px-3 py-2 hover:bg-cyber-gray/10 rounded flex items-center gap-2 text-cyber-light transition-colors"
                       >
                         <Clock className="w-4 h-4 text-cyber-gray" />
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
                        className="w-full text-left px-3 py-2 hover:bg-cyber-gray/10 rounded flex items-center gap-3 text-cyber-light group/item transition-colors"
                      >
                         <div className={`p-1.5 rounded-full bg-cyber-black border border-cyber-gray group-hover/item:border-cyber-primary transition-colors`}>
                            {getCategoryIcon(hotspot.category)}
                         </div>
                         <div className="flex-1 overflow-hidden">
                            <p className="font-bold font-mono text-sm truncate">{hotspot.name}</p>
                            <p className="text-xs text-cyber-gray truncate">{hotspot.address}</p>
                         </div>
                      </button>
                   ))}
                   {filteredHotspots.length === 0 && (
                      <div className="p-4 text-center text-cyber-gray text-sm font-mono">
                        No matches found
                      </div>
                   )}
                 </div>
               )}
            </div>
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
                            ? "bg-cyber-pink text-white shadow-[0_0_15px_rgba(255,0,110,0.4)]"
                            : "bg-cyber-primary text-black hover:bg-cyber-yellow hover:shadow-[0_0_15px_var(--color-cyber-primary)]"
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
                            ? "bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.4)]"
                            : "bg-cyber-secondary text-white hover:bg-cyber-pink hover:shadow-[0_0_15px_var(--color-cyber-secondary)]"
                        } active:scale-95 disabled:opacity-50`}
                      >
                        <Star className={`w-3.5 h-3.5 ${userRating ? "fill-black" : ""}`} />
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
          <div className="text-center py-12 text-cyber-gray">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-mono">No hotspots found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
