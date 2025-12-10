"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { CyberButton } from "@/components/ui/cyber-button"
import { toast } from "sonner"

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export function NotificationPermissionModal() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Check if we've already asked or if permission is already granted/denied
        const hasAsked = localStorage.getItem("notification_permission_asked")

        if (
            !hasAsked &&
            "Notification" in window &&
            Notification.permission === "default"
        ) {
            // Small delay to not overwhelm user immediately
            const timer = setTimeout(() => setIsOpen(true), 3000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleEnable = async () => {
        try {
            const permission = await Notification.requestPermission()

            if (permission === "granted") {
                await subscribeUser()
                toast.success("Notifications enabled!")
            } else {
                toast.error("Permission denied. Enable in browser settings.")
            }
        } catch (error) {
            console.error("Error requesting permission:", error)
            toast.error("Something went wrong.")
        } finally {
            setIsOpen(false)
            localStorage.setItem("notification_permission_asked", "true")
        }
    }

    const handleLater = () => {
        setIsOpen(false)
        localStorage.setItem("notification_permission_asked", "true")
    }

    const subscribeUser = async () => {
        if (!("serviceWorker" in navigator)) return

        try {
            const registration = await navigator.serviceWorker.ready
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

            if (!vapidPublicKey) {
                console.error("VAPID public key not found")
                return
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            })

            // Send subscription to server
            const response = await fetch("/api/notifications/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(subscription),
            })

            if (!response.ok) {
                throw new Error("Failed to save subscription")
            }
        } catch (error) {
            console.error("Error subscribing:", error)
            throw error // Re-throw to be caught by caller
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-cyan-500/30 bg-[#0A0E27]/95 p-6 shadow-[0_0_50px_-12px_rgba(0,255,255,0.25)]">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-500/20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-[#E8FF00]/10 blur-3xl pointer-events-none" />

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
                        <div className="relative bg-[#1A1F3A] p-3 rounded-full border border-cyan-500/30">
                            <Bell className="w-8 h-8 text-cyan-400" />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-white tracking-wide">Stay Connected</h2>
                    <p className="text-[#B0B9C1]">
                        Get notified when friends check in nearby and never miss a hangout session in Vasai-Virar.
                    </p>

                    <div className="flex w-full gap-3 pt-2">
                        <button
                            onClick={handleLater}
                            className="flex-1 px-4 py-2 rounded-lg border border-[#B0B9C1]/30 text-[#B0B9C1] hover:bg-white/5 transition-colors font-medium text-sm"
                        >
                            Maybe Later
                        </button>
                        <CyberButton
                            onClick={handleEnable}
                            className="flex-1 !w-full"
                            variant="cyan"
                            glowing={true}
                        >
                            Enable Notifications
                        </CyberButton>
                    </div>
                </div>

                <button
                    onClick={handleLater}
                    className="absolute top-4 right-4 text-[#B0B9C1] hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
