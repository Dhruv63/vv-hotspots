"use client"

import { usePathname } from "next/navigation"
import { AppProvider, useAppContext } from "@/context/app-context"
import dynamic from "next/dynamic"
import { ReactNode, useEffect, useState } from "react"
import { Hotspot } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

// Dynamic import for MapView to avoid SSR issues
const MapView = dynamic(() => import("@/components/map-view").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse" />,
})

interface MainLayoutShellProps {
  children: ReactNode
  hotspots: Hotspot[]
  activeCheckins: Record<string, number>
  userCurrentCheckin: string | null
  userRatings: Record<string, number>
}

function PersistentMapShell({
  children,
  hotspots,
  activeCheckins: initialActiveCheckins,
  userCurrentCheckin: initialUserCheckin,
  userRatings,
}: MainLayoutShellProps) {
  const pathname = usePathname()
  const {
    selectedHotspot,
    setSelectedHotspot,
    viewMode,
    setUserLocation,
    isMapVisible,
    setIsMapVisible,
    filterCategories,
    searchTerm,
    showFriendsOnly,
    friendVisitedHotspotIds,
    setActionHotspot,
    setIsCheckInModalOpen
  } = useAppContext()

  const [activeCheckins, setActiveCheckins] = useState(initialActiveCheckins)
  const [userCurrentCheckin, setUserCurrentCheckin] = useState(initialUserCheckin)

  // Sync props if they change (e.g. initial load)
  useEffect(() => {
    setActiveCheckins(initialActiveCheckins)
  }, [initialActiveCheckins])

  useEffect(() => {
      setUserCurrentCheckin(initialUserCheckin)
  }, [initialUserCheckin])

  // Real-time subscription for global checkins
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
        .channel("global-checkins-map")
        .on("postgres_changes", { event: "*", schema: "public", table: "check_ins" }, handleCheckInChange)
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }, [])

  // Determine if map should be visible
  const isDashboard = pathname === "/dashboard"
  const shouldShowMap = isDashboard

  useEffect(() => {
    setIsMapVisible(shouldShowMap)
  }, [shouldShowMap, setIsMapVisible])

  const handleHotspotSelect = (h: Hotspot) => setSelectedHotspot(h)

  // Filter Logic
  const filteredHotspots = hotspots.filter((h) => {
      if (filterCategories.length > 0 && !filterCategories.includes(h.category)) return false
      if (showFriendsOnly && !friendVisitedHotspotIds.includes(h.id)) return false
      if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase()
          return h.name.toLowerCase().includes(lowerTerm) || h.address.toLowerCase().includes(lowerTerm)
      }
      return true
  })

  return (
    <div className="relative w-full h-full overflow-hidden bg-background/0">
        {shouldShowMap && (
            <div
                className="absolute inset-0 z-0"
                style={{
                    visibility: 'visible',
                    pointerEvents: 'auto'
                }}
            >
                 <MapView
                    hotspots={filteredHotspots}
                    selectedHotspot={selectedHotspot}
                    onHotspotSelect={handleHotspotSelect}
                    activeCheckins={activeCheckins}
                    userCurrentCheckin={userCurrentCheckin}
                    onCheckIn={(h) => {
                        setActionHotspot(h)
                        setIsCheckInModalOpen(true)
                    }}
                    isLoading={false}
                    onLocationUpdate={setUserLocation}
                    viewMode={viewMode}
                    isVisible={true}
                />
            </div>
        )}

        {/* Page Content Layer */}
        <div className="relative z-10 w-full h-full pointer-events-none">
             {children}
        </div>
    </div>
  )
}

export function MainLayoutShell(props: MainLayoutShellProps) {
    return (
        <AppProvider>
            <PersistentMapShell {...props} />
        </AppProvider>
    )
}
