"use client"

import { useEffect, useRef } from "react"
import { X, Check, Grid, List, Map as MapIcon, Activity, Layers, ArrowLeft, Users } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { THEME_COLORS } from "@/components/map-view"

interface UnifiedMenuDrawerProps {
  isOpen: boolean
  onClose: () => void
  currentView: string // 'all', 'map', 'list', 'grid', 'feed'
  currentCategories: string[]
  showFriendsOnly: boolean
  onToggleFriendsOnly: (value: boolean) => void
  onApply: (view: string, categories: string[]) => void
  onClear: () => void
}

export function UnifiedMenuDrawer({
  isOpen,
  onClose,
  currentView,
  currentCategories,
  showFriendsOnly,
  onToggleFriendsOnly,
  onApply,
  onClear
}: UnifiedMenuDrawerProps) {
  const { theme: currentTheme } = useTheme()
  const theme = currentTheme as keyof typeof THEME_COLORS
  const colors = THEME_COLORS[theme] || THEME_COLORS.cyberpunk

  // Touch handling for swipe-down to close
  const touchStartY = useRef<number | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null || !drawerRef.current) return
    const touchY = e.touches[0].clientY
    const diff = touchY - touchStartY.current

    // If swiping down and at the top of the scroll container
    if (diff > 50 && drawerRef.current.scrollTop === 0) {
      // Could add visual feedback here (transform)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return
    const touchY = e.changedTouches[0].clientY
    const diff = touchY - touchStartY.current

    if (diff > 100) { // Threshold for closing
      onClose()
    }
    touchStartY.current = null
  }

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isOpen, onClose])

  const categories = [
    { value: "cafe", label: "Cafes", color: colors.cafe.main },
    { value: "park", label: "Parks", color: colors.park.main },
    { value: "gaming", label: "Gaming", color: colors.gaming.main },
    { value: "food", label: "Food", color: colors.food.main },
    { value: "hangout", label: "Hangout", color: colors.hangout.main },
    { value: "other", label: "Other", color: colors.other.main },
  ]

  const viewOptions = [
    { value: "all", label: "All Places", icon: Layers },
    { value: "grid", label: "Grid View", icon: Grid },
    { value: "list", label: "List View", icon: List },
    { value: "map", label: "Map Only", icon: MapIcon },
    { value: "feed", label: "Feed", icon: Activity },
  ]

  const toggleCategory = (cat: string) => {
    let newCategories: string[]
    if (currentCategories.includes(cat)) {
      newCategories = currentCategories.filter(c => c !== cat)
    } else {
      newCategories = [...currentCategories, cat]
    }
    onApply(currentView, newCategories)
  }

  const setView = (view: string) => {
    onApply(view, currentCategories)
  }

  if (!isOpen) return null

  return (
    <>
       {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:z-[40] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed inset-x-0 bottom-0 md:top-16 md:bottom-0 md:left-0 md:right-auto md:w-80 z-[100] md:z-[50]
        bg-card border-t-2 md:border-t-0 md:border-r border-primary md:border-border
        rounded-t-2xl md:rounded-none transition-transform duration-300 ease-out
        flex flex-col shadow-2xl
        ${isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:-translate-x-full"}`}
        style={{ maxHeight: "85vh", height: "100%" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle for Mobile */}
        <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={onClose}>
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full"></div>
        </div>

        <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
                <button
                    onClick={onClose}
                    className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-muted/10"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-primary font-mono text-lg font-bold tracking-wider">FILTERS</h2>
                    {currentCategories.length > 0 && (
                        <p className="text-xs font-mono text-muted-foreground">{currentCategories.length} selected</p>
                    )}
                </div>
            </div>
          <button
            onClick={onClose}
            className="hidden md:block p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-muted/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* View Options */}
            <section>
                <h3 className="text-foreground/70 font-mono text-xs font-bold mb-3 uppercase tracking-wider">View Options</h3>
                <div className="grid grid-cols-2 gap-2">
                    {viewOptions.map((option) => {
                        const isActive = currentView === option.value
                        return (
                            <button
                                key={option.value}
                                onClick={() => setView(option.value)}
                                className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left duration-200
                                    ${isActive
                                        ? "border-primary bg-primary/10 text-primary shadow-lg"
                                        : "border-border bg-muted/30 text-foreground hover:border-muted-foreground"
                                    }
                                `}
                            >
                                <option.icon className="w-4 h-4 flex-shrink-0" />
                                <span className="font-mono text-xs font-bold">{option.label}</span>
                            </button>
                        )
                    })}
                </div>
            </section>

            {/* Social Filters */}
            <section>
                 <h3 className="text-foreground/70 font-mono text-xs font-bold mb-3 uppercase tracking-wider">Social</h3>
                 <button
                    onClick={() => onToggleFriendsOnly(!showFriendsOnly)}
                    className={`flex items-center justify-between w-full p-3 rounded-lg border transition-all duration-200
                        ${showFriendsOnly
                            ? "border-primary bg-primary/10"
                            : "border-border bg-muted/30 hover:border-muted-foreground"
                        }
                    `}
                >
                     <div className="flex items-center gap-3">
                          <Users className={`w-4 h-4 ${showFriendsOnly ? "text-primary" : 'text-muted-foreground'}`} />
                          <span className={`font-mono text-sm transition-colors ${showFriendsOnly ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                                Friends Only
                          </span>
                     </div>
                     <div className={`w-10 h-5 rounded-full border relative transition-colors duration-300
                          ${showFriendsOnly ? "border-primary bg-primary/10" : "border-muted-foreground bg-transparent"}
                     `}>
                          <div className={`absolute top-0.5 bottom-0.5 w-3.5 h-3.5 rounded-full transition-all duration-300
                               ${showFriendsOnly ? "right-0.5 bg-primary" : "left-0.5 bg-muted-foreground"}
                          `} style={{ right: showFriendsOnly ? '2px' : 'auto', left: showFriendsOnly ? 'auto' : '2px' }} />
                     </div>
                </button>
            </section>

            {/* Filter Categories */}
             <section>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-foreground/70 font-mono text-xs font-bold uppercase tracking-wider">Categories</h3>
                    {currentCategories.length > 0 && (
                         <button
                            onClick={onClear}
                            className="text-xs font-mono text-muted-foreground hover:text-primary underline decoration-dotted underline-offset-4"
                        >
                            Clear All
                        </button>
                    )}
                </div>
                <div className="space-y-2">
                    {categories.map((cat) => {
                        const isSelected = currentCategories.includes(cat.value)
                        return (
                            <button
                                key={cat.value}
                                onClick={() => toggleCategory(cat.value)}
                                className={`flex items-center justify-between w-full p-3 rounded-lg border transition-all duration-200
                                    ${isSelected
                                        ? "border-primary bg-primary/10"
                                        : "border-border bg-muted/30 hover:border-muted-foreground"
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full shadow-[0_0_5px] transition-transform duration-300"
                                        style={{
                                            backgroundColor: cat.color,
                                            boxShadow: `0 0 5px ${cat.color}`,
                                            transform: isSelected ? 'scale(1.2)' : 'scale(1)'
                                        }}
                                    />
                                    <span className={`font-mono text-sm transition-colors ${isSelected ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                                        {cat.label}
                                    </span>
                                </div>

                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200
                                    ${isSelected
                                        ? "bg-primary border-transparent"
                                        : "border-muted-foreground bg-transparent"
                                    }
                                `}>
                                    <Check className={`w-3.5 h-3.5 text-primary-foreground transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                                </div>
                            </button>
                        )
                    })}
                </div>
            </section>
        </div>
      </div>
    </>
  )
}
