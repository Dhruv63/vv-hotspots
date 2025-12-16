"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import {
  User,
  MapPin,
  Calendar,
  Star,
  Share2,
  UserPlus,
  Users,
  MessageSquare,
  Instagram,
  Twitter,
  ArrowLeft,
  Check
} from "lucide-react"
import { toast } from "sonner"
import { Navbar } from "@/components/navbar"
import { CyberCard } from "@/components/ui/cyber-card"
import { CyberButton } from "@/components/ui/cyber-button"
import { CategoryBadge } from "@/components/ui/category-badge"
import { sendFriendRequest, acceptFriendRequest } from "@/app/actions/friends"
import { useRouter } from "next/navigation"

interface UserProfileClientProps {
  profile: any
  stats: {
    checkIns: number
    spotsVisited: number
    reviews: number
    friends: number
  }
  recentActivity: any[]
  topSpots: any[]
  reviews: any[]
  friendStatus: string
  mutualFriendsCount: number
  currentUser: any
  requestId: string | null
}

export function UserProfileClient({
  profile,
  stats,
  recentActivity,
  topSpots,
  reviews,
  friendStatus,
  mutualFriendsCount,
  currentUser,
  requestId
}: UserProfileClientProps) {
  const [activeTab, setActiveTab] = useState<'activity' | 'top_spots' | 'reviews'>('activity')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Profile link copied to clipboard!")
  }

  const handleAddFriend = async () => {
    if (!currentUser) {
       toast.error("Please login to add friends")
       return
    }
    setIsLoading(true)
    try {
       const res = await sendFriendRequest(profile.id)
       if (res.error) toast.error(res.error)
       else toast.success("Friend request sent!")
    } catch (e) {
       toast.error("Failed to send request")
    } finally {
       setIsLoading(false)
       router.refresh()
    }
  }

  const handleAcceptRequest = async () => {
     if (!requestId) return
     setIsLoading(true)
     try {
        const res = await acceptFriendRequest(requestId)
        if (res.error) toast.error(res.error)
        else toast.success("Friend request accepted!")
     } catch (e) {
        toast.error("Failed to accept request")
     } finally {
        setIsLoading(false)
        router.refresh()
     }
  }

  return (
    <div className="min-h-screen bg-cyber-black scanlines pointer-events-auto">
      <Navbar user={currentUser} />

      <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
        {/* Back button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-cyber-cyan hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-sm">Back to Map</span>
        </Link>

        {/* Profile Header */}
        <CyberCard className="p-6 mb-8 relative overflow-hidden">
          {/* Background decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-cyan/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="w-[150px] h-[150px] rounded-full overflow-hidden border-4 border-cyber-cyan shadow-[0_0_30px_rgba(0,255,255,0.3)] bg-cyber-dark">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.username || "User avatar"}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20">
                    <User className="w-20 h-20 text-cyber-cyan" />
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-mono text-3xl md:text-4xl font-bold text-cyber-light tracking-tight mb-2">
                    @{profile.username}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-cyber-cyan font-mono">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.city || 'Vasai-Virar'}</span>
                  </div>
                </div>

                <div className="flex gap-3 justify-center md:justify-start">
                  {currentUser && currentUser.id !== profile.id && (
                     <>
                        {friendStatus === 'none' && (
                           <CyberButton onClick={handleAddFriend} disabled={isLoading} variant="outline" size="sm" className="gap-2 border-lime-500 text-lime-500 hover:bg-lime-500/10 hover:text-lime-400">
                             <UserPlus className="w-4 h-4" />
                             Add Friend
                           </CyberButton>
                        )}
                        {friendStatus === 'sent' && (
                           <CyberButton disabled variant="outline" size="sm" className="gap-2 opacity-70 cursor-not-allowed">
                             <Check className="w-4 h-4" />
                             Request Sent
                           </CyberButton>
                        )}
                        {friendStatus === 'received' && (
                           <CyberButton onClick={handleAcceptRequest} disabled={isLoading} variant="cyan" size="sm" className="gap-2 bg-lime-500 text-black hover:bg-lime-400 border-none">
                             Accept Request
                           </CyberButton>
                        )}
                        {friendStatus === 'friends' && (
                           <CyberButton disabled variant="outline" size="sm" className="gap-2 border-cyber-cyan text-cyber-cyan opacity-100">
                             <Check className="w-4 h-4" />
                             Friends ✓
                           </CyberButton>
                        )}
                     </>
                  )}
                  <CyberButton onClick={handleShare} variant="ghost" size="sm" className="px-2">
                    <Share2 className="w-5 h-5" />
                  </CyberButton>
                </div>
              </div>

              {profile.bio && (
                <p className="text-[#CCCCCC] mb-6 max-w-2xl mx-auto md:mx-0 font-light italic">
                  "{profile.bio}"
                </p>
              )}

              <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-cyber-gray mb-6">
                <div className="flex items-center gap-2">
                   <Users className="w-4 h-4 text-cyber-cyan" />
                   <span className="text-cyber-cyan">{mutualFriendsCount} Mutual Friends</span>
                </div>
                <div className="flex gap-4">
                   {profile.instagram_username && (
                    <a
                      href={`https://instagram.com/${profile.instagram_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 hover:text-pink-400 hover:scale-110 transition-transform"
                    >
                      <Instagram className="w-6 h-6" />
                    </a>
                  )}
                  {profile.twitter_username && (
                    <a
                      href={`https://twitter.com/${profile.twitter_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 hover:scale-110 transition-transform"
                    >
                      <Twitter className="w-6 h-6" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CyberCard>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <CyberCard className="p-4 md:p-6 text-center hover:scale-105 transition-transform duration-300 group cursor-default">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-cyber-cyan/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-cyber-cyan/20 transition-colors">
               <MapPin className="w-5 h-5 md:w-6 md:h-6 text-cyber-cyan" />
            </div>
            <p className="font-mono text-2xl md:text-4xl font-bold text-cyber-light mb-1">{stats.checkIns}</p>
            <p className="text-cyber-gray font-mono text-[10px] md:text-xs uppercase tracking-widest">Check-ins</p>
          </CyberCard>

          <CyberCard className="p-4 md:p-6 text-center hover:scale-105 transition-transform duration-300 group cursor-default">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#E8FF00]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#E8FF00]/20 transition-colors">
               <Users className="w-5 h-5 md:w-6 md:h-6 text-[#E8FF00]" />
            </div>
            <p className="font-mono text-2xl md:text-4xl font-bold text-cyber-light mb-1">{stats.spotsVisited}</p>
            <p className="text-cyber-gray font-mono text-[10px] md:text-xs uppercase tracking-widest">Spots Visited</p>
          </CyberCard>

          <CyberCard className="p-4 md:p-6 text-center hover:scale-105 transition-transform duration-300 group cursor-default">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-pink-500/20 transition-colors">
               <Star className="w-5 h-5 md:w-6 md:h-6 text-pink-500" />
            </div>
            <p className="font-mono text-2xl md:text-4xl font-bold text-cyber-light mb-1">{stats.reviews}</p>
            <p className="text-cyber-gray font-mono text-[10px] md:text-xs uppercase tracking-widest">Reviews Given</p>
          </CyberCard>

          <CyberCard className="p-4 md:p-6 text-center hover:scale-105 transition-transform duration-300 group cursor-default">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-lime-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-lime-500/20 transition-colors">
               <Users className="w-5 h-5 md:w-6 md:h-6 text-lime-500" />
            </div>
            <p className="font-mono text-2xl md:text-4xl font-bold text-cyber-light mb-1">{stats.friends}</p>
            <p className="text-cyber-gray font-mono text-[10px] md:text-xs uppercase tracking-widest">Friends</p>
          </CyberCard>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex border-b border-cyber-gray/30 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-3 font-mono text-sm uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'activity'
                  ? 'border-[#FFFF00] text-[#FFFF00] font-bold bg-[#FFFF00]/5'
                  : 'border-transparent text-cyber-gray hover:text-cyber-light hover:border-cyber-gray'
              }`}
            >
              Recent Activity
            </button>
            <button
              onClick={() => setActiveTab('top_spots')}
              className={`px-6 py-3 font-mono text-sm uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'top_spots'
                  ? 'border-[#FFFF00] text-[#FFFF00] font-bold bg-[#FFFF00]/5'
                  : 'border-transparent text-cyber-gray hover:text-cyber-light hover:border-cyber-gray'
              }`}
            >
              Top Spots
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-mono text-sm uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-[#FFFF00] text-[#FFFF00] font-bold bg-[#FFFF00]/5'
                  : 'border-transparent text-cyber-gray hover:text-cyber-light hover:border-cyber-gray'
              }`}
            >
              Reviews
            </button>
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'activity' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {recentActivity.length > 0 ? (
                  recentActivity.map((checkin) => (
                    <CyberCard key={checkin.id} className="p-4 hover:border-cyber-cyan/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded bg-cyber-dark overflow-hidden flex-shrink-0 relative">
                             {checkin.hotspots?.image_url ? (
                               <Image src={checkin.hotspots.image_url} alt={checkin.hotspots.name} fill className="object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center bg-cyber-gray/20">
                                 <MapPin className="w-6 h-6 text-cyber-gray" />
                               </div>
                             )}
                          </div>
                          <div>
                            <h3 className="font-bold text-cyber-light text-lg">{checkin.hotspots?.name}</h3>
                            <div className="flex items-center gap-2 mb-1">
                              <CategoryBadge category={checkin.hotspots?.category} />
                              <span className="text-xs text-cyber-gray font-mono">{checkin.hotspots?.address}</span>
                            </div>
                            {checkin.note && (
                              <p className="text-sm text-[#CCCCCC] italic mt-1">"{checkin.note}"</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-cyber-gray font-mono block">
                            {formatDistanceToNow(new Date(checkin.checked_in_at), { addSuffix: true })}
                          </span>
                          {checkin.is_active && (
                             <span className="inline-block px-2 py-0.5 mt-2 bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan text-[10px] uppercase font-bold rounded animate-pulse">
                                Active
                             </span>
                          )}
                        </div>
                      </div>
                    </CyberCard>
                  ))
                ) : (
                  <div className="text-center py-12 border border-dashed border-cyber-gray/30 rounded-lg">
                    <p className="text-cyber-gray font-mono">No recent public activity</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'top_spots' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                 {topSpots.length > 0 ? (
                    topSpots.map((item, index) => (
                       <CyberCard key={item.hotspot.id} className="p-4 flex items-center gap-4">
                          <div className="text-2xl font-bold font-mono text-[#E8FF00] w-8 text-center">
                             #{index + 1}
                          </div>
                          <div className="w-16 h-16 rounded bg-cyber-dark overflow-hidden flex-shrink-0 relative">
                             {item.hotspot.image_url ? (
                               <Image src={item.hotspot.image_url} alt={item.hotspot.name} fill className="object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center bg-cyber-gray/20">
                                 <MapPin className="w-6 h-6 text-cyber-gray" />
                               </div>
                             )}
                          </div>
                          <div className="flex-1">
                             <h3 className="font-bold text-cyber-light text-lg">{item.hotspot.name}</h3>
                             <CategoryBadge category={item.hotspot.category} />
                          </div>
                          <div className="text-right">
                             <span className="block text-2xl font-bold text-cyber-light font-mono">{item.count}</span>
                             <span className="text-xs text-cyber-gray uppercase tracking-wider">Visits</span>
                          </div>
                       </CyberCard>
                    ))
                 ) : (
                    <div className="text-center py-12 border border-dashed border-cyber-gray/30 rounded-lg">
                      <p className="text-cyber-gray font-mono">No top spots yet</p>
                    </div>
                 )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                 {reviews.length > 0 ? (
                    reviews.map((rating) => (
                       <CyberCard key={rating.id} className="p-4">
                          <div className="flex justify-between items-start mb-3">
                             <div className="flex gap-3">
                                <div className="w-10 h-10 rounded bg-cyber-dark overflow-hidden flex-shrink-0 relative">
                                  {rating.hotspots?.image_url ? (
                                    <Image src={rating.hotspots.image_url} alt={rating.hotspots.name} fill className="object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-cyber-gray/20">
                                      <MapPin className="w-4 h-4 text-cyber-gray" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                   <h3 className="font-bold text-cyber-light">{rating.hotspots?.name}</h3>
                                   <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                         <Star
                                            key={i}
                                            className={`w-3 h-3 ${i < rating.rating ? 'text-[#FFFF00] fill-[#FFFF00]' : 'text-cyber-gray'}`}
                                         />
                                      ))}
                                   </div>
                                </div>
                             </div>
                             <span className="text-xs text-cyber-gray font-mono">
                                {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                             </span>
                          </div>
                          {rating.review && (
                             <div className="p-3 bg-cyber-black/30 rounded border-l-2 border-cyber-purple">
                                <p className="text-[#CCCCCC] text-sm italic">"{rating.review}"</p>
                             </div>
                          )}
                       </CyberCard>
                    ))
                 ) : (
                    <div className="text-center py-12 border border-dashed border-cyber-gray/30 rounded-lg">
                      <p className="text-cyber-gray font-mono">No reviews yet</p>
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
