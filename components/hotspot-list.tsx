"use client"

import { useState, useEffect } from "react"
import { Search, Filter, List, Grid, Zap, Star, X, MessageSquare, Loader2 } from "lucide-react"
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
}: HotspotListProps) {
  const [search, setSearch] = useState("")

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

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-gray group-focus-within:scale-110 group-focus-within:text-cyber-primary transition-all duration-200" />
          <Input
            placeholder="Search hotspots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 text-base rounded-xl bg-cyber-navy border-cyber-gray text-cyber-light placeholder:text-cyber-gray/50 transition-all duration-200 focus:border-cyber-primary focus:ring-cyber-primary/20 focus:shadow-[0_0_12px_rgba(232,255,0,0.3)] shadow-inner"
          />
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
