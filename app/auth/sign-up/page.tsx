"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MapPin, Mail, Lock, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CyberButton } from "@/components/ui/cyber-button"
import { CyberCard } from "@/components/ui/cyber-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      console.log("[v0] Attempting signup for:", email)

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            username: username || email.split("@")[0],
          },
        },
      })

      console.log("[v0] Sign up response:", { data, error: signUpError })

      if (signUpError) {
        console.log("[v0] Sign up error:", signUpError.message)
        throw signUpError
      }

      if (data.user && !data.session) {
        // Email confirmation required
        console.log("[v0] Email confirmation required")
        router.push("/auth/sign-up-success")
      } else if (data.session) {
        // Auto-confirmed (for development)
        console.log("[v0] Auto-login after signup")
        await new Promise((resolve) => setTimeout(resolve, 100))
        window.location.href = "/dashboard"
      } else {
        router.push("/auth/sign-up-success")
      }
    } catch (err) {
      console.log("[v0] Sign up error:", err)
      setError(err instanceof Error ? err.message : "Sign up failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-black scanlines flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 0, 110, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 0, 110, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 glitch-hover">
          <div className="w-10 h-10 bg-cyber-pink cyber-clip-sm flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <span className="font-mono text-2xl font-bold">
            <span className="neon-text-pink">VV</span>
            <span className="text-cyber-light"> HOTSPOTS</span>
          </span>
        </Link>

        <CyberCard className="p-8">
          <h1 className="font-mono text-2xl font-bold text-cyber-light mb-2">{"> CREATE ACCOUNT"}</h1>
          <p className="text-cyber-gray mb-6">Join the Vasai-Virar social discovery network</p>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-cyber-light font-mono">
                USERNAME
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-gray" />
                <Input
                  id="username"
                  type="text"
                  placeholder="cyber_user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-cyber-black border-cyber-gray text-cyber-light placeholder:text-cyber-gray/50 focus:border-cyber-pink"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-cyber-light font-mono">
                EMAIL
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-gray" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-cyber-black border-cyber-gray text-cyber-light placeholder:text-cyber-gray/50 focus:border-cyber-pink"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-cyber-light font-mono">
                PASSWORD
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-gray" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-cyber-black border-cyber-gray text-cyber-light placeholder:text-cyber-gray/50 focus:border-cyber-pink"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-cyber-light font-mono">
                CONFIRM PASSWORD
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-gray" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10 bg-cyber-black border-cyber-gray text-cyber-light placeholder:text-cyber-gray/50 focus:border-cyber-pink"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-cyber-pink/10 border border-cyber-pink text-cyber-pink text-sm font-mono">
                {error}
              </div>
            )}

            <CyberButton type="submit" variant="pink" size="lg" className="w-full" disabled={isLoading} glowing>
              {isLoading ? "CREATING ACCOUNT..." : "SIGN UP"}
            </CyberButton>
          </form>

          <p className="mt-6 text-center text-cyber-gray">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-cyber-pink hover:underline">
              Login
            </Link>
          </p>
        </CyberCard>
      </div>
    </div>
  )
}
