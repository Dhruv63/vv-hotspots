'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'
import {
  Bot,
  MapPin,
  Clock,
  Users,
  Sparkles,
  RefreshCw,
  Share2,
  Copy,
  Save,
  ArrowLeft,
  Calendar,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'

export default function AIPlanner() {
  const [timeAvailable, setTimeAvailable] = useState('4')
  const [companionType, setCompanionType] = useState('friends')
  const [startLocation, setStartLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState('')
  const [generatedAt, setGeneratedAt] = useState('')
  const [error, setError] = useState('')
  const [usageCount, setUsageCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  const supabase = createClient()
  const MAX_DAILY_USAGE = 3

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
      toast.error('Please log in to use AI Planner')
      setError('Please log in to use AI Planner')
      return
    }

    if (!startLocation.trim()) {
      toast.error('Please enter a starting location')
      setError('Please enter a starting location')
      return
    }

    if (usageCount >= MAX_DAILY_USAGE) {
      const msg = `Daily limit reached! You can generate ${MAX_DAILY_USAGE} itineraries per day.`
      toast.error(msg)
      setError(msg)
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
      setGeneratedAt(new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }))
      updateUsage()
      toast.success('Itinerary generated successfully!')

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('itinerary-result')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to generate. Please try again.')
      toast.error('Failed to generate itinerary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!itinerary) return
    navigator.clipboard.writeText(itinerary)
    toast.success('Itinerary copied to clipboard!')
  }

  const handleShare = async () => {
    if (navigator.share && itinerary) {
      try {
        await navigator.share({
          title: 'My Vasai-Virar Day Plan',
          text: itinerary,
        })
        toast.success('Shared successfully!')
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      handleCopy()
    }
  }

  const companionOptions = [
    { value: 'girlfriend', emoji: '💑', label: 'Partner', desc: 'Romantic date' },
    { value: 'friends', emoji: '👯', label: 'Friends', desc: 'Group hangout' },
    { value: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Family', desc: 'Family time' },
    { value: 'solo', emoji: '🚶', label: 'Solo', desc: 'Me time' },
  ]

  const timeValue = parseInt(timeAvailable)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-6 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-2xl mx-auto w-full space-y-8">

        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block p-4 sm:p-6 rounded-full bg-cyan-500/20 border-2 border-cyan-500 mb-4 sm:mb-6">
            <div className="text-4xl sm:text-5xl">🤖</div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-cyan-400">AI</span>{' '}
            <span className="text-yellow-400">Day Planner</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-xl mx-auto px-4">
            Experience Vasai-Virar like never before with a personalized itinerary curated just for you.
          </p>

          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full border border-yellow-500/50 bg-yellow-500/10">
            <span className="text-xl sm:text-2xl">✨</span>
            <span className="text-xs sm:text-sm font-medium text-yellow-400">
              {usageCount}/{MAX_DAILY_USAGE} itineraries generated today
            </span>
          </div>
        </div>

        {/* Input Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10 group-hover:bg-cyan-500/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -z-10 group-hover:bg-pink-500/20 transition-all duration-700"></div>

          {!isAuthenticated && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center rounded-2xl md:rounded-3xl">
              <Bot className="w-16 h-16 text-yellow-400 mb-4 opacity-80" />
              <h3 className="text-2xl font-bold text-white mb-2">Login Required</h3>
              <p className="text-gray-300 mb-6 max-w-md">Please sign in to your account to generate personalized AI itineraries.</p>
              <Link
                href="/login?next=/ai-planner"
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:scale-105"
              >
                Sign In / Sign Up
              </Link>
            </div>
          )}

          <div className="space-y-8">
            {/* Time Slider Section */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between mb-6">
                <label className="text-lg sm:text-xl font-medium text-cyan-400 flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Time Available
                </label>
                <div className="bg-cyan-500/20 px-4 py-2 rounded-full border border-cyan-500/50">
                  <span className="text-2xl sm:text-3xl font-bold text-cyan-400">{timeValue}</span>
                  <span className="text-sm text-cyan-300 ml-1">hrs</span>
                </div>
              </div>

              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={timeAvailable}
                  onChange={(e) => setTimeAvailable(e.target.value)}
                  className="w-full h-3 sm:h-2 appearance-none bg-gray-700 rounded-full cursor-pointer accent-cyan-400"
                  style={{
                    background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(timeValue/12)*100}%, #1e293b ${(timeValue/12)*100}%, #1e293b 100%)`
                  }}
                />
                <div className="flex justify-between mt-2 text-xs sm:text-sm text-gray-400">
                  <span>Short Trip</span>
                  <span>Full Day</span>
                </div>
              </div>
            </div>

            {/* Companion Selection */}
            <div className="space-y-4 mb-8">
              <label className="text-lg sm:text-xl font-medium text-pink-400 flex items-center gap-2">
                <Users className="w-5 h-5" /> Who are you with?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {companionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCompanionType(option.value)}
                    className={`
                      p-6 sm:p-8 rounded-2xl border-2 transition-all relative text-left
                      ${companionType === option.value
                        ? 'border-pink-500 bg-pink-500/20 shadow-lg shadow-pink-500/50'
                        : 'border-gray-700 bg-gray-800/50 hover:border-pink-400'}
                    `}
                  >
                    <div className="text-4xl mb-3">{option.emoji}</div>
                    <div className="text-lg sm:text-xl font-semibold text-white">{option.label}</div>
                    <div className="text-sm text-gray-400 mt-1">{option.desc}</div>

                    {companionType === option.value && (
                       <div className="absolute top-3 right-3 text-pink-500">
                         <CheckCircle2 className="w-6 h-6" />
                       </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Input */}
            <div className="space-y-4 mb-8">
              <label className="text-lg sm:text-xl font-medium text-yellow-400 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Starting Location
              </label>

              <input
                type="text"
                placeholder="e.g., Vasai Railway Station, Virar East"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                className="w-full px-4 py-4 sm:py-3 text-base sm:text-lg rounded-xl bg-gray-800 border-2 border-gray-700 text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !isAuthenticated || !startLocation.trim() || usageCount >= MAX_DAILY_USAGE}
              className="w-full py-5 sm:py-4 text-lg sm:text-xl font-bold rounded-xl bg-gradient-to-r from-cyan-500 via-yellow-400 to-pink-500 text-black disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-all active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚡</span> Generating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  ✨ Generate AI Itinerary 🚀
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Output Section */}
        {itinerary && (
          <div id="itinerary-result" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-yellow-500 to-pink-500"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-4xl">🎉</span> Your Perfect Day
                  </h2>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Generated on {generatedAt}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-all hover:text-white"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-all hover:text-white"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  <button
                    onClick={() => {
                      setItinerary('');
                      setStartLocation('');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 rounded-lg text-sm text-cyan-300 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> New Plan
                  </button>
                </div>
              </div>

              <div className="prose prose-invert max-w-none prose-lg">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-6 border-b border-white/10 pb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl md:text-2xl font-bold text-cyan-400 mb-4 mt-8 flex items-center gap-2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg md:text-xl font-semibold text-pink-400 mb-3 mt-6" {...props} />,
                    p: ({node, ...props}) => <p className="text-gray-300 mb-4 leading-relaxed" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 ml-4 mb-6 text-gray-300" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-3 ml-4 mb-6 text-gray-300" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-yellow-400 font-bold" {...props} />,
                    em: ({node, ...props}) => <em className="text-cyan-300 italic not-italic" {...props} />,
                    code: ({node, ...props}) => <code className="bg-gray-800/50 border border-white/10 px-2 py-1 rounded text-yellow-300 text-sm font-mono" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-pink-500 pl-4 py-1 my-4 bg-pink-500/5 rounded-r-lg italic text-gray-300" {...props} />,
                  }}
                >
                  {itinerary}
                </ReactMarkdown>
              </div>

              <div className="mt-10 pt-6 border-t border-white/10 text-center">
                <p className="text-gray-500 text-sm">
                  Disclaimer: AI-generated itineraries may need verification. Prices and timings are estimates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center pb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-lg group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
