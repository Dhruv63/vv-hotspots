import Link from "next/link"
import { MapPin, Users, Star, Zap, Instagram, Twitter, Shield, FileText } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { CyberButton } from "@/components/ui/cyber-button"
import { User } from "@supabase/supabase-js"

interface LandingDesktopProps {
  user: User | null
}

export default function LandingDesktop({ user }: LandingDesktopProps) {
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
    <div className="min-h-screen bg-cyber-black scanlines flex flex-col">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 md:pt-32 md:pb-24 overflow-hidden flex-1 flex items-center">
        {/* Background grid effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(232, 255, 0, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(232, 255, 0, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Side: Content */}
          <div className="text-left space-y-8">
            <h1 className="font-sans text-5xl md:text-7xl font-bold leading-tight text-foreground">
              Find Where Your <span className="text-gradient-animated bg-clip-text text-transparent font-extrabold tracking-tight">Crew</span> Is
            </h1>
            <p className="text-xl md:text-2xl text-cyber-gray max-w-lg font-sans">
              Real-time hangout discovery for Vasai-Virar locals
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href={user ? "/dashboard" : "/auth/sign-up"}>
                <CyberButton variant="cyan" size="lg" glowing className="w-full sm:w-auto font-bold text-black">
                  {user ? "EXPLORE MAP" : "GET STARTED"}
                </CyberButton>
              </Link>
              {!user && (
                <Link href="/login">
                  <CyberButton variant="outline" size="lg" className="w-full sm:w-auto">
                    LOGIN
                  </CyberButton>
                </Link>
              )}
            </div>
          </div>

          {/* Right Side: Animated Phone Mockup */}
          <div className="relative flex justify-center md:justify-end animate-float">
             {/* Phone Body */}
             <div className="relative w-[300px] h-[600px] bg-background border-[12px] border-border rounded-[3rem] shadow-[0_0_50px_rgba(var(--primary),0.15)] overflow-hidden transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#2A3055] rounded-b-xl z-20"></div>

                {/* Screen Content - Map Simulation */}
                <div className="w-full h-full bg-[#1A1F3A] relative overflow-hidden">
                   {/* Map Grid */}
                   <div className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `linear-gradient(#2A3055 1px, transparent 1px), linear-gradient(90deg, #2A3055 1px, transparent 1px)`,
                            backgroundSize: "20px 20px"
                        }}>
                   </div>

                   {/* Random Map Markers */}
                   <div className="absolute top-[30%] left-[20%] w-4 h-4 bg-cyber-yellow rounded-full shadow-[0_0_10px_#E8FF00] animate-pulse"></div>
                   <div className="absolute top-[50%] right-[30%] w-4 h-4 bg-cyber-pink rounded-full shadow-[0_0_10px_#FF006E] animate-pulse delay-700"></div>
                   <div className="absolute bottom-[25%] left-[40%] w-4 h-4 bg-cyber-cyan rounded-full shadow-[0_0_10px_#00D9FF] animate-pulse delay-300"></div>

                   {/* Fake UI Overlay */}
                   <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-cyber-black via-cyber-black/80 to-transparent pt-12">
                      <div className="bg-cyber-navy/90 backdrop-blur border border-cyber-yellow/30 p-3 rounded-xl shadow-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold text-cyber-yellow uppercase">Trending Now</span>
                        </div>
                        <p className="text-cyber-light text-sm">12 spots • 342 checked in</p>
                        <p className="text-cyber-cyan text-xs mt-1">89 new reviews today</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Glow behind phone */}
             <div className="absolute inset-0 bg-cyber-yellow/20 blur-[100px] -z-10 rounded-full transform translate-y-20"></div>
          </div>
        </div>
      </section>

      {/* Features Grid - Updated Styling */}
      <section className="py-20 px-4 bg-cyber-dark/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-sans text-3xl font-bold text-center mb-16 text-cyber-light">
             Why Join the Map?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              const colorClasses = {
                cyan: "text-cyber-cyan",
                pink: "text-cyber-pink",
                purple: "text-cyber-pink", // Using pink as secondary/purple replacement
              }[feature.color]

              return (
                <div key={feature.title} className="glass-panel p-6 rounded-2xl transition-all duration-300 hover-float group">
                  <div className={`w-12 h-12 mb-4 rounded-xl bg-background/50 flex items-center justify-center border border-white/10 group-hover:border-${feature.color === 'cyan' ? 'cyber-cyan' : 'cyber-pink'} shadow-inner`}>
                    <Icon className={`w-6 h-6 ${colorClasses}`} />
                  </div>
                  <h3 className="font-sans text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10 bg-cyber-black mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
                <span className="text-xl font-bold block mb-4">
                    <span className="text-cyber-yellow">VV</span>
                    <span className="text-cyber-light"> HOTSPOTS</span>
                </span>
                <p className="text-cyber-gray text-sm">
                    Built by locals, for locals.
                </p>
            </div>

            <div>
                <h4 className="font-bold text-cyber-light mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm text-cyber-gray">
                    <li><Link href="/" className="hover:text-cyber-yellow transition-colors">Home</Link></li>
                    <li><Link href="/dashboard" className="hover:text-cyber-yellow transition-colors">Map</Link></li>
                    <li><Link href="#" className="hover:text-cyber-yellow transition-colors">About Us</Link></li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-cyber-light mb-4">Social</h4>
                <ul className="space-y-2 text-sm text-cyber-gray">
                    <li>
                        <Link href="#" className="flex items-center gap-2 hover:text-cyber-pink transition-colors">
                            <Twitter className="w-4 h-4" /> Twitter
                        </Link>
                    </li>
                    <li>
                        <Link href="#" className="flex items-center gap-2 hover:text-cyber-pink transition-colors">
                            <Instagram className="w-4 h-4" /> Instagram
                        </Link>
                    </li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-cyber-light mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-cyber-gray">
                    <li>
                        <Link href="#" className="flex items-center gap-2 hover:text-cyber-cyan transition-colors">
                            <Shield className="w-4 h-4" /> Privacy Policy
                        </Link>
                    </li>
                    <li>
                        <Link href="#" className="flex items-center gap-2 hover:text-cyber-cyan transition-colors">
                            <FileText className="w-4 h-4" /> Terms of Service
                        </Link>
                    </li>
                </ul>
            </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-cyber-gray/50 text-xs">© 2025 VV Hotspots. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
