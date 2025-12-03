"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
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
  const [isLoading, setIsLoading] = useState(false)

  const [activeCheckins, setActiveCheckins] = useState(initialActiveCheckins)
  const [averageRatings, setAverageRatings] = useState(initialAverageRatings)
  const [activityFeed, setActivityFeed] = useState(initialActivityFeed)
  const [userCurrentCheckin, setUserCurrentCheckin] = useState(initialUserCheckin)
  const [userRatings, setUserRatings] = useState(initialUserRatings)

  const handleHotspotSelect = useCallback((hotspot: Hotspot) => {
    setSelectedHotspot(hotspot)
    // On mobile, close sidebar when selecting
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  const handleCheckIn = async () => {
    if (!selectedHotspot) return
    setIsLoading(true)

    const supabase = createClient()

    try {
      // First, check out from any existing location
      if (userCurrentCheckin) {
        await supabase.from("check_ins").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true)
      }

      // Create new check-in
      const { error } = await supabase.from("check_ins").insert({
        user_id: user.id,
        hotspot_id: selectedHotspot.id,
        is_active: true,
      })

      if (error) throw error

      // Update local state
      setUserCurrentCheckin(selectedHotspot.id)
      setActiveCheckins((prev) => ({
        ...prev,
        [selectedHotspot.id]: (prev[selectedHotspot.id] || 0) + 1,
        ...(userCurrentCheckin ? { [userCurrentCheckin]: Math.max(0, (prev[userCurrentCheckin] || 1) - 1) } : {}),
      }))

      // Refresh to get updated feed
      router.refresh()
    } catch (err) {
      console.error("Check-in failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!selectedHotspot || !userCurrentCheckin) return
    setIsLoading(true)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("check_ins")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("hotspot_id", selectedHotspot.id)
        .eq("is_active", true)

      if (error) throw error

      // Update local state
      setActiveCheckins((prev) => ({
        ...prev,
        [selectedHotspot.id]: Math.max(0, (prev[selectedHotspot.id] || 1) - 1),
      }))
      setUserCurrentCheckin(null)
    } catch (err) {
      console.error("Check-out failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRate = async (rating: number) => {
    if (!selectedHotspot) return

    const supabase = createClient()

    try {
      // Upsert rating
      const { error } = await supabase.from("ratings").upsert(
        {
          user_id: user.id,
          hotspot_id: selectedHotspot.id,
          rating,
        },
        { onConflict: "user_id,hotspot_id" },
      )

      if (error) throw error

      // Update local state
      setUserRatings((prev) => ({
        ...prev,
        [selectedHotspot.id]: rating,
      }))

      // Recalculate average (simplified)
      setAverageRatings((prev) => ({
        ...prev,
        [selectedHotspot.id]: rating, // This is simplified; in reality would need full recalc
      }))
    } catch (err) {
      console.error("Rating failed:", err)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-cyber-black">
      <Navbar user={user} />

      <div className="flex-1 flex pt-16 relative overflow-hidden">
        {/* Mobile Toggle Buttons */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden absolute top-2 left-2 z-30 p-2 bg-cyber-dark border border-cyber-gray text-cyber-light"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setFeedOpen(!feedOpen)}
          className="md:hidden absolute top-2 right-2 z-30 p-2 bg-cyber-dark border border-cyber-gray text-cyber-cyan font-mono text-xs"
        >
          FEED
        </button>

        {/* Sidebar - Hotspot List */}
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

        {/* Main Map Area */}
        <div className="flex-1 relative">
          <MapView
            hotspots={hotspots}
            selectedHotspot={selectedHotspot}
            onHotspotSelect={handleHotspotSelect}
            activeCheckins={activeCheckins}
          />

          {/* Hotspot Detail Panel */}
          {selectedHotspot && (
            <HotspotDetail
              hotspot={selectedHotspot}
              activeCheckins={activeCheckins[selectedHotspot.id] || 0}
              averageRating={averageRatings[selectedHotspot.id] || 0}
              userRating={userRatings[selectedHotspot.id] || null}
              isCheckedIn={userCurrentCheckin === selectedHotspot.id}
              onClose={() => setSelectedHotspot(null)}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onRate={handleRate}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Activity Feed Sidebar */}
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
