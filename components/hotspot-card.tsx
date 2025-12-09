"use client"

import { ReactNode } from "react"
import Image from "next/image"
import { MapPin, Users, Star, StarHalf } from "lucide-react"
import type { Hotspot } from "@/lib/types"

interface HotspotCardProps {
  hotspot: Hotspot
  activeCheckins?: number
  averageRating?: number
  ratingCount?: number
  distance?: number | null
  onClick?: () => void
  isSelected?: boolean
  children?: ReactNode
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
  const common = "text-white dark:text-black"
  switch (category) {
    case "cafe":
      return `bg-cat-cafe border-cat-cafe shadow-[0_0_10px_var(--color-cat-cafe)] ${common}`
    case "park":
      return `bg-cat-park border-cat-park shadow-[0_0_10px_var(--color-cat-park)] ${common}`
    case "gaming":
      return `bg-cat-gaming border-cat-gaming shadow-[0_0_10px_var(--color-cat-gaming)] ${common}`
    case "food":
      return `bg-cat-food border-cat-food shadow-[0_0_10px_var(--color-cat-food)] ${common}`
    case "hangout":
      return `bg-cat-hangout border-cat-hangout shadow-[0_0_10px_var(--color-cat-hangout)] ${common}`
    case "other":
    default:
      return `bg-cat-other border-cat-other shadow-[0_0_10px_var(--color-cat-other)] ${common}`
  }
}

export function HotspotCard({
  hotspot,
  activeCheckins = 0,
  averageRating = 0,
  ratingCount = 234, // Default mock value for visual polish
  distance,
  onClick,
  isSelected = false,
  children,
}: HotspotCardProps) {
  const imageUrl = getHotspotImage(hotspot)

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="w-3.5 h-3.5 fill-cyber-primary text-cyber-primary"
        />
      )
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-3.5 h-3.5">
            <StarHalf className="absolute inset-0 w-3.5 h-3.5 fill-cyber-primary text-cyber-primary z-10" />
            <Star className="absolute inset-0 w-3.5 h-3.5 text-cyber-gray/30" />
        </div>
      )
    }

    // Empty stars
    const remainingStars = 5 - stars.length
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          className="w-3.5 h-3.5 text-cyber-gray/30"
        />
      )
    }

    return stars
  }

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-200 ease-out bg-cyber-navy border flex flex-col h-full active:scale-[0.98] hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(232,255,0,0.15)] ${
        isSelected
          ? "border-cyber-primary shadow-[0_0_20px_var(--color-cyber-primary)]"
          : "border-white/10 hover:border-cyber-primary/50"
      }`}
      style={{ width: "100%" }}
    >
      {/* Image section - Increased height to 150px */}
      <div className="relative h-[150px] w-full shrink-0 bg-cyber-dark/50 overflow-hidden">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={hotspot.name}
          fill
          className="object-cover transition-all duration-200 group-hover:brightness-105"
          sizes="(max-width: 768px) 100vw, 320px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-black/80 to-transparent" />

        {/* Category badge */}
        <div className="absolute top-2 left-2 z-10">
          <span
            className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${getCategoryColor(hotspot.category)}`}
          >
            {hotspot.category}
          </span>
        </div>

        {/* Active users badge */}
        {activeCheckins > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-cyber-black/80 border border-cyber-cyan text-cyber-cyan text-[10px] font-mono rounded z-10">
            <Users className="w-3 h-3" />
            <span>{activeCheckins}</span>
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-3 flex flex-col flex-1 overflow-hidden">
        <div className="flex justify-between items-start mb-1 gap-2">
            <h3 className="font-mono text-[16px] font-bold text-cyber-light leading-tight line-clamp-2 text-ellipsis">
            {hotspot.name}
            </h3>
            {distance !== undefined && distance !== null && (
                <span className="text-[10px] font-mono font-bold text-cyber-primary whitespace-nowrap bg-cyber-primary/10 px-1.5 py-0.5 rounded border border-cyber-primary/20">
                    {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)} km`}
                </span>
            )}
        </div>

        <div className="flex items-center gap-1 text-cyber-gray text-[12px] mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="leading-tight line-clamp-1 text-ellipsis overflow-hidden">{hotspot.address}</span>
        </div>

        {/* Rating display */}
        <div className="flex items-center gap-1 mt-auto text-[14px] mb-3">
          {averageRating > 0 ? (
            <div className="flex items-center gap-1.5">
               <div className="flex items-center">
                  {renderStars(averageRating)}
               </div>
               <span className="text-cyber-gray text-xs font-mono">({ratingCount} ratings)</span>
            </div>
          ) : (
            <span className="text-cyber-gray text-xs font-mono">No ratings yet</span>
          )}
        </div>

        {/* Buttons (Children) - Ensure full width and spacing handled by parent or flex here if needed */}
        {children && <div className="mt-auto w-full">{children}</div>}
      </div>
    </div>
  )
}
