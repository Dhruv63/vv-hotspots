import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EditProfileForm } from "./edit-profile-form"

export default async function EditProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
      // Create if missing, or redirect
      // Assuming profile exists as per ProfilePage logic, but to be safe:
      const username = user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: username,
        })
        .select()
        .single()

      return <EditProfileForm user={user} profile={newProfile} />
  }

  return (
    <EditProfileForm user={user} profile={profile} />
  )
}
