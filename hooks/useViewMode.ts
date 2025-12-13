"use client"

import { useDashboardContext } from "@/context/dashboard-context"

export function useViewMode() {
  const { viewMode, setViewMode } = useDashboardContext()
  return [viewMode, setViewMode] as const
}
