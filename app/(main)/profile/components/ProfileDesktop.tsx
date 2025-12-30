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
import { ThemeSelector } from "@/app/(main)/settings/theme-selector"

interface ProfileDesktopProps {
  user: SupabaseUser
  profile: any
  checkIns: any[]
  ratings: any[]
  userPhotos: any[]
  popularHotspots: any[]
  savedHotspots: any[]
}

export default function ProfileDesktop({ user, profile: initialProfile, checkIns, ratings, userPhotos, popularHotspots, savedHotspots }: ProfileDesktopProps) {
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

      <main className="pt-20 px-4 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Profile Info */}
        <div className="lg:col-span-4 space-y-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-accent hover:underline mb-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Map</span>
          </Link>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full p-[3px] bg-gradient-to-tr from-accent via-primary to-accent bg-[length:200%_200%] animate-gradient-x shadow-lg mb-4 relative group">
                <div className="w-full h-full rounded-full overflow-hidden bg-background relative">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url || "/placeholder.svg"}
                      alt={profile.username || "User avatar"}
                      width={128}
                      height={128}
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

              <h1 className="text-2xl font-bold text-foreground mb-1">
                {profile?.username || user.email?.split("@")[0] || "Anonymous"}
              </h1>
              <p className="text-muted-foreground text-sm mb-4">{user.email}</p>

              {profile?.city && (
                <div className="flex items-center gap-2 text-accent text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.city}</span>
                </div>
              )}

              {profile?.bio && (
                <p className="text-muted-foreground text-sm italic mb-4 max-w-xs">{profile.bio}</p>
              )}

              <div className="flex gap-3 justify-center mb-6">
                {profile?.instagram_username && (
                  <a
                    href={`https://instagram.com/${profile.instagram_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-400 p-2 glass rounded-full"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {profile?.twitter_username && (
                  <a
                    href={`https://twitter.com/${profile.twitter_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 p-2 glass rounded-full"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>

              <Link href="/profile/edit" className="w-full">
                <button className="w-full py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              </Link>
            </div>
          </div>

          {/* Theme Selector Section */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
             <ThemeSelector />
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-8">
           {/* Stats Row */}
           <div className="glass-panel p-6 rounded-2xl border border-white/10 mb-8 flex justify-around items-center">
              <div className="text-center cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('history')}>
                 <p className="text-3xl text-primary font-bold animate-count-up">{totalCheckIns}</p>
                 <p className="text-muted-foreground text-sm">Check-ins</p>
              </div>
              <div className="text-center cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('visited')}>
                 <p className="text-3xl text-primary font-bold animate-count-up" style={{ animationDelay: '100ms' }}>{uniqueSpots}</p>
                 <p className="text-muted-foreground text-sm">Spots Visited</p>
              </div>
              <div className="text-center cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('reviews')}>
                 <p className="text-3xl text-primary font-bold animate-count-up" style={{ animationDelay: '200ms' }}>{totalRatings}</p>
                 <p className="text-muted-foreground text-sm">Ratings</p>
              </div>
              <div className="text-center cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('photos')}>
                 <p className="text-3xl text-primary font-bold animate-count-up" style={{ animationDelay: '300ms' }}>{totalPhotos}</p>
                 <p className="text-muted-foreground text-sm">Photos</p>
              </div>
           </div>

           {/* Tabs Navigation */}
          <div className="flex overflow-x-auto border-b border-border mb-6 scrollbar-hide">
            {['history', 'reviews', 'saved', 'photos', 'visited'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 text-sm uppercase tracking-wider transition-all border-b-2 flex-shrink-0 rounded-t-lg ${
                  activeTab === tab
                    ? 'border-primary text-primary font-bold bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                {tab === 'history' && 'Check-in History'}
                {tab === 'reviews' && 'Reviews'}
                {tab === 'saved' && 'Saved'}
                {tab === 'photos' && 'Photos'}
                {tab === 'visited' && 'Visited'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">

            {activeTab === 'history' && (
              <div className="glass-panel p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg text-foreground flex items-center gap-2 font-bold">
                    <MapPin className="w-5 h-5 text-accent" />
                    CHECK-IN HISTORY
                  </h2>
                  <span className="text-muted-foreground text-xs">{totalCheckIns} total</span>
                </div>

                {checkIns && checkIns.length > 0 ? (
                  <div className="space-y-3">
                    {checkIns.map((checkin: any) => (
                      <div
                        key={checkin.id}
                        className={`p-4 border rounded-xl transition-all ${
                          checkin.is_active
                            ? "border-accent bg-accent/10 shadow-[var(--shadow-hover)]"
                            : "border-border bg-muted/50 hover:border-accent/50 hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-foreground text-lg">{checkin.hotspots?.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <CategoryBadge category={checkin.hotspots?.category} />
                              <span className="text-muted-foreground text-xs">{checkin.hotspots?.address}</span>
                            </div>
                          </div>
                          {checkin.is_active && (
                            <span className="px-2 py-1 bg-accent/20 border border-accent text-accent text-xs font-bold animate-pulse rounded-full">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-muted-foreground text-xs">
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
              <div className="glass-panel p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl">
                 <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg text-foreground flex items-center gap-2 font-bold">
                    <Star className="w-5 h-5 text-primary" />
                    YOUR REVIEWS
                  </h2>
                  <span className="text-muted-foreground text-xs">{totalRatings} total</span>
                </div>

                {ratings && ratings.length > 0 ? (
                  <div className="space-y-4">
                    {ratings.map((rating: any) => (
                      <div
                        key={rating.id}
                        className="p-4 border border-border bg-muted/50 rounded-xl hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-foreground text-lg">{rating.hotspots?.name}</h3>
                            <CategoryBadge category={rating.hotspots?.category} className="mt-1" />
                          </div>
                          <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/30">
                            <Star className="w-4 h-4 text-primary fill-primary" />
                            <span className="text-primary font-bold">{rating.rating}</span>
                          </div>
                        </div>

                        {rating.review && (
                          <div className="p-3 bg-background/50 rounded-lg border-l-2 border-accent mb-3">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                              <p className="text-foreground italic">"{rating.review}"</p>
                            </div>
                          </div>
                        )}

                        <p className="text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-bold">No reviews yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'saved' && (
               <div className="glass-panel p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl">
                 <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl text-foreground flex items-center gap-2 font-bold">
                    <Heart className="w-6 h-6 text-secondary" />
                    SAVED HOTSPOTS
                  </h2>
                  <span className="text-muted-foreground text-xs">{saved.length} total</span>
                </div>

                {saved.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {saved.map((item: any) => (
                         <div key={item.id} className="group relative rounded-xl overflow-hidden border border-border bg-muted hover:border-accent/50 transition-all flex flex-col">
                            <div className="h-40 relative">
                               <Image src={item.hotspots?.image_url || "/placeholder.svg"} alt={item.hotspots?.name} fill className="object-cover" />
                               <div className="absolute top-2 right-2">
                                  <CategoryBadge category={item.hotspots?.category} />
                               </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                               <h3 className="font-bold text-foreground text-lg mb-1">{item.hotspots?.name}</h3>
                               <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {item.hotspots?.address}
                               </p>
                               <div className="mt-auto flex items-center justify-between gap-3">
                                  <Link href={`/dashboard?hotspot=${item.hotspots?.id}`} className="flex-1">
                                     <button className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors">
                                        VIEW DETAILS
                                     </button>
                                  </Link>
                                  <button
                                    onClick={() => handleRemoveSaved(item.id, item.hotspots?.id)}
                                    className="p-2 border border-secondary/50 text-secondary hover:bg-secondary/10 rounded-full transition-colors"
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
                </div>
                )}
               </div>
            )}

            {activeTab === 'visited' && (
              <div className="glass-panel p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg text-foreground flex items-center gap-2 font-bold">
                    <MapPin className="w-5 h-5 text-accent" />
                    SPOTS VISITED
                  </h2>
                  <span className="text-muted-foreground text-xs">{uniqueSpots} total</span>
                </div>

                {visitedHotspots.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {visitedHotspots.map((spot: any) => (
                      <Link key={spot.id} href={`/dashboard?hotspot=${spot.id}`} className="group block relative aspect-video rounded-xl overflow-hidden border border-border hover:border-accent transition-all">
                        <Image src={spot.image_url || "/placeholder.svg"} alt={spot.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-3 flex flex-col justify-end">
                          <h3 className="font-bold text-white text-sm truncate">{spot.name}</h3>
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
                    <p className="font-bold">No spots visited yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="glass-panel p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl">
                 <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg text-foreground flex items-center gap-2 font-bold">
                    <Camera className="w-5 h-5 text-accent" />
                    MY PHOTOS
                  </h2>
                  <span className="text-muted-foreground text-xs">{totalPhotos} total</span>
                </div>

                {userPhotos && userPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {userPhotos.map((photo: any) => (
                      <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group border border-border hover:border-accent transition-all hover:shadow-[var(--shadow-hover)]">
                        <Image
                          src={photo.thumbnail_url || photo.image_url}
                          alt="My upload"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <p className="text-xs text-white font-bold truncate">{photo.hotspots?.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Camera className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-bold">No photos yet</p>
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
