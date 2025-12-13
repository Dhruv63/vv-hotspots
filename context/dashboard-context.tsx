"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

interface DashboardContextType {
  viewMode: string
  setViewMode: (mode: string) => void
  isMenuOpen: boolean
  setIsMenuOpen: (isOpen: boolean) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewModeState] = useState<string>("map")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const savedView = localStorage.getItem("vv-view-mode")
    if (savedView) {
      setViewModeState(savedView)
    }
  }, [])

  const setViewMode = useCallback((mode: string) => {
    setViewModeState(mode)
    localStorage.setItem("vv-view-mode", mode)
  }, [])

  // Avoid hydration mismatch by rendering children only after mount if viewMode depends on localStorage?
  // Actually, we can just default to 'map' on server and update on client.
  // But if we want to avoid flash, we just accept the update.

  return (
    <DashboardContext.Provider value={{ viewMode, setViewMode, isMenuOpen, setIsMenuOpen }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboardContext() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboardContext must be used within a DashboardProvider")
  }
  return context
}
