"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, Activity, MapPin } from "lucide-react"
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
}

export function DashboardClient({
  user,
  hotspots,
  activeCheckins: initialActiveCheckins,
  averageRatings: initialAverageRatings,
  activityFeed: initialActivityFeed,
  userCurrentCheckin: initialUserCheckin,
  userRatings: initialUserRatings,
}: DashboardClientProps) {
  const router = useRouter()
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [feedOpen, setFeedOpen] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [activeCheckins, setActiveCheckins] = useState(initialActiveCheckins)
  const [averageRatings, setAverageRatings] = useState(initialAverageRatings)
  const [activityFeed, setActivityFeed] = useState(initialActivityFeed)
  const [userCurrentCheckin, setUserCurrentCheckin] = useState(initialUserCheckin)
  const [userRatings, setUserRatings] = useState(initialUserRatings)

  const showMessage = (type: "error" | "success", message: string) => {
    if (type === "error") {
      setError(message)
      setTimeout(() => setError(null), 3000)
    } else {
      setSuccess(message)
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const handleHotspotSelect = useCallback((hotspot: Hotspot) => {
    setSelectedHotspot(hotspot)
    setShowDetail(true)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
      setFeedOpen(false)
    }
  }, [])

  const handleCheckIn = async () => {
    if (!selectedHotspot) return
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      if (userCurrentCheckin) {
        const { error: checkoutError } = await supabase
          .from("check_ins")
          .update({ is_active: false })
          .eq("user_id", user.id)
          .eq("is_active", true)

        if (checkoutError) {
          console.log("[v0] Checkout error:", checkoutError)
        }
      }

      const { data, error: insertError } = await supabase
        .from("check_ins")
        .insert({
          user_id: user.id,
          hotspot_id: selectedHotspot.id,
          is_active: true,
          checked_in_at: new Date().toISOString(),
        })
        .select()

      if (insertError) {
        console.log("[v0] Check-in insert error:", insertError)
        throw insertError
      }

      console.log("[v0] Check-in successful:", data)

      setUserCurrentCheckin(selectedHotspot.id)
      setActiveCheckins((prev) => ({
        ...prev,
        [selectedHotspot.id]: (prev[selectedHotspot.id] || 0) + 1,
        ...(userCurrentCheckin ? { [userCurrentCheckin]: Math.max(0, (prev[userCurrentCheckin] || 1) - 1) } : {}),
      }))

      const newActivity: ActivityFeedItem = {
        id: `temp-${Date.now()}`,
        username: user.email?.split("@")[0] || "User",
        avatar_url: null,
        hotspot_name: selectedHotspot.name,
        hotspot_category: selectedHotspot.category,
        checked_in_at: new Date().toISOString(),
      }
      setActivityFeed((prev) => [newActivity, ...prev.slice(0, 19)])

      showMessage("success", `Checked in to ${selectedHotspot.name}!`)
      router.refresh()
    } catch (err: any) {
      console.log("[v0] Check-in failed:", err)
      showMessage("error", err.message || "Check-in failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!selectedHotspot || !userCurrentCheckin) return
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error: updateError } = await supabase
        .from("check_ins")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("hotspot_id", selectedHotspot.id)
        .eq("is_active", true)

      if (updateError) {
        console.log("[v0] Check-out error:", updateError)
        throw updateError
      }

      setActiveCheckins((prev) => ({
        ...prev,
        [selectedHotspot.id]: Math.max(0, (prev[selectedHotspot.id] || 1) - 1),
      }))
      setUserCurrentCheckin(null)
      showMessage("success", `Checked out from ${selectedHotspot.name}`)
    } catch (err: any) {
      console.log("[v0] Check-out failed:", err)
      showMessage("error", err.message || "Check-out failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRate = async (rating: number) => {
    if (!selectedHotspot) return

    const supabase = createClient()

    try {
      const { data, error: rateError } = await supabase
        .from("ratings")
        .upsert(
          {
            user_id: user.id,
            hotspot_id: selectedHotspot.id,
            rating,
            created_at: new Date().toISOString(),
          },
          { onConflict: "user_id,hotspot_id" },
        )
        .select()

      if (rateError) {
        console.log("[v0] Rating error:", rateError)
        throw rateError
      }

      console.log("[v0] Rating successful:", data)

      setUserRatings((prev) => ({
        ...prev,
        [selectedHotspot.id]: rating,
      }))

      const { data: avgData } = await supabase.from("ratings").select("rating").eq("hotspot_id", selectedHotspot.id)

      if (avgData && avgData.length > 0) {
        const avg = avgData.reduce((sum, r) => sum + r.rating, 0) / avgData.length
        setAverageRatings((prev) => ({
          ...prev,
          [selectedHotspot.id]: Math.round(avg * 10) / 10,
        }))
      }

      showMessage("success", `Rated ${selectedHotspot.name} ${rating} stars!`)
    } catch (err: any) {
      console.log("[v0] Rating failed:", err)
      showMessage("error", err.message || "Rating failed. Please try again.")
    }
  }

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false)
    setSelectedHotspot(null)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-cyber-black">
      <Navbar user={user} />

      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-cyber-pink/20 border border-cyber-pink text-cyber-pink font-mono text-sm animate-pulse rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan font-mono text-sm rounded">
          {success}
        </div>
      )}

      <div className="flex-1 flex pt-16 relative overflow-hidden">
        <div className="md:hidden absolute top-2 left-2 z-30 flex gap-2">
          <button
            onClick={() => {
              setSidebarOpen(!sidebarOpen)
              if (!sidebarOpen) {
                setFeedOpen(false)
                setShowDetail(false)
              }
            }}
            className={`p-2 border font-mono text-xs rounded ${
              sidebarOpen
                ? "bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan"
                : "bg-cyber-dark border-cyber-gray text-cyber-light"
            }`}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {selectedHotspot && !showDetail && (
            <button
              onClick={() => setShowDetail(true)}
              className="p-2 border border-cyber-cyan bg-cyber-cyan/20 text-cyber-cyan font-mono text-xs rounded flex items-center gap-1 animate-pulse"
            >
              <MapPin className="w-4 h-4" />
              <span>CHECK IN</span>
            </button>
          )}
        </div>

        <button
          onClick={() => {
            setFeedOpen(!feedOpen)
            if (!feedOpen) {
              setSidebarOpen(false)
              setShowDetail(false)
            }
          }}
          className={`md:hidden absolute top-2 right-2 z-30 p-2 border font-mono text-xs flex items-center gap-1 rounded ${
            feedOpen
              ? "bg-cyber-pink/20 border-cyber-pink text-cyber-pink"
              : "bg-cyber-dark border-cyber-gray text-cyber-cyan"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>FEED</span>
          {activityFeed.length > 0 && <span className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" />}
        </button>

        <div
          className={`absolute md:relative z-20 h-full w-80 bg-cyber-dark border-r border-cyber-gray transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <HotspotList
            hotspots={hotspots}
            selectedHotspot={selectedHotspot}
            onHotspotSelect={handleHotspotSelect}
            activeCheckins={activeCheckins}
            averageRatings={averageRatings}
          />
        </div>

        <div className="flex-1 relative">
          <MapView
            hotspots={hotspots}
            selectedHotspot={selectedHotspot}
            onHotspotSelect={handleHotspotSelect}
            activeCheckins={activeCheckins}
          />

          {selectedHotspot && showDetail && (
            <HotspotDetail
              hotspot={selectedHotspot}
              activeCheckins={activeCheckins[selectedHotspot.id] || 0}
              averageRating={averageRatings[selectedHotspot.id] || 0}
              userRating={userRatings[selectedHotspot.id] || null}
              isCheckedIn={userCurrentCheckin === selectedHotspot.id}
              onClose={handleCloseDetail}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onRate={handleRate}
              isLoading={isLoading}
            />
          )}
        </div>

        <div
          className={`absolute md:relative right-0 z-20 h-full w-80 bg-cyber-dark border-l border-cyber-gray transition-transform duration-300 ${
            feedOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
          }`}
        >
          <div className="p-4 h-full overflow-hidden">
            <ActivityFeed activities={activityFeed} />
          </div>
        </div>
      </div>
    </div>
  )
}
