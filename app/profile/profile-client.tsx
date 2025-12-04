"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { User, MapPin, Calendar, Star, ArrowLeft, Edit2, Camera, X, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { CyberCard } from "@/components/ui/cyber-card"
import { CyberButton } from "@/components/ui/cyber-button"
import { CategoryBadge } from "@/components/ui/category-badge"
import { sanitizeUsername, sanitizeAvatarUrl, checkRateLimit, RATE_LIMITS } from "@/lib/security"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface ProfileClientProps {
  user: SupabaseUser
  profile: any
  checkIns: any[]
  ratings: any[]
}

export function ProfileClient({ user, profile: initialProfile, checkIns, ratings }: ProfileClientProps) {
  const router = useRouter()
  const [profile, setProfile] = useState(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editUsername, setEditUsername] = useState(profile?.username || "")
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile?.avatar_url || "")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stats
  const totalCheckIns = checkIns?.length || 0
  const totalRatings = ratings?.length || 0
  const uniqueSpots = new Set(checkIns?.map((c: any) => c.hotspots?.id)).size
  const avgRating =
    ratings?.length > 0
      ? (ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / ratings.length).toFixed(1)
      : null

  const handleSaveProfile = async () => {
    const sanitizedUsername = sanitizeUsername(editUsername)
    const sanitizedAvatarUrl = sanitizeAvatarUrl(editAvatarUrl)

    if (!sanitizedUsername) {
      setError("Username must contain only letters, numbers, underscores, or hyphens")
      return
    }

    if (sanitizedUsername.length < 3) {
      setError("Username must be at least 3 characters")
      return
    }

    const rateCheck = checkRateLimit("profile", user.id)
    if (!rateCheck.allowed) {
      const seconds = rateCheck.waitTime || 60
      setError(`Too many updates. Please wait ${seconds} seconds.`)
      return
    }

    if (editAvatarUrl.trim() && !sanitizedAvatarUrl) {
      setError("Avatar URL must be a valid HTTPS URL")
      return
    }

    setIsSaving(true)
    setError(null)

    const supabase = createClient()
    const { data, error: updateError } = await supabase
      .from("profiles")
      .update({
        username: sanitizedUsername,
        avatar_url: sanitizedAvatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      if (updateError.message.includes("unique")) {
        setError("This username is already taken")
      } else {
        setError(updateError.message)
      }
      setIsSaving(false)
      return
    }

    setProfile(data)
    setIsEditing(false)
    setIsSaving(false)
    router.refresh()
  }

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
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-cyber-cyan shadow-[0_0_20px_rgba(0,255,255,0.5)] bg-cyber-dark">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url || "/placeholder.svg"}
                    alt={profile.username || "User avatar"}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20">
                    <User className="w-12 h-12 text-cyber-cyan" />
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 right-0 w-8 h-8 bg-cyber-purple rounded-full flex items-center justify-center border-2 border-cyber-black hover:scale-110 transition-transform shadow-[0_0_10px_rgba(183,0,255,0.5)]"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <h1 className="font-mono text-2xl sm:text-3xl font-bold text-cyber-light">
                  {profile?.username || user.email?.split("@")[0] || "Anonymous"}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 text-cyber-cyan hover:text-cyber-light transition-colors text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
              <p className="text-cyber-gray text-sm mb-4">{user.email}</p>

              {/* Stats */}
              <div className="flex justify-center sm:justify-start gap-6 sm:gap-8">
                <div className="text-center">
                  <p className="font-mono text-2xl sm:text-3xl text-cyber-cyan">{totalCheckIns}</p>
                  <p className="text-cyber-gray text-xs sm:text-sm">Check-ins</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-2xl sm:text-3xl text-cyber-pink">{uniqueSpots}</p>
                  <p className="text-cyber-gray text-xs sm:text-sm">Spots Visited</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-2xl sm:text-3xl text-cyber-purple">{totalRatings}</p>
                  <p className="text-cyber-gray text-xs sm:text-sm">Ratings</p>
                </div>
                {avgRating && (
                  <div className="text-center">
                    <p className="font-mono text-2xl sm:text-3xl text-cyber-yellow">{avgRating}</p>
                    <p className="text-cyber-gray text-xs sm:text-sm">Avg Rating</p>
                  </div>
                )}
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
              <span className="text-cyber-gray text-sm ml-auto">{totalCheckIns} total</span>
            </h2>

            {checkIns && checkIns.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {checkIns.map((checkin: any) => (
                  <div
                    key={checkin.id}
                    className={`p-3 border rounded-lg transition-all ${
                      checkin.is_active
                        ? "border-cyber-cyan bg-cyber-cyan/10 shadow-[0_0_10px_rgba(0,255,255,0.2)]"
                        : "border-cyber-gray/50 bg-cyber-black/50 hover:border-cyber-cyan hover:shadow-[0_0_10px_rgba(0,255,255,0.2)]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-cyber-light">{checkin.hotspots?.name}</p>
                        <CategoryBadge category={checkin.hotspots?.category} className="mt-1" />
                      </div>
                      {checkin.is_active && (
                        <span className="px-2 py-1 bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan text-xs font-mono animate-pulse rounded">
                          ACTIVE
                        </span>
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

          {/* Ratings & Reviews */}
          <CyberCard className="p-4">
            <h2 className="font-mono text-lg text-cyber-light mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-cyber-yellow" />
              YOUR RATINGS & REVIEWS
              <span className="text-cyber-gray text-sm ml-auto">{totalRatings} total</span>
            </h2>

            {ratings && ratings.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {ratings.map((rating: any) => (
                  <div
                    key={rating.id}
                    className="p-3 border border-cyber-gray/50 bg-cyber-black/50 rounded-lg hover:border-cyber-purple hover:shadow-[0_0_10px_rgba(183,0,255,0.3)] transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-cyber-light">{rating.hotspots?.name}</p>
                        <CategoryBadge category={rating.hotspots?.category} className="mt-1" />
                      </div>
                      <div className="flex items-center gap-1 bg-cyber-yellow/10 px-2 py-1 rounded border border-cyber-yellow/30">
                        <Star className="w-4 h-4 text-cyber-yellow fill-cyber-yellow" />
                        <span className="font-mono text-cyber-yellow">{rating.rating}</span>
                      </div>
                    </div>

                    {/* Review text */}
                    {rating.review && (
                      <div className="mt-2 p-2 bg-cyber-purple/10 border-l-2 border-cyber-purple rounded-r">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-cyber-purple flex-shrink-0 mt-0.5" />
                          <p className="text-cyber-light text-sm italic">"{rating.review}"</p>
                        </div>
                      </div>
                    )}

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

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-cyber-dark border-2 border-cyber-purple rounded-lg shadow-[0_0_30px_rgba(183,0,255,0.3)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-xl text-cyber-light">Edit Profile</h2>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditUsername(profile?.username || "")
                  setEditAvatarUrl(profile?.avatar_url || "")
                  setError(null)
                }}
                className="text-cyber-gray hover:text-cyber-light transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-cyber-pink/20 border border-cyber-pink text-cyber-pink text-sm rounded">
                {error}
              </div>
            )}

            {/* Avatar Preview */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-cyber-purple bg-cyber-dark">
                {editAvatarUrl ? (
                  <img
                    src={editAvatarUrl || "/placeholder.svg"}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20">
                    <User className="w-10 h-10 text-cyber-purple" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-cyber-gray text-sm mb-2 font-mono">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-cyber-black border-2 border-cyber-gray rounded text-cyber-light font-mono focus:border-cyber-purple focus:outline-none focus:shadow-[0_0_10px_rgba(183,0,255,0.3)] transition-all"
                  placeholder="Enter username"
                  maxLength={30}
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-cyber-gray text-sm mb-2 font-mono">Avatar URL</label>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-cyber-black border-2 border-cyber-gray rounded text-cyber-light font-mono focus:border-cyber-purple focus:outline-none focus:shadow-[0_0_10px_rgba(183,0,255,0.3)] transition-all"
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-cyber-gray text-xs mt-1">Paste a URL to an image (JPG, PNG, GIF)</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditUsername(profile?.username || "")
                  setEditAvatarUrl(profile?.avatar_url || "")
                  setError(null)
                }}
                className="flex-1 px-4 py-3 border-2 border-cyber-gray text-cyber-gray hover:text-cyber-light hover:border-cyber-light rounded font-mono transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-cyber-purple border-2 border-cyber-purple text-white rounded font-mono hover:shadow-[0_0_15px_rgba(183,0,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
