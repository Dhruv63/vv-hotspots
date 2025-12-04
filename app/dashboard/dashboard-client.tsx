"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, Activity, WifiOff, RefreshCw, AlertTriangle, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { MapView } from "@/components/map-view"
import { HotspotList } from "@/components/hotspot-list"
import { HotspotDetail } from "@/components/hotspot-detail"
import { ActivityFeed } from "@/components/activity-feed"
import { sanitizeInput, checkRateLimit, RATE_LIMITS } from "@/lib/security"
import type { Hotspot, ActivityFeedItem } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

interface DashboardClientProps {
  user: User
  hotspots: Hotspot[]
  activeCheckins: Record<string, number>
  averageRatings: Record<string, number>
  activityFeed: ActivityFeedItem[]
  userCurrentCheckin: string | null
  userRatings: Record<string, number>
  userReviews: Record<string, string>
  initError?: string | null // Added init error prop
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
  initError, // Accept init error
}: DashboardClientProps) {
  const router = useRouter()
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)
  const [drawerOpen, setDrawerOpen] = useState<"hotspots" | "feed" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(initError || null) // Initialize with server error
  const [success, setSuccess] = useState<string | null>(null)
  const [mobileCategory, setMobileCategory] = useState("all")
  const [isOffline, setIsOffline] = useState(false)
  const [processingAction, setProcessingAction] = useState<string | null>(null)
  const [rateLimitCooldown, setRateLimitCooldown] = useState<number>(0)

  const [activeCheckins, setActiveCheckins] = useState(initialActiveCheckins)
  const [averageRatings, setAverageRatings] = useState(initialAverageRatings)
  const [userCurrentCheckin, setUserCurrentCheckin] = useState(initialUserCheckin)
  const [userRatings, setUserRatings] = useState(initialUserRatings)
  const [userReviews, setUserReviews] = useState(initialUserReviews)

  // Sync state with props
  useEffect(() => {
    setActiveCheckins(initialActiveCheckins)
  }, [initialActiveCheckins])

  useEffect(() => {
    setAverageRatings(initialAverageRatings)
  }, [initialAverageRatings])

  useEffect(() => {
    setUserCurrentCheckin(initialUserCheckin)
  }, [initialUserCheckin])

  useEffect(() => {
    setUserRatings(initialUserRatings)
  }, [initialUserRatings])

  useEffect(() => {
    setUserReviews(initialUserReviews)
  }, [initialUserReviews])

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    // Check initial state
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
    setDrawerOpen(null)
  }, [])

  const handleCheckIn = useCallback(
    async (hotspot?: Hotspot) => {
      const targetHotspot = hotspot || selectedHotspot
      if (!targetHotspot) {
        showMessage("error", "Please select a hotspot first")
        return
      }

      if (isOffline) {
        showMessage("error", "You are offline. Please check your internet connection.")
        return
      }

      if (processingAction === `checkin-${targetHotspot.id}`) {
        return
      }

      const rateCheck = checkRateLimit("checkIn", user.id)
      if (!rateCheck.allowed && rateCheck.waitTime) {
        setRateLimitCooldown(rateCheck.waitTime * 1000)
        showMessage("error", `Too many check-ins. Please wait ${rateCheck.waitTime} seconds.`)
        return
      }

      setIsLoading(true)
      setProcessingAction(`checkin-${targetHotspot.id}`)
      setError(null)
      const supabase = createClient()

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !sessionData?.session) {
          showMessage("error", "Authentication required. Please sign in again.")
          router.push("/auth/login")
          return
        }

        // Deactivate all existing check-ins to ensure single active location
        const { error: updateError } = await supabase
          .from("check_ins")
          .update({ is_active: false })
          .eq("user_id", user.id)
          .eq("is_active", true)

        if (updateError) throw updateError

        const { data, error: insertError } = await supabase
          .from("check_ins")
          .insert({
            user_id: user.id,
            hotspot_id: targetHotspot.id,
            is_active: true,
            checked_in_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (insertError) throw new Error(insertError.message)

        setUserCurrentCheckin(targetHotspot.id)
        setActiveCheckins((prev) => ({
          ...prev,
          [targetHotspot.id]: (prev[targetHotspot.id] || 0) + 1,
          ...(userCurrentCheckin && userCurrentCheckin !== targetHotspot.id
            ? { [userCurrentCheckin]: Math.max(0, (prev[userCurrentCheckin] || 1) - 1) }
            : {}),
        }))

        showMessage("success", `Checked in to ${targetHotspot.name}!`)
        router.refresh()
      } catch (err: any) {
        showMessage("error", err.message || "Check-in failed. Please try again.")
      } finally {
        setIsLoading(false)
        setProcessingAction(null)
      }
    },
    [selectedHotspot, user.id, userCurrentCheckin, router, isOffline, processingAction],
  )

  const handleCheckOut = useCallback(async () => {
    if (!userCurrentCheckin) return

    if (isOffline) {
      showMessage("error", "You are offline. Please check your internet connection.")
      return
    }

    if (processingAction === "checkout") {
      return
    }

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

  const handleRate = useCallback(
    async (rating: number): Promise<void> => {
      if (!selectedHotspot) return

      if (isOffline) {
        showMessage("error", "You are offline. Please check your internet connection.")
        throw new Error("Offline")
      }

      const supabase = createClient()

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !sessionData?.session) {
          showMessage("error", "Authentication required. Please sign in again.")
          router.push("/auth/login")
          throw new Error("Not authenticated")
        }

        const { error: rateError } = await supabase.from("ratings").upsert(
          {
            user_id: user.id,
            hotspot_id: selectedHotspot.id,
            rating,
          },
          { onConflict: "user_id,hotspot_id" },
        )

        if (rateError) throw rateError

        setUserRatings((prev) => ({ ...prev, [selectedHotspot.id]: rating }))

        const { data: avgData } = await supabase.from("ratings").select("rating").eq("hotspot_id", selectedHotspot.id)

        if (avgData && avgData.length > 0) {
          const avg = avgData.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / avgData.length
          setAverageRatings((prev) => ({ ...prev, [selectedHotspot.id]: Math.round(avg * 10) / 10 }))
        }

        showMessage("success", `Rated ${selectedHotspot.name} ${rating} stars!`)
      } catch (err: any) {
        if (err.message !== "Offline" && err.message !== "Not authenticated") {
          showMessage("error", err.message || "Rating failed. Please try again.")
        }
        throw err
      }
    },
    [selectedHotspot, user.id, isOffline, router],
  )

  const handleRateHotspot = useCallback(
    async (hotspot: Hotspot, rating: number, review?: string): Promise<void> => {
      if (isOffline) {
        showMessage("error", "You are offline. Please check your internet connection.")
        return
      }

      const rateCheck = checkRateLimit("rating", user.id)
      if (!rateCheck.allowed && rateCheck.waitTime) {
        setRateLimitCooldown(rateCheck.waitTime * 1000)
        showMessage("error", `Too many ratings. Please wait ${rateCheck.waitTime} seconds.`)
        return
      }

      const supabase = createClient()

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !sessionData?.session) {
          showMessage("error", "Authentication required. Please sign in again.")
          router.push("/auth/login")
          return
        }

        const sanitizedReview = review ? sanitizeInput(review) : null

        const { error: rateError } = await supabase.from("ratings").upsert(
          {
            user_id: user.id,
            hotspot_id: hotspot.id,
            rating,
            review: sanitizedReview,
          },
          { onConflict: "user_id,hotspot_id" },
        )

        if (rateError) throw rateError

        setUserRatings((prev) => ({ ...prev, [hotspot.id]: rating }))
        if (sanitizedReview) {
          setUserReviews((prev) => ({ ...prev, [hotspot.id]: sanitizedReview }))
        }

        const { data: avgData } = await supabase.from("ratings").select("rating").eq("hotspot_id", hotspot.id)

        if (avgData && avgData.length > 0) {
          const avg = avgData.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / avgData.length
          setAverageRatings((prev) => ({ ...prev, [hotspot.id]: Math.round(avg * 10) / 10 }))
        }

        showMessage("success", `Rated ${hotspot.name} ${rating} stars!`)
      } catch (err: any) {
        showMessage("error", err.message || "Rating failed. Please try again.")
      }
    },
    [user.id, isOffline, router],
  )

  const handleCloseDetail = useCallback(() => {
    setSelectedHotspot(null)
  }, [])

  const handleRetry = useCallback(() => {
    router.refresh()
  }, [router])

  const currentCheckinHotspot = userCurrentCheckin ? hotspots.find((h) => h.id === userCurrentCheckin) : null

  const mobileFilteredHotspots =
    mobileCategory === "all" ? hotspots : hotspots.filter((h) => h.category === mobileCategory)

  const categories = [
    { value: "all", label: "All" },
    { value: "cafe", label: "Cafes" },
    { value: "park", label: "Parks" },
    { value: "gaming", label: "Gaming" },
    { value: "food", label: "Food" },
    { value: "hangout", label: "Hangout" },
  ]

  return (
    <div className="h-screen flex flex-col bg-cyber-black overflow-hidden">
      <Navbar user={user} />

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
        <div className="fixed bottom-24 md:bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-4 py-3 bg-cyber-dark border-2 border-cyber-cyan rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.3)] max-w-[90vw]">
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

      <div className="flex-1 flex pt-16 relative overflow-hidden">
        <div className="md:hidden fixed top-[72px] left-2 right-2 z-40 flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(drawerOpen === "hotspots" ? null : "hotspots")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs transition-all min-h-[44px] ${
              drawerOpen === "hotspots"
                ? "bg-cyber-cyan text-cyber-black shadow-[0_0_15px_rgba(0,255,255,0.5)]"
                : "bg-cyber-dark border border-cyber-gray text-cyber-light"
            }`}
          >
            {drawerOpen === "hotspots" ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>Places</span>
          </button>

          <div className="flex-1 overflow-x-auto flex gap-1 pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setMobileCategory(cat.value)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg font-mono text-xs transition-all min-h-[44px] ${
                  mobileCategory === cat.value
                    ? "bg-cyber-cyan text-cyber-black"
                    : "bg-cyber-dark border border-cyber-gray text-cyber-gray"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setDrawerOpen(drawerOpen === "feed" ? null : "feed")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs transition-all min-h-[44px] ${
              drawerOpen === "feed"
                ? "bg-cyber-pink text-white shadow-[0_0_15px_rgba(255,0,110,0.5)]"
                : "bg-cyber-dark border border-cyber-gray text-cyber-cyan"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Feed</span>
          </button>
        </div>

        <div className="hidden md:block w-72 lg:w-80 h-full bg-cyber-dark border-r border-cyber-gray">
          <HotspotList
            hotspots={hotspots}
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
          />
        </div>

        <div className="flex-1 relative z-0">
          <MapView
            hotspots={isMobile ? mobileFilteredHotspots : hotspots}
            selectedHotspot={selectedHotspot}
            onHotspotSelect={handleHotspotSelect}
            activeCheckins={activeCheckins}
            userCurrentCheckin={userCurrentCheckin}
            onCheckIn={handleCheckIn}
            isLoading={isLoading}
          />
        </div>

        <div
          className={`md:hidden fixed inset-x-0 bottom-0 z-[80] bg-cyber-dark border-t-2 border-cyber-cyan rounded-t-2xl transition-transform duration-300 ${
            drawerOpen === "hotspots" ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "70vh" }}
        >
          <div className="flex items-center justify-center py-2">
            <div className="w-12 h-1 bg-cyber-gray rounded-full" />
          </div>
          <div className="h-[calc(70vh-20px)] overflow-hidden">
            <HotspotList
              hotspots={hotspots}
              selectedHotspot={selectedHotspot}
              onHotspotSelect={(h) => {
                handleHotspotSelect(h)
                setDrawerOpen(null)
              }}
              activeCheckins={activeCheckins}
              averageRatings={averageRatings}
              userCurrentCheckin={userCurrentCheckin}
              onCheckIn={handleCheckIn}
              onRate={handleRateHotspot}
              userRatings={userRatings}
              userReviews={userReviews}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div
          className={`md:hidden fixed inset-x-0 bottom-0 z-[80] bg-cyber-dark border-t-2 border-cyber-pink rounded-t-2xl transition-transform duration-300 ${
            drawerOpen === "feed" ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "70vh" }}
        >
          <div className="flex items-center justify-center py-2">
            <div className="w-12 h-1 bg-cyber-gray rounded-full" />
          </div>
          <div className="h-[calc(70vh-20px)] overflow-hidden p-4">
            <ActivityFeed initialActivities={initialActivityFeed} />
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
            onRate={handleRate}
            isLoading={isLoading || processingAction !== null}
          />
        )}

        <div className="hidden md:block w-72 lg:w-80 h-full bg-cyber-dark border-l border-cyber-gray p-4 overflow-hidden">
          <ActivityFeed initialActivities={initialActivityFeed} />
        </div>
      </div>

      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[70] backdrop-blur-sm"
          onClick={() => setDrawerOpen(null)}
        />
      )}
    </div>
  )
}
