"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  showLabel?: boolean
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  showLabel = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-10 h-10",
  }

  const touchTargets = {
    sm: "min-w-[32px] min-h-[32px]",
    md: "min-w-[40px] min-h-[40px]",
    lg: "min-w-[48px] min-h-[48px]",
  }

  const displayRating = hoverRating ?? rating

  const handleStarClick = (starValue: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5" onMouseLeave={() => interactive && setHoverRating(null)}>
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1
          const filled = starValue <= Math.floor(displayRating)
          const partial = starValue === Math.ceil(displayRating) && displayRating % 1 !== 0

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleStarClick(starValue)
              }}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              className={cn(
                "transition-all duration-150 relative flex items-center justify-center",
                touchTargets[size],
                interactive && "hover:scale-110 cursor-pointer active:scale-95 hover:bg-[#FFFF00]/10 rounded-lg",
                !interactive && "cursor-default",
              )}
            >
              <Star
                className={cn(
                  sizes[size],
                  "transition-colors duration-150",
                  filled || partial
                    ? "fill-[#FFFF00] text-[#FFFF00] drop-shadow-[0_0_8px_rgba(255,255,0,0.9)]"
                    : interactive && hoverRating && starValue <= hoverRating
                      ? "fill-[#FFFF00]/70 text-[#FFFF00]"
                      : "fill-transparent text-cyber-gray/60 hover:text-[#FFFF00]/50",
                )}
              />
            </button>
          )
        })}
      </div>
      {showLabel && displayRating > 0 && (
        <span className="font-mono text-sm text-cyber-light">{displayRating.toFixed(1)}</span>
      )}
    </div>
  )
}
