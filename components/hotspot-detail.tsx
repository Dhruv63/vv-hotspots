"use client"

import { useState } from "react"
import Image from "next/image"
import { X, MapPin, Users, Navigation, Clock, Zap } from "lucide-react"
import { CyberButton } from "@/components/ui/cyber-button"
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

const getHotspotImage = (hotspot: Hotspot): string => {
  const locationImages: Record<string, string> = {
    "Vasai Fort": "/vasai-fort.jpg",
    "Arnala Beach": "/arnala-beach.jpg",
    "Rajodi Beach": "/rajodi-beach.jpg",
    "Cafe Hashtag": "/cafe-hashtag.jpg",
    "The Good Vibes Cafe": "/good-vibes-cafe.jpg",
    "Pelhar Dam": "/pelhar-dam.jpg",
    "Tungareshwar Temple": "/tungareshwar.jpg",
    "Suruchi Beach": "/suruchi-beach.jpg",
    "Navapur Beach": "/navapur-beach.jpg",
    "Tipsy Panda": "/tipsy-panda.jpg",
  }

  if (locationImages[hotspot.name]) {
    return locationImages[hotspot.name]
  }

  const categoryImages: Record<string, string> = {
    cafe: "/cozy-cafe-interior-warm-lighting-coffee.jpg",
    park: "/beautiful-park-nature-greenery-trees.jpg",
    gaming: "/gaming-arcade-neon-lights-video-games.jpg",
    hangout: "/sunset-beach-hangout-spot-friends.jpg",
    food: "/indian-street-food-delicious-colorful.jpg",
    other: "/urban-hangout-spot-city-location.jpg",
  }
  return categoryImages[hotspot.category] || categoryImages.other
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "cafe":
      return "bg-cyber-cyan text-cyber-black"
    case "park":
      return "bg-green-500 text-cyber-black"
    case "gaming":
      return "bg-cyber-purple text-cyber-light"
    case "food":
      return "bg-orange-500 text-cyber-black"
    case "hangout":
      return "bg-cyber-pink text-cyber-light"
    default:
      return "bg-cyber-gray text-cyber-black"
  }
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
  const [isRating, setIsRating] = useState(false)

  const handleRating = async (rating: number) => {
    setPendingRating(rating)
    setIsRating(true)
    await onRate(rating)
    setIsRating(false)
  }

  const openInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${hotspot.latitude},${hotspot.longitude}`
    window.open(url, "_blank")
  }

  const imageUrl = getHotspotImage(hotspot)

  return (
    <div className="absolute bottom-0 left-0 right-0 md:bottom-4 md:left-auto md:right-4 md:w-96 z-30 bg-cyber-dark border-t-2 md:border-2 border-cyber-cyan md:rounded-lg max-h-[85vh] overflow-y-auto shadow-[0_0_30px_rgba(0,255,255,0.3)]">
      {/* Glowing header bar */}
      <div className="h-1 w-full bg-gradient-to-r from-cyber-cyan via-cyber-pink to-cyber-purple" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-3 z-10 p-2 bg-cyber-black/80 border border-cyber-gray text-cyber-gray hover:text-cyber-light hover:border-cyber-cyan transition-colors rounded"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Image header */}
      <div className="relative h-40 md:h-48">
        <Image src={imageUrl || "/placeholder.svg"} alt={hotspot.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-cyber-black/50 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4">
          <span
            className={`inline-block px-2 py-1 text-xs font-mono font-bold uppercase rounded mb-2 ${getCategoryColor(hotspot.category)}`}
          >
            {hotspot.category}
          </span>
          <h2 className="font-mono text-xl font-bold text-cyber-light drop-shadow-lg">{hotspot.name}</h2>
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
            className="flex items-center gap-1 text-cyber-cyan text-xs font-mono hover:underline flex-shrink-0 px-2 py-1 border border-cyber-cyan/50 rounded hover:bg-cyber-cyan/10 transition-colors"
          >
            <Navigation className="w-3 h-3" />
            Navigate
          </button>
        </div>

        {/* Description */}
        <div className="bg-cyber-black/50 p-3 border-l-2 border-cyber-cyan rounded-r">
          <p className="text-cyber-light/90 text-sm leading-relaxed">
            {hotspot.description ||
              "Discover this awesome spot in Vasai-Virar! Check in to let others know you're here."}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between py-3 border-y border-cyber-gray/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cyber-cyan/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-cyber-cyan" />
            </div>
            <div>
              <span className="font-mono text-cyber-light text-lg">{activeCheckins}</span>
              <span className="text-cyber-gray text-xs ml-1">here now</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={averageRating} size="sm" />
            <span className="font-mono text-cyber-light">{averageRating > 0 ? averageRating.toFixed(1) : "-"}</span>
          </div>
        </div>

        {/* Check-in section - PROMINENT */}
        <div className="space-y-3 p-3 bg-cyber-black/30 rounded-lg border border-cyber-gray/30">
          {/* Current status indicator */}
          {isCheckedIn && (
            <div className="flex items-center gap-2 p-2 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded">
              <span className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" />
              <span className="text-cyber-cyan text-sm font-mono">You are currently here</span>
            </div>
          )}

          <CyberButton
            variant={isCheckedIn ? "pink" : "cyan"}
            size="lg"
            className={`w-full text-lg py-5 font-bold tracking-wider ${!isCheckedIn ? "animate-pulse" : ""}`}
            glowing={!isCheckedIn}
            onClick={isCheckedIn ? onCheckOut : onCheckIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                PROCESSING...
              </span>
            ) : isCheckedIn ? (
              <span className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                CHECK OUT
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                CHECK IN HERE
              </span>
            )}
          </CyberButton>

          {!isCheckedIn && (
            <p className="text-center text-cyber-gray text-xs font-mono">Let others know you&apos;re at this spot!</p>
          )}
        </div>

        {/* Rate this spot */}
        <div className="space-y-2 pt-2 border-t border-cyber-gray/50">
          <div className="flex items-center justify-between">
            <p className="text-cyber-gray text-sm font-mono">RATE THIS SPOT</p>
            {userRating && <span className="text-cyber-cyan text-xs font-mono">Your rating: {userRating}/5</span>}
          </div>
          <div className="flex items-center gap-3">
            <StarRating
              rating={pendingRating ?? userRating ?? 0}
              size="lg"
              interactive={!isRating}
              onRatingChange={handleRating}
            />
            {isRating && <span className="text-cyber-cyan text-xs font-mono animate-pulse">Saving...</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
