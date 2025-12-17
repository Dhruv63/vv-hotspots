import { createClient } from "@/lib/supabase/server"
import { MainLayoutShell } from "@/components/main-layout-shell"
import { redirect } from "next/navigation"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()

  const [
    { data: hotspots },
    { data: activeCheckIns },
    { data: userCheckin },
  ] = await Promise.all([
    supabase.from("hotspots").select("*").order("name"),
    supabase
      .from("check_ins")
      .select("hotspot_id")
      .eq("is_active", true)
      .gte("checked_in_at", fourHoursAgo),
    supabase
      .from("check_ins")
      .select("hotspot_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
  ])

  // Process Active Check-ins
  const activeCheckinCounts: Record<string, number> = {}
  activeCheckIns?.forEach((c: any) => {
    activeCheckinCounts[c.hotspot_id] = (activeCheckinCounts[c.hotspot_id] || 0) + 1
  })

  return (
    <MainLayoutShell
        hotspots={hotspots || []}
        activeCheckins={activeCheckinCounts}
        userCurrentCheckin={userCheckin?.hotspot_id || null}
        userRatings={{}}
    >
        {children}
    </MainLayoutShell>
  )
}
