'use client'

import Link from 'next/link'
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
  ArrowLeft,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Locate
} from 'lucide-react'
import { useAIPlanner, companionOptions, MAX_DAILY_USAGE } from './useAIPlanner'

export default function AIPlannerDesktop() {
  const {
    timeAvailable, setTimeAvailable,
    companionType, setCompanionType,
    startLocation, setStartLocation,
    isLocating, handleUseMyLocation,
    loading,
    itinerary, setItinerary,
    generatedAt,
    error,
    usageCount,
    isAuthenticated,
    handleGenerate,
    handleCopy,
    handleShare,
    resetPlanner
  } = useAIPlanner()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-black p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 rounded-full border border-cyan-500/30 mb-2 animate-bounce-subtle">
            <Bot className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-yellow-400 to-pink-500 bg-clip-text text-transparent pb-2">
            AI Day Planner
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Experience Vasai-Virar like never before with a personalized itinerary curated just for you.
          </p>

          <div className="flex justify-center mt-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
              usageCount >= MAX_DAILY_USAGE
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            }`}>
              <Sparkles className="w-4 h-4" />
              <span className="font-medium text-sm">
                {usageCount}/{MAX_DAILY_USAGE} itineraries generated today
              </span>
              {usageCount < MAX_DAILY_USAGE && (
                <span className="flex h-2 w-2 relative ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
              )}
            </div>
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

          <div className="space-y-8 md:space-y-10">
            {/* Time Slider Section */}
            <div>
              <label className="flex items-center gap-2 text-cyan-300 mb-4 font-bold text-lg">
                <Clock className="w-5 h-5" />
                Time Available
              </label>
              <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-gray-400 text-sm font-medium">Short Trip</span>
                  <span className="text-3xl font-bold text-white tabular-nums">
                    {timeAvailable}<span className="text-lg text-gray-500 ml-1">hrs</span>
                  </span>
                  <span className="text-gray-400 text-sm font-medium">Full Day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={timeAvailable}
                  onChange={(e) => setTimeAvailable(e.target.value)}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(34,211,238,0.5)] [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                  <span>1h</span>
                  <span>6h</span>
                  <span>12h</span>
                </div>
              </div>
            </div>

            {/* Companion Selection */}
            <div>
              <label className="flex items-center gap-2 text-pink-300 mb-4 font-bold text-lg">
                <Users className="w-5 h-5" />
                Who are you with?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {companionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCompanionType(option.value)}
                    className={`relative p-4 rounded-xl border transition-all duration-300 group/card text-left ${
                      companionType === option.value
                        ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.2)]'
                        : 'bg-black/20 border-white/10 hover:border-pink-500/50 hover:bg-white/5'
                    }`}
                  >
                    <div className={`text-3xl mb-3 transition-transform duration-300 ${companionType === option.value ? 'scale-110' : 'group-hover/card:scale-110'}`}>
                      {option.emoji}
                    </div>
                    <div className={`font-bold text-lg mb-1 ${companionType === option.value ? 'text-white' : 'text-gray-300'}`}>
                      {option.label}
                    </div>
                    <div className={`text-xs ${companionType === option.value ? 'text-pink-200' : 'text-gray-500'}`}>
                      {option.desc}
                    </div>

                    {companionType === option.value && (
                      <div className="absolute top-3 right-3 text-pink-500">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Input */}
            <div>
              <label className="flex items-center gap-2 text-purple-300 mb-4 font-bold text-lg">
                <MapPin className="w-5 h-5" />
                Starting Location
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="e.g., Vasai Railway Station, Virar East, Arnala..."
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all hover:border-white/20"
                />
                <button
                    onClick={handleUseMyLocation}
                    disabled={isLocating}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-400 hover:text-purple-300 disabled:opacity-50 transition-colors"
                    title="Use my location"
                >
                    {isLocating ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                    ) : (
                        <Locate className="h-5 w-5" />
                    )}
                </button>
              </div>
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
              className="w-full relative group overflow-hidden bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-[2px] rounded-xl transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <div className="relative bg-black/80 hover:bg-transparent transition-colors rounded-[10px] py-4 px-6 flex items-center justify-center gap-3 h-full">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="text-white font-bold text-lg">Crafting your plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-yellow-300 group-hover:animate-spin-slow" />
                    <span className="text-white font-bold text-lg">Generate Itinerary</span>
                  </>
                )}
              </div>
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
                    disabled={!itinerary}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-all hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                  <button
                    onClick={handleShare}
                    disabled={!itinerary}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-all hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Share2 className="w-4 h-4" /> Share Itinerary
                  </button>
                  <button
                    onClick={resetPlanner}
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
