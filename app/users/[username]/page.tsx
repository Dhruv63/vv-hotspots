import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserProfileClient } from "./user-profile-client"
import { Metadata } from "next"
import { getMutualFriends, getFriends, getFriendStatus } from "@/app/actions/friends"

// Force dynamic rendering to ensure fresh friendship status on every load
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

  // 1. Fetch Profile and Current User in parallel
  const [
    { data: profile },
    { data: { user: currentUser } }
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("username", username).single(),
    supabase.auth.getUser()
  ])

  if (!profile) {
    notFound()
  }

  // 2. Prepare Parallel Fetches for Profile Data and Friend Logic
  const fetchPromises = [
    // Fetch Check-ins
    supabase
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
      .limit(1000),

    // Fetch Ratings
    supabase
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
      .order("created_at", { ascending: false }),

    // Get friend count
    getFriends(profile.id)
  ]

  // Conditional Friend Logic
  let friendStatusPromise = Promise.resolve('none')
  let mutualsPromise = Promise.resolve([])
  let requestPromise = Promise.resolve<{ data: any } | null>(null)

  if (currentUser && currentUser.id !== profile.id) {
    friendStatusPromise = getFriendStatus(currentUser.id, profile.id)
    mutualsPromise = getMutualFriends(currentUser.id, profile.id)

    // We optimistically fetch the request if it exists, to be ready if status is 'pending_received'
    requestPromise = supabase
      .from('friend_requests')
      .select('*')
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${currentUser.id})`)
      .eq('status', 'pending')
      .maybeSingle()
  }

  // Execute all promises
  const [
    { data: allCheckIns },
    { data: ratings },
    friends,
    friendStatus,
    mutuals,
    requestResult
  ] = await Promise.all([
    ...fetchPromises,
    friendStatusPromise,
    mutualsPromise,
    requestPromise
  ])

  // Process Results
  const checkIns = allCheckIns || []
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
    .slice(0, 5)

  const recentActivity = checkIns.slice(0, 10)
  const totalReviews = ratings?.length || 0
  const friendCount = (friends as any[]).length

  // Extract Request ID if relevant
  let requestId = null
  if (friendStatus === 'pending_received' && requestResult?.data) {
     requestId = requestResult.data.id
  }

  return (
    <UserProfileClient
      profile={profile}
      stats={{
        checkIns: totalCheckIns,
        spotsVisited: uniqueSpotsVisited,
        reviews: totalReviews,
        friends: friendCount
      }}
      recentActivity={recentActivity}
      topSpots={topSpots}
      reviews={ratings || []}
      friendStatus={friendStatus}
      mutualFriendsCount={(mutuals as any[]).length}
      currentUser={currentUser}
      requestId={requestId}
    />
  )
}
