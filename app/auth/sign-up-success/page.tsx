import Link from "next/link"
import { MapPin, Mail, CheckCircle } from "lucide-react"
import { CyberButton } from "@/components/ui/cyber-button"
import { CyberCard } from "@/components/ui/cyber-card"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-cyber-black scanlines flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 0, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 0, 0.3) 1px, transparent 1px)
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

        <CyberCard className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-cyber-cyan mx-auto mb-4" />
          <h1 className="font-mono text-2xl font-bold text-cyber-light mb-2">{"> ACCOUNT CREATED"}</h1>
          <p className="text-cyber-gray mb-6">Check your email to verify your account before signing in.</p>

          <div className="p-4 bg-cyber-dark border border-cyber-gray mb-6">
            <Mail className="w-8 h-8 text-cyber-cyan mx-auto mb-2" />
            <p className="text-cyber-light text-sm font-mono">Verification email sent!</p>
          </div>

          <Link href="/login">
            <CyberButton variant="cyan" size="lg" className="w-full">
              GO TO LOGIN
            </CyberButton>
          </Link>
        </CyberCard>
      </div>
    </div>
  )
}
