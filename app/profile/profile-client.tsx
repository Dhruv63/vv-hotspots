"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { User, MapPin, Calendar, Star, ArrowLeft, Edit2, Camera, X, MessageSquare, Heart, Instagram, Twitter, Upload, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
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
  userPhotos: any[]
  popularHotspots: any[]
}

export function ProfileClient({ user, profile: initialProfile, checkIns, ratings, userPhotos, popularHotspots }: ProfileClientProps) {
  const router = useRouter()
  const [profile, setProfile] = useState(initialProfile)
  const [activeTab, setActiveTab] = useState<'history' | 'reviews' | 'saved' | 'photos'>('history')

  // Stats
  const totalCheckIns = checkIns?.length || 0
  const totalRatings = ratings?.length || 0
  const totalPhotos = userPhotos?.length || 0
  const uniqueSpots = new Set(checkIns?.map((c: any) => c.hotspots?.id)).size
  const avgRating =
    ratings?.length > 0
      ? (ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / ratings.length).toFixed(1)
      : null


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
              <Link
                href="/profile/edit"
                className="absolute bottom-0 right-0 w-8 h-8 bg-cyber-purple rounded-full flex items-center justify-center border-2 border-cyber-black hover:scale-110 transition-transform shadow-[0_0_10px_rgba(255,215,0,0.5)]"
              >
                <Camera className="w-4 h-4 text-white" />
              </Link>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <h1 className="font-mono text-2xl sm:text-3xl font-bold text-cyber-light">
                  {profile?.username || user.email?.split("@")[0] || "Anonymous"}
                </h1>
                <Link
                  href="/profile/edit"
                  className="inline-flex items-center gap-1 text-[#FFFF00] hover:text-cyber-light transition-colors text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Link>
              </div>
              <p className="text-[#CCCCCC] text-sm mb-4">{user.email}</p>

              <div className="flex flex-col gap-2 mb-4">
                {profile?.city && (
                  <div className="flex items-center gap-2 text-cyber-cyan text-sm font-mono">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.city}</span>
                  </div>
                )}
                {profile?.bio && (
                  <p className="text-[#CCCCCC] text-sm italic max-w-lg">{profile.bio}</p>
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
                  <div className="text-center py-12 text-cyber-gray">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-mono">No check-ins yet</p>
                    <Link href="/dashboard">
                      <CyberButton variant="cyan" size="sm" className="mt-4">
                        Explore Hotspots
                      </CyberButton>
                    </Link>
                  </div>
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
                  <div className="text-center py-12 text-cyber-gray">
                    <Star className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-mono">No reviews yet</p>
                    <p className="text-sm">Rate hotspots to keep track of your favorites!</p>
                  </div>
                )}
              </CyberCard>
            )}

            {activeTab === 'saved' && (
               <CyberCard className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                 <div className="flex items-center justify-between mb-6">
                  <h2 className="font-mono text-xl text-cyber-light flex items-center gap-2 font-bold">
                    <Heart className="w-6 h-6 text-cyber-pink" />
                    SAVED HOTSPOTS
                  </h2>
                </div>
                <div className="text-center py-8">
                    <Heart className="w-16 h-16 mx-auto mb-6 text-cyber-gray/30" />
                    <p className="font-mono text-xl text-cyber-light mb-2">No saved hotspots yet</p>
                    <p className="text-cyber-gray mb-8 max-w-md mx-auto">Save your favorite spots for quick access and get notified about new events.</p>
                    <Link href="/dashboard">
                      <button className="px-8 py-4 bg-[#E8FF00] text-black font-mono font-bold text-lg rounded-lg hover:bg-[#D4E600] shadow-[0_0_20px_rgba(232,255,0,0.4)] transition-all active:scale-95 flex items-center gap-3 mx-auto">
                        <MapPin className="w-5 h-5" />
                        BROWSE HOTSPOTS
                      </button>
                    </Link>

                    {/* Popular Spots Preview */}
                    <div className="mt-12 text-left">
                       <p className="text-cyber-gray text-xs font-mono mb-4 uppercase tracking-widest">Popular right now</p>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {popularHotspots.slice(0, 3).map((spot: any) => (
                             <div key={spot.id} className="group relative rounded-lg overflow-hidden border border-cyber-gray/30 bg-cyber-dark hover:border-cyber-cyan/50 transition-all">
                                <div className="h-32 relative">
                                   <Image src={spot.image_url || "/placeholder.svg"} alt={spot.name} fill className="object-cover" />
                                   <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent opacity-80" />
                                   <div className="absolute top-2 right-2">
                                      <CategoryBadge category={spot.category} />
                                   </div>
                                </div>
                                <div className="p-3">
                                   <h3 className="font-bold text-cyber-light truncate">{spot.name}</h3>
                                   <p className="text-xs text-cyber-gray truncate mb-3">{spot.address}</p>
                                   <button
                                      onClick={() => toast.success(`Saved ${spot.name} to favorites!`)}
                                      className="w-full py-2 bg-cyber-gray/20 hover:bg-cyber-pink/20 text-cyber-pink text-xs font-mono font-bold rounded border border-cyber-gray/30 hover:border-cyber-pink transition-colors flex items-center justify-center gap-2"
                                   >
                                      <Heart className="w-3 h-3" />
                                      SAVE THIS
                                   </button>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
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
                  <div className="space-y-8">
                     {/* Drag & Drop Area */}
                     <div
                        className="border-2 border-dashed border-cyber-gray/40 rounded-xl p-12 text-center hover:border-cyber-cyan/60 hover:bg-cyber-cyan/5 transition-all cursor-pointer group"
                        onClick={() => toast("Please go to a hotspot on the map to upload photos.")}
                     >
                        <div className="w-16 h-16 rounded-full bg-cyber-gray/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                           <Upload className="w-8 h-8 text-cyber-gray group-hover:text-cyber-cyan transition-colors" />
                        </div>
                        <h3 className="font-mono text-lg text-cyber-light font-bold mb-2">Drag photos here or click to upload</h3>
                        <p className="text-cyber-gray text-sm">Share your best moments with the community</p>
                     </div>

                     {/* Inspiration */}
                     <div>
                        <p className="text-cyber-gray text-xs font-mono mb-4 uppercase tracking-widest">Inspiration from others</p>
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
              </CyberCard>
            )}
          </div>
        </div>
      </main>

    </div>
  )
}
