import Link from "next/link"
import { MapPin, AlertTriangle } from "lucide-react"
import { CyberButton } from "@/components/ui/cyber-button"
import { CyberCard } from "@/components/ui/cyber-card"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-cyber-black scanlines flex items-center justify-center p-4">
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

        <CyberCard className="p-8 text-center border-cyber-pink">
          <AlertTriangle className="w-16 h-16 text-cyber-pink mx-auto mb-4" />
          <h1 className="font-mono text-2xl font-bold text-cyber-light mb-2">{"> AUTH ERROR"}</h1>
          <p className="text-cyber-gray mb-4">Something went wrong during authentication.</p>

          {params?.error && (
            <div className="p-3 bg-cyber-pink/10 border border-cyber-pink text-cyber-pink text-sm font-mono mb-6">
              Error: {params.error}
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <CyberButton variant="cyan">TRY LOGIN</CyberButton>
            </Link>
            <Link href="/">
              <CyberButton variant="ghost">GO HOME</CyberButton>
            </Link>
          </div>
        </CyberCard>
      </div>
    </div>
  )
}
