import Link from "next/link"
import { MapPin, Users, Star, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { CyberButton } from "@/components/ui/cyber-button"
import { CyberCard } from "@/components/ui/cyber-card"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const features = [
    {
      icon: MapPin,
      title: "Discover Spots",
      description: "Find the coolest hangout locations across Vasai-Virar",
      color: "cyan",
    },
    {
      icon: Users,
      title: "See Who's There",
      description: "Check live activity and connect with others at your favorite spots",
      color: "pink",
    },
    {
      icon: Star,
      title: "Rate & Review",
      description: "Share your experiences and help others find the best places",
      color: "purple",
    },
    {
      icon: Zap,
      title: "Quick Check-in",
      description: "One tap to let friends know where you're hanging out",
      color: "cyan",
    },
  ]

  return (
    <div className="min-h-screen bg-cyber-black scanlines">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        {/* Background grid effect */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="font-mono text-5xl md:text-7xl font-bold mb-6">
            <span className="neon-text-cyan">VV</span>
            <span className="text-cyber-light"> HOTSPOTS</span>
          </h1>
          <p className="text-xl md:text-2xl text-cyber-light/70 mb-4 font-mono">{"// VASAI-VIRAR SOCIAL DISCOVERY"}</p>
          <p className="text-lg text-cyber-gray max-w-2xl mx-auto mb-8">
            Discover the hottest hangout spots in Vasai-Virar. Check-in, see who&apos;s around, and connect with your
            crew at cafes, parks, gaming zones, and street food spots.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={user ? "/dashboard" : "/auth/sign-up"}>
              <CyberButton variant="cyan" size="lg" glowing>
                {user ? "EXPLORE MAP" : "GET STARTED"}
              </CyberButton>
            </Link>
            {!user && (
              <Link href="/auth/login">
                <CyberButton variant="ghost" size="lg">
                  LOGIN
                </CyberButton>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-mono text-2xl text-center mb-12">
            <span className="text-cyber-pink">{">"}</span>
            <span className="text-cyber-light"> FEATURES</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              const colorClasses = {
                cyan: "neon-text-cyan",
                pink: "neon-text-pink",
                purple: "neon-text-purple",
              }[feature.color]

              return (
                <CyberCard key={feature.title} className="p-6 hover:border-cyber-cyan transition-colors">
                  <Icon className={`w-10 h-10 mb-4 ${colorClasses}`} />
                  <h3 className="font-mono text-lg font-semibold text-cyber-light mb-2">{feature.title}</h3>
                  <p className="text-cyber-gray text-sm">{feature.description}</p>
                </CyberCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* Map Preview Section */}
      <section className="py-16 px-4 bg-cyber-dark/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-mono text-2xl text-center mb-8">
            <span className="text-cyber-cyan">{">"}</span>
            <span className="text-cyber-light"> LIVE MAP PREVIEW</span>
          </h2>

          <CyberCard className="aspect-video relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-navy to-cyber-black flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-cyber-cyan mx-auto mb-4 animate-pulse" />
                <p className="font-mono text-cyber-light">
                  {user ? "Click Explore Map to view hotspots" : "Sign up to explore the map"}
                </p>
              </div>
            </div>
          </CyberCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-cyber-gray">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-mono text-cyber-gray text-sm">{"// VV HOTSPOTS © 2025 | VASAI-VIRAR"}</p>
        </div>
      </footer>
    </div>
  )
}
