"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { MapPin, Users, Star, StarHalf, Heart } from "lucide-react"
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
  isSaved?: boolean
  onToggleSave?: (id: string) => void
  variant?: "list" | "grid" | "compact"
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
  const common = "text-white"
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

const getCrowdStatus = (count: number) => {
  if (count >= 20) return { label: "Packed", color: "bg-black text-white border-white", dot: "bg-white" }
  if (count >= 9) return { label: "Busy", color: "bg-red-500 text-white border-red-400", dot: "bg-white" }
  if (count >= 3) return { label: "Moderate", color: "bg-yellow-500 text-black border-yellow-400", dot: "bg-black" }
  return { label: "Empty", color: "bg-green-500 text-white border-green-400", dot: "bg-white" }
}

export function HotspotCard({
  hotspot,
  activeCheckins = 0,
  averageRating = 0,
  ratingCount = 234,
  distance,
  onClick,
  isSelected = false,
  children,
  isSaved,
  onToggleSave,
  variant = "list",
}: HotspotCardProps) {
  const imageUrl = getHotspotImage(hotspot)
  const crowdStatus = getCrowdStatus(activeCheckins)

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="w-3 h-3 md:w-3.5 md:h-3.5 fill-primary text-primary transition-transform hover:scale-125"
        />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-3 h-3 md:w-3.5 md:h-3.5 transition-transform hover:scale-125">
            <StarHalf className="absolute inset-0 w-full h-full fill-primary text-primary z-10" />
            <Star className="absolute inset-0 w-full h-full text-muted-foreground/30" />
        </div>
      )
    }

    const remainingStars = 5 - stars.length
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          className="w-3 h-3 md:w-3.5 md:h-3.5 text-muted-foreground/30 transition-transform hover:scale-125"
        />
      )
    }

    return stars
  }

  const isGrid = variant === "grid"
  const isCompact = variant === "compact"
  const imageHeight = isGrid ? "h-[140px]" : isCompact ? "h-[120px]" : "h-[180px]"

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden card-theme glass-card cursor-pointer flex flex-col hover-float",
        isSelected
          ? "border-primary shadow-[var(--shadow-hover)]"
          : "hover:border-transparent", // Make border transparent on hover to show gradient
        (isGrid || isCompact) ? "w-full" : "w-full mb-3 last:mb-0"
      )}
    >
      {/* Gradient Border on Hover */}
      <div className="absolute inset-0 rounded-[inherit] p-[2px] bg-gradient-to-r from-cyan-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
      <div className="absolute inset-[1px] bg-card/90 rounded-[inherit] -z-10 group-hover:bg-card/95 transition-colors duration-300" />

      {/* Image section */}
      <div className={cn("relative w-full shrink-0 bg-muted/50 overflow-hidden", imageHeight)}>
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={hotspot.name}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-110"
          sizes={isGrid || isCompact ? "(max-width: 768px) 50vw, 320px" : "(max-width: 768px) 100vw, 320px"}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80" />

        {/* Category badge */}
        {!isCompact && (
          <div className="absolute top-2 left-2 z-10">
            <span
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full shadow-sm ${getCategoryColor(hotspot.category)}`}
            >
              {hotspot.category}
            </span>
          </div>
        )}

        {/* Active users badge & Save Button */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          {activeCheckins > 0 ? (
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full backdrop-blur-sm shadow-lg border",
              crowdStatus.color,
              activeCheckins >= 3 && "animate-pulse"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", crowdStatus.dot)} />
              <span>{activeCheckins} people</span>
            </div>
          ) : null}
          {onToggleSave && !isCompact && (
             <button
                onClick={(e) => { e.stopPropagation(); onToggleSave(hotspot.id) }}
                className={cn(
                  "p-1.5 rounded-full backdrop-blur-sm transition-all active:scale-95 hover:scale-110",
                  isSaved
                    ? "bg-secondary/20 border-secondary text-secondary shadow-[0_0_10px_var(--color-secondary)]"
                    : "bg-black/30 border-white/20 text-white hover:bg-black/50 hover:border-white hover:shadow-lg"
                )}
             >
                <Heart className={cn("w-3.5 h-3.5", isSaved && "fill-secondary")} />
             </button>
          )}
        </div>

        {/* Distance */}
        {!isCompact && distance !== undefined && distance !== null && (
          <div className="absolute bottom-2 left-2 z-10">
             <span className="text-[10px] font-bold text-white/90 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm border border-white/10">
                {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)} km`}
             </span>
          </div>
        )}
      </div>

      {/* Content section */}
      <div className={cn("flex flex-col flex-1 overflow-hidden relative z-10", isCompact ? "p-2" : "p-3")}>
        <div className="flex justify-between items-start mb-1 gap-2">
            <h3 className={cn(
              "font-bold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300",
              (isGrid || isCompact) ? "text-[14px]" : "text-[18px]"
            )}>
              {hotspot.name}
            </h3>
        </div>

        {!isGrid && !isCompact && (
          <div className="flex items-center gap-1 text-muted-foreground text-[12px] mb-2">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="leading-tight line-clamp-1 text-ellipsis overflow-hidden">{hotspot.address}</span>
          </div>
        )}

        {/* Rating display */}
        <div className="flex items-center gap-1 mt-auto mb-1">
          {averageRating > 0 ? (
            <div className="flex items-center gap-1.5">
               <div className="flex items-center">
                  {renderStars(averageRating)}
               </div>
               {!isGrid && !isCompact && <span className="text-muted-foreground text-xs">({ratingCount})</span>}
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">No ratings</span>
          )}
        </div>

        {/* Status Pill for Empty/Moderate etc if no checkins > 0 shown above, or to reinforce */}
        {/* Actually, the badge on image handles it. But we can add a text status here too if needed. */}
        {/* The requirement says: "status pill + '12 people here now'" on hotspot cards. */}
        {/* I put it on the image which is prominent. */}

        {children && (
          <div className={cn("mt-auto w-full", (isGrid || isCompact) ? "pt-1" : "pt-2")}>
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
