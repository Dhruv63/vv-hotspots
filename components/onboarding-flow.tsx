"use client"

import { useState, useEffect } from "react"
import { ChevronRight, MapPin, Camera, Star } from "lucide-react"

export function OnboardingFlow() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Check if onboarding is already completed
    const hasCompletedOnboarding = localStorage.getItem("onboarding-complete")
    if (!hasCompletedOnboarding) {
      setIsOpen(true)
    }
  }, [])

  const handleComplete = () => {
    localStorage.setItem("onboarding-complete", "true")
    setIsOpen(false)
  }

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  if (!isOpen) return null

  const steps = [
    {
      title: "Discover Hotspots",
      description: "Find the best cafes, parks, and hangout spots in Vasai-Virar.",
      icon: <MapPin className="w-12 h-12 text-cyber-yellow" />,
    },
    {
      title: "Share Your Vibe",
      description: "Check in, upload photos, and let friends know where you are.",
      icon: <Camera className="w-12 h-12 text-cyber-pink" />,
    },
    {
      title: "Rate & Review",
      description: "Help the community by rating spots and leaving reviews.",
      icon: <Star className="w-12 h-12 text-cyber-cyan" />,
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0E27] animate-in fade-in duration-300">

      <div className="relative z-10 w-full max-w-md p-6 flex flex-col items-center text-center">
        <button
          onClick={handleComplete}
          className="absolute top-0 right-6 text-cyber-gray hover:text-white transition-colors p-2"
          aria-label="Skip onboarding"
        >
          <span className="text-sm font-mono tracking-wider">SKIP</span>
        </button>

        <div className="mt-12 mb-8 relative group">
           <div className="w-32 h-32 rounded-full bg-cyber-dark border-2 border-cyber-cyan flex items-center justify-center shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-transform duration-500 group-hover:scale-105">
              {steps[step].icon}
           </div>
           {/* Decorative ring */}
           <div className="absolute -inset-2 border border-cyber-pink/30 rounded-full" />
        </div>

        <div key={step} className="animate-in slide-in-from-right-8 fade-in duration-300 w-full">
            <h2 className="text-2xl font-bold text-white mb-4 font-mono">
            {steps[step].title}
            </h2>

            <p className="text-cyber-gray mb-12 min-h-[48px] text-lg">
            {steps[step].description}
            </p>
        </div>

        <div className="flex gap-3 mb-10">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-cyber-yellow shadow-[0_0_10px_rgba(232,255,0,0.5)]" : "w-2 bg-cyber-dark bg-opacity-50"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-4 bg-cyber-pink text-white font-bold tracking-wider rounded-lg shadow-[0_0_15px_rgba(255,0,110,0.4)] hover:bg-cyber-pink/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
        >
          {step === steps.length - 1 ? "GET STARTED" : "NEXT"}
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
