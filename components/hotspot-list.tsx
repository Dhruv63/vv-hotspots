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
  onRate?: (hotspot: Hotspot, rating: number, review?: string) => void
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
  const [ratingHotspot, setRatingHotspot] = useState<Hotspot | null>(null)
  const [pendingRating, setPendingRating] = useState<number>(0)
  const [pendingReview, setPendingReview] = useState<string>("")
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [checkingInHotspotId, setCheckingInHotspotId] = useState<string | null>(null)

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

  const handleStarClick = (rating: number) => {
    setPendingRating(rating)
  }

  const handleSubmitRating = async () => {
    if (ratingHotspot && pendingRating > 0 && onRate) {
      setIsSubmittingRating(true)
      try {
        await onRate(ratingHotspot, pendingRating, pendingReview || undefined)
        setRatingHotspot(null)
        setPendingRating(0)
        setPendingReview("")
      } finally {
        setIsSubmittingRating(false)
      }
    }
  }

  const openRatingModal = (hotspot: Hotspot) => {
    setRatingHotspot(hotspot)
    setPendingRating(userRatings[hotspot.id] || 0)
    setPendingReview(userReviews[hotspot.id] || "")
  }

  const handleCheckInClick = async (hotspot: Hotspot) => {
    if (!onCheckIn || isLoading || checkingInHotspotId) return
    setCheckingInHotspotId(hotspot.id)
    try {
      await onCheckIn(hotspot)
    } finally {
      setCheckingInHotspotId(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-cyber-dark">
      {ratingHotspot && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => !isSubmittingRating && setRatingHotspot(null)}
        >
          <div
            className="relative w-full max-w-md bg-[#0a0a0f] border-2 border-cyber-pink rounded-xl p-6 shadow-[0_0_60px_rgba(255,0,110,0.3)] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setRatingHotspot(null)}
              disabled={isSubmittingRating}
              className="absolute top-3 right-3 text-cyber-gray hover:text-cyber-light p-1 z-10 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-mono font-bold text-cyber-light text-center mb-2 pr-8">Rate this spot</h3>
            <p className="text-cyber-primary font-mono text-center mb-6 text-lg">{ratingHotspot.name}</p>

            <div className="flex justify-center gap-3 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  disabled={isSubmittingRating}
                  className="p-1 transition-transform hover:scale-125 active:scale-95 disabled:opacity-50"
                >
                  <Star
                    className={`w-10 h-10 sm:w-12 sm:h-12 transition-all ${
                      star <= pendingRating
                        ? "fill-cyber-primary text-cyber-primary drop-shadow-[0_0_15px_var(--color-cyber-primary)]"
                        : "fill-transparent text-cyber-gray/40 hover:text-cyber-primary/60"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 text-cyber-gray text-sm font-mono mb-2">
                <MessageSquare className="w-4 h-4" />
                Write a review (optional)
              </label>
              <textarea
                value={pendingReview}
                onChange={(e) => setPendingReview(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
                maxLength={500}
                disabled={isSubmittingRating}
                className="w-full bg-cyber-black border border-cyber-gray rounded-lg p-3 text-cyber-light font-mono text-sm placeholder:text-cyber-gray/50 focus:border-cyber-primary focus:outline-none focus:ring-1 focus:ring-cyber-primary resize-none disabled:opacity-50"
              />
              <p className="text-cyber-gray/50 text-xs font-mono text-right mt-1">{pendingReview.length}/500</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRatingHotspot(null)}
                disabled={isSubmittingRating}
                className="flex-1 py-3 px-4 border border-cyber-gray text-cyber-gray font-mono text-sm rounded-lg hover:border-cyber-light hover:text-cyber-light transition-colors active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={pendingRating === 0 || isSubmittingRating}
                className="flex-1 py-3 px-4 bg-cyber-secondary text-white font-mono text-sm font-bold rounded-lg hover:shadow-[0_0_20px_var(--color-cyber-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmittingRating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Submit Rating"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-b border-cyber-gray space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-base text-cyber-light">
            <span className="text-cyber-primary">{">"}</span> HOTSPOTS
          </h2>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-gray" />
          <Input
            placeholder="Search hotspots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 text-base rounded-xl bg-cyber-navy border-cyber-gray text-cyber-light placeholder:text-cyber-gray/50 focus:border-cyber-primary focus:ring-cyber-primary/20 shadow-inner"
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
            const isCheckingIn = checkingInHotspotId === hotspot.id

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
                          handleCheckInClick(hotspot)
                        }}
                        disabled={
                          isLoading ||
                          isCheckingIn ||
                          (checkingInHotspotId !== null && checkingInHotspotId !== hotspot.id)
                        }
                        className={`flex-1 py-2.5 px-2 font-mono text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
                          isCheckedInHere
                            ? "bg-cyber-pink text-white shadow-[0_0_15px_rgba(255,0,110,0.4)]"
                            : "bg-cyber-primary text-black hover:bg-cyber-yellow hover:shadow-[0_0_15px_var(--color-cyber-primary)]"
                        } disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
                      >
                        {isCheckingIn ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isCheckedInHere ? (
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
                          openRatingModal(hotspot)
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
