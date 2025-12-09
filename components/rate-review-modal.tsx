"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Hotspot } from "@/lib/types"
import { Loader2, MessageSquare } from "lucide-react"
import { StarRating } from "@/components/ui/star-rating"
import { toast } from "sonner"

interface RateReviewModalProps {
  isOpen: boolean
  onClose: () => void
  hotspot: Hotspot | null
  initialRating?: number
  initialReview?: string
  onRate: (hotspot: Hotspot, rating: number, review: string) => Promise<void>
}

const ratingTexts: Record<number, string> = {
  1: "Bad",
  2: "Poor",
  3: "Average",
  4: "Good",
  5: "Great"
}

export function RateReviewModal({ isOpen, onClose, hotspot, initialRating = 0, initialReview = "", onRate }: RateReviewModalProps) {
  const [rating, setRating] = useState(initialRating)
  const [review, setReview] = useState(initialReview || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync state when reopening or changing hotspot
  useEffect(() => {
    if (isOpen) {
        setRating(initialRating)
        setReview(initialReview || "")
        setError(null)
    }
  }, [isOpen, initialRating, initialReview])

  if (!hotspot) return null

  const handleSubmit = async () => {
    if (rating === 0) {
        setError("Please select a rating")
        return
    }

    setIsLoading(true)
    setError(null)
    try {
      await onRate(hotspot, rating, review)
      toast.success("Review submitted!")
      onClose()
    } catch (error) {
       // handled by parent, but we can set error here if passed
       toast.error("Failed to submit review")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate & Review">
      <div className="p-6 space-y-6 flex flex-col items-center">

        {/* Hotspot Name */}
        <h2 className="text-xl font-bold text-white font-mono text-center">{hotspot.name}</h2>

        {/* Stars */}
        <div className="flex flex-col items-center gap-2">
            <StarRating
                rating={rating}
                size="lg"
                interactive={!isLoading}
                onRatingChange={(r) => {
                    setRating(r)
                    setError(null)
                }}
            />
            <div className="h-6 flex items-center justify-center">
                {rating > 0 && (
                    <span className="text-[#E8FF00] font-mono text-lg font-bold animate-in fade-in slide-in-from-bottom-2">
                        {rating}/5 - {ratingTexts[rating]}
                    </span>
                )}
            </div>
        </div>

        {/* Review Input */}
        <div className="w-full space-y-2">
            <label className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-3 h-3" />
                Review (Optional)
            </label>
            <div className="relative">
                <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    maxLength={500}
                    placeholder="Tell us about your experience..."
                    className="w-full bg-[#0A0E27] border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#E8FF00] focus:ring-1 focus:ring-[#E8FF00] transition-all resize-none h-32 text-sm"
                    disabled={isLoading}
                />
                <span className="absolute bottom-2 right-2 text-[10px] text-gray-500 font-mono">
                    {review.length}/500
                </span>
            </div>
            {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full pt-2">
            <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-lg border border-gray-600 text-gray-300 font-mono text-sm hover:bg-gray-800 transition-colors"
                disabled={isLoading}
            >
                Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={isLoading || rating === 0}
                className="flex-1 py-3 px-4 rounded-lg bg-[#E8FF00] text-black font-mono font-bold text-sm hover:bg-[#D4E600] transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(232,255,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    "SUBMIT"
                )}
            </button>
        </div>

      </div>
    </Modal>
  )
}
