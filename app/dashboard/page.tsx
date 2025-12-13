import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "./dashboard-client"
import { ErrorBoundary } from "@/components/error-boundary"
import { getFriends } from "@/app/actions/friends"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Fetch all independent data in parallel
  const [
    { data: hotspots, error: hotspotsError },
    { data: activeCheckIns, error: checkinsError },
    { data: ratings, error: ratingsError },
    { data: recentCheckIns },
    { data: userCheckin },
    { data: userRatings },
    { data: savedHotspotsData },
    { count: todayCount },
    friends
  ] = await Promise.all([
    // Hotspots
    supabase.from("hotspots").select("*").order("name"),

    // Active Check-ins (Global)
    supabase
      .from("check_ins")
      .select("hotspot_id, user_id")
      .eq("is_active", true)
      .gte("checked_in_at", fourHoursAgo),

    // Ratings (Global - for average calculation)
    supabase.from("ratings").select("hotspot_id, rating"),

    // Recent Check-ins (for Activity Feed)
    supabase
      .from("check_ins")
      .select("id, user_id, hotspot_id, checked_in_at")
      .eq("is_active", true)
      .order("checked_in_at", { ascending: false })
      .limit(50),

    // User's Current Check-in
    supabase
      .from("check_ins")
      .select("hotspot_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .gte("checked_in_at", fourHoursAgo)
      .order("checked_in_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    // User's Ratings (for map markers)
    supabase
      .from("ratings")
      .select("hotspot_id, rating, review")
      .eq("user_id", user.id),

    // User's Saved Hotspots
    supabase
      .from("saved_hotspots")
      .select("hotspot_id")
      .eq("user_id", user.id),

    // Today's Check-in Count
    supabase
      .from("check_ins")
      .select("*", { count: "exact", head: true })
      .gte("checked_in_at", todayStart.toISOString()),

    // Friends List
    getFriends(user.id)
  ])

  // Process Active Check-in Counts
  const activeCheckinCounts: Record<string, number> = {}
  activeCheckIns?.forEach((checkin) => {
    activeCheckinCounts[checkin.hotspot_id] = (activeCheckinCounts[checkin.hotspot_id] || 0) + 1
  })

  // Process Average Ratings
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

  // Dependent Fetches: Activity Feed Details & Friend Visits
  let activityFeedPromise = Promise.resolve<any[]>([])
  let friendVisitsPromise = Promise.resolve<{ data: any[] } | null>(null)

  // 1. Activity Feed Details (depends on recentCheckIns)
  if (recentCheckIns && recentCheckIns.length > 0) {
    const userIds = [...new Set(recentCheckIns.map((c) => c.user_id))]
    const hotspotIds = [...new Set(recentCheckIns.map((c) => c.hotspot_id))]

    activityFeedPromise = Promise.all([
        supabase.from("profiles").select("id, username, avatar_url").in("id", userIds),
        supabase.from("hotspots").select("id, name, category").in("id", hotspotIds)
    ]).then(([{ data: profiles }, { data: hotspotData }]) => {
        const profileMap: Record<string, { username: string | null; avatar_url: string | null }> = {}
        profiles?.forEach((p) => {
          profileMap[p.id] = { username: p.username, avatar_url: p.avatar_url }
        })

        const hotspotMap: Record<string, { name: string; category: string }> = {}
        hotspotData?.forEach((h) => {
          hotspotMap[h.id] = { name: h.name, category: h.category }
        })

        return recentCheckIns.map((item) => ({
          id: item.id,
          user_id: item.user_id,
          hotspot_id: item.hotspot_id,
          checked_in_at: item.checked_in_at,
          username: profileMap[item.user_id]?.username || null,
          avatar_url: profileMap[item.user_id]?.avatar_url || null,
          hotspot_name: hotspotMap[item.hotspot_id]?.name || "Unknown Hotspot",
          hotspot_category: hotspotMap[item.hotspot_id]?.category || "other",
        }))
    })
  }

  // 2. Friend Visits (depends on friends list)
  const friendIds = friends.map((f: any) => f.id)
  if (friendIds.length > 0) {
      friendVisitsPromise = supabase
        .from('check_ins')
        .select('hotspot_id')
        .in('user_id', friendIds) as any
  }

  // Await dependent data
  const [activityFeed, friendVisitsResult] = await Promise.all([
      activityFeedPromise,
      friendVisitsPromise
  ])

  // Process User Data
  const userRatingsMap: Record<string, number> = {}
  const userReviewsMap: Record<string, string> = {}
  userRatings?.forEach((r) => {
    userRatingsMap[r.hotspot_id] = r.rating
    if (r.review) {
      userReviewsMap[r.hotspot_id] = r.review
    }
  })

  const savedHotspotIds = savedHotspotsData?.map(s => s.hotspot_id) || []
  const friendVisitedHotspotIds = Array.from(new Set(friendVisitsResult?.data?.map((v: any) => v.hotspot_id) || []))

  const errors = [hotspotsError, checkinsError, ratingsError].filter(Boolean)
  const initError = errors.length > 0 ? "Failed to load some data. Please refresh the page." : null

  return (
    <ErrorBoundary>
      <DashboardClient
        user={user}
        hotspots={hotspots || []}
        activeCheckins={activeCheckinCounts}
        averageRatings={averageRatings}
        activityFeed={activityFeed}
        userCurrentCheckin={userCheckin?.hotspot_id || null}
        userRatings={userRatingsMap}
        userReviews={userReviewsMap}
        savedHotspotIds={savedHotspotIds}
        todayCheckinCount={todayCount || 0}
        initError={initError}
        friendIds={friendIds}
        friendVisitedHotspotIds={friendVisitedHotspotIds}
      />
    </ErrorBoundary>
  )
}
