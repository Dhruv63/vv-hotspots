"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Lock, Smartphone, LogOut, Sun, Moon, Volume2, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { CyberCard } from "@/components/ui/cyber-card"
import { useTheme } from "next-themes"
import type { User } from "@supabase/supabase-js"

interface SettingsClientProps {
  user: User
}

export function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [privacyMode, setPrivacyMode] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const Switch = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (c: boolean) => void }) => (
    <button
        onClick={() => onCheckedChange(!checked)}
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out border ${
            checked ? 'bg-cyber-primary border-cyber-primary' : 'bg-transparent border-cyber-gray'
        }`}
    >
        <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-6 bg-black' : 'translate-x-0 bg-cyber-gray'
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
                                onClick={() => setTheme("light")}
                                className={`p-2 rounded ${theme === 'light' ? 'bg-cyber-light text-cyber-black' : 'text-cyber-gray'}`}
                            >
                                <Sun className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setTheme("dark")}
                                className={`p-2 rounded ${theme === 'dark' ? 'bg-cyber-primary text-cyber-black' : 'text-cyber-gray'}`}
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
                        <Switch checked={notifications} onCheckedChange={setNotifications} />
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
