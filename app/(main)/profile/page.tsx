import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import ProfileDesktop from "./components/ProfileDesktop"
import ProfileMobile from "./components/ProfileMobile"

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/login")
  }

  // Fetch all data in parallel
  const [
    { data: profileData },
    { data: checkIns },
    { data: ratings },
    { data: userPhotos },
    { data: popularHotspots },
    { data: savedHotspots },
  ] = await Promise.all([
    // Get profile
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),

    // Get check-in history
    supabase
      .from("check_ins")
      .select(`
        id,
        checked_in_at,
        is_active,
        hotspots (id, name, category, address)
      `)
      .eq("user_id", user.id)
      .order("checked_in_at", { ascending: false }),

    // Get user's ratings with reviews
    supabase
      .from("ratings")
      .select(`
        id,
        rating,
        review,
        created_at,
        hotspots (id, name, category)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    // Get user's photos
    supabase
      .from("hotspot_photos")
      .select(`
        id,
        image_url,
        thumbnail_url,
        created_at,
        hotspots (id, name, category)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    // Get popular hotspots for recommendations (limit 3)
    supabase
      .from("hotspots")
      .select("id, name, category, image_url, address")
      .limit(3),

    // Get saved hotspots
    supabase
      .from("saved_hotspots")
      .select(`
        id,
        created_at,
        hotspots (id, name, category, address, image_url)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
  ])

  let profile = profileData

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

  const props = {
    user,
    profile,
    checkIns: checkIns || [],
    ratings: ratings || [],
    userPhotos: userPhotos || [],
    popularHotspots: popularHotspots || [],
    savedHotspots: savedHotspots || [],
  }

  return (
    <>
      <div className="block md:hidden">
        <ProfileMobile {...props} />
      </div>
      <div className="hidden md:block">
        <ProfileDesktop {...props} />
      </div>
    </>
  )
}
