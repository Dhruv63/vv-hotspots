"use client"

import { useEffect, useState } from "react"
import { getTrendingHotspots } from "@/app/actions/crowd"
import { HotspotCard } from "@/components/hotspot-card"
import type { Hotspot } from "@/lib/types"
import { Flame } from "lucide-react"

export function TrendingHotspots() {
  const [trending, setTrending] = useState<(Hotspot & { recent_checkins: number })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTrending() {
        const data = await getTrendingHotspots(5)
        setTrending(data)
        setLoading(false)
    }
    loadTrending()
  }, [])

  if (loading) return null // Or a skeleton
  if (trending.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
        <h2 className="text-lg font-bold font-heading">Trending Now</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trending.map((hotspot) => (
          <div key={hotspot.id} className="relative">
             <HotspotCard
                hotspot={hotspot}
                activeCheckins={hotspot.recent_checkins}
                variant="compact"
             />
             <div className="absolute top-2 right-2 z-20">
                 <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/90 text-white text-[10px] font-bold rounded-full shadow-lg backdrop-blur-sm">
                    <Flame className="w-3 h-3 fill-white" />
                    Trending
                 </span>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}
