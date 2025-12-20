"use client"

import { Map, List, Grid, Activity, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  currentView: string
  onViewChange: (view: string) => void
  onMenuClick: () => void
}

export function BottomNav({ currentView, onViewChange, onMenuClick }: BottomNavProps) {
  const tabs = [
    { id: "map", label: "Map", icon: Map },
    { id: "list", label: "List", icon: List },
    { id: "grid", label: "Grid", icon: Grid },
    { id: "feed", label: "Feed", icon: Activity },
    { id: "menu", label: "Menu", icon: Menu },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] glass border-t border-white/10 h-16 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around h-full px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.id === "menu" ? false : currentView === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => tab.id === "menu" ? onMenuClick() : onViewChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 active:scale-90",
                isActive
                  ? "text-primary -translate-y-1"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn("relative transition-all duration-300", isActive && "drop-shadow-[0_0_8px_var(--color-primary)]")}>
                <Icon
                  className={cn("w-6 h-6 transition-all", isActive && "fill-primary/20 scale-110")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_var(--color-primary)]" />
                )}
              </div>
              <span className={cn("text-[10px] font-medium transition-colors", isActive && "text-primary font-bold")}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
