"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { User, MapPin, Calendar, Star, ArrowLeft, Edit2, Camera, X, MessageSquare, Heart, Instagram, Twitter, Upload, Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Navbar } from "@/components/navbar"
import { CategoryBadge } from "@/components/ui/category-badge"
import { sanitizeUsername, sanitizeAvatarUrl, checkRateLimit, RATE_LIMITS } from "@/lib/security"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface ProfileClientProps {
  user: SupabaseUser
  profile: any
  checkIns: any[]
  ratings: any[]
  userPhotos: any[]
  popularHotspots: any[]
  savedHotspots: any[]
}

export function ProfileClient({ user, profile: initialProfile, checkIns, ratings, userPhotos, popularHotspots, savedHotspots }: ProfileClientProps) {
  const router = useRouter()
  const [profile, setProfile] = useState(initialProfile)
  const [activeTab, setActiveTab] = useState<'history' | 'reviews' | 'saved' | 'photos' | 'visited'>('history')
  const [saved, setSaved] = useState(savedHotspots)

  // Stats
  const totalCheckIns = checkIns?.length || 0
  const totalRatings = ratings?.length || 0
  const totalPhotos = userPhotos?.length || 0

  const visitedHotspotsMap = new Map()
  checkIns?.forEach((c: any) => {
    if (c.hotspots && !visitedHotspotsMap.has(c.hotspots.id)) {
      visitedHotspotsMap.set(c.hotspots.id, c.hotspots)
    }
  })
  const visitedHotspots = Array.from(visitedHotspotsMap.values())
  const uniqueSpots = visitedHotspots.length

  const avgRating =
    ratings?.length > 0
      ? (ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / ratings.length).toFixed(1)
      : null

  const handleRemoveSaved = async (id: string, hotspotId: string) => {
    const supabase = createClient()
    try {
      await supabase.from("saved_hotspots").delete().eq("user_id", user.id).eq("hotspot_id", hotspotId)
      setSaved(prev => prev.filter(item => item.id !== id))
      toast.success("Removed from saved spots")
    } catch (error) {
      toast.error("Failed to remove saved spot")
    }
  }

  return (
    <div className="min-h-screen bg-background pb-12 pointer-events-auto">
      <Navbar user={user} />

      <main className="pt-20 px-4 max-w-4xl mx-auto">
        {/* Back button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-accent hover:underline mb-6 font-heading">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Map</span>
        </Link>

        {/* Profile Header */}
        <div className="card-theme p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-accent shadow-theme bg-muted">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url || "/placeholder.svg"}
                    alt={profile.username || "User avatar"}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent/10">
                    <User className="w-12 h-12 text-accent" />
                  </div>
                )}
              </div>
              <Link
                href="/profile/edit"
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-background hover:scale-110 transition-transform shadow-sm"
              >
                <Camera className="w-4 h-4 text-primary-foreground" />
              </Link>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                  {profile?.username || user.email?.split("@")[0] || "Anonymous"}
                </h1>
                <Link
                  href="/profile/edit"
                  className="inline-flex items-center gap-1 text-primary hover:text-foreground transition-colors text-sm font-heading"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Link>
              </div>
              <p className="text-muted-foreground text-sm mb-4">{user.email}</p>

              <div className="flex flex-col gap-2 mb-4">
                {profile?.city && (
                  <div className="flex items-center gap-2 text-accent text-sm font-heading">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.city}</span>
                  </div>
                )}
                {profile?.bio && (
                  <p className="text-muted-foreground text-sm italic max-w-lg font-heading">{profile.bio}</p>
                )}
                <div className="flex gap-3 mt-1">
                  {profile?.instagram_username && (
                    <a
                      href={`https://instagram.com/${profile.instagram_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 hover:text-pink-400"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {profile?.twitter_username && (
                    <a
                      href={`https://twitter.com/${profile.twitter_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-center sm:justify-start gap-6 sm:gap-8">
                <div
                  className={`text-center cursor-pointer transition-transform hover:scale-105 ${activeTab === 'history' ? 'border-b-2 border-primary pb-1' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  <p className="font-heading text-2xl sm:text-3xl text-primary">{totalCheckIns}</p>
                  <p className="text-muted-foreground text-xs sm:text-sm font-heading">Check-ins</p>
                </div>
                <div
                  className={`text-center cursor-pointer transition-transform hover:scale-105 ${activeTab === 'visited' ? 'border-b-2 border-primary pb-1' : ''}`}
                  onClick={() => setActiveTab('visited')}
                >
                  <p className="font-heading text-2xl sm:text-3xl text-primary">{uniqueSpots}</p>
                  <p className="text-muted-foreground text-xs sm:text-sm font-heading">Spots Visited</p>
                </div>
                <div
                  className={`text-center cursor-pointer transition-transform hover:scale-105 ${activeTab === 'reviews' ? 'border-b-2 border-primary pb-1' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  <p className="font-heading text-2xl sm:text-3xl text-primary">{totalRatings}</p>
                  <p className="text-muted-foreground text-xs sm:text-sm font-heading">Ratings</p>
                </div>
                <div
                  className={`text-center cursor-pointer transition-transform hover:scale-105 ${activeTab === 'photos' ? 'border-b-2 border-primary pb-1' : ''}`}
                  onClick={() => setActiveTab('photos')}
                >
                  <p className="font-heading text-2xl sm:text-3xl text-primary">{totalPhotos}</p>
                  <p className="text-muted-foreground text-xs sm:text-sm font-heading">Photos</p>
                </div>
                {avgRating && (
                  <div
                    className={`text-center cursor-pointer transition-transform hover:scale-105 ${activeTab === 'reviews' ? 'border-b-2 border-primary pb-1' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                  >
                    <p className="font-heading text-2xl sm:text-3xl text-primary">{avgRating}</p>
                    <p className="text-muted-foreground text-xs sm:text-sm font-heading">Avg Rating</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto border-b border-border mb-6">
            {['history', 'reviews', 'saved', 'photos', 'visited'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 font-heading text-sm uppercase tracking-wider transition-all border-b-2 flex-shrink-0 ${
                  activeTab === tab
                    ? 'border-primary text-primary font-bold bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                {tab === 'history' && 'Check-in History'}
                {tab === 'reviews' && 'My Reviews'}
                {tab === 'saved' && 'Saved Hotspots'}
                {tab === 'photos' && 'My Photos'}
                {tab === 'visited' && 'Spots Visited'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">

            {activeTab === 'history' && (
              <div className="card-theme p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-lg text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    CHECK-IN HISTORY
                  </h2>
                  <span className="text-muted-foreground text-xs font-heading">{totalCheckIns} total</span>
                </div>

                {checkIns && checkIns.length > 0 ? (
                  <div className="space-y-3">
                    {checkIns.map((checkin: any) => (
                      <div
                        key={checkin.id}
                        className={`p-4 border rounded-lg transition-all ${
                          checkin.is_active
                            ? "border-accent bg-accent/10 shadow-[var(--shadow-hover)]"
                            : "border-border bg-muted/50 hover:border-accent/50 hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-foreground text-lg font-heading">{checkin.hotspots?.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <CategoryBadge category={checkin.hotspots?.category} />
                              <span className="text-muted-foreground text-xs font-heading">{checkin.hotspots?.address}</span>
                            </div>
                          </div>
                          {checkin.is_active && (
                            <span className="px-2 py-1 bg-accent/20 border border-accent text-accent text-xs font-heading animate-pulse rounded">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-muted-foreground text-xs font-heading">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(checkin.checked_in_at).toLocaleDateString()} at {new Date(checkin.checked_in_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-heading">No check-ins yet</p>
                    <Link href="/dashboard">
                      <button className="mt-4 px-4 py-2 bg-accent text-accent-foreground rounded font-heading font-bold hover:brightness-110 transition-all">
                        Explore Hotspots
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="card-theme p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                 <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-lg text-foreground flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    YOUR REVIEWS
                  </h2>
                  <span className="text-muted-foreground text-xs font-heading">{totalRatings} total</span>
                </div>

                {ratings && ratings.length > 0 ? (
                  <div className="space-y-4">
                    {ratings.map((rating: any) => (
                      <div
                        key={rating.id}
                        className="p-4 border border-border bg-muted/50 rounded-lg hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-foreground text-lg font-heading">{rating.hotspots?.name}</h3>
                            <CategoryBadge category={rating.hotspots?.category} className="mt-1" />
                          </div>
                          <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded border border-primary/30">
                            <Star className="w-4 h-4 text-primary fill-primary" />
                            <span className="font-heading text-primary font-bold">{rating.rating}</span>
                          </div>
                        </div>

                        {rating.review && (
                          <div className="p-3 bg-background/50 rounded border-l-2 border-accent mb-3">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                              <p className="text-foreground italic">"{rating.review}"</p>
                            </div>
                          </div>
                        )}

                        <p className="text-muted-foreground text-xs font-heading">
                          {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-heading">No reviews yet</p>
                    <p className="text-sm">Rate hotspots to keep track of your favorites!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'saved' && (
               <div className="card-theme p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                 <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-xl text-foreground flex items-center gap-2 font-bold">
                    <Heart className="w-6 h-6 text-secondary" />
                    SAVED HOTSPOTS
                  </h2>
                  <span className="text-muted-foreground text-xs font-heading">{saved.length} total</span>
                </div>

                {saved.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {saved.map((item: any) => (
                         <div key={item.id} className="group relative rounded-lg overflow-hidden border border-border bg-muted hover:border-accent/50 transition-all flex flex-col">
                            <div className="h-40 relative">
                               <Image src={item.hotspots?.image_url || "/placeholder.svg"} alt={item.hotspots?.name} fill className="object-cover" />
                               <div className="absolute top-2 right-2">
                                  <CategoryBadge category={item.hotspots?.category} />
                               </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                               <h3 className="font-bold text-foreground text-lg mb-1 font-heading">{item.hotspots?.name}</h3>
                               <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1 font-heading">
                                  <MapPin className="w-3 h-3" />
                                  {item.hotspots?.address}
                               </p>
                               <div className="mt-auto flex items-center justify-between gap-3">
                                  <Link href={`/dashboard?hotspot=${item.hotspots?.id}`} className="flex-1">
                                     <button className="w-full py-2 bg-primary text-primary-foreground text-xs font-heading font-bold rounded hover:bg-primary/90 transition-colors">
                                        VIEW DETAILS
                                     </button>
                                  </Link>
                                  <button
                                    onClick={() => handleRemoveSaved(item.id, item.hotspots?.id)}
                                    className="p-2 border border-secondary/50 text-secondary hover:bg-secondary/10 rounded transition-colors"
                                  >
                                     <Trash2 className="w-4 h-4" />
                                  </button>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                ) : (
                <div className="text-center py-8">
                    <Heart className="w-16 h-16 mx-auto mb-6 text-muted-foreground/30" />
                    <p className="font-heading text-xl text-foreground mb-2">No saved hotspots yet</p>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">Save your favorite spots for quick access.</p>
                    <Link href="/dashboard">
                      <button className="px-8 py-4 bg-primary text-primary-foreground font-heading font-bold text-lg rounded-lg hover:bg-primary/90 shadow-[var(--shadow-hover)] transition-all active:scale-95 flex items-center gap-3 mx-auto">
                        <MapPin className="w-5 h-5" />
                        BROWSE HOTSPOTS
                      </button>
                    </Link>
                </div>
                )}
               </div>
            )}

            {activeTab === 'visited' && (
              <div className="card-theme p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-lg text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    SPOTS VISITED
                  </h2>
                  <span className="text-muted-foreground text-xs font-heading">{uniqueSpots} total</span>
                </div>

                {visitedHotspots.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {visitedHotspots.map((spot: any) => (
                      <Link key={spot.id} href={`/dashboard?hotspot=${spot.id}`} className="group block relative aspect-video rounded-lg overflow-hidden border border-border hover:border-accent transition-all">
                        <Image src={spot.image_url || "/placeholder.svg"} alt={spot.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-3 flex flex-col justify-end">
                          <h3 className="font-bold text-white text-sm truncate font-heading">{spot.name}</h3>
                          <div className="flex items-center gap-1">
                             <CategoryBadge category={spot.category} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-heading">No spots visited yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="card-theme p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                 <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-lg text-foreground flex items-center gap-2">
                    <Camera className="w-5 h-5 text-accent" />
                    MY PHOTOS
                  </h2>
                  <span className="text-muted-foreground text-xs font-heading">{totalPhotos} total</span>
                </div>

                {userPhotos && userPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {userPhotos.map((photo: any) => (
                      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group border border-border hover:border-accent transition-all hover:shadow-[var(--shadow-hover)]">
                        <Image
                          src={photo.thumbnail_url || photo.image_url}
                          alt="My upload"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <p className="text-xs text-white font-heading font-bold truncate">{photo.hotspots?.name}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(photo.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                     <div
                        className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-accent/60 hover:bg-accent/5 transition-all cursor-pointer group"
                        onClick={() => toast("Please go to a hotspot on the map to upload photos.")}
                     >
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                           <Upload className="w-8 h-8 text-muted-foreground group-hover:text-accent transition-colors" />
                        </div>
                        <h3 className="font-heading text-lg text-foreground font-bold mb-2">Drag photos here or click to upload</h3>
                        <p className="text-muted-foreground text-sm">Share your best moments with the community</p>
                     </div>

                     <div>
                        <p className="text-muted-foreground text-xs font-heading mb-4 uppercase tracking-widest">Inspiration from others</p>
                        <div className="grid grid-cols-3 gap-4">
                           {popularHotspots.slice(0, 3).map((spot: any) => (
                              <div key={spot.id} className="relative aspect-square rounded-lg overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
                                 <Image src={spot.image_url || "/placeholder.svg"} alt="Inspiration" fill className="object-cover grayscale hover:grayscale-0 transition-all" />
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  )
}
