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
  CheckCircle2
} from 'lucide-react'
import { useAIPlanner, companionOptions, MAX_DAILY_USAGE } from './useAIPlanner'

export default function AIPlannerMobile() {
  const {
    timeAvailable, setTimeAvailable,
    companionType, setCompanionType,
    startLocation, setStartLocation,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-slate-900 to-black pb-32">
        {/* Mobile Header */}
        <div className="p-6 pt-12 text-center space-y-4">
             <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 rounded-full border border-cyan-500/30 mb-2">
                <Bot className="w-10 h-10 text-cyan-400" />
             </div>
             <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-yellow-400 to-pink-500 bg-clip-text text-transparent pb-2 leading-tight">
                AI Planner
             </h1>

             {/* Usage limit badge */}
             <div className="flex justify-center mt-6">
                <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-full border ${
                  usageCount >= MAX_DAILY_USAGE
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                }`}>
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold text-base">
                    {usageCount}/{MAX_DAILY_USAGE} Used Today
                  </span>
                </div>
              </div>
        </div>

        {/* Form Container */}
        <div className="px-4 space-y-8">

             {!isAuthenticated && (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-sm">
                  <Bot className="w-16 h-16 text-yellow-400 mb-4 opacity-80 mx-auto" />
                  <h3 className="text-2xl font-bold text-white mb-3">Login Required</h3>
                  <p className="text-gray-300 mb-8 text-lg">Sign in to generate your plan.</p>
                  <Link
                    href="/login?next=/ai-planner"
                    className="block w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xl rounded-2xl shadow-lg shadow-cyan-900/20"
                  >
                    Sign In Now
                  </Link>
                </div>
              )}

             {/* Time Slider */}
             <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                <label className="flex items-center gap-3 text-cyan-300 mb-6 font-bold text-xl">
                    <Clock className="w-6 h-6" />
                    How much time?
                </label>

                <div className="mb-8 flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-bold text-white tabular-nums tracking-tighter">{timeAvailable}</span>
                    <span className="text-xl text-gray-400 font-medium">hours</span>
                </div>

                <div className="px-2">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={timeAvailable}
                    onChange={(e) => setTimeAvailable(e.target.value)}
                    className="w-full h-4 bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyan-400 touch-none
                    [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(34,211,238,0.6)]
                    [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:border-none
                    "
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-4 font-medium">
                    <span>Quick (1h)</span>
                    <span>All Day (12h)</span>
                  </div>
                </div>
             </div>

             {/* Companion */}
             <div className="space-y-4">
                <label className="flex items-center gap-3 text-pink-300 mb-2 font-bold text-xl pl-2">
                    <Users className="w-6 h-6" />
                    Who's with you?
                </label>
                <div className="grid grid-cols-1 gap-4">
                    {companionOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setCompanionType(option.value)}
                            className={`relative p-5 rounded-2xl border transition-all flex items-center gap-4 ${
                              companionType === option.value
                                ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.15)]'
                                : 'bg-white/5 border-white/10 active:scale-[0.98]'
                            }`}
                        >
                            <div className="text-4xl">{option.emoji}</div>
                            <div className="text-left flex-1">
                                <div className={`font-bold text-xl ${companionType === option.value ? 'text-white' : 'text-gray-300'}`}>
                                    {option.label}
                                </div>
                                <div className={`text-sm ${companionType === option.value ? 'text-pink-200' : 'text-gray-500'}`}>
                                    {option.desc || 'Just me'}
                                </div>
                            </div>
                            {companionType === option.value && (
                                <div className="text-pink-500">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
             </div>

             {/* Location Input */}
             <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                <label className="flex items-center gap-3 text-purple-300 mb-4 font-bold text-xl">
                    <MapPin className="w-6 h-6" />
                    Start Location
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-6 w-6 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Vasai Station..."
                      value={startLocation}
                      onChange={(e) => setStartLocation(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-5 text-white text-xl placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                </div>
             </div>

             {/* Error Message */}
             {error && (
               <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-4">
                 <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-1" />
                 <p className="text-red-300 text-base font-medium">{error}</p>
               </div>
             )}

             {/* Generate Button */}
             <button
              onClick={handleGenerate}
              disabled={loading || !isAuthenticated || !startLocation.trim() || usageCount >= MAX_DAILY_USAGE}
              className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-[2px] rounded-2xl shadow-lg disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-transform"
             >
                <div className="bg-black/80 hover:bg-transparent rounded-[14px] py-6 flex items-center justify-center gap-3 h-full transition-colors">
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            <span className="text-white font-bold text-xl">Generating...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-6 h-6 text-yellow-300" />
                            <span className="text-white font-bold text-xl tracking-wide">GENERATE PLAN</span>
                        </>
                    )}
                </div>
             </button>

        </div>

        {/* Results */}
        {itinerary && (
            <div id="itinerary-result" className="mt-12 px-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 via-yellow-500 to-pink-500"></div>

                    <div className="mb-8 mt-4">
                        <h2 className="text-3xl font-bold text-white mb-2">🎉 Plan Ready!</h2>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{generatedAt}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <button onClick={handleCopy} className="py-4 bg-white/5 active:bg-white/10 border border-white/10 rounded-2xl text-white font-medium flex items-center justify-center gap-2 transition-colors">
                            <Copy className="w-5 h-5" /> Copy
                        </button>
                        <button onClick={handleShare} className="py-4 bg-white/5 active:bg-white/10 border border-white/10 rounded-2xl text-white font-medium flex items-center justify-center gap-2 transition-colors">
                            <Share2 className="w-5 h-5" /> Share
                        </button>
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none">
                         <ReactMarkdown
                            components={{
                                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-yellow-400 mb-6 border-b border-white/10 pb-4" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-cyan-400 mb-4 mt-8 flex items-center gap-2" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-pink-400 mb-3 mt-6" {...props} />,
                                p: ({node, ...props}) => <p className="text-gray-300 mb-4 text-base leading-relaxed" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 ml-2 mb-6 text-gray-300" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-3 ml-2 mb-6 text-gray-300" {...props} />,
                                strong: ({node, ...props}) => <strong className="text-yellow-400 font-bold" {...props} />,
                            }}
                         >
                             {itinerary}
                         </ReactMarkdown>
                    </div>

                    <button
                        onClick={resetPlanner}
                        className="w-full mt-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-cyan-400 font-bold flex items-center justify-center gap-2 active:bg-white/10 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" /> Start New Plan
                    </button>
                </div>
            </div>
        )}

        <div className="text-center mt-12 px-4 pb-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 py-4 px-6 text-gray-400 hover:text-white font-medium border border-transparent hover:border-white/10 rounded-xl transition-all">
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
            </Link>
        </div>
    </div>
  )
}
