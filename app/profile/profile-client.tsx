"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { User, MapPin, Calendar, Star, ArrowLeft, Edit2, Camera, X, MessageSquare, Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { CyberCard } from "@/components/ui/cyber-card"
import { CyberButton } from "@/components/ui/cyber-button"
import { CategoryBadge } from "@/components/ui/category-badge"
import { EmptyState } from "@/components/empty-state"
import { sanitizeUsername, sanitizeAvatarUrl, checkRateLimit, RATE_LIMITS } from "@/lib/security"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface ProfileClientProps {
  user: SupabaseUser
  profile: any
  checkIns: any[]
  ratings: any[]
  userPhotos: any[]
}

export function ProfileClient({ user, profile: initialProfile, checkIns, ratings, userPhotos }: ProfileClientProps) {
  const router = useRouter()
  const [profile, setProfile] = useState(initialProfile)
  const [activeTab, setActiveTab] = useState<'history' | 'reviews' | 'saved' | 'photos'>('history')
  const [isEditing, setIsEditing] = useState(false)
  const [editUsername, setEditUsername] = useState(profile?.username || "")
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile?.avatar_url || "")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stats
  const totalCheckIns = checkIns?.length || 0
  const totalRatings = ratings?.length || 0
  const totalPhotos = userPhotos?.length || 0
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
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-cyber-cyan shadow-[0_0_20px_rgba(255,255,0,0.5)] bg-cyber-dark">
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
                className="absolute bottom-0 right-0 w-8 h-8 bg-cyber-purple rounded-full flex items-center justify-center border-2 border-cyber-black hover:scale-110 transition-transform shadow-[0_0_10px_rgba(255,215,0,0.5)]"
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
                  className="inline-flex items-center gap-1 text-[#FFFF00] hover:text-cyber-light transition-colors text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
              <p className="text-[#CCCCCC] text-sm mb-4">{user.email}</p>

              {/* Stats */}
              <div className="flex justify-center sm:justify-start gap-6 sm:gap-8">
                <div className="text-center">
                  <p className="font-mono text-2xl sm:text-3xl text-[#FFFF00]">{totalCheckIns}</p>
                  <p className="text-[#CCCCCC] text-xs sm:text-sm">Check-ins</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-2xl sm:text-3xl text-[#FFFF00]">{uniqueSpots}</p>
                  <p className="text-[#CCCCCC] text-xs sm:text-sm">Spots Visited</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-2xl sm:text-3xl text-[#FFFF00]">{totalRatings}</p>
                  <p className="text-[#CCCCCC] text-xs sm:text-sm">Ratings</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-2xl sm:text-3xl text-[#FFFF00]">{totalPhotos}</p>
                  <p className="text-[#CCCCCC] text-xs sm:text-sm">Photos</p>
                </div>
                {avgRating && (
                  <div className="text-center">
                    <p className="font-mono text-2xl sm:text-3xl text-[#FFFF00]">{avgRating}</p>
                    <p className="text-[#CCCCCC] text-xs sm:text-sm">Avg Rating</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CyberCard>

        <div className="mt-8">
          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto border-b border-cyber-gray/30 mb-6">
            {['history', 'reviews', 'saved', 'photos'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 font-mono text-sm uppercase tracking-wider transition-all border-b-2 flex-shrink-0 ${
                  activeTab === tab
                    ? 'border-[#FFFF00] text-[#FFFF00] font-bold bg-[#FFFF00]/5'
                    : 'border-transparent text-cyber-gray hover:text-cyber-light hover:border-cyber-gray'
                }`}
              >
                {tab === 'history' && 'Check-in History'}
                {tab === 'reviews' && 'My Reviews'}
                {tab === 'saved' && 'Saved Hotspots'}
                {tab === 'photos' && 'My Photos'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">

            {activeTab === 'history' && (
              <CyberCard className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-mono text-lg text-cyber-light flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-cyber-cyan" />
                    CHECK-IN HISTORY
                  </h2>
                  <span className="text-cyber-gray text-xs font-mono">{totalCheckIns} total</span>
                </div>

                {checkIns && checkIns.length > 0 ? (
                  <div className="space-y-3">
                    {checkIns.map((checkin: any) => (
                      <div
                        key={checkin.id}
                        className={`p-4 border rounded-lg transition-all ${
                          checkin.is_active
                            ? "border-cyber-cyan bg-cyber-cyan/10 shadow-[0_0_10px_rgba(255,255,0,0.2)]"
                            : "border-cyber-gray/30 bg-cyber-black/50 hover:border-cyber-cyan/50 hover:bg-cyber-gray/5"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-cyber-light text-lg">{checkin.hotspots?.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <CategoryBadge category={checkin.hotspots?.category} />
                              <span className="text-cyber-gray text-xs">{checkin.hotspots?.address}</span>
                            </div>
                          </div>
                          {checkin.is_active && (
                            <span className="px-2 py-1 bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan text-xs font-mono animate-pulse rounded">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-cyber-gray text-xs font-mono">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(checkin.checked_in_at).toLocaleDateString()} at {new Date(checkin.checked_in_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={MapPin}
                    title="Start exploring!"
                    description="Check in to your first hotspot"
                    variant="cyan"
                    action={
                      <Link href="/dashboard">
                        <CyberButton variant="cyan" size="sm" className="mt-4">
                          Explore Hotspots
                        </CyberButton>
                      </Link>
                    }
                  />
                )}
              </CyberCard>
            )}

            {activeTab === 'reviews' && (
              <CyberCard className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                 <div className="flex items-center justify-between mb-4">
                  <h2 className="font-mono text-lg text-cyber-light flex items-center gap-2">
                    <Star className="w-5 h-5 text-cyber-yellow" />
                    YOUR REVIEWS
                  </h2>
                  <span className="text-cyber-gray text-xs font-mono">{totalRatings} total</span>
                </div>

                {ratings && ratings.length > 0 ? (
                  <div className="space-y-4">
                    {ratings.map((rating: any) => (
                      <div
                        key={rating.id}
                        className="p-4 border border-cyber-gray/30 bg-cyber-black/50 rounded-lg hover:border-cyber-yellow/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-cyber-light text-lg">{rating.hotspots?.name}</h3>
                            <CategoryBadge category={rating.hotspots?.category} className="mt-1" />
                          </div>
                          <div className="flex items-center gap-1 bg-cyber-yellow/10 px-3 py-1.5 rounded border border-cyber-yellow/30">
                            <Star className="w-4 h-4 text-cyber-yellow fill-cyber-yellow" />
                            <span className="font-mono text-cyber-yellow font-bold">{rating.rating}</span>
                          </div>
                        </div>

                        {rating.review && (
                          <div className="p-3 bg-cyber-gray/5 rounded border-l-2 border-cyber-purple mb-3">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-cyber-purple flex-shrink-0 mt-1" />
                              <p className="text-cyber-light italic">"{rating.review}"</p>
                            </div>
                          </div>
                        )}

                        <p className="text-cyber-gray text-xs font-mono">
                          {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Star}
                    title="Share your first review"
                    description="Rate hotspots to keep track of your favorites!"
                    variant="yellow"
                  />
                )}
              </CyberCard>
            )}

            {activeTab === 'saved' && (
               <CyberCard className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                 <div className="flex items-center justify-between mb-4">
                  <h2 className="font-mono text-lg text-cyber-light flex items-center gap-2">
                    <Heart className="w-5 h-5 text-cyber-pink" />
                    SAVED HOTSPOTS
                  </h2>
                </div>
                <EmptyState
                  icon={Heart}
                  title="No saved hotspots"
                  description="Save your favorite spots for quick access."
                  variant="pink"
                  action={
                    <Link href="/dashboard">
                      <CyberButton variant="pink" size="sm" className="mt-4">
                        Browse Hotspots
                      </CyberButton>
                    </Link>
                  }
                />
               </CyberCard>
            )}

            {activeTab === 'photos' && (
              <CyberCard className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                 <div className="flex items-center justify-between mb-4">
                  <h2 className="font-mono text-lg text-cyber-light flex items-center gap-2">
                    <Camera className="w-5 h-5 text-cyber-cyan" />
                    MY PHOTOS
                  </h2>
                  <span className="text-cyber-gray text-xs font-mono">{totalPhotos} total</span>
                </div>

                {userPhotos && userPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {userPhotos.map((photo: any) => (
                      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group border border-cyber-gray/30 hover:border-cyber-cyan transition-all hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                        <Image
                          src={photo.thumbnail_url || photo.image_url}
                          alt="My upload"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <p className="text-xs text-white font-mono font-bold truncate">{photo.hotspots?.name}</p>
                            <p className="text-[10px] text-cyber-gray">{new Date(photo.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Camera}
                    title="No photos yet"
                    description="Upload photos when you check in!"
                    variant="cyan"
                  />
                )}
              </CyberCard>
            )}
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-cyber-dark border-2 border-cyber-purple rounded-lg shadow-[0_0_30px_rgba(255,215,0,0.3)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-xl text-cyber-light">Edit Profile</h2>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditUsername(profile?.username || "")
                  setEditAvatarUrl(profile?.avatar_url || "")
                  setError(null)
                }}
                className="text-[#CCCCCC] hover:text-cyber-light transition-colors"
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
                <label className="block text-[#CCCCCC] text-sm mb-2 font-mono">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-cyber-black border-2 border-cyber-gray rounded text-cyber-light font-mono focus:border-cyber-purple focus:outline-none focus:shadow-[0_0_10px_rgba(255,215,0,0.3)] transition-all"
                  placeholder="Enter username"
                  maxLength={30}
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-[#CCCCCC] text-sm mb-2 font-mono">Avatar URL</label>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-cyber-black border-2 border-cyber-gray rounded text-cyber-light font-mono focus:border-cyber-purple focus:outline-none focus:shadow-[0_0_10px_rgba(255,215,0,0.3)] transition-all"
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-[#CCCCCC] text-xs mt-1">Paste a URL to an image (JPG, PNG, GIF)</p>
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
                className="flex-1 px-4 py-3 border-2 border-cyber-gray text-[#CCCCCC] hover:text-cyber-light hover:border-cyber-light rounded font-mono transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-cyber-purple border-2 border-cyber-purple text-white rounded font-mono hover:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
