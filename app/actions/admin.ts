"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const hotspotSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["cafe", "park", "gaming", "food", "hangout", "other"]),
  address: z.string().min(1, "Address is required"),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  description: z.string().optional(),
  image_url: z.string().optional(),
})

// Helper to get admin client
const getAdminClient = () => {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function updateHotspot(id: string, formData: z.infer<typeof hotspotSchema>) {
  // Use the exact logging requested by user
  const payload = {
    name: formData.name,
    category: formData.category,
    address: formData.address,
    latitude: formData.latitude,
    longitude: formData.longitude,
    description: formData.description || null,
    image_url: formData.image_url || null,
  }

  console.log('Admin edit hotspot payload', payload);

  const supabase = await createClient()

  // 1. Verify Admin
  // It is OK to SELECT from auth.users just to check email
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'vv.hotspots@gmail.com') {
    return { error: "Unauthorized" }
  }

  const adminClient = getAdminClient()

  // 3. Perform Update
  // The ONLY database write must be update on hotspots
  const { error } = await adminClient
    .from("hotspots")
    .update(payload)
    .eq("id", id)

  console.log('Admin edit hotspot result', error);

  if (error) {
    // keeping this for debugging convenience, user only asked to ADD logs, not replace entirely,
    // but the requested logs are added above.
    console.error("Server Action Update Error:", error)
    return { error: error.message }
  }

  revalidatePath("/admin")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function createHotspot(formData: z.infer<typeof hotspotSchema>) {
  const supabase = await createClient()

  // 1. Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'vv.hotspots@gmail.com') {
    return { error: "Unauthorized" }
  }

  const adminClient = getAdminClient()

  // 2. Prepare Data
  const updates = {
    name: formData.name,
    category: formData.category,
    address: formData.address,
    latitude: formData.latitude,
    longitude: formData.longitude,
    description: formData.description || null,
    image_url: formData.image_url || null,
  }

  // 3. Perform Insert
  const { data, error } = await adminClient
    .from("hotspots")
    .insert(updates)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin")
  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function deleteHotspot(id: string) {
  const supabase = await createClient()

  // 1. Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'vv.hotspots@gmail.com') {
    return { error: "Unauthorized" }
  }

  const adminClient = getAdminClient()

  // 2. Perform Delete
  const { error } = await adminClient
    .from("hotspots")
    .delete()
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin")
  revalidatePath("/dashboard")
  return { success: true }
}
