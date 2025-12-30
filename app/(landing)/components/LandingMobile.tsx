import Link from "next/link"
import { MapPin, Users, Sparkles, ChevronRight, Activity, CheckCircle, ArrowRight, Instagram, Twitter } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { CyberButton } from "@/components/ui/cyber-button"
import { User } from "@supabase/supabase-js"

interface LandingMobileProps {
  user: User | null
}

export default function LandingMobile({ user }: LandingMobileProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex flex-col text-white">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative pt-28 pb-12 px-4 flex flex-col items-center text-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-600/20 rounded-full blur-[60px] animate-pulse"></div>
        <div className="absolute top-40 right-10 w-40 h-40 bg-cyan-600/20 rounded-full blur-[60px] animate-pulse delay-700"></div>

        <div className="relative z-10 w-full max-w-sm mx-auto space-y-6">
          <h1 className="font-sans text-4xl font-extrabold leading-tight tracking-tight drop-shadow-lg">
            Your Ultimate Guide to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Vasai-Virar</span> Hangouts
          </h1>
          <p className="text-base text-gray-200 leading-relaxed drop-shadow-md">
            Discover hidden cafes, track where your friends are, and plan the perfect day out with AI.
          </p>

          <div className="flex flex-col gap-4 w-full pt-4">
            <Link href={user ? "/dashboard" : "/auth/sign-up"} className="w-full">
              <CyberButton variant="cyan" size="lg" glowing className="w-full py-5 text-lg font-bold text-black flex items-center justify-center gap-2 group">
                {user ? "START EXPLORING NOW" : "START EXPLORING NOW"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

      {/* Social Proof / Stats Strip */}
      <section className="py-6 border-y border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex justify-around items-center px-4">
           <div className="flex flex-col items-center gap-1">
             <span className="font-bold text-xl text-cyan-400">50+</span>
             <span className="text-xs text-gray-400 uppercase tracking-wide">Hotspots</span>
           </div>
           <div className="w-px h-8 bg-white/10"></div>
           <div className="flex flex-col items-center gap-1">
             <Activity className="w-5 h-5 text-purple-400" />
             <span className="text-xs text-gray-400 uppercase tracking-wide">Active</span>
           </div>
           <div className="w-px h-8 bg-white/10"></div>
           <div className="flex flex-col items-center gap-1">
             <CheckCircle className="w-5 h-5 text-green-400" />
             <span className="text-xs text-gray-400 uppercase tracking-wide">Verified</span>
           </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 space-y-8">
        <div className="text-center space-y-2">
            <h2 className="font-sans text-3xl font-bold text-white">
               How It Works
            </h2>
            <p className="text-gray-400 text-sm">Three steps to your perfect day out.</p>
        </div>

        <div className="flex flex-col gap-6">
            {/* Step 1: Discover */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                    <MapPin className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">1. Discover</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        Find the best cafes, parks, and gaming zones near you.
                    </p>
                </div>
            </div>

            {/* Step 2: Connect */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                    <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">2. Connect</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        See live check-ins and meet up with friends.
                    </p>
                </div>
            </div>

            {/* Step 3: Plan */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">3. Plan</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        Let our AI build your perfect itinerary in seconds.
                    </p>
                </div>
            </div>
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

             <div className="text-gray-600 text-[10px]">
              © 2025 VV Hotspots.
            </div>
        </div>
      </footer>
    </div>
  )
}
