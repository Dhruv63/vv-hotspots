import Link from "next/link";
import { MapPin, Users, Star, Sparkles } from "lucide-react";

export default function LandingMobile() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-black text-white font-sans overflow-x-hidden">
      <div className="flex flex-col min-h-screen px-6 py-10">

        {/* Hero Section */}
        <header className="mb-12 pt-8">
          <h1 className="text-4xl font-extrabold leading-tight mb-4 tracking-tight whitespace-nowrap">
            VV <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Hotspots</span>
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed mb-8">
            The ultimate guide to Vasai-Virar's best hangout spots. Find where your friends are, right now.
          </p>

          <div className="space-y-4 w-full">
            <Link
              href="/explore"
              className="block w-full text-center py-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
            >
              Explore Hotspots
            </Link>
            <Link
              href="/auth"
              className="block w-full text-center py-5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 font-bold text-lg hover:bg-white/20 transition-colors"
            >
              Sign In
            </Link>
            <button
              className="block w-full text-center py-3 rounded-xl bg-transparent border border-gray-700 text-gray-400 text-sm hover:text-white transition-colors"
            >
              Download App
            </button>
          </div>
        </header>

        {/* Features Section */}
        <div className="flex-1 space-y-3">
          <h2 className="text-2xl font-bold mb-6 text-gray-200">Why Join?</h2>

          {/* Feature 1 */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-center gap-5">
            <div className="w-14 h-14 min-w-[3.5rem] rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-1 text-white">Real-Time Check-Ins</h3>
              <p className="text-sm text-gray-400">See live activity on the map.</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-center gap-5">
            <div className="w-14 h-14 min-w-[3.5rem] rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-1 text-white">Find Your Crowd</h3>
              <p className="text-sm text-gray-400">Connect with local friends.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-center gap-5">
            <div className="w-14 h-14 min-w-[3.5rem] rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Star className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-1 text-white">Rate & Review</h3>
              <p className="text-sm text-gray-400">Share your best experiences.</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex items-center gap-5">
            <div className="w-14 h-14 min-w-[3.5rem] rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-1 text-white">AI Day Planner</h3>
              <p className="text-sm text-gray-400">Get instant plans for the day.</p>
            </div>
          </div>
        </div>

        {/* Simple Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm pb-4">
          © 2024 VV Hotspots.
        </footer>
      </div>
    </div>
  );
}
