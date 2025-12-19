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
            const target = event.target as HTMLElement
            // Close if clicking outside the dropdown container
            if (isOpen && dropdownRef.current && !dropdownRef.current.contains(target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen])

    const handleNotificationClick = async (notification: Notification) => {
        console.log('🔔 Notification clicked:', notification)

        // Mark as read via API if not read
        if (!notification.read) {
            try {
                console.log('📤 Sending mark-read request for:', notification.id)

                const response = await fetch('/api/notifications/mark-read', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notification_id: notification.id })
                })

                console.log('📥 Mark-read response status:', response.status)

                const result = await response.json()
                console.log('✅ Mark-read result:', result)

                if (!result.success) {
                    console.error('❌ Mark-read failed:', result.error)
                }

                // Optimistic update
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
                )
                setUnreadCount((prev) => Math.max(0, prev - 1))
            } catch (error) {
                console.error("❌ Error marking notification as read:", error)
            }
        } else {
            console.log('ℹ️ Notification already read')
        }

        setIsOpen(false)

        // Navigate based on notification type
        if (notification.type === 'friend_request') {
            router.push('/profile/friends')
        } else if (notification.type === 'friend_accept') {
            router.push('/profile/friends')
        } else if (notification.data?.hotspot_id) {
            router.push(`/hotspots/${notification.data.hotspot_id}`)
        } else if (notification.data?.user_id) {
            router.push(`/users/${notification.data.user_id}`)
        } else {
            // Default fallback
            // window.location.href not ideal in SPA, using router.push but refreshing notifications
            // If just general notification, maybe stay on page?
            // router.push('/dashboard')
        }

        // Reload notifications to sync state fully if needed
        fetchNotifications()
    }

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mark_all: true })
            })

            // Optimistic update
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
            setUnreadCount(0)

            // Re-fetch to confirm
            fetchNotifications()
        } catch (error) {
            console.error("Error marking all as read:", error)
        }
    }

    return (
        <div className="relative notification-bell-container" ref={dropdownRef}>
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
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-3 border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors ${
                                            !notif.read ? 'bg-cyan-900/20 border-l-4 border-l-cyan-500' : ''
                                        }`}
                                        onClick={() => handleNotificationClick(notif)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-semibold ${
                                                    !notif.read ? 'text-cyan-300' : 'text-gray-300'
                                                }`}>
                                                    {notif.type === 'friend_request' ? '👥 Friend Request' :
                                                     notif.type === 'friend_accept' ? '✅ Friend Accepted' :
                                                     notif.type === 'check_in' ? '📍 Check-in' : // Assuming check_in type exists or mapped
                                                     '🔔 Notification'}
                                                </h4>
                                                <p className="text-xs text-gray-300 mt-1">
                                                    {/* Display content based on type/data if content field missing */}
                                                    {notif.data?.message ||
                                                     (notif.type === 'friend_request' && "New friend request received") ||
                                                     (notif.type === 'friend_accept' && "Your friend request was accepted") ||
                                                     "New notification"}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                     <Clock className="w-3 h-3" />
                                                    {new Date(notif.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            {!notif.read && (
                                                <div className="w-2 h-2 bg-cyan-500 rounded-full ml-2 mt-1 animate-pulse" />
                                            )}
                                        </div>
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
