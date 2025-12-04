"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Activity, MapPin, User, Zap, Radio } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { ActivityFeedItem } from "@/lib/types"

interface ActivityFeedProps {
  initialActivities: ActivityFeedItem[]
}

export function ActivityFeed({ initialActivities }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityFeedItem[]>(initialActivities)
  const [isConnected, setIsConnected] = useState(false)
  const [newActivityId, setNewActivityId] = useState<string | null>(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("realtime-checkins")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "check_ins",
          filter: "is_active=eq.true",
        },
        async (payload: any) => {
          try {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("username, avatar_url")
              .eq("id", payload.new.user_id)
              .maybeSingle()

            const { data: hotspotData } = await supabase
              .from("hotspots")
              .select("name, category")
              .eq("id", payload.new.hotspot_id)
              .maybeSingle()

            if (hotspotData) {
              const newActivity: ActivityFeedItem = {
                id: payload.new.id,
                user_id: payload.new.user_id,
                hotspot_id: payload.new.hotspot_id,
                username: profileData?.username || "Anonymous",
                avatar_url: profileData?.avatar_url || null,
                hotspot_name: hotspotData.name,
                hotspot_category: hotspotData.category,
                checked_in_at: payload.new.checked_in_at,
              }

              setActivities((prev) => {
                if (prev.some((a) => a.id === newActivity.id)) {
                  return prev
                }
                return [newActivity, ...prev.slice(0, 49)]
              })
              setNewActivityId(payload.new.id)
              setTimeout(() => setNewActivityId(null), 3000)
            }
          } catch (error) {
            console.error("Error processing real-time check-in:", error)
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "check_ins",
          filter: "is_active=eq.false",
        },
        (payload: any) => {
          setActivities((prev) => prev.filter((a) => a.id !== payload.new.id))
        },
      )
      .subscribe((status: any) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "cafe":
        return "text-cyber-cyan border-cyber-cyan bg-cyber-cyan/10"
      case "park":
        return "text-green-400 border-green-400 bg-green-400/10"
      case "gaming":
        return "text-cyber-purple border-cyber-purple bg-cyber-purple/10"
      case "food":
        return "text-yellow-400 border-yellow-400 bg-yellow-400/10"
      case "hangout":
        return "text-cyber-pink border-cyber-pink bg-cyber-pink/10"
      default:
        return "text-cyber-gray border-cyber-gray bg-cyber-gray/10"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) {
        return "recently"
      }
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return "recently"
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with real-time indicator */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyber-gray/30">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="w-5 h-5 text-cyber-cyan" />
            {isConnected && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>
          <h3 className="font-mono text-base md:text-lg text-cyber-light tracking-wider">LIVE FEED</h3>
        </div>

        <div
          className={`flex items-center gap-1 text-xs font-mono ${isConnected ? "text-green-400" : "text-cyber-gray"}`}
        >
          <Radio className={`w-3 h-3 ${isConnected ? "animate-pulse" : ""}`} />
          <span>{isConnected ? "LIVE" : "..."}</span>
        </div>
      </div>

      {/* Activity list */}
      {activities.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-cyber-gray py-8">
          <div className="w-16 h-16 border border-cyber-gray/30 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 opacity-50" />
          </div>
          <p className="font-mono text-sm">No recent activity</p>
          <p className="text-xs mt-1 opacity-70">Be the first to check in!</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`
                relative p-3 border transition-all duration-500 rounded-lg min-h-[72px]
                ${
                  activity.id === newActivityId
                    ? "border-cyber-cyan bg-cyber-cyan/10 shadow-[0_0_20px_rgba(0,255,255,0.3)] animate-pulse"
                    : "border-cyber-gray/30 bg-cyber-black/50 hover:border-cyber-cyan/50 hover:bg-cyber-cyan/5"
                }
              `}
            >
              {activity.id === newActivityId && (
                <div className="absolute -top-1 -right-1 flex items-center gap-1 px-2 py-0.5 bg-cyber-cyan text-cyber-black text-[10px] font-mono font-bold rounded">
                  <Zap className="w-3 h-3" />
                  NEW
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {activity.avatar_url ? (
                    <img
                      src={activity.avatar_url || "/placeholder.svg"}
                      alt={activity.username || "User"}
                      className="w-11 h-11 md:w-10 md:h-10 border-2 border-cyber-cyan object-cover rounded-full"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="w-11 h-11 md:w-10 md:h-10 bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border-2 border-cyber-cyan flex items-center justify-center rounded-full">
                      <User className="w-5 h-5 text-cyber-cyan" />
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-cyber-black rounded-full" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-tight">
                    <span className="font-mono text-cyber-cyan font-semibold">{activity.username || "Anonymous"}</span>
                    <span className="text-cyber-gray mx-1">checked in at</span>
                    <span className="text-cyber-light font-medium">{activity.hotspot_name}</span>
                  </p>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className={`
                      text-[10px] font-mono px-2 py-0.5 border uppercase tracking-wider rounded
                      ${getCategoryColor(activity.hotspot_category)}
                    `}
                    >
                      {activity.hotspot_category}
                    </span>

                    <span className="text-cyber-gray text-xs font-mono">{formatTimestamp(activity.checked_in_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer stats */}
      <div className="mt-4 pt-3 border-t border-cyber-gray/30">
        <div className="flex items-center justify-between text-xs font-mono text-cyber-gray">
          <span>{activities.length} recent check-ins</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" />
            Real-time updates
          </span>
        </div>
      </div>
    </div>
  )
}
