"use client"

import { type ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "cyan" | "pink" | "purple" | "ghost"
  size?: "sm" | "md" | "lg"
  glowing?: boolean
}

const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, variant = "cyan", size = "md", glowing = false, children, ...props }, ref) => {
    const variants = {
      cyan: "bg-cyber-cyan/10 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-black",
      pink: "bg-cyber-pink/10 border-cyber-pink text-cyber-pink hover:bg-cyber-pink hover:text-white",
      purple: "bg-cyber-purple/10 border-cyber-purple text-cyber-purple hover:bg-cyber-purple hover:text-white",
      ghost: "bg-transparent border-cyber-gray text-cyber-light hover:border-cyber-cyan hover:text-cyber-cyan",
    }

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    }

    const glowClass = glowing
      ? {
          cyan: "neon-pulse",
          pink: "neon-border-pink",
          purple: "neon-border-purple",
          ghost: "",
        }[variant]
      : ""

    return (
      <button
        ref={ref}
        className={cn(
          "font-mono font-semibold border-2 transition-all duration-300 cyber-clip-sm glitch-hover",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          glowClass,
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)
CyberButton.displayName = "CyberButton"

export { CyberButton }
