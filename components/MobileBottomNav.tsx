"use client"

import { Map, List, LayoutGrid, Activity, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useViewMode } from "@/hooks/useViewMode"
import { useDashboardContext } from "@/context/dashboard-context"

export function MobileBottomNav() {
  const [viewMode, setViewMode] = useViewMode()
  const { setIsMenuOpen } = useDashboardContext()

  const tabs = [
    { id: "map", label: "Map", icon: Map },
    { id: "list", label: "List", icon: List },
    { id: "grid", label: "Grid", icon: LayoutGrid },
    { id: "feed", label: "Feed", icon: Activity },
    { id: "menu", label: "Menu", icon: Menu },
  ]

  const handleTabClick = (id: string) => {
    if (id === "menu") {
      setIsMenuOpen(true)
    } else {
      setViewMode(id)
    }
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-background/95 backdrop-blur-sm border-t border-border h-16 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-full px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.id === "menu" ? false : viewMode === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[48px] h-full gap-1 active:scale-95 transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={tab.label}
            >
              <Icon
                className={cn(
                  "w-6 h-6 transition-all duration-300",
                  isActive && "fill-primary/20 scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(
                "text-[10px] font-medium transition-opacity duration-300",
                isActive ? "opacity-100" : "opacity-70"
              )}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
