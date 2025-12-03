import { redirect } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { User, MapPin, Calendar, Star, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { CyberCard } from "@/components/ui/cyber-card"
import { CyberButton } from "@/components/ui/cyber-button"
import { CategoryBadge } from "@/components/ui/category-badge"
import { StarRating } from "@/components/ui/star-rating"

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
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  // If profile doesn't exist, create one
  if (!profile) {
    const username = user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`
    await supabase.from("profiles").insert({
      id: user.id,
      username: username,
      avatar_url: null,
    })
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
    .limit(20)

  // Get user's ratings
  const { data: ratings } = await supabase
    .from("ratings")
    .select(`
      id,
      rating,
      created_at,
      hotspots (id, name, category)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Stats
  const totalCheckIns = checkIns?.length || 0
  const totalRatings = ratings?.length || 0
  const uniqueSpots = new Set(checkIns?.map((c: any) => c.hotspots?.id)).size

  return (
    <div className="min-h-screen bg-cyber-black scanlines">
      <Navbar user={user} />

      <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
        {/* Back button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-cyber-cyan hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-sm">Back to Map</span>
        </Link>

        {/* Profile Header */}
        <CyberCard className="p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-cyber-cyan/20 border-2 border-cyber-cyan flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-cyber-cyan" />
            </div>
            <div className="flex-1">
              <h1 className="font-mono text-2xl font-bold text-cyber-light mb-1">
                {profile?.username || user.email?.split("@")[0] || "Anonymous"}
              </h1>
              <p className="text-cyber-gray text-sm mb-4">{user.email}</p>

              {/* Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="font-mono text-2xl text-cyber-cyan">{totalCheckIns}</p>
                  <p className="text-cyber-gray text-xs">Check-ins</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-2xl text-cyber-pink">{uniqueSpots}</p>
                  <p className="text-cyber-gray text-xs">Spots Visited</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-2xl text-cyber-purple">{totalRatings}</p>
                  <p className="text-cyber-gray text-xs">Ratings</p>
                </div>
              </div>
            </div>
          </div>
        </CyberCard>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Check-in History */}
          <CyberCard className="p-4">
            <h2 className="font-mono text-lg text-cyber-light mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyber-cyan" />
              CHECK-IN HISTORY
            </h2>

            {checkIns && checkIns.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {checkIns.map((checkin: any) => (
                  <div
                    key={checkin.id}
                    className={`p-3 border ${
                      checkin.is_active ? "border-cyber-cyan bg-cyber-cyan/10" : "border-cyber-gray bg-cyber-black/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-cyber-light">{checkin.hotspots?.name}</p>
                        <CategoryBadge category={checkin.hotspots?.category} className="mt-1" />
                      </div>
                      {checkin.is_active && (
                        <span className="text-cyber-cyan text-xs font-mono animate-pulse">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-cyber-gray text-xs mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(checkin.checked_in_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-cyber-gray">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="font-mono text-sm">No check-ins yet</p>
                <Link href="/dashboard">
                  <CyberButton variant="cyan" size="sm" className="mt-4">
                    Explore Hotspots
                  </CyberButton>
                </Link>
              </div>
            )}
          </CyberCard>

          {/* Ratings */}
          <CyberCard className="p-4">
            <h2 className="font-mono text-lg text-cyber-light mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-cyber-yellow" />
              YOUR RATINGS
            </h2>

            {ratings && ratings.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {ratings.map((rating: any) => (
                  <div key={rating.id} className="p-3 border border-cyber-gray bg-cyber-black/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-cyber-light">{rating.hotspots?.name}</p>
                        <CategoryBadge category={rating.hotspots?.category} className="mt-1" />
                      </div>
                      <StarRating rating={rating.rating} size="sm" />
                    </div>
                    <p className="text-cyber-gray text-xs mt-2">
                      {formatDistanceToNow(new Date(rating.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-cyber-gray">
                <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="font-mono text-sm">No ratings yet</p>
                <p className="text-xs">Rate hotspots to help others!</p>
              </div>
            )}
          </CyberCard>
        </div>
      </main>
    </div>
  )
}
