"use client"

import { formatDistanceToNow } from "date-fns"
import { Activity, MapPin, User } from "lucide-react"
import { CyberCard } from "@/components/ui/cyber-card"
import { CategoryBadge } from "@/components/ui/category-badge"
import type { ActivityFeedItem } from "@/lib/types"

interface ActivityFeedProps {
  activities: ActivityFeedItem[]
  isLoading?: boolean
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <CyberCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-cyber-cyan" />
          <h3 className="font-mono text-lg text-cyber-light">LIVE FEED</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-cyber-gray/20 rounded" />
            </div>
          ))}
        </div>
      </CyberCard>
    )
  }

  return (
    <CyberCard className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-cyber-cyan animate-pulse" />
        <h3 className="font-mono text-lg text-cyber-light">LIVE FEED</h3>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-cyber-gray">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="font-mono text-sm">No recent activity</p>
          <p className="text-xs">Be the first to check in!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="p-3 bg-cyber-black/50 border border-cyber-gray/50 hover:border-cyber-cyan/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-cyber-cyan/20 border border-cyber-cyan flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-cyber-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-cyber-light text-sm">
                    <span className="font-mono text-cyber-cyan">{activity.username || "Anonymous"}</span> checked in at{" "}
                    <span className="font-semibold">{activity.hotspot_name}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <CategoryBadge category={activity.hotspot_category as any} className="text-[10px] py-0.5 px-1.5" />
                    <span className="text-cyber-gray text-xs">
                      {formatDistanceToNow(new Date(activity.checked_in_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CyberCard>
  )
}
