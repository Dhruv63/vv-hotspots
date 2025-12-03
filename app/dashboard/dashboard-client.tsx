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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [feedOpen, setFeedOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [activeCheckins, setActiveCheckins] = useState(initialActiveCheckins)
  const [averageRatings, setAverageRatings] = useState(initialAverageRatings)
  const [userCurrentCheckin, setUserCurrentCheckin] = useState(initialUserCheckin)
  const [userRatings, setUserRatings] = useState(initialUserRatings)
  const [userReviews, setUserReviews] = useState(initialUserReviews)

  useEffect(() => {
    console.log("[v0] Dashboard mounted with user:", user?.id)
    console.log("[v0] Initial user checkin:", initialUserCheckin)
    console.log("[v0] Hotspots count:", hotspots.length)
  }, [user?.id, initialUserCheckin, hotspots.length])

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
    console.log("[v0] Hotspot selected:", hotspot.name, hotspot.id)
    setSelectedHotspot(hotspot)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
      setFeedOpen(false)
    }
  }, [])

  const handleCheckIn = useCallback(
    async (hotspot?: Hotspot) => {
      const targetHotspot = hotspot || selectedHotspot
      console.log("[v0] handleCheckIn called with:", targetHotspot?.name)

      if (!targetHotspot) {
        console.log("[v0] No hotspot for check-in")
        showMessage("error", "Please select a hotspot first")
        return
      }

      console.log("[v0] Starting check-in for:", targetHotspot.name)
      setIsLoading(true)
      setError(null)

      const supabase = createClient()

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        console.log("[v0] Session:", sessionData?.session?.user?.id)

        if (!sessionData?.session) {
          throw new Error("No active session. Please log in again.")
        }

        if (userCurrentCheckin && userCurrentCheckin !== targetHotspot.id) {
          console.log("[v0] Checking out from:", userCurrentCheckin)
          await supabase.from("check_ins").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true)
        }

        console.log("[v0] Inserting check-in for hotspot:", targetHotspot.id)
        const { data, error: insertError } = await supabase
          .from("check_ins")
          .insert({
            user_id: user.id,
            hotspot_id: targetHotspot.id,
            is_active: true,
          })
          .select()
          .single()

        if (insertError) {
          console.log("[v0] Insert error:", insertError)
          throw new Error(insertError.message)
        }

        console.log("[v0] Check-in successful:", data)

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
        console.log("[v0] Check-in error:", err)
        showMessage("error", err.message || "Check-in failed")
      } finally {
        setIsLoading(false)
      }
    },
    [selectedHotspot, user.id, userCurrentCheckin, router],
  )

  const handleCheckOut = useCallback(async () => {
    console.log("[v0] handleCheckOut called")

    if (!userCurrentCheckin) {
      console.log("[v0] Not checked in anywhere")
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error: updateError } = await supabase
        .from("check_ins")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("is_active", true)

      if (updateError) throw updateError

      console.log("[v0] Checkout successful")

      const checkedOutHotspot = hotspots.find((h) => h.id === userCurrentCheckin)
      setActiveCheckins((prev) => ({
        ...prev,
        [userCurrentCheckin]: Math.max(0, (prev[userCurrentCheckin] || 1) - 1),
      }))
      setUserCurrentCheckin(null)
      showMessage("success", `Checked out from ${checkedOutHotspot?.name || "location"}`)
      router.refresh()
    } catch (err: any) {
      console.log("[v0] Check-out error:", err)
      showMessage("error", err.message || "Check-out failed")
    } finally {
      setIsLoading(false)
    }
  }, [user.id, userCurrentCheckin, hotspots, router])

  const handleRate = useCallback(
    async (rating: number): Promise<void> => {
      if (!selectedHotspot) {
        console.log("[v0] No hotspot selected for rating")
        return
      }
      console.log("[v0] Rating hotspot:", selectedHotspot.name, "with", rating, "stars")

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

        if (rateError) {
          console.log("[v0] Rating error:", rateError)
          throw rateError
        }

        console.log("[v0] Rating saved successfully")
        setUserRatings((prev) => ({ ...prev, [selectedHotspot.id]: rating }))

        const { data: avgData } = await supabase.from("ratings").select("rating").eq("hotspot_id", selectedHotspot.id)

        if (avgData && avgData.length > 0) {
          const avg = avgData.reduce((sum, r) => sum + r.rating, 0) / avgData.length
          setAverageRatings((prev) => ({ ...prev, [selectedHotspot.id]: Math.round(avg * 10) / 10 }))
        }

        showMessage("success", `Rated ${selectedHotspot.name} ${rating} stars!`)
      } catch (err: any) {
        console.log("[v0] Rating failed:", err)
        showMessage("error", err.message || "Rating failed")
        throw err
      }
    },
    [selectedHotspot, user.id],
  )

  const handleRateHotspot = useCallback(
    async (hotspot: Hotspot, rating: number, review?: string): Promise<void> => {
      console.log("[v0] Quick rating hotspot:", hotspot.name, "with", rating, "stars", review ? "and review" : "")

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

        if (rateError) {
          console.log("[v0] Rating error:", rateError)
          throw rateError
        }

        console.log("[v0] Rating saved successfully")
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
        console.log("[v0] Rating failed:", err)
        showMessage("error", err.message || "Rating failed")
      }
    },
    [user.id],
  )

  const handleCloseDetail = useCallback(() => {
    setSelectedHotspot(null)
  }, [])

  const currentCheckinHotspot = userCurrentCheckin ? hotspots.find((h) => h.id === userCurrentCheckin) : null

  return (
    <div className="h-screen flex flex-col bg-cyber-black overflow-hidden">
      <Navbar user={user} />

      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-cyber-pink/20 border border-cyber-pink text-cyber-pink font-mono text-sm rounded max-w-md text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan font-mono text-sm rounded">
          {success}
        </div>
      )}

      {currentCheckinHotspot && (
        <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-4 py-3 bg-cyber-dark border-2 border-cyber-cyan rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.3)]">
          <span className="w-3 h-3 bg-cyber-cyan rounded-full animate-pulse" />
          <span className="text-cyber-light font-mono text-sm">
            At <span className="text-cyber-cyan font-bold">{currentCheckinHotspot.name}</span>
          </span>
          <button
            onClick={handleCheckOut}
            disabled={isLoading}
            className="ml-2 px-3 py-1 bg-cyber-pink text-white font-mono text-xs font-bold rounded hover:bg-cyber-pink/80 transition-colors disabled:opacity-50"
          >
            {isLoading ? "..." : "CHECK OUT"}
          </button>
        </div>
      )}

      <div className="flex-1 flex pt-16 relative overflow-hidden">
        <div className="md:hidden fixed top-[72px] left-2 z-40 flex gap-2">
          <button
            onClick={() => {
              setSidebarOpen(!sidebarOpen)
              if (!sidebarOpen) setFeedOpen(false)
            }}
            className={`p-2.5 rounded-lg font-mono text-xs transition-all ${
              sidebarOpen
                ? "bg-cyber-cyan text-cyber-black shadow-[0_0_15px_rgba(0,255,255,0.5)]"
                : "bg-cyber-dark border border-cyber-gray text-cyber-light"
            }`}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <button
          onClick={() => {
            setFeedOpen(!feedOpen)
            if (!feedOpen) setSidebarOpen(false)
          }}
          className={`md:hidden fixed top-[72px] right-2 z-40 p-2.5 rounded-lg font-mono text-xs flex items-center gap-1 transition-all ${
            feedOpen
              ? "bg-cyber-pink text-white shadow-[0_0_15px_rgba(255,0,110,0.5)]"
              : "bg-cyber-dark border border-cyber-gray text-cyber-cyan"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span className="text-xs">FEED</span>
        </button>

        <div
          className={`fixed md:relative z-30 h-[calc(100%-4rem)] md:h-full w-full md:w-72 lg:w-80 bg-cyber-dark border-r border-cyber-gray transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
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
            hotspots={hotspots}
            selectedHotspot={selectedHotspot}
            onHotspotSelect={handleHotspotSelect}
            activeCheckins={activeCheckins}
            userCurrentCheckin={userCurrentCheckin}
            onCheckIn={handleCheckIn}
            isLoading={isLoading}
          />
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
            isLoading={isLoading}
          />
        )}

        <div
          className={`fixed md:relative right-0 z-30 h-[calc(100%-4rem)] md:h-full w-full md:w-72 lg:w-80 bg-cyber-dark border-l border-cyber-gray transition-transform duration-300 ${
            feedOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
          }`}
        >
          <div className="p-4 h-full overflow-hidden">
            <ActivityFeed initialActivities={initialActivityFeed} />
          </div>
        </div>
      </div>
    </div>
  )
}
