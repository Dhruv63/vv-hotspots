"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { User, Loader2 } from "lucide-react"

interface ActiveUser {
  user_id: string
  username: string
  avatar_url: string | null
  checked_in_at: string
}

interface ActiveUsersListProps {
  hotspotId: string
}

export function ActiveUsersList({ hotspotId }: ActiveUsersListProps) {
  const [users, setUsers] = useState<ActiveUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    const supabase = createClient()

    // 1. Fetch active check-ins
    const { data: checkIns, error: checkInError } = await supabase
      .from("check_ins")
      .select("user_id, checked_in_at")
      .eq("hotspot_id", hotspotId)
      .eq("is_active", true)
      .order("checked_in_at", { ascending: false })

    if (checkInError) {
      console.error("Error fetching check-ins:", checkInError)
      setLoading(false)
      return
    }

    if (!checkIns || checkIns.length === 0) {
      setUsers([])
      setLoading(false)
      return
    }

    // 2. Fetch profiles for these users
    const userIds = checkIns.map((c: any) => c.user_id)
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", userIds)

    if (profileError) {
      console.error("Error fetching profiles:", profileError)
      setLoading(false)
      return
    }

    // 3. Merge data
    const mappedUsers = checkIns.map((checkIn: any) => {
      const profile = profiles?.find((p: any) => p.id === checkIn.user_id)
      return {
        user_id: checkIn.user_id,
        username: profile?.username || "Anonymous",
        avatar_url: profile?.avatar_url || null,
        checked_in_at: checkIn.checked_in_at,
      }
    })

    setUsers(mappedUsers)
    setLoading(false)
  }, [hotspotId])

  useEffect(() => {
    fetchUsers()

    const supabase = createClient()
    const channel = supabase
      .channel(`active-users-${hotspotId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "check_ins",
          filter: `hotspot_id=eq.${hotspotId}`,
        },
        () => {
          fetchUsers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [hotspotId, fetchUsers])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-cyber-gray text-sm py-2 px-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="font-mono">Loading active users...</span>
      </div>
    )
  }

  if (users.length === 0) {
    return null
  }

  return (
    <div className="p-4 bg-cyber-black/30 border border-cyber-cyan/30 rounded-lg backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,255,0.1)]">
      <h3 className="text-cyber-cyan font-mono text-sm font-bold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,255,34,0.8)]"/>
        CURRENTLY HERE ({users.length})
      </h3>

      <div className="flex flex-wrap gap-4">
        {users.map((user) => (
          <div key={user.user_id} className="flex flex-col items-center gap-2 group w-16 relative">
            <div className="relative">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-12 h-12 rounded-full border-2 border-cyber-cyan/50 group-hover:border-cyber-cyan transition-colors object-cover bg-cyber-black"
                />
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-cyber-cyan/50 group-hover:border-cyber-cyan transition-colors bg-cyber-dark flex items-center justify-center">
                  <User className="w-6 h-6 text-cyber-cyan/70" />
                </div>
              )}
              <div className="absolute inset-0 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.2)] group-hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all pointer-events-none" />
            </div>

            <span className="text-[10px] font-mono text-cyber-gray group-hover:text-cyber-cyan truncate w-full text-center transition-colors">
              {user.username}
            </span>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-cyber-black border border-cyber-cyan text-cyber-light text-xs font-mono rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-[0_0_10px_rgba(0,255,255,0.2)]">
              <div className="font-bold text-cyber-cyan mb-0.5">{user.username}</div>
              <div className="text-cyber-gray text-[10px]">
                {user.checked_in_at ? formatDistanceToNow(new Date(user.checked_in_at), { addSuffix: true }) : 'Just now'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
