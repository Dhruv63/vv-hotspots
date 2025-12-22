'use client';

export default function LandingDesktop() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* THIS SHOULD BE THE EXACT ORIGINAL DESKTOP VERSION */}
      {/* Copy the desktop landing page code that was working before */}
      {/* DO NOT change anything from the original working version */}

      {/* If you don't have the original code, use a clean simple version: */}

      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📍</span>
            <span className="text-xl font-bold text-gray-900">VV HOTSPOTS</span>
          </div>

          <div className="flex gap-4">
            <button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
              🌙
            </button>
            <button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
              🔔
            </button>
            <button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
              ☰
            </button>
          </div>
        </div>
      </header>

      <div className="pt-32 pb-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <h1 className="text-6xl font-black mb-6 leading-tight">
                <span className="block text-gray-900">Find Where</span>
                <span className="block text-purple-600">Your Crew</span>
                <span className="block text-gray-900">Is</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Real-time hangout discovery for Vasai-Virar locals
              </p>

              <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-lg px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                🗺️ EXPLORE MAP
              </button>
            </div>

            {/* Right: Map preview */}
            <div className="relative">
              <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-square bg-slate-800 relative p-8">
                  {/* Map dots */}
                  <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-pink-500 rounded-full"></div>
                  <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-yellow-400 rounded-full"></div>
                  <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-cyan-400 rounded-full"></div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-7xl mb-4">📍</div>
                      <div className="text-white/50">Live Activity</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
