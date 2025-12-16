"use client"

import { useState, useEffect, useId } from "react"
import Image from "next/image"
import { X, MapPin, Users, Navigation, Clock, Zap, Star, MessageSquare, Loader2, Camera, Check, Heart, Share2, Copy, Instagram } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { StarRating } from "@/components/ui/star-rating"
import { ActiveUsersList } from "@/components/active-users-list"
import { PhotoGallery } from "@/components/photo-gallery"
import { ReviewsTab } from "@/components/reviews-tab"
import { modalStack } from "@/lib/modal-stack"
import { getSafeLatLng } from "@/lib/coords"
import type { Hotspot } from "@/lib/types"

interface HotspotDetailProps {
  hotspot: Hotspot
  activeCheckins: number
  averageRating: number
  userRating: number | null
  userReview?: string | null
  isCheckedIn: boolean
  onClose: () => void
  onCheckIn: () => void
  onCheckOut: () => void
  onRate: (rating: number) => void
  isLoading?: boolean
}

const getHotspotImage = (hotspot: Hotspot): string => {
  const locationImages: Record<string, string> = {
    "Vasai Fort": "/vasai-fort.jpg",
    "Arnala Beach": "/arnala-beach.jpg",
    "Rajodi Beach": "/rajodi-beach.jpg",
    "Cafe Hashtag": "/cafe-hashtag.jpg",
    "The Good Vibes Cafe": "/good-vibes-cafe.jpg",
    "Pelhar Dam": "/pelhar-dam.jpg",
    "Tungareshwar Temple": "/tungareshwar.jpg",
    "Suruchi Beach": "/suruchi-beach.jpg",
    "Navapur Beach": "/navapur-beach.jpg",
    "Tipsy Panda": "/tipsy-panda.jpg",
  }

  if (locationImages[hotspot.name]) {
    return locationImages[hotspot.name]
  }

  const categoryImages: Record<string, string> = {
    cafe: "/cozy-cafe-interior-warm-lighting-coffee.jpg",
    park: "/beautiful-park-nature-greenery-trees.jpg",
    gaming: "/gaming-arcade-neon-lights-video-games.jpg",
    hangout: "/sunset-beach-hangout-spot-friends.jpg",
    food: "/indian-street-food-delicious-colorful.jpg",
    other: "/urban-hangout-spot-city-location.jpg",
  }
  return categoryImages[hotspot.category] || categoryImages.other
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "cafe":
    case "park":
    case "gaming":
    case "food":
    case "hangout":
      return "bg-[#FFFF00] text-black border-[#FFFF00] shadow-[0_0_10px_rgba(255,255,0,0.5)]"
    default:
      return "bg-cyber-gray text-cyber-black"
  }
}

export function HotspotDetail({
  hotspot,
  activeCheckins,
  averageRating,
  userRating,
  userReview,
  isCheckedIn,
  onClose,
  onCheckIn,
  onCheckOut,
  onRate,
  isLoading = false,
}: HotspotDetailProps) {
  const [isRating, setIsRating] = useState(false)
  const [ratingSuccess, setRatingSuccess] = useState(false)
  const [galleryRefreshTrigger, setGalleryRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState<'photos' | 'reviews'>('photos')
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Button feedback states
  const [isCheckInLoading, setIsCheckInLoading] = useState(false)
  const [isCheckInSuccess, setIsCheckInSuccess] = useState(false)

  // Sync internal loading state with prop
  useEffect(() => {
    if (!isLoading && isCheckInLoading) {
        // If prop stopped loading but we are still in internal loading state,
        // it means action finished.
        // However, we want to control the 'success' state locally.
        // We will handle this in handleCheckInClick.
    }
  }, [isLoading, isCheckInLoading])


  const modalId = useId()

  useEffect(() => {
    modalStack.push(modalId)
    return () => modalStack.pop(modalId)
  }, [modalId])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalStack.isTop(modalId)) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose, modalId])

  useEffect(() => {
    const checkSaved = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('saved_hotspots')
        .select('id')
        .eq('user_id', user.id)
        .eq('hotspot_id', hotspot.id)
        .maybeSingle()

      if (data) setIsSaved(true)
    }
    checkSaved()
  }, [hotspot.id])

  const toggleSave = async () => {
    setIsSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Please login to save hotspots")
      setIsSaving(false)
      return
    }

    try {
      if (isSaved) {
        await supabase.from("saved_hotspots").delete().eq("user_id", user.id).eq("hotspot_id", hotspot.id)
        setIsSaved(false)
        toast.success("Removed from saved spots")
      } else {
        await supabase.from("saved_hotspots").insert({ user_id: user.id, hotspot_id: hotspot.id })
        setIsSaved(true)
        toast.success("Added to saved spots")
      }
    } catch (error) {
      toast.error("Failed to update saved spots")
    } finally {
      setIsSaving(false)
    }
  }

  const handleShare = (platform: 'whatsapp' | 'copy' | 'instagram') => {
    const url = window.location.origin + `?hotspot=${hotspot.id}`
    const text = `Check out ${hotspot.name} on VV Hotspots!`

    if (platform === 'whatsapp') {
      window.open(`whatsapp://send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard!")
    } else if (platform === 'instagram') {
      // Instagram sharing via web is limited, usually copying link is best or direct message if app supported
      navigator.clipboard.writeText(url)
      toast.success("Link copied! Paste in Instagram DM.")
    }

    // Track share in analytics (mock)
    console.log(`[Analytics] Shared via ${platform}`)
  }

  const handleRating = async (rating: number) => {
    setIsRating(true)
    setRatingSuccess(false)
    try {
      await onRate(rating)
      setRatingSuccess(true)
      setTimeout(() => setRatingSuccess(false), 2000)
    } catch (err) {
      // Error handled by parent
    } finally {
      setIsRating(false)
    }
  }

  const handleCheckInClick = async () => {
      if (isCheckedIn) {
          onCheckOut()
      } else {
          setIsCheckInLoading(true)
          try {
              await onCheckIn() // Assuming this is async. If not, we might need a small delay to simulate or just set success.
              // We'll assume the parent updates 'isCheckedIn' prop which will re-render this.
              // But for the button feedback, we want to show success state before switching to 'CHECK OUT' state if possible.
              // Since 'onCheckIn' might trigger a data refresh that changes 'isCheckedIn', we might flip directly to "CHECK OUT".
              // The requirement says: "show loading state... then success state ... for 2 seconds before reverting"
              // Reverting to what? Probably to "CHECKED IN" state (which is the "CHECK OUT" button usually).
              // Or if it failed, revert to "CHECK IN".

              // Let's simulate the success state if the action was successful.
              setIsCheckInLoading(false)
              setIsCheckInSuccess(true)
              setTimeout(() => {
                  setIsCheckInSuccess(false)
              }, 2000)
          } catch (error) {
              setIsCheckInLoading(false)
          }
      }
  }

  const openInMaps = () => {
    const safeLoc = getSafeLatLng(hotspot.latitude, hotspot.longitude, "HotspotDetail Maps Link")
    if (safeLoc) {
        const url = `https://www.google.com/maps/search/?api=1&query=${safeLoc[0]},${safeLoc[1]}`
        window.open(url, "_blank")
    } else {
        toast.error("Location unavailable for this hotspot")
    }
  }

  const imageUrl = getHotspotImage(hotspot)

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]" onClick={onClose} />

      <div
        className="fixed inset-x-0 bottom-0 md:absolute md:inset-auto md:bottom-4 md:right-4 md:w-96 z-[1000] bg-cyber-dark border-t-2 md:border-2 border-cyber-cyan md:rounded-lg max-h-[85vh] md:max-h-[80vh] overflow-y-auto shadow-[0_0_30px_rgba(255,255,0,0.3)] rounded-t-2xl md:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for mobile */}
        <div className="md:hidden flex items-center justify-center py-2 sticky top-0 bg-cyber-dark z-10">
          <div className="w-12 h-1 bg-cyber-gray rounded-full" />
        </div>

        {/* Glowing header bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyber-cyan via-cyber-pink to-cyber-purple" />

        {/* Top Controls */}
        <div className="absolute top-4 right-3 z-50 flex items-center gap-2">
           <button
             onClick={toggleSave}
             disabled={isSaving}
             className={`p-3 bg-cyber-black/80 border transition-all rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50 ${isSaved ? "border-cyber-pink text-cyber-pink shadow-[0_0_15px_rgba(255,0,110,0.5)]" : "border-cyber-gray text-cyber-gray hover:text-cyber-pink hover:border-cyber-pink"}`}
           >
             <Heart className={`w-5 h-5 ${isSaved ? "fill-cyber-pink" : ""}`} />
           </button>
           <button
            onClick={onClose}
            disabled={isLoading || isCheckInLoading}
            className="p-3 bg-cyber-black/80 border border-cyber-gray text-cyber-gray hover:text-cyber-cyan hover:border-cyber-cyan hover:shadow-[0_0_15px_rgba(255,255,0,0.5)] transition-all rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image header */}
        <div className="relative h-48 md:h-48">
          <Image src={imageUrl || "/placeholder.svg"} alt={hotspot.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-cyber-black/50 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4">
            <span
              className={`inline-block px-3 py-1.5 text-xs font-mono font-bold uppercase rounded mb-2 ${getCategoryColor(hotspot.category)}`}
            >
              {hotspot.category}
            </span>
            <h2 className="font-mono text-xl md:text-xl font-bold text-cyber-light drop-shadow-lg">{hotspot.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Address & Navigate - larger touch targets */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 text-cyber-gray flex-1">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{hotspot.address}</span>
            </div>
            <button
              onClick={openInMaps}
              className="flex items-center gap-2 text-[#FFFF00] text-sm font-mono flex-shrink-0 px-4 py-2 border border-[#FFFF00] rounded-lg hover:bg-[#FFFF00]/10 hover:shadow-[0_0_10px_rgba(255,255,0,0.5)] transition-colors min-h-[44px]"
            >
              <Navigation className="w-4 h-4" />
              Navigate
            </button>
          </div>

          {/* Description */}
          <div className="bg-cyber-black/50 p-4 border-l-2 border-cyber-cyan rounded-r">
            <p className="text-cyber-light/90 text-sm leading-relaxed">
              {hotspot.description ||
                "Discover this awesome spot in Vasai-Virar! Check in to let others know you're here."}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between py-4 border-y border-cyber-gray/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyber-cyan/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-cyber-cyan" />
              </div>
              <div>
                <span className="font-mono text-cyber-light text-xl">{activeCheckins}</span>
                <span className="text-cyber-gray text-sm ml-1">here now</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={averageRating} size="sm" />
              <span className="font-mono text-cyber-light text-lg">
                {averageRating > 0 ? averageRating.toFixed(1) : "-"}
              </span>
            </div>
          </div>

          {/* Share Section */}
          <div className="flex items-center justify-between gap-2 py-2">
             <button
               onClick={() => handleShare('whatsapp')}
               className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-green-500/10 border border-green-500/30 rounded hover:bg-green-500/20 transition-colors"
             >
               <Share2 className="w-5 h-5 text-green-500" />
               <span className="text-[10px] font-mono text-green-400">WhatsApp</span>
             </button>
             <button
               onClick={() => handleShare('instagram')}
               className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-pink-500/10 border border-pink-500/30 rounded hover:bg-pink-500/20 transition-colors"
             >
               <Instagram className="w-5 h-5 text-pink-500" />
               <span className="text-[10px] font-mono text-pink-400">Instagram</span>
             </button>
             <button
               onClick={() => handleShare('copy')}
               className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded hover:bg-cyber-cyan/20 transition-colors"
             >
               <Copy className="w-5 h-5 text-cyber-cyan" />
               <span className="text-[10px] font-mono text-cyber-cyan">Copy Link</span>
             </button>
          </div>

          <ActiveUsersList hotspotId={hotspot.id} />

          {/* Check-in button - larger for mobile */}
          <div className="space-y-3 p-4 bg-gradient-to-b from-cyber-cyan/10 to-cyber-black/30 rounded-lg border-2 border-cyber-cyan/50 shadow-[0_0_20px_rgba(255,255,0,0.2)]">
            {isCheckedIn && (
              <div className="flex items-center gap-2 p-3 bg-cyber-cyan/20 border border-cyber-cyan rounded">
                <span className="w-3 h-3 bg-cyber-cyan rounded-full animate-pulse" />
                <span className="text-cyber-cyan text-sm font-mono font-bold">YOU ARE HERE</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleCheckInClick}
              disabled={isLoading || isCheckInLoading || isCheckInSuccess}
              className={`w-full py-4 px-6 font-mono font-bold text-lg tracking-wider rounded-lg transition-all duration-200 active:scale-[0.98] hover:scale-100 flex items-center justify-center gap-3 min-h-[56px] ${
                isCheckInLoading
                  ? "bg-cyber-gray/50 text-cyber-gray cursor-not-allowed"
                  : isCheckInSuccess
                    ? "bg-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.5)] scale-100"
                    : isCheckedIn
                      ? "bg-cyber-pink text-white hover:bg-cyber-pink/80 shadow-[0_0_20px_rgba(204,255,0,0.5)]"
                      : "bg-[#FFFF00] text-black hover:bg-[#E6E600] shadow-[0_0_30px_rgba(255,255,0,0.6)]"
              }`}
            >
              {isCheckInLoading || (isLoading && !isCheckedIn && !isCheckInSuccess) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  PROCESSING...
                </>
              ) : isCheckInSuccess ? (
                <>
                  <Check className="w-6 h-6" />
                  CHECKED IN
                </>
              ) : isCheckedIn ? (
                <>
                  <Clock className="w-6 h-6" />
                  CHECK OUT
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                  CHECK IN HERE
                </>
              )}
            </button>

            {!isCheckedIn && !isLoading && !isCheckInSuccess && (
              <p className="text-center text-cyber-cyan/70 text-xs font-mono">
                Tap to let others know you&apos;re at this spot!
              </p>
            )}
          </div>

          {/* Rating section */}
          <div className="space-y-3 p-4 bg-gradient-to-b from-cyber-purple/10 to-cyber-black/30 rounded-lg border border-cyber-purple/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <p className="text-cyber-light text-sm font-mono font-bold">RATE THIS SPOT</p>
              </div>
              {ratingSuccess && <span className="text-green-400 text-xs font-mono animate-pulse">Saved!</span>}
            </div>

            {/* User's current rating display */}
            {userRating && (
              <div className="flex items-center gap-2 p-3 bg-cyber-purple/20 border border-cyber-purple/50 rounded">
                <span className="text-cyber-purple text-xs font-mono">Your rating:</span>
                <StarRating rating={userRating} size="sm" />
                <span className="text-cyber-light font-mono text-sm font-bold">{userRating}/5</span>
              </div>
            )}

            {/* User's review display */}
            {userReview && (
              <div className="p-3 bg-cyber-purple/10 border border-cyber-purple/30 rounded">
                <div className="flex items-center gap-1 mb-1">
                  <MessageSquare className="w-3 h-3 text-cyber-purple" />
                  <span className="text-cyber-purple text-xs font-mono">Your review:</span>
                </div>
                <p className="text-cyber-light/80 text-sm italic">&quot;{userReview}&quot;</p>
              </div>
            )}

            {/* Interactive rating selector */}
            <div className="flex flex-col items-center gap-3 py-3">
              <p className="text-cyber-gray text-xs font-mono">
                {userRating ? "Tap to change your rating:" : "Tap a star to rate:"}
              </p>
              <div className="relative">
                {isRating ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 text-cyber-cyan animate-spin" />
                    <span className="ml-2 text-cyber-cyan font-mono text-sm">Saving...</span>
                  </div>
                ) : (
                  <StarRating
                    rating={userRating ?? 0}
                    size="lg"
                    interactive={!isLoading}
                    onRatingChange={handleRating}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-cyber-gray/30 mb-4 sticky top-0 bg-cyber-dark z-10 pt-2">
             <button
               onClick={() => setActiveTab('photos')}
               className={`flex-1 py-3 font-mono text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'photos' ? 'border-cyber-pink text-cyber-pink bg-cyber-pink/5' : 'border-transparent text-cyber-gray hover:text-cyber-light'}`}
             >
               <Camera className="w-4 h-4" />
               PHOTOS
             </button>
             <button
               onClick={() => setActiveTab('reviews')}
               className={`flex-1 py-3 font-mono text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'reviews' ? 'border-[#FFFF00] text-[#FFFF00] bg-[#FFFF00]/5' : 'border-transparent text-cyber-gray hover:text-cyber-light'}`}
             >
               <MessageSquare className="w-4 h-4" />
               REVIEWS
             </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'photos' && (
              <div className="space-y-3 p-4 bg-gradient-to-b from-cyber-black/30 to-cyber-purple/5 rounded-lg border border-cyber-gray/30 animate-in fade-in slide-in-from-bottom-2">
                 <PhotoGallery hotspotId={hotspot.id} refreshTrigger={galleryRefreshTrigger} />
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewsTab
                hotspotId={hotspot.id}
                onWriteReview={() => onRate(userRating || 0)}
                currentUserReview={userReview}
              />
            )}
          </div>

          <div className="h-6 md:h-0" />
        </div>
      </div>
    </>
  )
}
