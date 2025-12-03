import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch hotspots
  const { data: hotspots } = await supabase.from("hotspots").select("*").order("name")

  // Fetch active check-ins (within last 2 hours)
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  const { data: activeCheckIns } = await supabase
    .from("check_ins")
    .select("hotspot_id")
    .eq("is_active", true)
    .gte("checked_in_at", twoHoursAgo)

  // Count active check-ins per hotspot
  const activeCheckinCounts: Record<string, number> = {}
  activeCheckIns?.forEach((checkin) => {
    activeCheckinCounts[checkin.hotspot_id] = (activeCheckinCounts[checkin.hotspot_id] || 0) + 1
  })

  // Fetch average ratings
  const { data: ratings } = await supabase.from("ratings").select("hotspot_id, rating")

  // Calculate average ratings per hotspot
  const ratingTotals: Record<string, { sum: number; count: number }> = {}
  ratings?.forEach((rating) => {
    if (!ratingTotals[rating.hotspot_id]) {
      ratingTotals[rating.hotspot_id] = { sum: 0, count: 0 }
    }
    ratingTotals[rating.hotspot_id].sum += rating.rating
    ratingTotals[rating.hotspot_id].count += 1
  })

  const averageRatings: Record<string, number> = {}
  Object.entries(ratingTotals).forEach(([id, data]) => {
    averageRatings[id] = data.sum / data.count
  })

  const { data: recentCheckIns } = await supabase
    .from("check_ins")
    .select("id, user_id, hotspot_id, checked_in_at")
    .order("checked_in_at", { ascending: false })
    .limit(20)

  // Build activity feed by fetching profiles and hotspots data separately
  let activityFeed: Array<{
    id: string
    user_id: string
    hotspot_id: string
    checked_in_at: string
    username: string | null
    avatar_url: string | null
    hotspot_name: string | null
    hotspot_category: string | null
  }> = []

  if (recentCheckIns && recentCheckIns.length > 0) {
    // Get unique user IDs and hotspot IDs
    const userIds = [...new Set(recentCheckIns.map((c) => c.user_id))]
    const hotspotIds = [...new Set(recentCheckIns.map((c) => c.hotspot_id))]

    // Fetch profiles for these users
    const { data: profiles } = await supabase.from("profiles").select("id, username, avatar_url").in("id", userIds)

    // Fetch hotspots for these check-ins
    const { data: hotspotData } = await supabase.from("hotspots").select("id, name, category").in("id", hotspotIds)

    // Create lookup maps
    const profileMap: Record<string, { username: string | null; avatar_url: string | null }> = {}
    profiles?.forEach((p) => {
      profileMap[p.id] = { username: p.username, avatar_url: p.avatar_url }
    })

    const hotspotMap: Record<string, { name: string; category: string }> = {}
    hotspotData?.forEach((h) => {
      hotspotMap[h.id] = { name: h.name, category: h.category }
    })

    // Merge data
    activityFeed = recentCheckIns.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      hotspot_id: item.hotspot_id,
      checked_in_at: item.checked_in_at,
      username: profileMap[item.user_id]?.username || null,
      avatar_url: profileMap[item.user_id]?.avatar_url || null,
      hotspot_name: hotspotMap[item.hotspot_id]?.name || null,
      hotspot_category: hotspotMap[item.hotspot_id]?.category || null,
    }))
  }

  // Get user's current check-in
  const { data: userCheckin } = await supabase
    .from("check_ins")
    .select("hotspot_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .gte("checked_in_at", twoHoursAgo)
    .maybeSingle()

  // Get user's ratings
  const { data: userRatings } = await supabase.from("ratings").select("hotspot_id, rating").eq("user_id", user.id)

  const userRatingsMap: Record<string, number> = {}
  userRatings?.forEach((r) => {
    userRatingsMap[r.hotspot_id] = r.rating
  })

  return (
    <DashboardClient
      user={user}
      hotspots={hotspots || []}
      activeCheckins={activeCheckinCounts}
      averageRatings={averageRatings}
      activityFeed={activityFeed}
      userCurrentCheckin={userCheckin?.hotspot_id || null}
      userRatings={userRatingsMap}
    />
  )
}
