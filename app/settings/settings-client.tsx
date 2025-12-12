"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Lock, Smartphone, LogOut, Sun, Moon, Volume2, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { CyberCard } from "@/components/ui/cyber-card"
import { useTheme } from "@/components/theme-provider"
import { updateUserTheme } from "@/app/actions/theme"
import type { User } from "@supabase/supabase-js"
import { toast } from "sonner"

interface SettingsClientProps {
    user: User
}

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

export function SettingsClient({ user }: SettingsClientProps) {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [notifications, setNotifications] = useState(false)
    const [privacyMode, setPrivacyMode] = useState(false)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [loading, setLoading] = useState(true)

    const handleThemeChange = async (themeId: any) => {
        setTheme(themeId)
        localStorage.setItem('user-theme', themeId)
        const result = await updateUserTheme(themeId)
        if (result.success) {
            toast.success('Theme updated!')
            window.location.reload()
        }
    }

    useEffect(() => {
        // Check initial subscription state
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(subscription => {
                    setNotifications(!!subscription)
                    setLoading(false)
                })
            })
        } else {
            setLoading(false)
        }
    }, [])

    const handleNotificationToggle = async (checked: boolean) => {
        setNotifications(checked) // Optimistic update

        if (!('serviceWorker' in navigator)) {
            toast.error("Push notifications not supported")
            return
        }

        const registration = await navigator.serviceWorker.ready

        if (checked) {
            try {
                const permission = await Notification.requestPermission()
                if (permission !== 'granted') {
                    toast.error("Permission denied")
                    setNotifications(false)
                    return
                }

                const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
                if (!vapidPublicKey) return

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
                })

                await fetch("/api/notifications/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(subscription),
                })

                toast.success("Notifications enabled")
            } catch (error) {
                console.error(error)
                toast.error("Failed to enable notifications")
                setNotifications(false)
            }
        } else {
            try {
                const subscription = await registration.pushManager.getSubscription()
                if (subscription) {
                    await subscription.unsubscribe()
                    await fetch("/api/notifications/subscribe", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ endpoint: subscription.endpoint }),
                    })
                }
                toast.success("Notifications disabled")
            } catch (error) {
                console.error(error)
                toast.error("Failed to disable notifications")
                setNotifications(true)
            }
        }
    }

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/")
        router.refresh()
    }

    const Switch = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (c: boolean) => void }) => (
        <button
            onClick={() => onCheckedChange(!checked)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out border ${checked ? 'bg-cyber-primary border-cyber-primary' : 'bg-transparent border-cyber-gray'
                }`}
        >
            <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-6 bg-black' : 'translate-x-0 bg-cyber-gray'
                }`} />
        </button>
    )

    return (
        <div className="min-h-screen bg-cyber-black scanlines">
            <Navbar user={user} />

            <main className="pt-20 pb-12 px-4 max-w-3xl mx-auto">
                {/* Back button */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-cyber-cyan hover:underline font-mono text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>
                </div>

                <h1 className="font-mono text-3xl font-bold text-cyber-light mb-8 glitch-text">SETTINGS</h1>

                <div className="space-y-6">
                    {/* App Preferences */}
                    <CyberCard className="p-6">
                        <div className="flex items-center gap-3 mb-6 border-b border-cyber-gray/30 pb-4">
                            <Smartphone className="w-6 h-6 text-cyber-primary" />
                            <h2 className="font-mono text-xl text-cyber-light">App Preferences</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Sun className="w-5 h-5 text-cyber-gray" />
                                    <div>
                                        <p className="font-mono text-sm text-cyber-light">Theme</p>
                                        <p className="text-xs text-cyber-gray">Switch between Day/Night mode</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-cyber-black border border-cyber-gray rounded-lg p-1">
                                    <button
                                        onClick={() => handleThemeChange("light")}
                                        className={`p-2 rounded ${theme === 'light' ? 'bg-cyber-light text-cyber-black' : 'text-cyber-gray'}`}
                                    >
                                        <Sun className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange("dark")}
                                        className={`p-2 rounded ${theme === 'dark' || theme === 'cyberpunk' ? 'bg-cyber-primary text-cyber-black' : 'text-cyber-gray'}`}
                                    >
                                        <Moon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Volume2 className="w-5 h-5 text-cyber-gray" />
                                    <div>
                                        <p className="font-mono text-sm text-cyber-light">Sound Effects</p>
                                        <p className="text-xs text-cyber-gray">Enable UI interaction sounds</p>
                                    </div>
                                </div>
                                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                            </div>
                        </div>
                    </CyberCard>

                    {/* Notifications */}
                    <CyberCard className="p-6">
                        <div className="flex items-center gap-3 mb-6 border-b border-cyber-gray/30 pb-4">
                            <Bell className="w-6 h-6 text-cyber-pink" />
                            <h2 className="font-mono text-xl text-cyber-light">Notifications</h2>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-cyber-gray" />
                                <div>
                                    <p className="font-mono text-sm text-cyber-light">Push Notifications</p>
                                    <p className="text-xs text-cyber-gray">Get updates on friends and hotspots</p>
                                </div>
                            </div>
                            <Switch
                                checked={notifications}
                                onCheckedChange={handleNotificationToggle}
                            />
                        </div>
                    </CyberCard>

                    {/* Privacy */}
                    <CyberCard className="p-6">
                        <div className="flex items-center gap-3 mb-6 border-b border-cyber-gray/30 pb-4">
                            <Shield className="w-6 h-6 text-cyber-secondary" />
                            <h2 className="font-mono text-xl text-cyber-light">Privacy</h2>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 text-cyber-gray" />
                                <div>
                                    <p className="font-mono text-sm text-cyber-light">Ghost Mode</p>
                                    <p className="text-xs text-cyber-gray">Hide your check-ins from public feed</p>
                                </div>
                            </div>
                            <Switch checked={privacyMode} onCheckedChange={setPrivacyMode} />
                        </div>
                    </CyberCard>

                    {/* Logout */}
                    <div className="pt-8">
                        <button
                            onClick={handleSignOut}
                            className="w-full py-4 border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-400 rounded-lg font-mono text-lg font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                        >
                            <LogOut className="w-5 h-5" />
                            LOG OUT
                        </button>
                        <p className="text-center text-cyber-gray text-xs mt-4 font-mono">v1.2.0 • Build 2024.05</p>
                    </div>
                </div>
            </main>
        </div>
    )
}
