"use server"

import { createClient } from "@/lib/supabase/server"

export async function getHotspotReviews(hotspotId: string, limit = 5) {
  const supabase = await createClient()

  // 1. Fetch paged ratings (ALL ratings, not just those with text)
  // We fetch user_id manually to join with profiles later, avoiding FK issues
  const { data: pagedRatings, error: listError } = await supabase
    .from('ratings')
    .select('id, rating, review, created_at, user_id')
    .eq('hotspot_id', hotspotId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (listError) throw new Error(listError.message)

  // 2. Fetch profiles for these ratings
  const userIds = Array.from(new Set(pagedRatings?.map(r => r.user_id) || []))

  let profilesMap: Record<string, any> = {}
  if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds)

      if (profilesError) {
          console.error("Error fetching profiles:", profilesError)
      } else {
          profiles?.forEach(p => {
              profilesMap[p.id] = p
          })
      }
  }

  // 3. Merge ratings with profiles
  const reviews = pagedRatings?.map(r => ({
      ...r,
      profiles: profilesMap[r.user_id] || { username: 'Anonymous', avatar_url: null }
  })) || []

  // 4. Fetch all ratings to calculate distribution
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
