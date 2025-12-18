'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AIPlanner() {
  const [timeAvailable, setTimeAvailable] = useState('4')
  const [companionType, setCompanionType] = useState('friends')
  const [startLocation, setStartLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState('')
  const [error, setError] = useState('')
  const [usageCount, setUsageCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const supabase = createClient()
  const MAX_DAILY_USAGE = 5

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()
  }, [supabase])

  useEffect(() => {
    const today = new Date().toDateString()
    const usageKey = `ai_planner_${today}`
    const stored = localStorage.getItem(usageKey)
    setUsageCount(stored ? parseInt(stored) : 0)
  }, [])

  const updateUsage = () => {
    const today = new Date().toDateString()
    const usageKey = `ai_planner_${today}`
    const newCount = usageCount + 1
    localStorage.setItem(usageKey, newCount.toString())
    setUsageCount(newCount)
  }

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      setError('Please log in to use AI Planner')
      return
    }

    if (!startLocation.trim()) {
      setError('Please enter a starting location')
      return
    }

    if (usageCount >= MAX_DAILY_USAGE) {
      setError(`Daily limit reached! You can generate ${MAX_DAILY_USAGE} itineraries per day. Come back tomorrow! 🌅`)
      return
    }

    setLoading(true)
    setError('')
    setItinerary('')

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeAvailable,
          companionType,
          startLocation,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate itinerary')
      }

      setItinerary(data.itinerary)
      updateUsage()
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Failed to generate. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            🤖 AI Day Planner
          </h1>
          <p className="text-gray-300 text-lg">Plan your perfect day in Vasai-Virar with AI</p>

          <div className="mt-4 inline-block bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2">
            <span className="text-cyan-300 text-sm font-semibold">
              {usageCount}/{MAX_DAILY_USAGE} itineraries today
            </span>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="bg-yellow-900/40 border border-yellow-500/50 rounded-lg p-4 mb-6 text-center">
            <p className="text-yellow-300">⚠️ Please <Link href="/login" className="underline font-bold hover:text-yellow-200">log in</Link> to use AI Planner</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-300 font-semibold">⚠️ {error}</p>
          </div>
        )}

        <div className="bg-black/40 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-8 mb-6 shadow-2xl shadow-cyan-500/20">

          <div className="mb-6">
            <label className="block text-cyan-400 mb-3 font-bold text-lg">
              ⏰ Time Available
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="12"
                value={timeAvailable}
                onChange={(e) => setTimeAvailable(e.target.value)}
                className="flex-1 accent-cyan-500"
              />
              <div className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg px-6 py-3 min-w-[100px] text-center">
                <span className="text-cyan-300 font-bold text-xl">{timeAvailable}</span>
                <span className="text-cyan-400 text-sm ml-1">hrs</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-pink-400 mb-3 font-bold text-lg">
              👥 Who are you with?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'girlfriend', emoji: '💑', label: 'Partner' },
                { value: 'friends', emoji: '👯', label: 'Friends' },
                { value: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Family' },
                { value: 'solo', emoji: '🚶', label: 'Solo' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCompanionType(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all font-semibold ${
                    companionType === option.value
                      ? 'bg-pink-500/30 border-pink-500 text-pink-200 scale-105'
                      : 'bg-gray-900/50 border-pink-500/30 text-gray-400 hover:border-pink-500/60'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.emoji}</div>
                  <div className="text-sm">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-purple-400 mb-3 font-bold text-lg">
              📍 Starting Location
            </label>
            <input
              type="text"
              placeholder="e.g., Vasai Railway Station, Virar East"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              className="w-full bg-gray-900/70 border-2 border-purple-500/50 rounded-lg px-5 py-4 text-white text-lg focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/30 placeholder-gray-500 transition-all"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !isAuthenticated || !startLocation.trim() || usageCount >= MAX_DAILY_USAGE}
            className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold text-xl py-5 rounded-xl hover:shadow-2xl hover:shadow-pink-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Your Perfect Day...
              </span>
            ) : (
              '✨ Generate AI Itinerary 🚀'
            )}
          </button>
        </div>

        {itinerary && (
          <div className="bg-black/50 backdrop-blur-lg border border-pink-500/40 rounded-xl p-8 shadow-2xl shadow-pink-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                🎉 Your Perfect Day
              </h2>
              <button
                onClick={() => { setItinerary(''); setError('') }}
                className="text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-2 px-4 py-2 border border-pink-500/30 rounded-lg hover:bg-pink-500/10 transition-all"
              >
                🔄 New Plan
              </button>
            </div>

            <div className="text-gray-200 leading-relaxed whitespace-pre-wrap text-lg">
              {itinerary}
            </div>
          </div>
        )}

        <Link
          href="/dashboard"
          className="block text-center mt-8 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold text-lg"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
