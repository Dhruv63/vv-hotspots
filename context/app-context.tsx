"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"
import type { Hotspot } from "@/lib/types"

interface AppContextType {
  selectedHotspot: Hotspot | null
  setSelectedHotspot: (hotspot: Hotspot | null) => void
  viewMode: string
  setViewMode: (mode: string) => void
  userLocation: [number, number] | null
  setUserLocation: (location: [number, number] | null) => void
  isMapVisible: boolean
  setIsMapVisible: (visible: boolean) => void
  lastMapCenter: [number, number] | null
  setLastMapCenter: (center: [number, number] | null) => void

  // Filter State
  filterCategories: string[]
  setFilterCategories: (cats: string[]) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  showFriendsOnly: boolean
  setShowFriendsOnly: (show: boolean) => void
  friendVisitedHotspotIds: string[]
  setFriendVisitedHotspotIds: (ids: string[]) => void

  // Modal State
  isCheckInModalOpen: boolean
  setIsCheckInModalOpen: (open: boolean) => void
  isRateModalOpen: boolean
  setIsRateModalOpen: (open: boolean) => void
  actionHotspot: Hotspot | null
  setActionHotspot: (h: Hotspot | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)
  const [viewMode, setViewMode] = useState<string>("map")
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [isMapVisible, setIsMapVisible] = useState(true)
  const [lastMapCenter, setLastMapCenter] = useState<[number, number] | null>(null)

  const [filterCategories, setFilterCategories] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showFriendsOnly, setShowFriendsOnly] = useState(false)
  const [friendVisitedHotspotIds, setFriendVisitedHotspotIds] = useState<string[]>([])

  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false)
  const [isRateModalOpen, setIsRateModalOpen] = useState(false)
  const [actionHotspot, setActionHotspot] = useState<Hotspot | null>(null)

  // Sync viewMode with localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem('vv-view-mode')
      if (saved) setViewMode(saved)
    }
  }, [])

  const handleSetViewMode = (mode: string) => {
    setViewMode(mode)
    if (typeof window !== "undefined") {
      localStorage.setItem('vv-view-mode', mode)
    }
  }

  return (
    <AppContext.Provider
      value={{
        selectedHotspot,
        setSelectedHotspot,
        viewMode,
        setViewMode: handleSetViewMode,
        userLocation,
        setUserLocation,
        isMapVisible,
        setIsMapVisible,
        lastMapCenter,
        setLastMapCenter,
        filterCategories,
        setFilterCategories,
        searchTerm,
        setSearchTerm,
        showFriendsOnly,
        setShowFriendsOnly,
        friendVisitedHotspotIds,
        setFriendVisitedHotspotIds,
        isCheckInModalOpen,
        setIsCheckInModalOpen,
        isRateModalOpen,
        setIsRateModalOpen,
        actionHotspot,
        setActionHotspot
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
