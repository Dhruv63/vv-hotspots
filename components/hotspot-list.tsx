"use client"

import { useState } from "react"
import { Search, Filter, List, Grid } from "lucide-react"
import { HotspotCard } from "@/components/hotspot-card"
import { CyberButton } from "@/components/ui/cyber-button"
import { Input } from "@/components/ui/input"
import type { Hotspot } from "@/lib/types"

interface HotspotListProps {
  hotspots: Hotspot[]
  selectedHotspot: Hotspot | null
  onHotspotSelect: (hotspot: Hotspot) => void
  activeCheckins: Record<string, number>
  averageRatings: Record<string, number>
}

const categories = [
  { value: "all", label: "All" },
  { value: "cafe", label: "Cafes" },
  { value: "park", label: "Parks" },
  { value: "gaming", label: "Gaming" },
  { value: "food", label: "Food" },
  { value: "hangout", label: "Hangout" },
]

export function HotspotList({
  hotspots,
  selectedHotspot,
  onHotspotSelect,
  activeCheckins,
  averageRatings,
}: HotspotListProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const filteredHotspots = hotspots.filter((hotspot) => {
    const matchesSearch =
      hotspot.name.toLowerCase().includes(search.toLowerCase()) ||
      hotspot.address.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "all" || hotspot.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-cyber-gray space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-lg text-cyber-light">
            <span className="text-cyber-cyan">{">"}</span> HOTSPOTS
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "text-cyber-cyan" : "text-cyber-gray"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "text-cyber-cyan" : "text-cyber-gray"}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-gray" />
          <Input
            placeholder="Search hotspots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-cyber-black border-cyber-gray text-cyber-light placeholder:text-cyber-gray/50 focus:border-cyber-cyan"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <CyberButton
              key={cat.value}
              variant={category === cat.value ? "cyan" : "ghost"}
              size="sm"
              onClick={() => setCategory(cat.value)}
              className="flex-shrink-0"
            >
              {cat.label}
            </CyberButton>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4" : "space-y-4"}>
          {filteredHotspots.map((hotspot) => (
            <HotspotCard
              key={hotspot.id}
              hotspot={hotspot}
              activeCheckins={activeCheckins[hotspot.id] || 0}
              averageRating={averageRatings[hotspot.id] || 0}
              onClick={() => onHotspotSelect(hotspot)}
              isSelected={selectedHotspot?.id === hotspot.id}
            />
          ))}
        </div>

        {filteredHotspots.length === 0 && (
          <div className="text-center py-12 text-cyber-gray">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-mono">No hotspots found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
