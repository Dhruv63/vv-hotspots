"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, Activity } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { MapView } from "@/components/map-view"
import { HotspotList } from "@/components/hotspot-list"
import { HotspotDetail } from "@/components/hotspot-detail"
import { ActivityFeed } from "@/components/activity-feed"
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
}: DashboardClientProps) {
  const router = useRouter()
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)
  const [drawerOpen, setDrawerOpen] = useState<"hotspots" | "feed" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [mobileCategory, setMobileCategory] = useState("all")

  const [activeCheckins, setActiveCheckins] = useState(initialActiveCheckins)
  const [averageRatings, setAverageRatings] = useState(initialAverageRatings)
  const [userCurrentCheckin, setUserCurrentCheckin] = useState(initialUserCheckin)
  const [userRatings, setUserRatings] = useState(initialUserRatings)
  const [userReviews, setUserReviews] = useState(initialUserReviews)

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
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
    setDrawerOpen(null) // Close drawers when selecting
  }, [])

  const handleCheckIn = useCallback(
    async (hotspot?: Hotspot) => {
      const targetHotspot = hotspot || selectedHotspot
      if (!targetHotspot) {
        showMessage("error", "Please select a hotspot first")
        return
      }

      setIsLoading(true)
      setError(null)
      const supabase = createClient()

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData?.session) {
          throw new Error("No active session. Please log in again.")
        }

        if (userCurrentCheckin && userCurrentCheckin !== targetHotspot.id) {
          await supabase.from("check_ins").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true)
        }

        const { data, error: insertError } = await supabase
          .from("check_ins")
          .insert({
            user_id: user.id,
            hotspot_id: targetHotspot.id,
            is_active: true,
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
        showMessage("error", err.message || "Check-in failed")
      } finally {
        setIsLoading(false)
      }
    },
    [selectedHotspot, user.id, userCurrentCheckin, router],
  )

  const handleCheckOut = useCallback(async () => {
    if (!userCurrentCheckin) return

    setIsLoading(true)
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
      showMessage("error", err.message || "Check-out failed")
    } finally {
      setIsLoading(false)
    }
  }, [user.id, userCurrentCheckin, hotspots, router])

  const handleRate = useCallback(
    async (rating: number): Promise<void> => {
      if (!selectedHotspot) return

      const supabase = createClient()

      try {
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
          const avg = avgData.reduce((sum, r) => sum + r.rating, 0) / avgData.length
          setAverageRatings((prev) => ({ ...prev, [selectedHotspot.id]: Math.round(avg * 10) / 10 }))
        }

        showMessage("success", `Rated ${selectedHotspot.name} ${rating} stars!`)
      } catch (err: any) {
        showMessage("error", err.message || "Rating failed")
        throw err
      }
    },
    [selectedHotspot, user.id],
  )

  const handleRateHotspot = useCallback(
    async (hotspot: Hotspot, rating: number, review?: string): Promise<void> => {
      const supabase = createClient()

      try {
        const { error: rateError } = await supabase.from("ratings").upsert(
          {
            user_id: user.id,
            hotspot_id: hotspot.id,
            rating,
            review: review || null,
          },
          { onConflict: "user_id,hotspot_id" },
        )

        if (rateError) throw rateError

        setUserRatings((prev) => ({ ...prev, [hotspot.id]: rating }))
        if (review) {
          setUserReviews((prev) => ({ ...prev, [hotspot.id]: review }))
        }

        const { data: avgData } = await supabase.from("ratings").select("rating").eq("hotspot_id", hotspot.id)

        if (avgData && avgData.length > 0) {
          const avg = avgData.reduce((sum, r) => sum + r.rating, 0) / avgData.length
          setAverageRatings((prev) => ({ ...prev, [hotspot.id]: Math.round(avg * 10) / 10 }))
        }

        showMessage("success", `Rated ${hotspot.name} ${rating} stars!`)
      } catch (err: any) {
        showMessage("error", err.message || "Rating failed")
      }
    },
    [user.id],
  )

  const handleCloseDetail = useCallback(() => {
    setSelectedHotspot(null)
  }, [])

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

      {/* Toast messages */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-cyber-pink/20 border border-cyber-pink text-cyber-pink font-mono text-sm rounded max-w-[90vw] text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan font-mono text-sm rounded max-w-[90vw] text-center">
          {success}
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
            disabled={isLoading}
            className="ml-2 px-3 py-2 bg-cyber-pink text-white font-mono text-xs font-bold rounded hover:bg-cyber-pink/80 transition-colors disabled:opacity-50 min-h-[44px] min-w-[80px]"
          >
            {isLoading ? "..." : "CHECK OUT"}
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

        {/* Hotspot detail modal */}
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
            isLoading={isLoading}
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
