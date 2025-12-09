"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Star, MessageSquare, User, Loader2 } from "lucide-react"
import Image from "next/image"
import { getHotspotReviews } from "@/app/actions/reviews"
import { StarRating } from "@/components/ui/star-rating"

interface ReviewsTabProps {
  hotspotId: string
  onWriteReview: () => void
  currentUserReview?: string | null
}

export function ReviewsTab({ hotspotId, onWriteReview, currentUserReview }: ReviewsTabProps) {
  const [reviews, setReviews] = useState<any[]>([])
  const [distribution, setDistribution] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })
  const [totalRatings, setTotalRatings] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [limit, setLimit] = useState(5)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [hotspotId, limit])

  const loadReviews = async () => {
    setIsLoading(true)
    try {
      const data = await getHotspotReviews(hotspotId, limit)
      setReviews(data.reviews || [])
      setDistribution(data.distribution)
      setTotalRatings(data.totalRatings)
      // If we received exactly 'limit' reviews, assume there might be more
      setHasMore((data.reviews?.length || 0) >= limit)
    } catch (error) {
      console.error("Failed to load reviews:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadMore = () => {
    setLimit(prev => prev + 5)
  }

  // Calculate percentages
  const getPercent = (count: number) => {
    if (totalRatings === 0) return 0
    return (count / totalRatings) * 100
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

      {/* Rating Breakdown & Header */}
      <div className="bg-cyber-black/30 p-4 rounded-lg border border-cyber-gray/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
           <div>
             <h3 className="text-cyber-light font-mono font-bold text-lg flex items-center gap-2">
               <Star className="w-5 h-5 text-[#FFFF00] fill-[#FFFF00]" />
               RATINGS & REVIEWS
             </h3>
             <p className="text-cyber-gray text-xs font-mono mt-1">{totalRatings} total ratings</p>
           </div>

           <button
             onClick={onWriteReview}
             className="px-4 py-2 bg-[#FFFF00] text-black font-mono font-bold text-sm rounded hover:bg-[#E6E600] shadow-[0_0_15px_rgba(255,255,0,0.4)] transition-all active:scale-95 flex items-center gap-2"
           >
             <MessageSquare className="w-4 h-4" />
             {currentUserReview ? "EDIT YOUR REVIEW" : "WRITE A REVIEW"}
           </button>
        </div>

        {/* Bar Chart */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3 text-xs font-mono">
              <div className="w-8 flex justify-end text-cyber-light">{star} ★</div>
              <div className="flex-1 h-2 bg-cyber-gray/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FFFF00]"
                  style={{ width: `${getPercent(distribution[star])}%` }}
                />
              </div>
              <div className="w-8 text-cyber-gray">{distribution[star]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="bg-cyber-dark p-4 rounded-lg border border-cyber-gray/20 hover:border-cyber-cyan/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyber-gray/20 overflow-hidden relative border border-cyber-gray shrink-0">
                    {review.profiles?.avatar_url ? (
                      <Image
                        src={review.profiles.avatar_url}
                        alt={review.profiles.username || "User"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-5 h-5 text-cyber-gray" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-mono font-bold text-cyber-light text-sm">
                      {review.profiles?.username || "Anonymous"}
                    </div>
                    <div className="text-[10px] text-cyber-gray font-mono">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-cyber-black/50 px-2 py-1 rounded border border-cyber-gray/30 shrink-0">
                   <StarRating rating={review.rating} size="sm" />
                </div>
              </div>
              <p className="text-cyber-light/90 text-sm leading-relaxed pl-[52px]">
                {review.review}
              </p>
            </div>
          ))
        ) : !isLoading && (
          <div className="text-center py-12 text-cyber-gray border border-dashed border-cyber-gray/30 rounded-lg">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-mono text-sm">No reviews yet.</p>
            <p className="text-xs mt-1">Be the first to share your experience!</p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin" />
          </div>
        )}

        {hasMore && !isLoading && (
          <button
            onClick={handleLoadMore}
            className="w-full py-3 text-center font-mono text-xs text-cyber-cyan hover:text-cyber-light hover:underline transition-colors border border-dashed border-cyber-gray/30 rounded hover:border-cyber-cyan/50"
          >
            VIEW ALL REVIEWS
          </button>
        )}
      </div>
    </div>
  )
}
