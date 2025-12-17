'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { CyberButton } from '@/components/ui/cyber-button'
import { CyberCard } from '@/components/ui/cyber-card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { pipeline } from '@xenova/transformers'
import { toast } from 'sonner'
import { Loader2, Copy, Check, AlertTriangle } from 'lucide-react'

export default function AIPlannerPage() {
  const [timeAvailable, setTimeAvailable] = useState(2)
  const [companion, setCompanion] = useState('Friends')
  const [location, setLocation] = useState('')

  // Model state
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [itinerary, setItinerary] = useState('')
  const [generationError, setGenerationError] = useState('')

  // Refs for pipeline and abort controller
  const generatorRef = useRef<any>(null)

  useEffect(() => {
    loadModel()

    return () => {
      // Cleanup if needed
    }
  }, [])

  const loadModel = async () => {
    if (generatorRef.current) return // Already loaded

    try {
      setModelStatus('loading')

      // Initialize the pipeline
      // We use a custom progress callback to track download
      generatorRef.current = await pipeline('text2text-generation', 'Xenova/flan-t5-small', {
        progress_callback: (data: any) => {
          if (data.status === 'progress') {
            setLoadingProgress(Math.round(data.progress || 0))
          }
        }
      })

      setModelStatus('ready')
      toast.success('AI Model loaded successfully!')
    } catch (err) {
      console.error('Failed to load model:', err)
      setModelStatus('error')
      toast.error('Failed to load AI model. Please check your connection and try again.')
    }
  }

  const handleGenerate = async () => {
    if (!generatorRef.current) {
      toast.error('Model is not ready yet.')
      return
    }

    if (!location) {
      toast.error('Please enter a starting location.')
      return
    }

    setIsGenerating(true)
    setItinerary('')
    setGenerationError('')

    try {
      // Build the prompt
      const prompt = `Generate a detailed day itinerary for Vasai-Virar with 2-3 hotspots, including timing, travel info, and estimated costs. Keep total within ${timeAvailable} hours starting from ${location}. Optimized for ${companion}.`

      // Generate output
      const output = await generatorRef.current(prompt, {
        max_new_tokens: 500, // Allow enough length for a detailed response
        temperature: 0.7,   // Creativity
        do_sample: true,
      })

      if (output && output[0] && output[0].generated_text) {
        let text = output[0].generated_text

        // Basic formatting to make it look nicer if the raw output is a bit dense
        // Note: Flan-T5-Small is a small model, so its formatting might be simple.
        // We'll trust the model's output but ensure newlines are respected in display.
        setItinerary(text)
        toast.success('Itinerary generated!')
      } else {
        throw new Error('No output generated')
      }
    } catch (err) {
      console.error('Generation error:', err)
      setGenerationError('Failed to generate itinerary. Please try again.')
      toast.error('Error generating itinerary.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!itinerary) return
    navigator.clipboard.writeText(itinerary)
    toast.success('Itinerary copied to clipboard!')
  }

  const handleRetryLoad = () => {
    loadModel()
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

          {/* Model Status Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {modelStatus === 'loading' && (
              <span className="text-sm text-[var(--color-muted-foreground)] flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading AI model (80MB)... {loadingProgress > 0 && `${loadingProgress}%`}
              </span>
            )}
            {modelStatus === 'ready' && (
              <span className="text-sm text-green-500 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Model ready!
              </span>
            )}
            {modelStatus === 'error' && (
              <span className="text-sm text-red-500 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Model failed to load.
                <button onClick={handleRetryLoad} className="underline hover:text-red-400">Retry</button>
              </span>
            )}
          </div>
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
              disabled={!location || isGenerating || modelStatus !== 'ready'}
              glowing={!isGenerating && !!location && modelStatus === 'ready'}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Itinerary...
                </span>
              ) : (
                '✨ Generate Itinerary'
              )}
            </CyberButton>

            {modelStatus === 'loading' && (
              <p className="text-xs text-center text-[var(--color-muted-foreground)]">
                Waiting for model to load...
              </p>
            )}
          </div>
        </CyberCard>

        {/* Results Section */}
        {(itinerary || generationError) && (
          <CyberCard variant="highlighted" className="p-6 md:p-8 animate-in slide-in-from-bottom-4 fade-in duration-500 border-[var(--color-secondary)] neon-border-pink relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[var(--color-secondary)] drop-shadow-[0_0_10px_rgba(255,0,110,0.5)] font-heading">
                Your Itinerary
              </h2>
              {itinerary && (
                <CyberButton
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </CyberButton>
              )}
            </div>

            <div className="p-6 rounded bg-[var(--color-muted)]/50 border border-[var(--color-border)] min-h-[100px] text-[var(--color-foreground)] text-lg whitespace-pre-wrap leading-relaxed shadow-inner">
              {generationError ? (
                <span className="text-red-500 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {generationError}
                </span>
              ) : (
                itinerary
              )}
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
