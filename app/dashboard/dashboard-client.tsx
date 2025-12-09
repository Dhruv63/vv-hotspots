"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { WifiOff, RefreshCw, AlertTriangle, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { MapView } from "@/components/map-view"
import { HotspotList } from "@/components/hotspot-list"
import { ActivityFeed } from "@/components/activity-feed"
import { UnifiedMenuDrawer } from "@/components/unified-menu-drawer"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { CheckInModal } from "@/components/check-in-modal"
import { RateReviewModal } from "@/components/rate-review-modal"
import { sanitizeInput, checkRateLimit } from "@/lib/security"
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
}: DashboardClientProps) {
  const router = useRouter()
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)
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
  const [viewMode, setViewMode] = useState<string>("all")
  const [filterCategories, setFilterCategories] = useState<string[]>([])

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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  const [checkInModalOpen, setCheckInModalOpen] = useState(false)
  const [rateModalOpen, setRateModalOpen] = useState(false)
  const [actionHotspot, setActionHotspot] = useState<Hotspot | null>(null)

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
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
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
    // Don't close view/drawer here if on desktop?
    // On mobile, maybe we should close the list drawer to show the detail modal?
    // Detail modal is separate.
    // We can keep viewMode as is.
  }, [])

  const performCheckIn = useCallback(
    async (hotspot: Hotspot, note: string, isPublic: boolean) => {
      if (isOffline) {
        showMessage("error", "You are offline. Please check your internet connection.")
        return
      }
      if (processingAction === `checkin-${hotspot.id}`) return

      const rateCheck = checkRateLimit("checkIn", user.id)
      if (!rateCheck.allowed && rateCheck.waitTime) {
        setRateLimitCooldown(rateCheck.waitTime * 1000)
        showMessage("error", `Too many check-ins. Please wait ${rateCheck.waitTime} seconds.`)
        return
      }

      setIsLoading(true)
      setProcessingAction(`checkin-${hotspot.id}`)
      setError(null)
      const supabase = createClient()

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !sessionData?.session) {
          showMessage("error", "Authentication required. Please sign in again.")
          router.push("/auth/login")
          return
        }

        const { error: updateError } = await supabase
          .from("check_ins")
          .update({ is_active: false })
          .eq("user_id", user.id)
          .eq("is_active", true)

        if (updateError) throw updateError

        const sanitizedNote = note ? sanitizeInput(note) : null

        const { error: insertError } = await supabase
          .from("check_ins")
          .insert({
            user_id: user.id,
            hotspot_id: hotspot.id,
            is_active: true,
            checked_in_at: new Date().toISOString(),
            note: sanitizedNote,
            is_public: isPublic
          })
          .select()
          .single()

        if (insertError) throw new Error(insertError.message)

        setUserCurrentCheckin(hotspot.id)
        setActiveCheckins((prev) => ({
          ...prev,
          [hotspot.id]: (prev[hotspot.id] || 0) + 1,
          ...(userCurrentCheckin && userCurrentCheckin !== hotspot.id
            ? { [userCurrentCheckin]: Math.max(0, (prev[userCurrentCheckin] || 1) - 1) }
            : {}),
        }))

        router.refresh()
      } catch (err: any) {
        showMessage("error", err.message || "Check-in failed. Please try again.")
        throw err // Re-throw for modal
      } finally {
        setIsLoading(false)
        setProcessingAction(null)
      }
    },
    [user.id, userCurrentCheckin, router, isOffline, processingAction],
  )

  const handleCheckIn = useCallback((hotspot?: Hotspot) => {
      const targetHotspot = hotspot || selectedHotspot
      if (!targetHotspot) {
          showMessage("error", "Please select a hotspot first")
          return
      }
      setActionHotspot(targetHotspot)
      setCheckInModalOpen(true)
  }, [selectedHotspot])

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
      setRateModalOpen(true)
  }, [])

  const handleRateDetail = useCallback((rating: number) => {
      if (selectedHotspot) {
          setActionHotspot(selectedHotspot)
          setRateModalOpen(true)
      }
  }, [selectedHotspot])

  const handleCloseDetail = useCallback(() => {
    setSelectedHotspot(null)
  }, [])

  const handleRetry = useCallback(() => {
    router.refresh()
  }, [router])

  const currentCheckinHotspot = userCurrentCheckin ? hotspots.find((h) => h.id === userCurrentCheckin) : null

  // Filter Logic
  const filteredHotspots = hotspots.filter((h) => {
      if (filterCategories.length === 0) return true
      return filterCategories.includes(h.category)
  })

  // View Logic
  const showDesktopSidebar = ['all', 'list', 'grid'].includes(viewMode)
  const showMobileList = ['list', 'grid'].includes(viewMode)
  const showMobileFeed = viewMode === 'feed'

  // List View Mode (List vs Grid in the sidebar/drawer)
  const listComponentViewMode = viewMode === 'grid' ? 'grid' : 'list'

  return (
    <div className="h-screen flex flex-col bg-cyber-black overflow-hidden">
      <OnboardingFlow />
      <Navbar user={user} onMenuClick={() => setIsMenuOpen(true)} />

      {isOffline && (
        <div className="fixed top-16 left-0 right-0 z-[300] bg-yellow-500/90 text-cyber-black py-2 px-4 flex items-center justify-center gap-2 font-mono text-sm">
          <WifiOff className="w-4 h-4" />
          <span>You are offline. Some features may not work.</span>
        </div>
      )}

      {rateLimitCooldown > 0 && (
        <div className="fixed top-16 left-0 right-0 z-[300] bg-cyber-pink/90 text-white py-2 px-4 flex items-center justify-center gap-2 font-mono text-sm">
          <Clock className="w-4 h-4" />
          <span>Rate limited. Please wait {Math.ceil(rateLimitCooldown / 1000)}s</span>
        </div>
      )}

      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-cyber-pink/20 border border-cyber-pink text-cyber-pink font-mono text-sm rounded max-w-[90vw] text-center flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          {initError && (
            <button onClick={handleRetry} className="ml-2 p-1 hover:bg-cyber-pink/20 rounded">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      {success && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan font-mono text-sm rounded max-w-[90vw] text-center">
          {success}
        </div>
      )}

      {hotspots.length === 0 && !initError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-cyber-black/95">
          <div className="text-center p-8">
            <div className="w-16 h-16 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-cyber-cyan font-mono text-lg">Loading hotspots...</p>
          </div>
        </div>
      )}

      {currentCheckinHotspot && (
        <div className="fixed bottom-24 md:bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-4 py-3 bg-cyber-dark border-2 border-cyber-cyan rounded-lg shadow-[0_0_20px_rgba(255,255,0,0.3)] max-w-[90vw]">
          <span className="w-3 h-3 bg-cyber-cyan rounded-full animate-pulse flex-shrink-0" />
          <span className="text-cyber-light font-mono text-sm truncate">
            At <span className="text-cyber-cyan font-bold">{currentCheckinHotspot.name}</span>
          </span>
          <button
            onClick={handleCheckOut}
            disabled={isLoading || processingAction === "checkout"}
            className="ml-2 px-3 py-2 bg-cyber-pink text-white font-mono text-xs font-bold rounded hover:bg-cyber-pink/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[80px] flex items-center justify-center"
          >
            {processingAction === "checkout" ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "CHECK OUT"
            )}
          </button>
        </div>
      )}

      <div className="flex-1 flex pt-14 md:pt-16 relative overflow-hidden">

        <UnifiedMenuDrawer
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            currentView={viewMode}
            currentCategories={filterCategories}
            onApply={(view, cats) => {
                setViewMode(view)
                setFilterCategories(cats)
            }}
            onClear={() => setFilterCategories([])}
        />

        {showDesktopSidebar && (
            <div className="hidden md:block md:w-[280px] lg:w-1/4 h-full bg-cyber-dark border-r border-cyber-gray transition-all duration-300">
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
                viewMode={listComponentViewMode}
                userLocation={userLocation}
                savedHotspotIds={Array.from(localSavedIds)}
                onToggleSave={handleToggleSave}
            />
            </div>
        )}

        <div className="flex-1 relative z-0">
          <MapView
            hotspots={filteredHotspots}
            selectedHotspot={selectedHotspot}
            onHotspotSelect={handleHotspotSelect}
            activeCheckins={activeCheckins}
            userCurrentCheckin={userCurrentCheckin}
            onCheckIn={handleCheckIn}
            isLoading={isLoading}
            onLocationUpdate={setUserLocation}
          />
        </div>

        <div
          className={`md:hidden fixed inset-x-0 bottom-0 z-[80] bg-cyber-dark border-t-2 border-cyber-cyan rounded-t-2xl transition-transform duration-300 ${
            showMobileList ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "70vh" }}
        >
          <div className="flex items-center justify-center py-2">
            <div className="w-12 h-1 bg-cyber-gray rounded-full" />
          </div>
          <div className="h-[calc(70vh-20px)] overflow-hidden">
            <HotspotList
              hotspots={filteredHotspots}
              selectedHotspot={selectedHotspot}
              onHotspotSelect={(h) => {
                handleHotspotSelect(h)
                setViewMode('map')
              }}
              activeCheckins={activeCheckins}
              averageRatings={averageRatings}
              userCurrentCheckin={userCurrentCheckin}
              onCheckIn={handleCheckIn}
              onRate={handleRateHotspot}
              userRatings={userRatings}
              userReviews={userReviews}
              isLoading={isLoading}
              viewMode={listComponentViewMode}
              userLocation={userLocation}
              savedHotspotIds={Array.from(localSavedIds)}
              onToggleSave={handleToggleSave}
            />
          </div>
        </div>

        <div
          className={`md:hidden fixed inset-x-0 bottom-0 z-[80] bg-cyber-dark border-t-2 border-cyber-pink rounded-t-2xl transition-transform duration-300 ${
            showMobileFeed ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "70vh" }}
        >
          <div className="flex items-center justify-center py-2">
            <div className="w-12 h-1 bg-cyber-gray rounded-full" />
          </div>
          <div className="h-[calc(70vh-20px)] overflow-hidden p-4">
            <ActivityFeed
              initialActivities={initialActivityFeed}
              todayCount={todayCheckinCount}
              currentUserId={user.id}
            />
          </div>
        </div>

        {selectedHotspot && (
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
        )}

        <div className="hidden md:block md:w-[280px] lg:w-1/4 h-full bg-cyber-dark border-l border-cyber-gray p-4 overflow-hidden transition-all duration-300">
          <ActivityFeed
            initialActivities={initialActivityFeed}
            todayCount={todayCheckinCount}
            currentUserId={user.id}
          />
        </div>
      </div>

      <CheckInModal
        isOpen={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        hotspot={actionHotspot}
        onCheckIn={(hotspot, note, isPublic) => performCheckIn(hotspot, note, isPublic)}
      />

      <RateReviewModal
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        hotspot={actionHotspot}
        initialRating={actionHotspot ? (userRatings[actionHotspot.id] || 0) : 0}
        initialReview={actionHotspot ? (userReviews[actionHotspot.id] || "") : ""}
        onRate={(hotspot, rating, review) => performRate(hotspot, rating, review)}
      />
    </div>
  )
}
