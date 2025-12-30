"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { User, MapPin, Calendar, Star, ArrowLeft, Edit2, Camera, MessageSquare, Heart, Instagram, Twitter, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { CategoryBadge } from "@/components/ui/category-badge"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { ThemeSelector } from "@/app/(main)/settings/theme-selector"

interface ProfileMobileProps {
  user: SupabaseUser
  profile: any
  checkIns: any[]
  ratings: any[]
  userPhotos: any[]
  popularHotspots: any[]
  savedHotspots: any[]
}

export default function ProfileMobile({ user, profile: initialProfile, checkIns, ratings, userPhotos, popularHotspots, savedHotspots }: ProfileMobileProps) {
  const router = useRouter()
  const [profile, setProfile] = useState(initialProfile)
  const [activeTab, setActiveTab] = useState<'history' | 'reviews' | 'saved' | 'photos'>('history')
  const [saved, setSaved] = useState(savedHotspots)

  // Stats
  const totalCheckIns = checkIns?.length || 0
  const totalRatings = ratings?.length || 0
  const totalPhotos = userPhotos?.length || 0

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
    <div className="min-h-screen bg-background pb-20 pointer-events-auto">

      {/* Mobile Header: Centered Avatar & Username */}
      <div className="pt-8 pb-6 px-4 flex flex-col items-center justify-center bg-muted/20 relative border-b border-white/5">
         <Link href="/dashboard" className="absolute top-4 left-4 p-2 glass rounded-full text-muted-foreground hover:text-foreground">
             <ArrowLeft className="w-5 h-5" />
         </Link>

         <div className="relative mb-4">
             <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-accent via-primary to-accent bg-[length:200%_200%] animate-gradient-x shadow-lg">
                <div className="w-full h-full rounded-full overflow-hidden bg-background relative">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url || "/placeholder.svg"}
                      alt={profile.username || "User avatar"}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-accent/10">
                      <User className="w-10 h-10 text-accent" />
                    </div>
                  )}
                </div>
             </div>
             <Link
                href="/profile/edit"
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-background shadow-sm"
              >
                <Camera className="w-4 h-4 text-primary-foreground" />
              </Link>
         </div>

         <h1 className="text-2xl font-bold text-foreground mb-1">
             {profile?.username || user.email?.split("@")[0] || "Anonymous"}
         </h1>
         {profile?.city && (
            <div className="flex items-center gap-1.5 text-accent text-sm mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{profile.city}</span>
            </div>
         )}
         {profile?.bio && (
            <p className="text-muted-foreground text-sm italic text-center max-w-[80%] mb-4 line-clamp-2">{profile.bio}</p>
         )}

         {/* Full-width Edit Profile Button */}
         <Link href="/profile/edit" className="w-full max-w-xs">
            <button className="w-full py-3 bg-primary/10 border border-primary/20 text-primary font-semibold rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
               <Edit2 className="w-4 h-4" />
               Edit Profile
            </button>
         </Link>
      </div>

      {/* Horizontal Scroll Stats */}
      <div className="py-4 px-4 overflow-x-auto scrollbar-hide flex gap-4 border-b border-white/5 bg-background">
         <div className="flex-shrink-0 w-28 p-3 rounded-xl border border-white/5 bg-muted/20 flex flex-col items-center justify-center snap-center">
             <span className="text-2xl font-bold text-primary">{totalCheckIns}</span>
             <span className="text-xs text-muted-foreground">Check-ins</span>
         </div>
         <div className="flex-shrink-0 w-28 p-3 rounded-xl border border-white/5 bg-muted/20 flex flex-col items-center justify-center snap-center">
             <span className="text-2xl font-bold text-primary">{totalRatings}</span>
             <span className="text-xs text-muted-foreground">Reviews</span>
         </div>
         <div className="flex-shrink-0 w-28 p-3 rounded-xl border border-white/5 bg-muted/20 flex flex-col items-center justify-center snap-center">
             <span className="text-2xl font-bold text-primary">{totalPhotos}</span>
             <span className="text-xs text-muted-foreground">Photos</span>
         </div>
         <div className="flex-shrink-0 w-28 p-3 rounded-xl border border-white/5 bg-muted/20 flex flex-col items-center justify-center snap-center">
             <span className="text-2xl font-bold text-primary">{saved.length}</span>
             <span className="text-xs text-muted-foreground">Saved</span>
         </div>
      </div>

      {/* Theme Selector - Horizontal Scroll */}
      <div className="py-6 px-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Theme</h3>
          <div className="overflow-x-visible">
              <ThemeSelector />
          </div>
      </div>

      {/* Content Tabs */}
      <div className="px-4">
         <div className="flex items-center gap-4 border-b border-white/10 mb-4 overflow-x-auto scrollbar-hide">
            {['history', 'reviews', 'saved', 'photos'].map((tab) => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-3 pt-2 text-sm font-medium transition-colors whitespace-nowrap ${
                     activeTab === tab
                     ? 'text-primary border-b-2 border-primary'
                     : 'text-muted-foreground'
                  }`}
               >
                  {tab === 'history' && 'Check-ins'}
                  {tab === 'reviews' && 'Reviews'}
                  {tab === 'saved' && 'Saved'}
                  {tab === 'photos' && 'Photos'}
               </button>
            ))}
         </div>

         <div className="pb-10 min-h-[300px]">
            {activeTab === 'history' && (
               <div className="space-y-3">
                  {checkIns && checkIns.length > 0 ? (
                    checkIns.map((checkin: any) => (
                      <div key={checkin.id} className="flex gap-4 p-3 rounded-xl bg-muted/30 border border-white/5">
                         <div className="flex-1">
                            <h4 className="font-bold text-foreground text-sm">{checkin.hotspots?.name}</h4>
                            <p className="text-xs text-muted-foreground mb-1">{checkin.hotspots?.address}</p>
                            <div className="flex items-center gap-2">
                               <CategoryBadge category={checkin.hotspots?.category} className="text-[10px] px-1.5 py-0.5" />
                               <span className="text-[10px] text-muted-foreground/60">{formatDistanceToNow(new Date(checkin.checked_in_at), { addSuffix: true })}</span>
                            </div>
                         </div>
                         {checkin.is_active && (
                            <div className="flex-shrink-0">
                               <span className="w-2 h-2 rounded-full bg-accent animate-pulse block" />
                            </div>
                         )}
                      </div>
                    ))
                  ) : (
                     <div className="text-center py-8 text-muted-foreground text-sm">No check-ins yet.</div>
                  )}
               </div>
            )}

            {activeTab === 'reviews' && (
               <div className="space-y-3">
                  {ratings && ratings.length > 0 ? (
                     ratings.map((rating: any) => (
                        <div key={rating.id} className="p-4 rounded-xl bg-muted/30 border border-white/5">
                           <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-sm">{rating.hotspots?.name}</h4>
                              <div className="flex items-center gap-1 text-primary text-xs font-bold">
                                 <Star className="w-3 h-3 fill-primary" />
                                 {rating.rating}
                              </div>
                           </div>
                           {rating.review && (
                              <p className="text-sm text-muted-foreground italic bg-background/50 p-2 rounded-lg border-l-2 border-accent mb-2">"{rating.review}"</p>
                           )}
                           <p className="text-[10px] text-muted-foreground text-right">{formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}</p>
                        </div>
                     ))
                  ) : (
                     <div className="text-center py-8 text-muted-foreground text-sm">No reviews yet.</div>
                  )}
               </div>
            )}

            {activeTab === 'saved' && (
               <div className="space-y-3">
                  {saved && saved.length > 0 ? (
                     saved.map((item: any) => (
                        <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-muted/30 border border-white/5 relative overflow-hidden">
                           <div className="w-20 h-20 flex-shrink-0 relative rounded-lg overflow-hidden bg-muted">
                              <Image src={item.hotspots?.image_url || "/placeholder.svg"} alt={item.hotspots?.name} fill className="object-cover" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                 <h4 className="font-bold text-sm truncate pr-6">{item.hotspots?.name}</h4>
                                 <button onClick={() => handleRemoveSaved(item.id, item.hotspots?.id)} className="text-muted-foreground hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                              <p className="text-xs text-muted-foreground truncate mb-2">{item.hotspots?.address}</p>
                              <Link href={`/dashboard?hotspot=${item.hotspots?.id}`}>
                                 <button className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-md font-medium w-full">View</button>
                              </Link>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="text-center py-8 text-muted-foreground text-sm">No saved spots.</div>
                  )}
               </div>
            )}

            {activeTab === 'photos' && (
               <div className="grid grid-cols-3 gap-2">
                  {userPhotos && userPhotos.length > 0 ? (
                     userPhotos.map((photo: any) => (
                        <div key={photo.id} className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                           <Image src={photo.thumbnail_url || photo.image_url} alt="User photo" fill className="object-cover" />
                        </div>
                     ))
                  ) : (
                     <div className="col-span-3 text-center py-8 text-muted-foreground text-sm">No photos uploaded.</div>
                  )}
               </div>
            )}
         </div>
      </div>
    </div>
  )
}
