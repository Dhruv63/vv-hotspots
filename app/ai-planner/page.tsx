'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CyberButton } from '@/components/ui/cyber-button'
import { CyberCard } from '@/components/ui/cyber-card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function AIPlannerPage() {
  const [timeAvailable, setTimeAvailable] = useState(2)
  const [companion, setCompanion] = useState('Friends')
  const [location, setLocation] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false)
      setShowResults(true)
    }, 2000)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[var(--color-background)] to-black p-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-transparent to-transparent z-0" />

      <div className="w-full max-w-2xl relative z-10 space-y-8 animate-in fade-in zoom-in duration-500">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-secondary)] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,217,255,0.3)] font-heading">
            AI Day Planner
          </h1>
          <p className="text-[var(--color-muted-foreground)] text-lg">
            Plan your perfect day in Vasai-Virar
          </p>
        </div>

        {/* Input Form */}
        <CyberCard className="p-6 md:p-8 space-y-6 bg-[var(--color-card)]/80 backdrop-blur-md border-[var(--color-accent)] neon-border-cyan">
          <div className="space-y-4">

            {/* Time Available */}
            <div className="space-y-2">
              <label htmlFor="time" className="text-sm font-medium text-[var(--color-accent)] uppercase tracking-wider">
                Time Available (hours)
              </label>
              <Input
                id="time"
                type="number"
                min={1}
                max={12}
                value={timeAvailable}
                onChange={(e) => setTimeAvailable(Number(e.target.value))}
                className="bg-[var(--color-muted)] border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)] text-[var(--color-foreground)] h-12 text-lg"
              />
            </div>

            {/* Companion Type */}
            <div className="space-y-2">
              <label htmlFor="companion" className="text-sm font-medium text-[var(--color-accent)] uppercase tracking-wider">
                Who are you with?
              </label>
              <select
                id="companion"
                value={companion}
                onChange={(e) => setCompanion(e.target.value)}
                className="flex h-12 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] px-3 py-2 text-lg text-[var(--color-foreground)] ring-offset-[var(--color-background)] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Girlfriend/Partner">Girlfriend/Partner</option>
                <option value="Friends">Friends</option>
                <option value="Family">Family</option>
                <option value="Solo">Solo</option>
              </select>
            </div>

            {/* Starting Location */}
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium text-[var(--color-accent)] uppercase tracking-wider">
                Starting Location
              </label>
              <Input
                id="location"
                type="text"
                placeholder="e.g., Vasai Railway Station"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-[var(--color-muted)] border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]/50 h-12 text-lg"
                required
              />
            </div>

            {/* Generate Button */}
            <CyberButton
              variant="cyan"
              className="w-full mt-6 font-bold text-lg h-14 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-secondary)] hover:from-[var(--color-accent)]/80 hover:to-[var(--color-secondary)]/80 border-none text-white shadow-[0_0_15px_var(--color-secondary)]"
              onClick={handleGenerate}
              disabled={!location || isGenerating}
              glowing={!isGenerating && !!location}
            >
              {isGenerating ? 'Generating...' : '✨ Generate Itinerary'}
            </CyberButton>
          </div>
        </CyberCard>

        {/* Results Section */}
        {showResults && (
          <CyberCard variant="highlighted" className="p-6 md:p-8 animate-in slide-in-from-bottom-4 fade-in duration-500 border-[var(--color-secondary)] neon-border-pink">
            <h2 className="text-2xl font-bold mb-4 text-[var(--color-secondary)] drop-shadow-[0_0_10px_rgba(255,0,110,0.5)] font-heading">
              Your Itinerary
            </h2>
            <div className="p-6 rounded bg-[var(--color-muted)]/50 border border-[var(--color-border)] min-h-[100px] flex items-center justify-center text-[var(--color-muted-foreground)] italic text-lg">
              AI model will generate itinerary here...
            </div>
          </CyberCard>
        )}

        {/* Back Link */}
        <div className="text-center pt-8 pb-8">
          <Link
            href="/dashboard"
            className="text-[var(--color-accent)] hover:text-[var(--color-secondary)] transition-colors duration-300 font-medium flex items-center justify-center gap-2 group text-lg"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
