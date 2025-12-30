import Link from "next/link"
import { MapPin, Users, Sparkles, ArrowRight, Twitter, Instagram, Shield, FileText } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { CyberButton } from "@/components/ui/cyber-button"
import { User } from "@supabase/supabase-js"

interface LandingDesktopProps {
  user: User | null
}

export default function LandingDesktop({ user }: LandingDesktopProps) {
  return (
    <div className="min-h-screen bg-cyber-black scanlines flex flex-col">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden flex-1 flex items-center">
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
            <h1 className="font-sans text-5xl lg:text-7xl font-bold leading-tight text-foreground">
              Your Ultimate Guide to <span className="text-gradient-animated bg-clip-text text-transparent font-extrabold tracking-tight">Vasai-Virar</span> Hangouts
            </h1>
            <p className="text-xl md:text-2xl text-cyber-gray max-w-lg font-sans leading-relaxed">
              Discover hidden cafes, track where your friends are, and plan the perfect day out with AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href={user ? "/dashboard" : "/auth/sign-up"}>
                <CyberButton variant="cyan" size="lg" glowing className="w-full sm:w-auto font-bold text-black flex items-center gap-2 group">
                  {user ? "START EXPLORING NOW" : "START EXPLORING NOW"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

             {/* Social Proof / Stats Strip */}
             <div className="flex items-center gap-8 pt-8 border-t border-white/10 mt-8">
                <div className="flex flex-col">
                    <span className="font-bold text-2xl text-cyber-cyan">50+</span>
                    <span className="text-xs text-cyber-gray uppercase tracking-wide">Hotspots</span>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="flex flex-col">
                    <span className="font-bold text-2xl text-cyber-pink">Active</span>
                    <span className="text-xs text-cyber-gray uppercase tracking-wide">Community</span>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="flex flex-col">
                    <span className="font-bold text-2xl text-cyber-yellow">Verified</span>
                    <span className="text-xs text-cyber-gray uppercase tracking-wide">Reviews</span>
                </div>
             </div>
          </div>

          {/* Right Side: Animated Phone Mockup */}
          <div className="relative flex justify-center md:justify-end animate-float">
             {/* Phone Body */}
             <div className="relative w-[320px] h-[640px] bg-background border-[12px] border-border rounded-[3rem] shadow-[0_0_50px_rgba(var(--primary),0.15)] overflow-hidden transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
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
                      <div className="bg-cyber-navy/90 backdrop-blur border border-cyber-yellow/30 p-4 rounded-xl shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold text-cyber-yellow uppercase">Trending Now</span>
                        </div>
                        <p className="text-cyber-light text-sm font-medium">Café Basilico</p>
                        <p className="text-cyber-gray text-xs">Vasai West • 1.2km away</p>
                         <div className="mt-3 flex gap-2">
                            <span className="px-2 py-1 rounded-md bg-white/10 text-[10px] text-white">Cafe</span>
                            <span className="px-2 py-1 rounded-md bg-white/10 text-[10px] text-white">WiFi</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Glow behind phone */}
             <div className="absolute inset-0 bg-cyber-yellow/20 blur-[100px] -z-10 rounded-full transform translate-y-20"></div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-cyber-dark/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
              <h2 className="font-sans text-3xl md:text-4xl font-bold text-cyber-light">
                 How It Works
              </h2>
              <p className="text-cyber-gray max-w-2xl mx-auto text-lg">
                  Three simple steps to level up your social life in Vasai-Virar.
              </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* Step 1: Discover */}
             <div className="glass-panel p-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,217,255,0.1)] group text-center">
                 <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-cyber-cyan/10 flex items-center justify-center border border-cyber-cyan/30 group-hover:border-cyber-cyan transition-colors">
                    <MapPin className="w-8 h-8 text-cyber-cyan" />
                 </div>
                 <h3 className="font-sans text-2xl font-bold text-foreground mb-4">1. Discover</h3>
                 <p className="text-muted-foreground leading-relaxed">
                    Find the best cafes, hidden parks, and top-rated gaming zones near you.
                 </p>
             </div>

             {/* Step 2: Connect */}
             <div className="glass-panel p-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,0,110,0.1)] group text-center">
                 <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-cyber-pink/10 flex items-center justify-center border border-cyber-pink/30 group-hover:border-cyber-pink transition-colors">
                    <Users className="w-8 h-8 text-cyber-pink" />
                 </div>
                 <h3 className="font-sans text-2xl font-bold text-foreground mb-4">2. Connect</h3>
                 <p className="text-muted-foreground leading-relaxed">
                    See live check-ins, make new friends, and meet up with your squad.
                 </p>
             </div>

             {/* Step 3: Plan */}
             <div className="glass-panel p-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(232,255,0,0.1)] group text-center">
                 <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-cyber-yellow/10 flex items-center justify-center border border-cyber-yellow/30 group-hover:border-cyber-yellow transition-colors">
                    <Sparkles className="w-8 h-8 text-cyber-yellow" />
                 </div>
                 <h3 className="font-sans text-2xl font-bold text-foreground mb-4">3. Plan</h3>
                 <p className="text-muted-foreground leading-relaxed">
                    Let our AI build your perfect itinerary in seconds based on your vibe.
                 </p>
             </div>
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
