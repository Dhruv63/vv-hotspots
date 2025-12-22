import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MapPin, Moon, Bell, Menu, Users, CheckCircle, Compass, Star } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 relative overflow-hidden font-sans">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-yellow-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-cyan-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center">
        <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center shadow-lg text-white">
          <MapPin className="w-6 h-6" />
        </button>

        <div className="flex gap-3">
          <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center shadow-lg text-white">
            <Moon className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center shadow-lg text-white">
            <Bell className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center shadow-lg text-white">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 px-6 pt-24 pb-12 flex flex-col items-center">

        {/* Animated Hero Text */}
        <div className="text-center mb-8 w-full max-w-2xl">
          <h1 className="text-5xl sm:text-6xl font-black mb-4 leading-tight">
            <span className="block text-white drop-shadow-2xl animate-fade-in-down">
              Find Where
            </span>
            <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-fade-in-up">
              Your Crew
            </span>
            <span className="block text-white drop-shadow-2xl animate-fade-in-down delay-200">
              Is
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/90 font-medium max-w-sm mx-auto drop-shadow-lg animate-fade-in delay-300">
            Real-time hangout discovery for Vasai-Virar locals
          </p>
        </div>

        {/* Stunning CTA Button */}
        <Link href={user ? "/dashboard" : "/login"} className="w-full max-w-sm mx-auto block mb-12 group relative overflow-hidden">
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          {/* Button content */}
          <div className="relative bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 px-8 py-5 rounded-2xl shadow-2xl hover:shadow-yellow-500/50 transition-all active:scale-95 text-center">
            <span className="text-xl font-black text-gray-900 flex items-center justify-center gap-3">
              {user ? "🗺️ EXPLORE MAP" : "🚀 GET STARTED"}
              <span className="inline-block group-hover:translate-x-2 transition-transform">
                →
              </span>
            </span>
          </div>
        </Link>

        {/* Interactive Map Preview */}
        <div className="relative w-full max-w-sm">
          {/* Glowing container */}
          <div className="relative mx-auto">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/50 to-transparent blur-2xl"></div>

            {/* Map preview with tilt effect */}
            <div className="relative bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-white/20 transform hover:scale-105 transition-transform">
              {/* Mini map or image */}
              <div className="aspect-[9/16] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-6 relative">
                {/* Animated dots representing users/hotspots */}
                <div className="relative h-full w-full">
                  <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-pink-500 rounded-full animate-ping"></div>
                  <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)]"></div>

                  <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-ping delay-300"></div>
                  <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>

                  <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-cyan-400 rounded-full animate-ping delay-700"></div>
                  <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>

                  {/* Map placeholder text */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-6xl mb-4 animate-bounce">📍</div>
                      <div className="text-white/60 text-sm font-medium">Live Activity</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 px-3 py-1.5 rounded-full shadow-lg z-10">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-bold">LIVE</span>
              </div>
            </div>
          </div>

          {/* Feature badges floating around map */}
          <div className="absolute -top-4 -left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-xl animate-float z-20 border border-white/50">
            <span className="text-sm font-bold text-gray-900">🔥 12 Active Now</span>
          </div>

          <div className="absolute -bottom-4 -right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-xl animate-float delay-500 z-20 border border-white/50">
            <span className="text-sm font-bold text-gray-900">⚡ Real-time</span>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-4 mt-16 w-full max-w-sm">
          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20 flex flex-col items-center justify-center text-center hover:bg-white/20 transition-colors">
            <div className="text-3xl mb-2 text-white">
              <Users className="w-8 h-8 mx-auto" />
            </div>
            <div className="text-white font-semibold text-sm">Find Friends</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20 flex flex-col items-center justify-center text-center hover:bg-white/20 transition-colors">
            <div className="text-3xl mb-2 text-white">
              <CheckCircle className="w-8 h-8 mx-auto" />
            </div>
            <div className="text-white font-semibold text-sm">Check In</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20 flex flex-col items-center justify-center text-center hover:bg-white/20 transition-colors">
            <div className="text-3xl mb-2 text-white">
              <Compass className="w-8 h-8 mx-auto" />
            </div>
            <div className="text-white font-semibold text-sm">Explore</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20 flex flex-col items-center justify-center text-center hover:bg-white/20 transition-colors">
            <div className="text-3xl mb-2 text-white">
              <Star className="w-8 h-8 mx-auto" />
            </div>
            <div className="text-white font-semibold text-sm">Rate Places</div>
          </div>
        </div>

      </div>
    </div>
  );
}
