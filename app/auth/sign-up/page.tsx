"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MapPin, Mail, Lock, User, Eye, EyeOff, Globe, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CyberButton } from "@/components/ui/cyber-button"
import { CyberCard } from "@/components/ui/cyber-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

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
    <div className="min-h-screen bg-cyber-black scanlines flex items-center justify-center p-4 relative overflow-hidden">
      {/* Local Background Image */}
      <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cyber-black/80 z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm grayscale-[30%]"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=2670&auto=format&fit=crop')`,
            }}
          />
      </div>

      {/* Background grid */}
      <div className="absolute inset-0 opacity-5 z-10 pointer-events-none">
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

      <div className="relative w-full max-w-md z-20">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 glitch-hover">
          <div className="w-10 h-10 bg-cyber-secondary cyber-clip-sm flex items-center justify-center shadow-[0_0_15px_var(--color-cyber-secondary)]">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <span className="font-mono text-2xl font-bold">
            <span className="neon-text-pink">VV</span>
            <span className="text-cyber-light"> HOTSPOTS</span>
          </span>
        </Link>

        <CyberCard className="p-8 bg-cyber-navy border-white/10">
          <h1 className="font-sans text-2xl font-bold text-cyber-light mb-2">Create Account</h1>
          <p className="text-cyber-gray mb-6">Join the Vasai-Virar social discovery network</p>

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

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-cyber-light font-mono text-xs">
                USERNAME
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-gray" />
                <Input
                  id="username"
                  type="text"
                  placeholder="cyber_user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-12 h-12 bg-cyber-dark border-cyber-gray/50 text-cyber-light placeholder:text-cyber-gray/50 focus:border-cyber-secondary rounded-lg"
                />
              </div>
            </div>

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
                  className="pl-12 h-12 bg-cyber-dark border-cyber-gray/50 text-cyber-light placeholder:text-cyber-gray/50 focus:border-cyber-secondary rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-cyber-light font-mono text-xs">
                PASSWORD
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-gray" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12 pr-12 h-12 bg-cyber-dark border-cyber-gray/50 text-cyber-light placeholder:text-cyber-gray/50 focus:border-cyber-secondary rounded-lg"
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

            <CyberButton type="submit" variant="pink" size="lg" className="w-full font-bold" disabled={isLoading} glowing>
              {isLoading ? "CREATING ACCOUNT..." : "JOIN THE MAP"}
            </CyberButton>
          </form>

          <p className="mt-6 text-center text-cyber-gray text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-cyber-secondary hover:underline font-bold">
              Access Map
            </Link>
          </p>
        </CyberCard>
      </div>
    </div>
  )
}
