import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileClient } from "./profile-client"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get profile - use maybeSingle to handle case where profile doesn't exist
  let { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  // If profile doesn't exist, create one
  if (!profile) {
    const username = user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username: username,
        avatar_url: null,
      })
      .select()
      .single()
    profile = newProfile
  }

  // Get check-in history
  const { data: checkIns } = await supabase
    .from("check_ins")
    .select(`
      id,
      checked_in_at,
      is_active,
      hotspots (id, name, category, address)
    `)
    .eq("user_id", user.id)
    .order("checked_in_at", { ascending: false })

  // Get user's ratings with reviews
  const { data: ratings } = await supabase
    .from("ratings")
    .select(`
      id,
      rating,
      review,
      created_at,
      hotspots (id, name, category)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get user's photos
  const { data: userPhotos } = await supabase
    .from("hotspot_photos")
    .select(`
      id,
      image_url,
      thumbnail_url,
      created_at,
      hotspots (id, name, category)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get popular hotspots for recommendations (limit 3)
  const { data: popularHotspots } = await supabase
    .from("hotspots")
    .select("id, name, category, image_url, address")
    .limit(3)

  return (
    <ProfileClient
      user={user}
      profile={profile}
      checkIns={checkIns || []}
      ratings={ratings || []}
      userPhotos={userPhotos || []}
      popularHotspots={popularHotspots || []}
    />
  )
}
