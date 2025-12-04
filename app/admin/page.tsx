import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminClient from "./admin-client"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== "megahack785@gmail.com") {
    redirect("/dashboard")
  }

  const { data: hotspots } = await supabase
    .from("hotspots")
    .select("*")
    .order("created_at", { ascending: false })

  return <AdminClient initialHotspots={hotspots || []} userEmail={user.email!} />
}
