"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function savePhotoAndAwardPoints(
  hotspotId: string,
  imageUrl: string,
  thumbnailUrl: string
) {
  const supabase = await createClient()

  // 1. Get User
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  // 2. Validate Limits
  // Max 5 photos per user per day
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: dailyCount, error: countError } = await supabase
    .from("hotspot_photos")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", today.toISOString())

  if (countError) {
    console.error("Error checking daily limit:", countError)
    throw new Error("Failed to validate upload limits")
  }

  if (dailyCount !== null && dailyCount >= 5) {
    throw new Error("Daily upload limit reached (5 photos/day)")
  }

  // Max 3 photos per hotspot per day (Approximating "per check-in" as per day/session for this hotspot)
  const { count: hotspotCount, error: hotspotCountError } = await supabase
    .from("hotspot_photos")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("hotspot_id", hotspotId)
    .gte("created_at", today.toISOString())

   if (hotspotCountError) {
    console.error("Error checking hotspot limit:", hotspotCountError)
    throw new Error("Failed to validate hotspot upload limits")
   }

   if (hotspotCount !== null && hotspotCount >= 3) {
      throw new Error("You can only upload 3 photos per check-in (daily limit)")
   }

  // 3. Insert Photo
  const { error: insertError } = await supabase.from("hotspot_photos").insert({
    user_id: user.id,
    hotspot_id: hotspotId,
    image_url: imageUrl,
    thumbnail_url: thumbnailUrl,
  })

  if (insertError) {
    console.error("Error inserting photo:", insertError)
    throw new Error("Failed to save photo")
  }

  // 4. Award Points
  const { data: profile } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", user.id)
    .single()

  const currentPoints = profile?.points || 0
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ points: currentPoints + 20 })
    .eq("id", user.id)

  if (updateError) {
      console.error("Failed to award points:", updateError)
      // We don't throw here to avoid rolling back the photo upload which succeeded?
      // Actually we can't rollback easily without transactions.
      // We'll return success but maybe with a warning in logs.
  }

  revalidatePath("/dashboard")
  revalidatePath("/profile")

  return { success: true, pointsAwarded: 20 }
}
