import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export const MAX_DAILY_USAGE = 3

export const companionOptions = [
  { value: 'girlfriend', emoji: '💑', label: 'Partner', desc: 'Romantic date' },
  { value: 'friends', emoji: '👯', label: 'Friends', desc: 'Fun hangout' },
  { value: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Family', desc: 'Kid-friendly' },
  { value: 'solo', emoji: '🚶', label: 'Solo' },
]

export function useAIPlanner() {
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

  const resetPlanner = () => {
    setItinerary('')
    setStartLocation('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
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
  }
}
