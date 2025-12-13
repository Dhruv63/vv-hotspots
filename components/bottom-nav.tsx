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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-sm border-t border-border h-16 pb-safe">
      <div className="flex items-center justify-around h-full px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.id === "menu" ? false : currentView === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => tab.id === "menu" ? onMenuClick() : onViewChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
