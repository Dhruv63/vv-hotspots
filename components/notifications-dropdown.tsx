"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Notification } from "@/lib/types"

interface NotificationsDropdownProps {
    userId: string
}

export function NotificationsDropdown({ userId }: NotificationsDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const supabase = createClient()

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(10)

            if (error) throw error

            setNotifications(data || [])
            setUnreadCount(data?.filter((n: Notification) => !n.read).length || 0)
        } catch (error) {
            console.error("Error fetching notifications:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()

        const channel = supabase
            .channel("notifications-channel")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${userId}`,
                },
                (payload: any) => {
                    const newNotification = payload.new as Notification
                    setNotifications((prev) => [newNotification, ...prev].slice(0, 10))
                    setUnreadCount((prev) => prev + 1)
                },
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("id", id)

            if (error) throw error

            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            )
            setUnreadCount((prev) => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Error marking notification as read:", error)
        }
    }

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            await markAsRead(notification.id)
        }

        setIsOpen(false)

        // Navigate based on type
        if (notification.type === 'friend_request' || notification.type === 'friend_accept') {
            router.push('/profile/friends')
        } else {
            // Default fallback or handle checkins
            // router.push('/dashboard')
        }
    }

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
            if (unreadIds.length === 0) return

            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .in("id", unreadIds)

            if (error) throw error

            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error("Error marking all as read:", error)
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-cyber-gray/10 text-cyber-light transition-colors"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? "text-[#E8FF00]" : ""}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold border border-[#0A0E27]">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#0A0E27] border border-cyan-500/30 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-white/10 flex items-center justify-between bg-[#1A1F3A]">
                        <h3 className="font-mono text-sm font-bold text-white tracking-widest">NOTIFICATIONS</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="p-8 text-center text-[#B0B9C1]">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center gap-2">
                                <Bell className="w-8 h-8 text-white/20" />
                                <span className="text-sm text-[#B0B9C1]">No notifications yet</span>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`flex gap-3 p-4 hover:bg-white/5 transition-colors cursor-pointer ${!notification.read ? "bg-white/[0.02] border-l-2 border-[#E8FF00]" : "border-l-2 border-transparent"
                                            }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        {/* Avatar Placeholder - ideally fetch sender profile */}
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-bold">
                                            {notification.type === 'friend_request' ? 'FR' : 'FA'}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-200 line-clamp-2">
                                                {notification.type === 'friend_request' && "New friend request received"}
                                                {notification.type === 'friend_accept' && "Your friend request was accepted"}
                                                {!['friend_request', 'friend_accept'].includes(notification.type) && "New notification"}
                                            </p>
                                            <p className="text-xs text-[#B0B9C1] mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </p>
                                        </div>

                                        {!notification.read && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    markAsRead(notification.id)
                                                }}
                                                className="flex-shrink-0 text-[#E8FF00] hover:text-[#E8FF00]/80 p-1"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-white/10 bg-[#1A1F3A] text-center">
                        <Link
                            href="/profile"
                            className="text-xs text-[#B0B9C1] hover:text-white transition-colors capitalize"
                            onClick={() => setIsOpen(false)}
                        >
                            View user profile
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
