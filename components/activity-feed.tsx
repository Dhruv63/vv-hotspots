"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import {
  Activity, MapPin, Zap, Radio, Clock, Heart,
  Coffee, Trees, Gamepad2, Utensils, Music, HelpCircle,
  ChevronDown, ChevronUp
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { ActivityFeedItem } from "@/lib/types"

interface ActivityFeedProps {
  initialActivities: ActivityFeedItem[]
  todayCount?: number
  currentUserId?: string
}

export function ActivityFeed({ initialActivities, todayCount = 0, currentUserId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityFeedItem[]>(initialActivities)
  const [dailyCount, setDailyCount] = useState(todayCount)
  const [isConnected, setIsConnected] = useState(false)
  const [newActivityId, setNewActivityId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [, setTick] = useState(0)

  useEffect(() => {
    setActivities(initialActivities)
  }, [initialActivities])

  useEffect(() => {
    setDailyCount(todayCount)
  }, [todayCount])

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("realtime-feed")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "check_ins",
        },
        async (payload: any) => {
          if (payload.eventType === "INSERT" && payload.new.is_active) {
            setDailyCount((prev) => prev + 1)
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
                  likes_count: 0,
                  has_liked: false
                }

                setActivities((prev) => {
                  if (prev.some((a) => a.id === newActivity.id)) {
                    return prev
                  }
                  return [newActivity, ...prev]
                })
                setNewActivityId(payload.new.id)
                setTimeout(() => setNewActivityId(null), 3000)
              }
            } catch (error) {
              console.error("Error processing real-time check-in:", error)
            }
          } else if (payload.eventType === "UPDATE") {
            if (!payload.new.is_active) {
              setActivities((prev) => prev.filter((a) => a.id !== payload.new.id))
            }
          }
        },
      )
      .subscribe((status: any) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    const likesChannel = supabase
      .channel("realtime-likes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "check_in_likes" },
        (payload: any) => {
             const checkInId = payload.new?.check_in_id || payload.old?.check_in_id

             setActivities(prev => prev.map(a => {
               if (a.id !== checkInId) return a

               let newCount = a.likes_count || 0
               let newHasLiked = a.has_liked

               if (payload.eventType === "INSERT") {
                 newCount++
                 if (payload.new.user_id === currentUserId) newHasLiked = true
               } else if (payload.eventType === "DELETE") {
                 newCount = Math.max(0, newCount - 1)
                 if (payload.old.user_id === currentUserId) newHasLiked = false
               }

               return { ...a, likes_count: newCount, has_liked: newHasLiked }
             }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(likesChannel)
    }
  }, [currentUserId])

  const handleLike = async (e: React.MouseEvent, activity: ActivityFeedItem) => {
    e.stopPropagation()
    if (!currentUserId) return // In a real app, trigger login modal

    const isLiked = activity.has_liked

    // Optimistic Update
    setActivities(prev => prev.map(a =>
      a.id === activity.id
        ? { ...a, has_liked: !isLiked, likes_count: (a.likes_count || 0) + (isLiked ? -1 : 1) }
        : a
    ))

    const supabase = createClient()
    if (isLiked) {
      await supabase.from("check_in_likes").delete().eq("user_id", currentUserId).eq("check_in_id", activity.id)
    } else {
      await supabase.from("check_in_likes").insert({ user_id: currentUserId, check_in_id: activity.id })
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "cafe": return "text-cyan-400 border-cyan-400 bg-cyan-950/30"
      case "park": return "text-green-400 border-green-400 bg-green-950/30"
      case "gaming": return "text-purple-400 border-purple-400 bg-purple-950/30"
      case "food": return "text-orange-400 border-orange-400 bg-orange-950/30"
      case "hangout": return "text-yellow-400 border-yellow-400 bg-yellow-950/30"
      default: return "text-gray-400 border-gray-400 bg-gray-900/30"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "cafe": return <Coffee className="w-3 h-3" />
      case "park": return <Trees className="w-3 h-3" />
      case "gaming": return <Gamepad2 className="w-3 h-3" />
      case "food": return <Utensils className="w-3 h-3" />
      case "hangout": return <Music className="w-3 h-3" />
      default: return <HelpCircle className="w-3 h-3" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) {
        return "recently"
      }
      return formatDistanceToNow(date, { addSuffix: true })
        .replace("about ", "")
        .replace(" hours", " hrs")
        .replace(" hour", " hr")
        .replace(" minutes", " mins")
        .replace(" minute", " min")
        .replace("less than a minute", "just now")
    } catch {
      return "recently"
    }
  }

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase()
  }

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

  const visibleActivities = isExpanded ? activities : activities.slice(0, 10)

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyber-gray/30">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyber-primary" />
            <h3 className="font-mono text-base md:text-lg text-cyber-light tracking-wider">LIVE FEED</h3>
          </div>
          {dailyCount > 0 && (
            <div className="text-xs font-mono text-cyber-cyan mt-1">
              <span className="font-bold">{dailyCount}</span> people checked in today
            </div>
          )}
        </div>

        <div
          className={`flex items-center gap-1 text-xs font-mono ${isConnected ? "text-green-400" : "text-cyber-gray"}`}
        >
          <Radio className={`w-3 h-3 ${isConnected ? "animate-pulse" : ""}`} />
          <span>{isConnected ? "LIVE" : "..."}</span>
        </div>
      </div>

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
          {visibleActivities.map((activity) => (
            <div
              key={activity.id}
              className={`
                relative p-3 border transition-all duration-200 rounded-lg min-h-[72px]
                ${
                  activity.id === newActivityId
                    ? "border-cyber-primary bg-cyber-primary/10 shadow-[0_0_20px_var(--color-cyber-primary)] animate-pulse"
                    : "border-cyber-gray/30 bg-cyber-black/50 hover:-translate-y-0.5 hover:bg-cyber-navy hover:border-[rgba(232,255,0,0.3)]"
                }
              `}
            >
              {activity.id === newActivityId && (
                <div className="absolute -top-1 -right-1 flex items-center gap-1 px-2 py-0.5 bg-cyber-primary text-cyber-black text-[10px] font-mono font-bold rounded">
                  <Zap className="w-3 h-3" />
                  NEW
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  {activity.avatar_url ? (
                    <img
                      src={activity.avatar_url || "/placeholder.svg"}
                      alt={activity.username || "User"}
                      className="w-12 h-12 border-2 border-cyber-primary object-cover rounded-full shadow-[0_0_10px_var(--color-cyber-primary)]"
                    />
                  ) : (
                    <div className={`w-12 h-12 border-2 border-cyber-primary flex items-center justify-center rounded-full shadow-[0_0_10px_var(--color-cyber-primary)] ${getUserColor(activity.username || "Anonymous")} text-white`}>
                      <span className="font-mono font-bold text-lg">{getInitials(activity.username || "AN")}</span>
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-cyber-black rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-cyber-gray font-mono">
                      <span className="text-cyber-light font-bold">{activity.username || "Anonymous"}</span>
                      <span className="mx-1">@</span>
                      <span className="text-cyber-cyan truncate">{activity.hotspot_name}</span>
                      <span className="ml-2 inline-flex align-middle">{getCategoryIcon(activity.hotspot_category)}</span>
                    </p>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-cyber-gray text-xs font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(activity.checked_in_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 border-t border-white/5 pt-2">
                      <button
                        onClick={(e) => handleLike(e, activity)}
                        className="flex items-center gap-1 group"
                      >
                        <Heart
                          className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${activity.has_liked ? "fill-[#FF006E] text-[#FF006E]" : "text-cyber-gray group-hover:text-[#FF006E]"}`}
                        />
                        <span className={`text-xs font-mono ${activity.has_liked ? "text-[#FF006E]" : "text-cyber-gray"}`}>
                          {activity.likes_count || 0}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!isExpanded && activities.length > 10 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full py-2 mt-2 flex items-center justify-center gap-2 text-xs font-mono text-cyber-cyan border border-cyber-cyan/30 rounded hover:bg-cyber-cyan/10 transition-colors"
            >
              <ChevronDown className="w-3 h-3" />
              View All Activity ({activities.length})
            </button>
          )}

          {isExpanded && (
             <button
              onClick={() => setIsExpanded(false)}
              className="w-full py-2 mt-2 flex items-center justify-center gap-2 text-xs font-mono text-cyber-cyan border border-cyber-cyan/30 rounded hover:bg-cyber-cyan/10 transition-colors"
            >
              <ChevronUp className="w-3 h-3" />
              Show Less
            </button>
          )}
        </div>
      )}
    </div>
  )
}
