"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Mail, Lock, AlertTriangle, Eye, EyeOff, Globe } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CyberButton } from "@/components/ui/cyber-button"
import { CyberCard } from "@/components/ui/cyber-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        if (signInError.message.includes("Invalid login")) {
          throw new Error("Invalid email or password. Please try again.")
        }
        if (signInError.message.includes("Email not confirmed")) {
          throw new Error("Please verify your email before logging in.")
        }
        throw signInError
      }

      if (!data.session) {
        throw new Error("No session returned. Please try again.")
      }

      await new Promise((resolve) => setTimeout(resolve, 200))

      // Force a hard navigation to ensure middleware runs
      window.location.href = "/dashboard"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-cyber-black scanlines flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(232, 255, 0, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(232, 255, 0, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 glitch-hover">
          <div className="w-10 h-10 bg-cyber-primary cyber-clip-sm flex items-center justify-center shadow-[0_0_15px_var(--color-cyber-primary)]">
            <MapPin className="w-6 h-6 text-black" />
          </div>
          <span className="font-mono text-2xl font-bold">
            <span className="neon-text-yellow">VV</span>
            <span className="text-cyber-light"> HOTSPOTS</span>
          </span>
        </Link>

        <CyberCard className="p-8 bg-cyber-navy border-white/10">
          <h1 className="font-sans text-2xl font-bold text-cyber-light mb-2">Welcome Back</h1>
          <p className="text-cyber-gray mb-6">Login to access the real-time map</p>

          <div className="mb-6">
             <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
             >
                <Globe className="w-5 h-5" />
                Continue with Google
             </button>

             <div className="relative my-6 text-center">
                 <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-cyber-gray/30"></div>
                 </div>
                 <span className="relative bg-cyber-navy px-2 text-xs text-cyber-gray uppercase">Or continue with email</span>
             </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-cyber-light font-mono text-xs">
                EMAIL
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-gray" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-12 h-12 bg-cyber-dark border-cyber-gray/50 text-cyber-light placeholder:text-cyber-gray/50 focus:border-cyber-primary rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password" className="text-cyber-light font-mono text-xs">
                    PASSWORD
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-gray" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-12 pr-12 h-12 bg-cyber-dark border-cyber-gray/50 text-cyber-light placeholder:text-cyber-gray/50 focus:border-cyber-primary rounded-lg"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-cyber-gray hover:text-cyber-light"
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-cyber-secondary/10 border border-cyber-secondary text-cyber-secondary text-sm font-mono flex items-start gap-2 rounded">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <CyberButton type="submit" variant="cyan" size="lg" className="w-full font-bold" disabled={isLoading} glowing>
              {isLoading ? "AUTHENTICATING..." : "ACCESS MAP"}
            </CyberButton>
          </form>

          {/* Add this forgot password link */}
          <div className="text-center mt-4">
            <Link
              href="/forgot-password"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          <p className="mt-6 text-center text-cyber-gray text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="text-cyber-primary hover:underline font-bold">
              Join the Map
            </Link>
          </p>
        </CyberCard>
      </div>
    </div>
  )
}
