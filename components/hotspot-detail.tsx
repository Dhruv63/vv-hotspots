"use client"

import { useState } from "react"
import Image from "next/image"
import { X, MapPin, Users, Navigation, Clock } from "lucide-react"
import { CyberCard } from "@/components/ui/cyber-card"
import { CyberButton } from "@/components/ui/cyber-button"
import { CategoryBadge } from "@/components/ui/category-badge"
import { StarRating } from "@/components/ui/star-rating"
import type { Hotspot } from "@/lib/types"

interface HotspotDetailProps {
  hotspot: Hotspot
  activeCheckins: number
  averageRating: number
  userRating: number | null
  isCheckedIn: boolean
  onClose: () => void
  onCheckIn: () => void
  onCheckOut: () => void
  onRate: (rating: number) => void
  isLoading?: boolean
}

export function HotspotDetail({
  hotspot,
  activeCheckins,
  averageRating,
  userRating,
  isCheckedIn,
  onClose,
  onCheckIn,
  onCheckOut,
  onRate,
  isLoading = false,
}: HotspotDetailProps) {
  const [pendingRating, setPendingRating] = useState<number | null>(null)

  const handleRating = (rating: number) => {
    setPendingRating(rating)
    onRate(rating)
  }

  const openInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${hotspot.latitude},${hotspot.longitude}`
    window.open(url, "_blank")
  }

  return (
    <CyberCard className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-20 overflow-hidden">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 p-1 bg-cyber-black/80 border border-cyber-gray text-cyber-gray hover:text-cyber-light hover:border-cyber-cyan transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Image header */}
      <div className="relative h-48">
        <Image
          src={hotspot.image_url || "/placeholder.svg?height=192&width=384"}
          alt={hotspot.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-cyber-black/50 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4">
          <CategoryBadge category={hotspot.category} className="mb-2" />
          <h2 className="font-mono text-xl font-bold text-cyber-light">{hotspot.name}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Address & Navigate */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 text-cyber-gray">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{hotspot.address}</span>
          </div>
          <button
            onClick={openInMaps}
            className="flex items-center gap-1 text-cyber-cyan text-xs font-mono hover:underline"
          >
            <Navigation className="w-3 h-3" />
            Navigate
          </button>
        </div>

        {/* Description */}
        {hotspot.description && <p className="text-cyber-light/80 text-sm">{hotspot.description}</p>}

        {/* Stats */}
        <div className="flex items-center justify-between py-3 border-y border-cyber-gray">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyber-cyan" />
              <span className="font-mono text-cyber-light">{activeCheckins}</span>
              <span className="text-cyber-gray text-sm">here now</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={averageRating} size="sm" />
            <span className="font-mono text-cyber-light">{averageRating > 0 ? averageRating.toFixed(1) : "-"}</span>
          </div>
        </div>

        {/* Rate this spot */}
        <div className="space-y-2">
          <p className="text-cyber-gray text-sm font-mono">RATE THIS SPOT</p>
          <StarRating rating={pendingRating ?? userRating ?? 0} size="lg" interactive onRatingChange={handleRating} />
        </div>

        {/* Check-in button */}
        <CyberButton
          variant={isCheckedIn ? "pink" : "cyan"}
          size="lg"
          className="w-full"
          glowing={!isCheckedIn}
          onClick={isCheckedIn ? onCheckOut : onCheckIn}
          disabled={isLoading}
        >
          {isLoading ? (
            "PROCESSING..."
          ) : isCheckedIn ? (
            <>
              <Clock className="w-4 h-4 mr-2" />
              CHECK OUT
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              CHECK IN HERE
            </>
          )}
        </CyberButton>
      </div>
    </CyberCard>
  )
}
