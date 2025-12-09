"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Activity, MapPin, User, Zap, Radio, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { EmptyState } from "@/components/empty-state"
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
    setActivities(initialActivities)
  }, [initialActivities])

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
          event: "*",
          schema: "public",
          table: "check_ins",
        },
        async (payload: any) => {
          if (payload.eventType === "INSERT" && payload.new.is_active) {
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
          } else if (payload.eventType === "UPDATE") {
            if (!payload.new.is_active) {
              // Check-out or deactivated
              setActivities((prev) => prev.filter((a) => a.id !== payload.new.id))
            }
          }
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
      case "park":
      case "gaming":
      case "food":
      case "hangout":
        return "bg-cyber-primary text-cyber-black border-cyber-primary font-bold shadow-[0_0_5px_var(--color-cyber-primary)]"
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
      // Shorten "about 2 hours ago" to "2 hrs ago"
      return formatDistanceToNow(date, { addSuffix: true })
        .replace("about ", "")
        .replace(" hours", " hrs")
        .replace(" hour", " hr")
        .replace(" minutes", " mins")
        .replace(" minute", " min")
        .replace("less than a min", "now")
    } catch {
      return "recently"
    }
  }

  // Generate initials from username
  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase()
  }

  // Generate consistent color from username
  const getUserColor = (name: string) => {
    const colors = [
      "bg-red-500", "bg-orange-500", "bg-amber-500",
      "bg-green-500", "bg-emerald-500", "bg-teal-500",
      "bg-cyan-500", "bg-sky-500", "bg-blue-500",
      "bg-indigo-500", "bg-violet-500", "bg-purple-500",
      "bg-fuchsia-500", "bg-pink-500", "bg-rose-500"
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with real-time indicator */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyber-gray/30">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="w-5 h-5 text-cyber-primary" />
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
        <EmptyState
          icon={Activity}
          title="No recent activity"
          description="No one's checked in recently. Be the first!"
          variant="purple"
          className="flex-1 py-8"
        />
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`
                relative p-3 border transition-all duration-500 rounded-lg min-h-[72px]
                ${
                  activity.id === newActivityId
                    ? "border-cyber-primary bg-cyber-primary/10 shadow-[0_0_20px_var(--color-cyber-primary)] animate-pulse"
                    : "border-cyber-gray/30 bg-cyber-black/50 hover:border-cyber-primary/50 hover:bg-cyber-primary/5"
                }
              `}
            >
              {activity.id === newActivityId && (
                <div className="absolute -top-1 -right-1 flex items-center gap-1 px-2 py-0.5 bg-cyber-primary text-cyber-black text-[10px] font-mono font-bold rounded">
                  <Zap className="w-3 h-3" />
                  NEW
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {activity.avatar_url ? (
                    <img
                      src={activity.avatar_url || "/placeholder.svg"}
                      alt={activity.username || "User"}
                      className="w-12 h-12 border-2 border-cyber-primary object-cover rounded-full shadow-[0_0_10px_var(--color-cyber-primary)]"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  ) : (
                    <div className={`w-12 h-12 border-2 border-cyber-primary flex items-center justify-center rounded-full shadow-[0_0_10px_var(--color-cyber-primary)] ${getUserColor(activity.username || "Anonymous")} text-white`}>
                      <span className="font-mono font-bold text-lg">{getInitials(activity.username || "AN")}</span>
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-cyber-black rounded-full" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-cyber-gray font-mono">
                      <span className="text-cyber-primary font-bold">{activity.username || "Anonymous"}</span> checked in
                    </p>
                    <p className="text-lg text-cyber-light font-bold leading-tight line-clamp-2">
                        {activity.hotspot_name}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span
                      className={`
                      text-[10px] font-mono px-2 py-0.5 border uppercase tracking-wider rounded font-bold
                      ${getCategoryColor(activity.hotspot_category)}
                    `}
                    >
                      {activity.hotspot_category}
                    </span>

                    <span className="text-cyber-gray text-xs font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(activity.checked_in_at)}
                    </span>
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
            <span className="w-2 h-2 bg-cyber-primary rounded-full animate-pulse" />
            Real-time updates
          </span>
        </div>
      </div>
    </div>
  )
}
