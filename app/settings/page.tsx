"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Globe, Bell, Shield, Moon, Sun, Check } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { CyberCard } from "@/components/ui/cyber-card"
import { CyberButton } from "@/components/ui/cyber-button"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState("english")
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="min-h-screen bg-cyber-black scanlines">
      {/* We need a mock user here or use Navbar without user if auth check is done in middleware or layout */}
      {/* For simplicity we'll just render Navbar with null user or assume user is logged in (since settings requires auth usually) */}
      {/* Ideally we should fetch user server side, but this is a client page. */}
      {/* Let's wrap in a layout or just hardcode for now as it's a visual task primarily. */}

      <main className="pt-24 pb-12 px-4 max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-cyber-cyan hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-sm">Back to Dashboard</span>
        </Link>

        <h1 className="text-3xl font-bold font-mono text-cyber-light mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Language Settings */}
          <CyberCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-cyber-purple/20 flex items-center justify-center text-cyber-purple border border-cyber-purple/50">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-cyber-light mb-1">Language</h2>
                <p className="text-cyber-gray text-sm mb-4">Select your preferred language for the interface.</p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLanguage("english")}
                    className={`p-3 border rounded-lg flex items-center justify-between transition-all ${
                      language === "english"
                        ? "bg-cyber-purple/10 border-cyber-purple text-cyber-light"
                        : "border-cyber-gray/30 text-cyber-gray hover:border-cyber-gray"
                    }`}
                  >
                    <span className="font-mono">English</span>
                    {language === "english" && <Check className="w-4 h-4 text-cyber-purple" />}
                  </button>
                  <button
                    onClick={() => setLanguage("marathi")}
                    className={`p-3 border rounded-lg flex items-center justify-between transition-all ${
                      language === "marathi"
                        ? "bg-cyber-purple/10 border-cyber-purple text-cyber-light"
                        : "border-cyber-gray/30 text-cyber-gray hover:border-cyber-gray"
                    }`}
                  >
                    <span className="font-mono">मराठी (Beta)</span>
                    {language === "marathi" && <Check className="w-4 h-4 text-cyber-purple" />}
                  </button>
                </div>
              </div>
            </div>
          </CyberCard>

          {/* Theme Settings */}
          <CyberCard className="p-6">
             <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFFF00]/20 flex items-center justify-center text-[#FFFF00] border border-[#FFFF00]/50">
                <Sun className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-cyber-light mb-1">Appearance</h2>
                <p className="text-cyber-gray text-sm mb-4">Customize the look and feel.</p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-3 border rounded-lg flex items-center justify-between transition-all ${
                      theme === "dark"
                        ? "bg-[#FFFF00]/10 border-[#FFFF00] text-cyber-light"
                        : "border-cyber-gray/30 text-cyber-gray hover:border-cyber-gray"
                    }`}
                  >
                    <span className="font-mono flex items-center gap-2"><Moon className="w-4 h-4" /> Dark</span>
                    {theme === "dark" && <Check className="w-4 h-4 text-[#FFFF00]" />}
                  </button>
                   <button
                    onClick={() => setTheme("light")}
                    className={`p-3 border rounded-lg flex items-center justify-between transition-all ${
                      theme === "light"
                        ? "bg-pink-500/10 border-pink-500 text-cyber-light"
                        : "border-cyber-gray/30 text-cyber-gray hover:border-cyber-gray"
                    }`}
                  >
                    <span className="font-mono flex items-center gap-2"><Sun className="w-4 h-4" /> Light</span>
                    {theme === "light" && <Check className="w-4 h-4 text-pink-500" />}
                  </button>
                </div>
              </div>
            </div>
          </CyberCard>

          {/* Notifications */}
           <CyberCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-cyber-cyan/20 flex items-center justify-center text-cyber-cyan border border-cyber-cyan/50">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                   <h2 className="text-xl font-bold text-cyber-light">Notifications</h2>
                   <div
                      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${notifications ? 'bg-cyber-cyan' : 'bg-cyber-gray'}`}
                      onClick={() => setNotifications(!notifications)}
                   >
                      <div className={`w-4 h-4 bg-black rounded-full transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                   </div>
                </div>
                <p className="text-cyber-gray text-sm">Receive alerts about new hotspots and check-ins.</p>
              </div>
            </div>
          </CyberCard>

          <div className="text-center pt-8">
             <p className="text-cyber-gray text-xs font-mono">VV Hotspots v1.0.0 (Phase 3)</p>
             <p className="text-cyber-gray text-xs font-mono mt-1">Proudly serving Vasai-Virar</p>
          </div>
        </div>
      </main>
    </div>
  )
}
