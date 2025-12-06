"use client"

import { useState, useEffect } from "react"
import { X, Check, Grid, List, Map as MapIcon, Activity, Layers } from "lucide-react"
import { useTheme } from "next-themes"
import { THEME_COLORS } from "@/components/map-view"

interface UnifiedMenuDrawerProps {
  isOpen: boolean
  onClose: () => void
  currentView: string // 'all', 'map', 'list', 'grid', 'feed'
  currentCategories: string[]
  onApply: (view: string, categories: string[]) => void
  onClear: () => void
}

export function UnifiedMenuDrawer({
  isOpen,
  onClose,
  currentView,
  currentCategories,
  onApply,
  onClear
}: UnifiedMenuDrawerProps) {
  const [selectedView, setSelectedView] = useState(currentView)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentCategories)
  const { resolvedTheme } = useTheme()
  const theme = (resolvedTheme === "light" ? "light" : "dark") as keyof typeof THEME_COLORS
  const colors = THEME_COLORS[theme]

  // Sync state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setSelectedView(currentView)
      setSelectedCategories(currentCategories)
    }
  }, [isOpen, currentView, currentCategories])

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
    setSelectedCategories(prev => {
      if (prev.includes(cat)) {
        return prev.filter(c => c !== cat)
      } else {
        return [...prev, cat]
      }
    })
  }

  const handleApply = () => {
      onApply(selectedView, selectedCategories)
      // We don't close automatically here? Usually apply closes the drawer.
      onClose()
  }

  const handleClear = () => {
      setSelectedCategories([])
      // Don't reset view on clear filters, just filters.
      // But user said "Clear All Filters", so we just clear categories.
      onClear()
      // If we want to clear everything and apply immediately:
      // onApply(selectedView, [])
      // But typically Clear button clears the form state.
      // We'll just clear the local state for now.
  }

  if (!isOpen) return null

  return (
    <>
       {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:z-[40]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 md:top-16 md:bottom-0 md:left-0 md:right-auto md:w-80 z-[100] md:z-[50]
        bg-cyber-dark border-t-2 md:border-t-0 md:border-r border-cyber-primary md:border-cyber-gray
        rounded-t-2xl md:rounded-none transition-transform duration-300
        flex flex-col shadow-2xl
        ${isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:-translate-x-full"}`}
        style={{ maxHeight: "85vh", height: "100%" }} // Mobile max height, Desktop full height
      >
        <div className="flex items-center justify-between p-4 border-b border-cyber-gray/30">
          <h2 className="text-cyber-primary font-mono text-lg font-bold tracking-wider">MENU</h2>
          <button
            onClick={onClose}
            className="p-2 text-cyber-gray hover:text-cyber-primary transition-colors rounded-full hover:bg-cyber-gray/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* View Options */}
            <section>
                <h3 className="text-cyber-light/70 font-mono text-xs font-bold mb-3 uppercase tracking-wider">View Options</h3>
                <div className="grid grid-cols-2 gap-2">
                    {viewOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setSelectedView(option.value)}
                            className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left
                                ${selectedView === option.value
                                    ? "border-cyber-primary bg-cyber-primary/10 text-cyber-primary shadow-[0_0_10px_rgba(255,255,0,0.2)]"
                                    : "border-cyber-gray/30 bg-cyber-black/30 text-cyber-light hover:border-cyber-gray"
                                }
                            `}
                        >
                            <option.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="font-mono text-xs font-bold">{option.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Filter Categories */}
             <section>
                <h3 className="text-cyber-light/70 font-mono text-xs font-bold mb-3 uppercase tracking-wider">Filter by Category</h3>
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => toggleCategory(cat.value)}
                            className={`flex items-center justify-between w-full p-3 rounded-lg border transition-all
                                ${selectedCategories.includes(cat.value)
                                    ? "border-cyber-primary/50 bg-cyber-primary/5"
                                    : "border-cyber-gray/30 bg-cyber-black/30 hover:border-cyber-gray"
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-2.5 h-2.5 rounded-full shadow-[0_0_5px]"
                                    style={{
                                        backgroundColor: cat.color,
                                        boxShadow: `0 0 5px ${cat.color}`
                                    }}
                                />
                                <span className={`font-mono text-sm ${selectedCategories.includes(cat.value) ? "text-cyber-light" : "text-cyber-gray"}`}>
                                    {cat.label}
                                </span>
                            </div>

                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                                ${selectedCategories.includes(cat.value)
                                    ? "bg-cyber-primary border-cyber-primary"
                                    : "border-cyber-gray bg-transparent"
                                }
                            `}>
                                {selectedCategories.includes(cat.value) && <Check className="w-3.5 h-3.5 text-cyber-black" />}
                            </div>
                        </button>
                    ))}
                </div>
            </section>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-cyber-gray/30 flex gap-3 bg-cyber-dark safe-area-pb">
            <button
                onClick={handleClear}
                className="flex-1 py-3 border border-cyber-gray text-cyber-gray font-mono font-bold rounded-lg hover:border-cyber-light hover:text-cyber-light transition-colors"
            >
                Clear All
            </button>
            <button
                onClick={handleApply}
                className="flex-1 py-3 bg-cyber-primary text-cyber-black font-mono font-bold rounded-lg hover:bg-cyber-primary/90 transition-all shadow-[0_0_15px_rgba(255,255,0,0.3)]"
            >
                Apply
            </button>
        </div>

      </div>
    </>
  )
}
