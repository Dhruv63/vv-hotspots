"use server"

import { createClient } from "@/lib/supabase/server"
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

export async function updateHotspot(id: string, formData: z.infer<typeof hotspotSchema>) {
  console.log('Updating hotspot', id, formData);

  const supabase = await createClient()

  // 1. Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'vv.hotspots@gmail.com') {
    return { error: "Unauthorized" }
  }

  // 2. Prepare Data (Strictly typed, only hotspots columns)
  const updates = {
    name: formData.name,
    category: formData.category,
    address: formData.address,
    latitude: formData.latitude,
    longitude: formData.longitude,
    description: formData.description || null,
    image_url: formData.image_url || null,
  }

  // 3. Perform Update
  // Explicitly selecting only the updated row isn't necessary for update, but returns no data by default unless select() is called.
  // We just need the error.
  const { error } = await supabase
    .from("hotspots")
    .update(updates)
    .eq("id", id)

  console.log('Update result', error);

  if (error) {
    console.error("Server Action Update Error:", error)
    return { error: error.message }
  }

  revalidatePath("/admin")
  revalidatePath("/dashboard") // If hotspots are shown there
  return { success: true }
}

export async function createHotspot(formData: z.infer<typeof hotspotSchema>) {
  const supabase = await createClient()

  // 1. Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'vv.hotspots@gmail.com') {
    return { error: "Unauthorized" }
  }

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
  const { data, error } = await supabase
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

  // 2. Perform Delete
  const { error } = await supabase
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
