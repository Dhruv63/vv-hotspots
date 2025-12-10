import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserProfileClient } from "./user-profile-client"
import { Metadata } from "next"

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username} | VV Hotspots`,
    description: `Check out ${username}'s profile on VV Hotspots. See their check-ins, favorite spots, and reviews.`,
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()

  if (!profile) {
    notFound()
  }

  // 2. Fetch Check-ins (for Stats, Recent Activity, and Top Spots)
  // We fetch a larger limit to calculate Top Spots accurately
  const { data: allCheckIns } = await supabase
    .from("check_ins")
    .select(`
      id,
      checked_in_at,
      is_active,
      is_public,
      note,
      hotspots (
        id,
        name,
        category,
        address,
        image_url
      )
    `)
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("checked_in_at", { ascending: false })
    .limit(1000)

  const checkIns = allCheckIns || []

  // Calculate Stats
  const totalCheckIns = checkIns.length

  const visitedHotspotIds = new Set(checkIns.map((c) => {
    const h: any = c.hotspots
    return Array.isArray(h) ? h[0]?.id : h?.id
  }).filter(Boolean))
  const uniqueSpotsVisited = visitedHotspotIds.size

  // Calculate Top Spots
  const hotspotVisits: Record<string, { count: number; hotspot: any }> = {}

  checkIns.forEach((checkIn) => {
    const h: any = checkIn.hotspots
    const hotspot = Array.isArray(h) ? h[0] : h

    if (hotspot && hotspot.id) {
      if (!hotspotVisits[hotspot.id]) {
        hotspotVisits[hotspot.id] = { count: 0, hotspot }
      }
      hotspotVisits[hotspot.id].count += 1
    }
  })

  const topSpots = Object.values(hotspotVisits)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Top 5

  // Recent Activity (Limit to 10)
  const recentActivity = checkIns.slice(0, 10)

  // 3. Fetch Ratings/Reviews
  const { data: ratings } = await supabase
    .from("ratings")
    .select(`
      id,
      rating,
      review,
      created_at,
      hotspots (
        id,
        name,
        category,
        image_url
      )
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })

  const totalReviews = ratings?.length || 0

  return (
    <UserProfileClient
      profile={profile}
      stats={{
        checkIns: totalCheckIns,
        spotsVisited: uniqueSpotsVisited,
        reviews: totalReviews
      }}
      recentActivity={recentActivity}
      topSpots={topSpots}
      reviews={ratings || []}
    />
  )
}
