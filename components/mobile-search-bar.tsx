"use client"

import { Search, X, Coffee, Trees, Gamepad2, Utensils, Users } from "lucide-react"
import { useRef } from "react"
import { cn } from "@/lib/utils"

interface MobileSearchBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  activeFilters: string[]
  onFilterChange: (filters: string[]) => void
  className?: string
}

export function MobileSearchBar({
  searchTerm,
  onSearchChange,
  activeFilters,
  onFilterChange,
  className,
}: MobileSearchBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const filters = [
    { id: "cafe", label: "Cafes", icon: Coffee, color: "text-cyan-400" },
    { id: "park", label: "Parks", icon: Trees, color: "text-lime-400" },
    { id: "food", label: "Food", icon: Utensils, color: "text-orange-400" },
    { id: "gaming", label: "Gaming", icon: Gamepad2, color: "text-purple-400" },
    { id: "hangout", label: "Hangout", icon: Users, color: "text-pink-400" },
  ]

  const handleFilterClick = (id: string) => {
    if (activeFilters.includes(id)) {
      onFilterChange(activeFilters.filter((f) => f !== id))
    } else {
      onFilterChange([...activeFilters, id])
    }
  }

  const handleClear = () => {
    onSearchChange("")
    onFilterChange([])
  }

  return (
    <div className={cn("flex flex-col gap-3 p-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b border-border shadow-sm", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search cafes, beaches, parks..."
          className="w-full h-10 pl-9 pr-9 bg-muted border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
        />
        {(searchTerm || activeFilters.length > 0) && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-gradient-x pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <button
          onClick={() => onFilterChange([])}
          className={cn(
            "flex items-center justify-center px-4 h-8 rounded-full text-xs font-medium whitespace-nowrap border transition-all flex-shrink-0",
            activeFilters.length === 0
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/50"
          )}
        >
          All
        </button>
        {filters.map((filter) => {
          const Icon = filter.icon
          const isActive = activeFilters.includes(filter.id)
          return (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-medium whitespace-nowrap border transition-all flex-shrink-0",
                isActive
                  ? "bg-accent/10 border-accent text-accent shadow-[0_0_10px_var(--color-primary)]"
                  : "bg-card text-muted-foreground border-border hover:border-accent/50"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", isActive ? "text-accent" : filter.color)} />
              {filter.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
