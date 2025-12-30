import Link from "next/link";
import { MapPin, Users, Star, Sparkles, Twitter, Instagram } from "lucide-react";

export default function LandingDesktop() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight">VV Hotspots</div>
          <div className="flex gap-4">
            <Link
              href="/auth"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="py-20 px-8 text-center bg-white">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-6xl font-extrabold tracking-tight text-slate-900">
              VV Hotspots
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover the best hangout spots in Vasai-Virar. Connect with locals, find your crowd, and explore the city like never before.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                href="/explore"
                className="px-10 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                Explore Hotspots
              </Link>
              <Link
                href="/auth"
                className="px-8 py-4 rounded-full bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-8 bg-slate-50 border-t border-slate-200">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 gap-12">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-6 text-white shadow-md">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Real-Time Check-Ins</h3>
                <p className="text-slate-600 leading-relaxed">
                  See where people are hanging out right now. Our live map shows you the hottest spots in town instantly.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 text-white shadow-md">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Find Your Crowd</h3>
                <p className="text-slate-600 leading-relaxed">
                  Connect with friends and meet new people. See who is at your favorite cafe or park before you leave home.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-6 text-white shadow-md">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Rate & Review</h3>
                <p className="text-slate-600 leading-relaxed">
                  Share your experiences. Rate spots, write reviews, and help the community discover hidden gems.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 text-white shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">AI Day Planner</h3>
                <p className="text-slate-600 leading-relaxed">
                  Not sure what to do? Let our AI generate the perfect itinerary for your day out in Vasai-Virar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-8 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-slate-900">Ready to explore?</h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Join thousands of locals who use VV Hotspots to find the best places and connect with friends.
            </p>
            <Link
              href="/explore"
              className="inline-block px-8 py-4 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-slate-500 text-sm">
            &copy; 2024 VV Hotspots. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
