"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CyberButton } from "@/components/ui/cyber-button"
import { Input } from "@/components/ui/input"
import { CyberCard } from "@/components/ui/cyber-card"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    console.log('Attempting password reset for:', email)
    console.log('Redirect URL:', `${window.location.origin}/reset-password`)

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    console.log('Supabase response:', { data, error })

    setLoading(false)

    if (error) {
      console.error('FULL ERROR OBJECT:', JSON.stringify(error, null, 2))
      setError(`Error: ${error.message} (Code: ${error.status || 'unknown'})`)
    } else {
      console.log('Success! Email should be sent')
      setMessage('Check your email for the password reset link!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background with theme pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[url('/grid-pattern.svg')]" />

      <div className="w-full max-w-md z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 tracking-tighter text-foreground font-heading glow-text">
            RESET PASSWORD
          </h1>
          <p className="text-muted-foreground">
            Enter your email to receive a reset link
          </p>
        </div>

        <CyberCard className="p-8 border-primary/20 bg-background/80 backdrop-blur-sm card-theme shadow-[0_0_50px_-12px_var(--color-primary)]">
          {message ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold mb-2">Check your email</h2>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <div className="mb-6 text-sm text-muted-foreground">
                <span className="text-foreground font-medium">{email}</span>
              </div>
              <CyberButton size="md" variant="outline" className="w-full">
                <Link href="/login" className="w-full h-full flex items-center justify-center">
                  Back to Login
                </Link>
              </CyberButton>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-start gap-3 text-sm text-destructive">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="font-mono break-all">{error}</div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <CyberButton
                type="submit"
                className="w-full font-bold relative overflow-hidden group"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Link...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </CyberButton>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                >
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </CyberCard>
      </div>
    </div>
  )
}
