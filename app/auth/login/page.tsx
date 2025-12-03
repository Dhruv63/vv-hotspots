"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MapPin, Mail, Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CyberButton } from "@/components/ui/cyber-button"
import { CyberCard } from "@/components/ui/cyber-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
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
              linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 glitch-hover">
          <div className="w-10 h-10 bg-cyber-cyan cyber-clip-sm flex items-center justify-center">
            <MapPin className="w-6 h-6 text-cyber-black" />
          </div>
          <span className="font-mono text-2xl font-bold">
            <span className="neon-text-cyan">VV</span>
            <span className="text-cyber-light"> HOTSPOTS</span>
          </span>
        </Link>

        <CyberCard className="p-8">
          <h1 className="font-mono text-2xl font-bold text-cyber-light mb-2">{"> LOGIN"}</h1>
          <p className="text-cyber-gray mb-6">Access your account to explore hotspots</p>

          <form onSubmit={handleLogin} className="space-y-6">
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
                  className="pl-10 bg-cyber-black border-cyber-gray text-cyber-light placeholder:text-cyber-gray/50 focus:border-cyber-cyan"
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
                  className="pl-10 bg-cyber-black border-cyber-gray text-cyber-light placeholder:text-cyber-gray/50 focus:border-cyber-cyan"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-cyber-pink/10 border border-cyber-pink text-cyber-pink text-sm font-mono">
                {error}
              </div>
            )}

            <CyberButton type="submit" variant="cyan" size="lg" className="w-full" disabled={isLoading} glowing>
              {isLoading ? "AUTHENTICATING..." : "LOGIN"}
            </CyberButton>
          </form>

          <p className="mt-6 text-center text-cyber-gray">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="text-cyber-cyan hover:underline">
              Sign up
            </Link>
          </p>
        </CyberCard>
      </div>
    </div>
  )
}
