"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onRatingChange?: (rating: number) => void
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  return (
    <div className="flex gap-1">
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < Math.floor(rating)
        const partial = i === Math.floor(rating) && rating % 1 !== 0

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(i + 1)}
            className={cn(
              "transition-transform",
              interactive && "hover:scale-110 cursor-pointer",
              !interactive && "cursor-default",
            )}
          >
            <Star
              className={cn(
                sizes[size],
                filled || partial ? "fill-cyber-yellow text-cyber-yellow" : "fill-transparent text-cyber-gray",
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
