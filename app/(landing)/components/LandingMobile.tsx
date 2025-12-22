'use client';

export default function LandingMobile() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex justify-between items-center">
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            📍
          </button>

          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              🌙
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              🔔
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="pt-20 px-6 pb-12">
        {/* Hero Text */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2 leading-tight">
            <span className="block text-gray-900">Find Where</span>
            <span className="block text-purple-600">Your Crew</span>
            <span className="block text-gray-900">Is</span>
          </h1>

          <p className="text-base text-gray-600 mt-4 max-w-xs mx-auto">
            Real-time hangout discovery for Vasai-Virar locals
          </p>
        </div>

        {/* CTA Button */}
        <div className="mb-12">
          <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-lg px-8 py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
            🗺️ GET STARTED →
          </button>
        </div>

        {/* Map Preview */}
        <div className="relative max-w-sm mx-auto">
          <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-200">
            <div className="aspect-[9/14] bg-slate-800 relative">
              {/* Dots representing activity */}
              <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-pink-500 rounded-full"></div>
              <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-cyan-400 rounded-full"></div>

              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-2">📍</div>
                  <div className="text-white/50 text-sm">Live Activity</div>
                </div>
              </div>
            </div>

            {/* Live badge */}
            <div className="absolute top-4 right-4 bg-red-500 px-3 py-1 rounded-full flex items-center gap-1.5">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-white text-xs font-bold">LIVE</span>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -top-3 -left-3 bg-white px-3 py-1.5 rounded-full shadow-lg border border-gray-200">
            <span className="text-xs font-bold text-gray-900">🔥 12 Active Now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
