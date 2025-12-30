import Link from "next/link"
import { MapPin, Users, Star, Zap, Instagram, Twitter, Shield, FileText, ChevronRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { CyberButton } from "@/components/ui/cyber-button"
import { User } from "@supabase/supabase-js"

interface LandingMobileProps {
  user: User | null
}

export default function LandingMobile({ user }: LandingMobileProps) {
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
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex flex-col text-white">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 flex flex-col items-center text-center">
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-600/20 rounded-full blur-[60px] animate-pulse"></div>
        <div className="absolute top-40 right-10 w-40 h-40 bg-cyan-600/20 rounded-full blur-[60px] animate-pulse delay-700"></div>

        <div className="relative z-10 w-full max-w-sm mx-auto space-y-6">
          <h1 className="font-sans text-4xl font-extrabold leading-tight tracking-tight">
            Find Where Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Crew</span> Is
          </h1>
          <p className="text-base text-gray-300">
            Real-time hangout discovery for Vasai-Virar locals. Join the community today.
          </p>

          <div className="flex flex-col gap-4 w-full pt-4">
            <Link href={user ? "/dashboard" : "/auth/sign-up"} className="w-full">
              <CyberButton variant="cyan" size="lg" glowing className="w-full py-5 text-lg font-bold text-black flex items-center justify-center gap-2">
                {user ? "EXPLORE MAP" : "GET STARTED"}
                {!user && <ChevronRight className="w-5 h-5" />}
              </CyberButton>
            </Link>
            {!user && (
              <Link href="/login" className="w-full">
                <CyberButton variant="outline" size="lg" className="w-full py-5 text-lg border-white/20 hover:bg-white/5">
                  LOGIN
                </CyberButton>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Features List */}
      <section className="py-12 px-4 space-y-4">
        <h2 className="font-sans text-2xl font-bold text-center mb-6 text-white">
           Why Join?
        </h2>

        <div className="flex flex-col gap-4">
          {features.map((feature) => {
            const Icon = feature.icon
            const colorClasses = {
              cyan: "text-cyan-400",
              pink: "text-pink-400",
              purple: "text-purple-400",
            }[feature.color]

            return (
              <div key={feature.title} className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-black/30 border border-white/5`}>
                  <Icon className={`w-6 h-6 ${colorClasses}`} />
                </div>
                <div>
                  <h3 className="font-sans text-lg font-bold text-white mb-1">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Simplified Mobile Footer */}
      <footer className="py-8 px-4 border-t border-white/10 bg-black/40 mt-auto">
        <div className="flex flex-col items-center gap-6 text-center">
            <div>
                <span className="text-xl font-bold block mb-2">
                    <span className="text-cyan-400">VV</span>
                    <span className="text-white"> HOTSPOTS</span>
                </span>
                <p className="text-gray-500 text-xs">
                    Built by locals, for locals.
                </p>
            </div>

            <div className="flex gap-6">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                </Link>
            </div>

            <div className="flex gap-4 text-xs text-gray-500">
               <Link href="#">Privacy</Link>
               <span>•</span>
               <Link href="#">Terms</Link>
            </div>

            <div className="text-gray-600 text-[10px]">
              © 2025 VV Hotspots.
            </div>
        </div>
      </footer>
    </div>
  )
}
