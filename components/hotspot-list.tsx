"use client"

import { useState } from "react"
import { Search, Filter, List, Grid, Zap, Star, X, MessageSquare, Loader2 } from "lucide-react"
import { HotspotCard } from "@/components/hotspot-card"
import { CyberButton } from "@/components/ui/cyber-button"
import { Input } from "@/components/ui/input"
import type { Hotspot } from "@/lib/types"

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
}

const categories = [
  { value: "all", label: "All" },
  { value: "cafe", label: "Cafes" },
  { value: "park", label: "Parks" },
  { value: "gaming", label: "Gaming" },
  { value: "food", label: "Food" },
  { value: "hangout", label: "Hangout" },
]

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
}: HotspotListProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [ratingHotspot, setRatingHotspot] = useState<Hotspot | null>(null)
  const [pendingRating, setPendingRating] = useState<number>(0)
  const [pendingReview, setPendingReview] = useState<string>("")
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [checkingInHotspotId, setCheckingInHotspotId] = useState<string | null>(null)

  const filteredHotspots = hotspots.filter((hotspot) => {
    const matchesSearch =
      hotspot.name.toLowerCase().includes(search.toLowerCase()) ||
      hotspot.address.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "all" || hotspot.category === category
    return matchesSearch && matchesCategory
  })

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
    <div className="flex flex-col h-full">
      {ratingHotspot && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => !isSubmittingRating && setRatingHotspot(null)}
        >
          <div
            className="relative w-full max-w-md bg-[#0a0a0f] border-2 border-cyber-purple rounded-xl p-6 shadow-[0_0_60px_rgba(183,0,255,0.5)] mx-4"
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
            <p className="text-cyber-cyan font-mono text-center mb-6 text-lg">{ratingHotspot.name}</p>

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
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]"
                        : "fill-transparent text-cyber-gray/40 hover:text-yellow-400/60"
                    }`}
                  />
                </button>
              ))}
            </div>

            <p className="text-center text-cyber-light font-mono mb-4 text-lg">
              {pendingRating === 0 && "Tap a star to rate"}
              {pendingRating === 1 && "Poor"}
              {pendingRating === 2 && "Fair"}
              {pendingRating === 3 && "Good"}
              {pendingRating === 4 && "Great"}
              {pendingRating === 5 && "Amazing!"}
            </p>

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
                className="w-full bg-cyber-black border border-cyber-gray rounded-lg p-3 text-cyber-light font-mono text-sm placeholder:text-cyber-gray/50 focus:border-cyber-cyan focus:outline-none focus:ring-1 focus:ring-cyber-cyan resize-none disabled:opacity-50"
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
                className="flex-1 py-3 px-4 bg-cyber-purple text-white font-mono text-sm font-bold rounded-lg hover:shadow-[0_0_20px_rgba(183,0,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
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

            {userRatings[ratingHotspot.id] && (
              <p className="text-center text-cyber-cyan text-xs font-mono mt-4">
                Your current rating: {userRatings[ratingHotspot.id]}★{userReviews[ratingHotspot.id] && " (with review)"}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="p-4 border-b border-cyber-gray space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-base text-cyber-light">
            <span className="text-cyber-cyan">{">"}</span> HOTSPOTS
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 ${viewMode === "list" ? "text-cyber-cyan" : "text-cyber-gray"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 ${viewMode === "grid" ? "text-cyber-cyan" : "text-cyber-gray"}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-gray" />
          <Input
            placeholder="Search hotspots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-9 text-sm bg-cyber-black border-cyber-gray text-cyber-light placeholder:text-cyber-gray/50 focus:border-cyber-cyan"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
          {categories.map((cat) => (
            <CyberButton
              key={cat.value}
              variant={category === cat.value ? "cyan" : "ghost"}
              size="sm"
              onClick={() => setCategory(cat.value)}
              className="flex-shrink-0 text-xs px-2 py-1"
            >
              {cat.label}
            </CyberButton>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4" : "space-y-4"}>
          {filteredHotspots.map((hotspot) => {
            const isCheckedInHere = userCurrentCheckin === hotspot.id
            const userRating = userRatings[hotspot.id]
            const isCheckingIn = checkingInHotspotId === hotspot.id

            return (
              <div key={hotspot.id}>
                <HotspotCard
                  hotspot={hotspot}
                  activeCheckins={activeCheckins[hotspot.id] || 0}
                  averageRating={averageRatings[hotspot.id] || 0}
                  onClick={() => onHotspotSelect(hotspot)}
                  isSelected={selectedHotspot?.id === hotspot.id}
                />

                <div className="flex gap-2 mt-2">
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
                      className={`flex-1 py-3 px-3 font-mono text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                        isCheckedInHere
                          ? "bg-cyber-pink text-white shadow-[0_0_15px_rgba(255,0,110,0.4)]"
                          : "bg-cyber-cyan text-cyber-black hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]"
                      } disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
                    >
                      {isCheckingIn ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isCheckedInHere ? (
                        <>
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          YOU'RE HERE
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
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
                      className={`py-3 px-4 font-mono text-xs font-bold rounded-lg transition-all flex items-center gap-2 min-h-[44px] ${
                        userRating
                          ? "bg-yellow-400 text-cyber-black shadow-[0_0_15px_rgba(250,204,21,0.4)]"
                          : "bg-cyber-purple text-white hover:shadow-[0_0_15px_rgba(183,0,255,0.5)]"
                      } active:scale-95 disabled:opacity-50`}
                    >
                      <Star className={`w-4 h-4 ${userRating ? "fill-cyber-black" : ""}`} />
                      {userRating ? `${userRating}★` : "RATE"}
                    </button>
                  )}
                </div>
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
