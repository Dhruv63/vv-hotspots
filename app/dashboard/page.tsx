import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "./dashboard-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

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
  const { data: hotspots, error: hotspotsError } = await supabase.from("hotspots").select("*").order("name")

  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  const { data: activeCheckIns, error: checkinsError } = await supabase
    .from("check_ins")
    .select("hotspot_id, user_id")
    .eq("is_active", true)
    .gte("checked_in_at", fourHoursAgo)

  // Count active check-ins per hotspot
  const activeCheckinCounts: Record<string, number> = {}
  activeCheckIns?.forEach((checkin) => {
    activeCheckinCounts[checkin.hotspot_id] = (activeCheckinCounts[checkin.hotspot_id] || 0) + 1
  })

  // Fetch average ratings
  const { data: ratings, error: ratingsError } = await supabase.from("ratings").select("hotspot_id, rating")

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
    averageRatings[id] = Math.round((data.sum / data.count) * 10) / 10
  })

  const { data: recentCheckIns } = await supabase
    .from("check_ins")
    .select("id, user_id, hotspot_id, checked_in_at")
    .eq("is_active", true)
    .order("checked_in_at", { ascending: false })
    .limit(50)

  // Build activity feed by fetching profiles and hotspots data separately
  let activityFeed: Array<{
    id: string
    user_id: string
    hotspot_id: string
    checked_in_at: string
    username: string | null
    avatar_url: string | null
    hotspot_name: string
    hotspot_category: string
  }> = []

  if (recentCheckIns && recentCheckIns.length > 0) {
    const userIds = [...new Set(recentCheckIns.map((c) => c.user_id))]
    const hotspotIds = [...new Set(recentCheckIns.map((c) => c.hotspot_id))]

    const { data: profiles } = await supabase.from("profiles").select("id, username, avatar_url").in("id", userIds)
    const { data: hotspotData } = await supabase.from("hotspots").select("id, name, category").in("id", hotspotIds)

    const profileMap: Record<string, { username: string | null; avatar_url: string | null }> = {}
    profiles?.forEach((p) => {
      profileMap[p.id] = { username: p.username, avatar_url: p.avatar_url }
    })

    const hotspotMap: Record<string, { name: string; category: string }> = {}
    hotspotData?.forEach((h) => {
      hotspotMap[h.id] = { name: h.name, category: h.category }
    })

    activityFeed = recentCheckIns.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      hotspot_id: item.hotspot_id,
      checked_in_at: item.checked_in_at,
      username: profileMap[item.user_id]?.username || null,
      avatar_url: profileMap[item.user_id]?.avatar_url || null,
      hotspot_name: hotspotMap[item.hotspot_id]?.name || "Unknown Hotspot",
      hotspot_category: hotspotMap[item.hotspot_id]?.category || "other",
    }))
  }

  const { data: userCheckin } = await supabase
    .from("check_ins")
    .select("hotspot_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .gte("checked_in_at", fourHoursAgo)
    .order("checked_in_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: userRatings } = await supabase
    .from("ratings")
    .select("hotspot_id, rating, review")
    .eq("user_id", user.id)

  const userRatingsMap: Record<string, number> = {}
  const userReviewsMap: Record<string, string> = {}
  userRatings?.forEach((r) => {
    userRatingsMap[r.hotspot_id] = r.rating
    if (r.review) {
      userReviewsMap[r.hotspot_id] = r.review
    }
  })

  const errors = [hotspotsError, checkinsError, ratingsError].filter(Boolean)
  const initError = errors.length > 0 ? "Failed to load some data. Please refresh the page." : null

  return (
    <DashboardClient
      user={user}
      hotspots={hotspots || []}
      activeCheckins={activeCheckinCounts}
      averageRatings={averageRatings}
      activityFeed={activityFeed}
      userCurrentCheckin={userCheckin?.hotspot_id || null}
      userRatings={userRatingsMap}
      userReviews={userReviewsMap}
      initError={initError}
    />
  )
}
