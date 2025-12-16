"use client"

import { usePathname } from "next/navigation"
import { AppProvider, useAppContext } from "@/context/app-context"
import dynamic from "next/dynamic"
import { ReactNode, useEffect, useState } from "react"
import { Hotspot } from "@/lib/types"

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
  activeCheckins,
  userCurrentCheckin,
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
        {/* Persistent Map Layer */}
        {/*
            NOTE: Conditional rendering ensures the MapView unmounts when leaving the dashboard,
            preventing potential conflicts with other map instances (e.g., "Map container is being reused" errors).
            While this sacrifices state persistence across routes, it ensures stability.
        */}
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
