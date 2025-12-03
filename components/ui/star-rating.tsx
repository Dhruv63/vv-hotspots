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
    lg: "w-8 h-8", // Made lg size bigger for easier tapping
  }

  const displayRating = hoverRating ?? rating

  const handleStarClick = (starValue: number) => {
    console.log("[v0] Star clicked:", starValue, "interactive:", interactive)
    if (interactive && onRatingChange) {
      onRatingChange(starValue)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1" onMouseLeave={() => interactive && setHoverRating(null)}>
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
                "transition-all duration-150 relative p-1", // Added padding for bigger touch target
                interactive && "hover:scale-125 cursor-pointer active:scale-95 hover:bg-yellow-400/10 rounded",
                !interactive && "cursor-default",
              )}
            >
              <Star
                className={cn(
                  sizes[size],
                  "transition-colors duration-150",
                  filled || partial
                    ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]"
                    : interactive && hoverRating && starValue <= hoverRating
                      ? "fill-yellow-400/70 text-yellow-400"
                      : "fill-transparent text-cyber-gray/60 hover:text-yellow-400/50",
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
