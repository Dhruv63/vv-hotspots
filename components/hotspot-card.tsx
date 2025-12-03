"use client"

import Image from "next/image"
import { MapPin, Users } from "lucide-react"
import { CyberCard } from "@/components/ui/cyber-card"
import { CategoryBadge } from "@/components/ui/category-badge"
import { StarRating } from "@/components/ui/star-rating"
import type { Hotspot } from "@/lib/types"

interface HotspotCardProps {
  hotspot: Hotspot
  activeCheckins?: number
  averageRating?: number
  onClick?: () => void
  isSelected?: boolean
}

export function HotspotCard({
  hotspot,
  activeCheckins = 0,
  averageRating = 0,
  onClick,
  isSelected = false,
}: HotspotCardProps) {
  return (
    <CyberCard
      className={`overflow-hidden cursor-pointer transition-all duration-300 hover:border-cyber-cyan ${
        isSelected ? "border-cyber-cyan neon-border-cyan" : ""
      }`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-32 bg-cyber-dark">
        <Image
          src={hotspot.image_url || "/placeholder.svg?height=128&width=256"}
          alt={hotspot.name}
          fill
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-black/80 to-transparent" />
        <div className="absolute top-2 left-2">
          <CategoryBadge category={hotspot.category} />
        </div>
        {activeCheckins > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan text-xs font-mono rounded">
            <Users className="w-3 h-3" />
            {activeCheckins} here
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-mono text-lg font-semibold text-cyber-light mb-1 truncate">{hotspot.name}</h3>

        <div className="flex items-center gap-1 text-cyber-gray text-sm mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{hotspot.address}</span>
        </div>

        <div className="flex items-center justify-between">
          <StarRating rating={averageRating} size="sm" />
          <span className="text-cyber-gray text-xs font-mono">
            {averageRating > 0 ? averageRating.toFixed(1) : "No ratings"}
          </span>
        </div>
      </div>
    </CyberCard>
  )
}
