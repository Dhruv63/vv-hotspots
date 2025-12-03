"use client"

import Image from "next/image"
import { MapPin, Users, ChevronRight } from "lucide-react"
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
  // Location-specific images for real Vasai-Virar hotspots
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

  // Check if we have a specific image for this location
  if (locationImages[hotspot.name]) {
    return locationImages[hotspot.name]
  }

  // Fall back to category-based images
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
      className={`relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 group ${
        isSelected
          ? "ring-2 ring-cyber-cyan shadow-[0_0_20px_rgba(0,255,255,0.3)]"
          : "hover:ring-1 hover:ring-cyber-cyan/50"
      }`}
    >
      {/* Background image */}
      <div className="relative h-44 w-full">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={hotspot.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-cyber-black/60 to-transparent" />

        {/* Category badge - top left */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`px-2 py-1 text-xs font-mono font-bold uppercase rounded ${getCategoryColor(hotspot.category)}`}
          >
            {hotspot.category}
          </span>
        </div>

        {/* Active users badge - top right */}
        {activeCheckins > 0 && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 bg-cyber-black/70 border border-cyber-cyan text-cyber-cyan text-xs font-mono rounded backdrop-blur-sm">
            <Users className="w-3 h-3" />
            <span>{activeCheckins} here</span>
          </div>
        )}

        {/* Content overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="font-mono text-lg font-bold text-cyber-light mb-1 truncate drop-shadow-lg">{hotspot.name}</h3>

          <div className="flex items-center gap-1 text-cyber-gray/90 text-sm mb-2">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{hotspot.address}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StarRating rating={averageRating} size="sm" />
              <span className="text-cyber-gray text-xs font-mono">
                {averageRating > 0 ? averageRating.toFixed(1) : "No ratings"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-cyber-cyan text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
              <span>TAP TO CHECK IN</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
