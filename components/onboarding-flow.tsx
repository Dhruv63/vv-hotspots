"use client"

import { useState, useEffect } from "react"
import { Map, Users, Star, ArrowRight, Check } from "lucide-react"
import { CyberButton } from "@/components/ui/cyber-button"
import { CyberCard } from "@/components/ui/cyber-card"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export function OnboardingFlow() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("vv-onboarding-completed")
    if (!hasSeenOnboarding) {
      setIsOpen(true)
    }
  }, [])

  const handleComplete = () => {
    localStorage.setItem("vv-onboarding-completed", "true")
    setIsOpen(false)
  }

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const steps = [
    {
      title: "Discover Hotspots",
      description: "Find the best cafes, beaches, and hangouts in Vasai-Virar.",
      icon: Map,
      color: "text-cyber-cyan",
      bg: "bg-cyber-cyan/10",
      border: "border-cyber-cyan",
    },
    {
      title: "Check In & See Friends",
      description: "Let your crew know where you're at in real-time.",
      icon: Users,
      color: "text-cyber-purple",
      bg: "bg-cyber-purple/10",
      border: "border-cyber-purple",
    },
    {
      title: "Rate & Review",
      description: "Share your experience and help locals discover gems.",
      icon: Star,
      color: "text-[#FFFF00]",
      bg: "bg-[#FFFF00]/10",
      border: "border-[#FFFF00]",
    },
  ]

  if (!isOpen) return null

  const CurrentIcon = steps[step].icon

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleComplete()}>
      <DialogContent className="sm:max-w-md bg-cyber-black border-2 border-cyber-gray p-0 overflow-hidden gap-0">
        <div className="relative h-full flex flex-col">
          {/* Progress Indicators */}
          <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 z-10">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  i === step ? "w-8 bg-[#FFFF00] shadow-[0_0_10px_#FFFF00]" : "bg-cyber-gray/50"
                )}
              />
            ))}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-8 pt-16 text-center">
            {/* Illustration */}
            <div className={cn(
              "w-48 h-48 rounded-full flex items-center justify-center mb-8 border-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500",
              steps[step].bg,
              steps[step].border
            )}>
              <CurrentIcon className={cn("w-24 h-24 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]", steps[step].color)} />
            </div>

            <h2 className="text-2xl font-bold font-mono text-white mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {steps[step].title}
            </h2>
            <p className="text-gray-400 max-w-xs mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
              {steps[step].description}
            </p>
          </div>

          <div className="p-6 bg-cyber-dark/50 border-t border-cyber-gray/20 flex justify-between items-center">
            <button
              onClick={handleComplete}
              className="text-gray-500 hover:text-white font-mono text-sm px-4 py-2 transition-colors"
            >
              Skip
            </button>
            <CyberButton
              onClick={handleNext}
              variant={step === 2 ? "default" : "cyan"}
              className="group"
            >
              {step === 2 ? (
                <>Get Started <Check className="w-4 h-4 ml-2" /></>
              ) : (
                <>Next <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
              )}
            </CyberButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
