"use server"

import { createClient } from "@/lib/supabase/server"

export async function getCrowdHistory(hotspotId: string, daysBack: number = 30) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("get_crowd_history", {
    p_hotspot_id: hotspotId,
    p_days_back: daysBack,
  })

  if (error) {
    console.error("Error fetching crowd history:", error)
    return []
  }

  return data
}

export async function getTrendingHotspots(limit: number = 5) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("get_trending_hotspots", {
    p_limit: limit,
  })

  if (error) {
    console.error("Error fetching trending hotspots:", error)
    return []
  }

  // We need to fetch the actual hotspot details for these IDs
  if (!data || data.length === 0) return []

  const hotspotIds = data.map((item: any) => item.hotspot_id)

  const { data: hotspots, error: hotspotsError } = await supabase
    .from("hotspots")
    .select("*")
    .in("id", hotspotIds)

  if (hotspotsError) {
    console.error("Error fetching trending hotspot details:", hotspotsError)
    return []
  }

  // Map the count back to the hotspot object
  return hotspots.map((h) => {
    const trend = data.find((t: any) => t.hotspot_id === h.id)
    return {
      ...h,
      recent_checkins: trend ? trend.recent_checkins : 0
    }
  }).sort((a, b) => b.recent_checkins - a.recent_checkins)
}

export async function getActiveCheckinsForHotspot(hotspotId: string) {
    const supabase = await createClient()

    // Get active checkins with user profiles
    const { data, error } = await supabase
        .from("check_ins")
        .select(`
            id,
            checked_in_at,
            user:user_id (
                id,
                username,
                avatar_url
            )
        `)
        .eq("hotspot_id", hotspotId)
        .eq("is_active", true)
        .order("checked_in_at", { ascending: false })

    if (error) {
        console.error("Error fetching active checkins:", error)
        return []
    }

    return data
}
