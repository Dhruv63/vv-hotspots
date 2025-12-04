"use client"

import Image from "next/image"
import { MapPin, Users, Star } from "lucide-react"
import { StarRating } from "@/components/ui/star-rating"
import type { Hotspot } from "@/lib/types"

interface HotspotCardProps {
  hotspot: Hotspot
  activeCheckins?: number
  averageRating?: number
  onClick?: () => void
  isSelected?: boolean
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

export function HotspotCard({
  hotspot,
  activeCheckins = 0,
  averageRating = 0,
  onClick,
  isSelected = false,
}: HotspotCardProps) {
  const imageUrl = getHotspotImage(hotspot)

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 bg-cyber-dark border min-h-[120px] active:scale-[0.98] ${
        isSelected
          ? "border-cyber-cyan shadow-[0_0_20px_rgba(0,255,255,0.3)]"
          : "border-cyber-gray hover:border-cyber-cyan/50"
      }`}
    >
      {/* Image section */}
      <div className="relative h-28 md:h-32 w-full">
        <Image src={imageUrl || "/placeholder.svg"} alt={hotspot.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-black to-transparent" />

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-2.5 py-1 text-xs font-mono font-bold uppercase rounded ${getCategoryColor(hotspot.category)}`}
          >
            {hotspot.category}
          </span>
        </div>

        {/* Active users badge */}
        {activeCheckins > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 bg-cyber-black/80 border border-cyber-cyan text-cyber-cyan text-xs font-mono rounded">
            <Users className="w-3 h-3" />
            <span>{activeCheckins}</span>
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-3">
        <h3 className="font-mono text-base font-bold text-cyber-light mb-1 truncate">{hotspot.name}</h3>

        <div className="flex items-center gap-1 text-cyber-gray text-xs mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{hotspot.address}</span>
        </div>

        {/* Rating display */}
        <div className="flex items-center gap-2">
          {averageRating > 0 ? (
            <>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-mono font-bold">{averageRating.toFixed(1)}</span>
              <StarRating rating={averageRating} size="sm" />
            </>
          ) : (
            <span className="text-cyber-gray text-xs font-mono">No ratings yet</span>
          )}
        </div>
      </div>

      {/* Tap indicator for mobile */}
      <div className="absolute bottom-2 right-2 px-2 py-1 bg-cyber-cyan/20 border border-cyber-cyan/50 rounded text-cyber-cyan text-xs font-mono">
        Tap for details
      </div>
    </div>
  )
}
