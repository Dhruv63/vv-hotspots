"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { WifiOff, RefreshCw, AlertTriangle, Clock, List } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { HotspotList } from "@/components/hotspot-list"
import { ActivityFeed } from "@/components/activity-feed"
import { UnifiedMenuDrawer } from "@/components/unified-menu-drawer"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { CheckInModal } from "@/components/check-in-modal"
import { RateReviewModal } from "@/components/rate-review-modal"
import { BottomNav } from "@/components/bottom-nav"
import { MobileSearchBar } from "@/components/mobile-search-bar"
import { sanitizeInput, checkRateLimit } from "@/lib/security"
import { useAppContext } from "@/context/app-context"
import type { Hotspot, ActivityFeedItem } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

const HotspotDetail = dynamic(() => import("@/components/hotspot-detail").then((mod) => mod.HotspotDetail), {
  loading: () => null,
})

interface DashboardClientProps {
  user: User
  hotspots: Hotspot[]
  activeCheckins: Record<string, number>
  averageRatings: Record<string, number>
  activityFeed: ActivityFeedItem[]
  userCurrentCheckin: string | null
  userRatings: Record<string, number>
  userReviews: Record<string, string>
  savedHotspotIds: string[]
  todayCheckinCount: number
  initError?: string | null
  friendIds: string[]
  friendVisitedHotspotIds: string[]
}

export function DashboardClient({
  user,
  hotspots,
  activeCheckins: initialActiveCheckins,
  averageRatings: initialAverageRatings,
  activityFeed: initialActivityFeed,
  userCurrentCheckin: initialUserCheckin,
  userRatings: initialUserRatings,
  userReviews: initialUserReviews,
  savedHotspotIds,
  todayCheckinCount,
  initError,
  friendIds,
  friendVisitedHotspotIds
}: DashboardClientProps) {
  const router = useRouter()
  // Use Context
  const {
      selectedHotspot,
      setSelectedHotspot,
      viewMode,
      setViewMode,
      userLocation,
      filterCategories, setFilterCategories,
      searchTerm, setSearchTerm,
      showFriendsOnly, setShowFriendsOnly,
      setFriendVisitedHotspotIds,
      isCheckInModalOpen, setIsCheckInModalOpen,
      isRateModalOpen, setIsRateModalOpen,
      actionHotspot, setActionHotspot
  } = useAppContext()

  // Sync friendVisitedHotspotIds to Context
  useEffect(() => {
      setFriendVisitedHotspotIds(friendVisitedHotspotIds)
  }, [friendVisitedHotspotIds, setFriendVisitedHotspotIds])

  const [localSavedIds, setLocalSavedIds] = useState<Set<string>>(new Set(savedHotspotIds))

  useEffect(() => {
    setLocalSavedIds(new Set(savedHotspotIds))
  }, [savedHotspotIds])

  const handleToggleSave = useCallback(async (hotspotId: string) => {
    const isSaved = localSavedIds.has(hotspotId)
    setLocalSavedIds(prev => {
      const next = new Set(prev)
      if (isSaved) next.delete(hotspotId)
      else next.add(hotspotId)
      return next
    })

    const supabase = createClient()
    try {
      if (isSaved) {
        await supabase.from("saved_hotspots").delete().eq("user_id", user.id).eq("hotspot_id", hotspotId)
        showMessage("success", "Removed from saved")
      } else {
        await supabase.from("saved_hotspots").insert({ user_id: user.id, hotspot_id: hotspotId })
        showMessage("success", "Hotspot saved")
      }
      router.refresh()
    } catch (err) {
      showMessage("error", "Failed to update saved status")
      setLocalSavedIds(prev => {
        const next = new Set(prev)
        if (isSaved) next.add(hotspotId)
        else next.delete(hotspotId)
        return next
      })
    }
  }, [user.id, localSavedIds, router])

  // New State for Unified Menu
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(initError || null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const [processingAction, setProcessingAction] = useState<string | null>(null)
  const [rateLimitCooldown, setRateLimitCooldown] = useState<number>(0)

  const [activeCheckins, setActiveCheckins] = useState(initialActiveCheckins)
  const [averageRatings, setAverageRatings] = useState(initialAverageRatings)
  const [userCurrentCheckin, setUserCurrentCheckin] = useState(initialUserCheckin)
  const [userRatings, setUserRatings] = useState(initialUserRatings)
  const [userReviews, setUserReviews] = useState(initialUserReviews)
  const [isMobile, setIsMobile] = useState(false)

  // handleViewChange via Context
  const handleViewChange = useCallback((newView: string) => {
      setViewMode(newView)
  }, [setViewMode])

  // Sync state with props
  useEffect(() => { setActiveCheckins(initialActiveCheckins) }, [initialActiveCheckins])
  useEffect(() => { setAverageRatings(initialAverageRatings) }, [initialAverageRatings])
  useEffect(() => { setUserCurrentCheckin(initialUserCheckin) }, [initialUserCheckin])
  useEffect(() => { setUserRatings(initialUserRatings) }, [initialUserRatings])
  useEffect(() => { setUserReviews(initialUserReviews) }, [initialUserReviews])

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    setIsOffline(!navigator.onLine)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    const checkMobile = () => {
        setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (rateLimitCooldown > 0) {
      const timer = setInterval(() => {
        setRateLimitCooldown((prev) => Math.max(0, prev - 1000))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [rateLimitCooldown])

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient()
    const handleCheckInChange = async (payload: any) => {
      const hotspotIds = new Set<string>()
      if (payload.new && payload.new.hotspot_id) hotspotIds.add(payload.new.hotspot_id)
      if (payload.old && payload.old.hotspot_id) hotspotIds.add(payload.old.hotspot_id)

      for (const id of hotspotIds) {
        const { count, error } = await supabase
          .from("check_ins")
          .select("*", { count: "exact", head: true })
          .eq("hotspot_id", id)
          .eq("is_active", true)

        if (!error && count !== null) {
          setActiveCheckins((prev) => ({ ...prev, [id]: count }))
        }
      }
    }

    const channel = supabase
      .channel("global-checkins")
      .on("postgres_changes", { event: "*", schema: "public", table: "check_ins" }, handleCheckInChange)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const showMessage = (type: "error" | "success", message: string) => {
    if (type === "error") {
      setError(message)
      setTimeout(() => setError(null), 5000)
    } else {
      setSuccess(message)
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const handleHotspotSelect = useCallback((hotspot: Hotspot) => {
    setSelectedHotspot(hotspot)
  }, [setSelectedHotspot])

  const handleCheckInSuccess = useCallback((hotspotId: string) => {
    setUserCurrentCheckin(hotspotId)
    setActiveCheckins((prev) => ({
      ...prev,
      [hotspotId]: (prev[hotspotId] || 0) + 1,
      ...(userCurrentCheckin && userCurrentCheckin !== hotspotId
        ? { [userCurrentCheckin]: Math.max(0, (prev[userCurrentCheckin] || 1) - 1) }
        : {}),
    }))
    router.refresh()
  }, [userCurrentCheckin, router])

  const handleCheckIn = useCallback((hotspot?: Hotspot) => {
      const targetHotspot = hotspot || selectedHotspot
      if (!targetHotspot) {
          showMessage("error", "Please select a hotspot first")
          return
      }
      setActionHotspot(targetHotspot)
      setIsCheckInModalOpen(true)
  }, [selectedHotspot, setActionHotspot, setIsCheckInModalOpen])

  const handleCheckOut = useCallback(async () => {
    if (!userCurrentCheckin) return
    if (isOffline) {
      showMessage("error", "You are offline. Please check your internet connection.")
      return
    }
    if (processingAction === "checkout") return

    setIsLoading(true)
    setProcessingAction("checkout")
    const supabase = createClient()

    try {
      const { error: updateError } = await supabase
        .from("check_ins")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("is_active", true)

      if (updateError) throw updateError

      const checkedOutHotspot = hotspots.find((h) => h.id === userCurrentCheckin)
      setActiveCheckins((prev) => ({
        ...prev,
        [userCurrentCheckin]: Math.max(0, (prev[userCurrentCheckin] || 1) - 1),
      }))
      setUserCurrentCheckin(null)
      showMessage("success", `Checked out from ${checkedOutHotspot?.name || "location"}`)
      router.refresh()
    } catch (err: any) {
      showMessage("error", err.message || "Check-out failed. Please try again.")
    } finally {
      setIsLoading(false)
      setProcessingAction(null)
    }
  }, [user.id, userCurrentCheckin, hotspots, router, isOffline, processingAction])

  const performRate = useCallback(
    async (hotspot: Hotspot, rating: number, review?: string): Promise<void> => {
      if (isOffline) {
        showMessage("error", "You are offline. Please check your internet connection.")
        throw new Error("Offline")
      }
      const rateCheck = checkRateLimit("rating", user.id)
      if (!rateCheck.allowed && rateCheck.waitTime) {
        setRateLimitCooldown(rateCheck.waitTime * 1000)
        showMessage("error", `Too many ratings. Please wait ${rateCheck.waitTime} seconds.`)
        throw new Error("Rate limit exceeded")
      }
      const supabase = createClient()
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !sessionData?.session) {
          showMessage("error", "Authentication required. Please sign in again.")
          router.push("/auth/login")
          throw new Error("Not authenticated")
        }
        const sanitizedReview = review ? sanitizeInput(review) : null
        const { error: rateError } = await supabase.from("ratings").upsert(
          { user_id: user.id, hotspot_id: hotspot.id, rating, review: sanitizedReview },
          { onConflict: "user_id,hotspot_id" },
        )
        if (rateError) throw rateError
        setUserRatings((prev) => ({ ...prev, [hotspot.id]: rating }))
        if (sanitizedReview) setUserReviews((prev) => ({ ...prev, [hotspot.id]: sanitizedReview }))
        const { data: avgData } = await supabase.from("ratings").select("rating").eq("hotspot_id", hotspot.id)
        if (avgData && avgData.length > 0) {
          const avg = avgData.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / avgData.length
          setAverageRatings((prev) => ({ ...prev, [hotspot.id]: Math.round(avg * 10) / 10 }))
        }
      } catch (err: any) {
        if (err.message !== "Offline" && err.message !== "Not authenticated" && err.message !== "Rate limit exceeded") {
             showMessage("error", err.message || "Rating failed. Please try again.")
        }
        throw err
      }
    },
    [user.id, isOffline, router],
  )

  const handleRateHotspot = useCallback((hotspot: Hotspot) => {
      setActionHotspot(hotspot)
      setIsRateModalOpen(true)
  }, [setActionHotspot, setIsRateModalOpen])

  const handleRateDetail = useCallback((rating: number) => {
      if (selectedHotspot) {
          setActionHotspot(selectedHotspot)
          setIsRateModalOpen(true)
      }
  }, [selectedHotspot, setActionHotspot, setIsRateModalOpen])

  const handleCloseDetail = useCallback(() => {
    setSelectedHotspot(null)
  }, [setSelectedHotspot])

  // Filter Logic
  const filteredHotspots = hotspots.filter((h) => {
      if (filterCategories.length > 0 && !filterCategories.includes(h.category)) return false
      if (showFriendsOnly) return friendVisitedHotspotIds.includes(h.id)
      if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase()
          return h.name.toLowerCase().includes(lowerTerm) || h.address.toLowerCase().includes(lowerTerm)
      }
      return true
  })

  return (
    <div className="h-screen flex flex-col bg-transparent overflow-hidden pb-16 md:pb-0 pointer-events-none">
      <div className="pointer-events-auto">
          <OnboardingFlow />
      </div>

      <div className="hidden md:block pointer-events-auto bg-background">
        <Navbar user={user} onMenuClick={() => setIsMenuOpen(true)} />
      </div>

      {(viewMode === 'list' || viewMode === 'grid') && (
        <div className="md:hidden pointer-events-auto">
             <MobileSearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                activeFilters={filterCategories}
                onFilterChange={setFilterCategories}
             />
        </div>
      )}

      {isOffline && (
        <div className="fixed top-16 left-0 right-0 z-[300] bg-yellow-500/90 text-background py-2 px-4 flex items-center justify-center gap-2 font-mono text-sm pointer-events-auto">
          <WifiOff className="w-4 h-4" />
          <span>You are offline. Some features may not work.</span>
        </div>
      )}

      <div className="flex-1 flex md:pt-16 relative overflow-hidden">

        <div className="pointer-events-auto">
            <UnifiedMenuDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                currentView={viewMode}
                currentCategories={filterCategories}
                showFriendsOnly={showFriendsOnly}
                onToggleFriendsOnly={setShowFriendsOnly}
                onApply={(view, cats) => {
                    if (view) handleViewChange(view)
                    setFilterCategories(cats)
                }}
                onClear={() => setFilterCategories([])}
            />
        </div>

        {/* Desktop Sidebar (Left) */}
        <div className="hidden md:block md:w-[280px] lg:w-1/4 h-full bg-muted border-r border-border overflow-hidden pointer-events-auto">
            <HotspotList
                hotspots={filteredHotspots}
                selectedHotspot={selectedHotspot}
                onHotspotSelect={handleHotspotSelect}
                activeCheckins={activeCheckins}
                averageRatings={averageRatings}
                userCurrentCheckin={userCurrentCheckin}
                onCheckIn={handleCheckIn}
                onRate={handleRateHotspot}
                userRatings={userRatings}
                userReviews={userReviews}
                isLoading={isLoading}
                viewMode="list"
                userLocation={userLocation}
                savedHotspotIds={Array.from(localSavedIds)}
                onToggleSave={handleToggleSave}
                onOpenFilter={() => setIsMenuOpen(true)}
                activeFilterCount={filterCategories.length}
            />
        </div>

        {/* Center / Main Area (Map Background) */}
        <div className={`flex-1 relative z-0 h-full ${viewMode !== 'map' ? 'hidden md:block' : 'block'}`}>
            {/* Map is in Layout, behind this. This div is transparent. */}
        </div>

        {/* Mobile Views: List/Grid/Feed (Overlay on Map) */}
        <div className={`md:hidden absolute inset-0 bg-background z-10 overflow-hidden pointer-events-auto ${viewMode === 'list' ? 'block' : 'hidden'}`}>
             <HotspotList
                hotspots={filteredHotspots}
                selectedHotspot={selectedHotspot}
                onHotspotSelect={(h) => { handleHotspotSelect(h); /* switch to map? */ }}
                activeCheckins={activeCheckins}
                averageRatings={averageRatings}
                userCurrentCheckin={userCurrentCheckin}
                onCheckIn={handleCheckIn}
                onRate={handleRateHotspot}
                userRatings={userRatings}
                userReviews={userReviews}
                isLoading={isLoading}
                viewMode="list"
                userLocation={userLocation}
                savedHotspotIds={Array.from(localSavedIds)}
                onToggleSave={handleToggleSave}
            />
        </div>

        <div className={`md:hidden absolute inset-0 bg-background z-10 overflow-hidden pointer-events-auto ${viewMode === 'grid' ? 'block' : 'hidden'}`}>
             <HotspotList
                hotspots={filteredHotspots}
                selectedHotspot={selectedHotspot}
                onHotspotSelect={(h) => { handleHotspotSelect(h); }}
                activeCheckins={activeCheckins}
                averageRatings={averageRatings}
                userCurrentCheckin={userCurrentCheckin}
                onCheckIn={handleCheckIn}
                onRate={handleRateHotspot}
                userRatings={userRatings}
                userReviews={userReviews}
                isLoading={isLoading}
                viewMode="grid"
                userLocation={userLocation}
                savedHotspotIds={Array.from(localSavedIds)}
                onToggleSave={handleToggleSave}
            />
        </div>

        <div className={`md:hidden absolute inset-0 bg-background z-10 overflow-hidden pointer-events-auto ${viewMode === 'feed' ? 'block' : 'hidden'}`}>
             <ActivityFeed
                initialActivities={initialActivityFeed}
                todayCount={todayCheckinCount}
                currentUserId={user.id}
                friendIds={friendIds}
                showFriendsOnly={showFriendsOnly}
             />
        </div>

        {/* Detail Modal */}
        {selectedHotspot && (
          <div className="pointer-events-auto">
              <HotspotDetail
                hotspot={selectedHotspot}
                activeCheckins={activeCheckins[selectedHotspot.id] || 0}
                averageRating={averageRatings[selectedHotspot.id] || 0}
                userRating={userRatings[selectedHotspot.id] || null}
                userReview={userReviews[selectedHotspot.id] || null}
                isCheckedIn={userCurrentCheckin === selectedHotspot.id}
                onClose={handleCloseDetail}
                onCheckIn={() => handleCheckIn(selectedHotspot)}
                onCheckOut={handleCheckOut}
                onRate={handleRateDetail}
                isLoading={isLoading || processingAction !== null}
              />
          </div>
        )}

        {/* Desktop Feed (Right) */}
        <div className="hidden md:block md:w-[280px] lg:w-1/4 h-full bg-muted border-l border-border overflow-hidden pointer-events-auto">
          <ActivityFeed
            initialActivities={initialActivityFeed}
            todayCount={todayCheckinCount}
            currentUserId={user.id}
            friendIds={friendIds}
            showFriendsOnly={showFriendsOnly}
          />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="pointer-events-auto bg-background">
          <BottomNav
            currentView={viewMode}
            onViewChange={handleViewChange}
            onMenuClick={() => setIsMenuOpen(true)}
          />
      </div>

      <div className="pointer-events-auto">
          <CheckInModal
            isOpen={isCheckInModalOpen}
            onClose={() => setIsCheckInModalOpen(false)}
            hotspot={actionHotspot}
            onCheckInSuccess={handleCheckInSuccess}
          />

          <RateReviewModal
            isOpen={isRateModalOpen}
            onClose={() => setIsRateModalOpen(false)}
            hotspot={actionHotspot}
            initialRating={actionHotspot ? (userRatings[actionHotspot.id] || 0) : 0}
            initialReview={actionHotspot ? (userReviews[actionHotspot.id] || "") : ""}
            onRate={(hotspot, rating, review) => performRate(hotspot, rating, review)}
          />
      </div>
    </div>
  )
}
