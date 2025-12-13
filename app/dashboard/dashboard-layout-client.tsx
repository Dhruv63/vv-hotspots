"use client"

import { DashboardProvider } from "@/context/dashboard-context"
import { MobileBottomNav } from "@/components/MobileBottomNav"

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        {children}
        <MobileBottomNav />
      </div>
    </DashboardProvider>
  )
}
