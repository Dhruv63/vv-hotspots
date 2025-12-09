"use server"

import { createClient } from "@/lib/supabase/server"

export async function getHotspotReviews(hotspotId: string, limit = 5) {
  const supabase = await createClient()

  // Fetch reviews with text
  const { data: reviews, error: reviewsError } = await supabase
    .from('ratings')
    .select(`
      id,
      rating,
      review,
      created_at,
      profiles (
        username,
        avatar_url
      )
    `)
    .eq('hotspot_id', hotspotId)
    .not('review', 'is', null)
    .neq('review', '')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (reviewsError) throw new Error(reviewsError.message)

  // Fetch all ratings to calculate distribution
  const { data: allRatings, error: ratingsError } = await supabase
    .from('ratings')
    .select('rating')
    .eq('hotspot_id', hotspotId)

  if (ratingsError) throw new Error(ratingsError.message)

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

  allRatings?.forEach(r => {
    // Round just in case, though schema says integer
    const rating = Math.round(r.rating)
    if (rating >= 1 && rating <= 5) {
      distribution[rating] = (distribution[rating] || 0) + 1
    }
  })

  return {
    reviews,
    distribution,
    totalRatings: allRatings?.length || 0
  }
}
