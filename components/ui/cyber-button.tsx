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

    const glowStyles = glowing
      ? {
          cyan: "shadow-[0_0_20px_rgba(255,255,0,0.5),0_0_40px_rgba(255,255,0,0.3),inset_0_0_20px_rgba(255,255,0,0.1)] animate-pulse",
          pink: "shadow-[0_0_20px_rgba(204,255,0,0.5),0_0_40px_rgba(204,255,0,0.3),inset_0_0_20px_rgba(204,255,0,0.1)] animate-pulse",
          purple:
            "shadow-[0_0_20px_rgba(255,215,0,0.5),0_0_40px_rgba(255,215,0,0.3),inset_0_0_20px_rgba(255,215,0,0.1)] animate-pulse",
          ghost: "",
        }[variant]
      : ""

    return (
      <button
        ref={ref}
        className={cn(
          "font-mono font-semibold border-2 transition-all duration-300 relative overflow-hidden",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:animate-none",
          "active:scale-95",
          variants[variant],
          sizes[size],
          glowStyles,
          className,
        )}
        {...props}
      >
        {glowing && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        )}
        <span className="relative z-10 flex items-center justify-center">{children}</span>
      </button>
    )
  },
)
CyberButton.displayName = "CyberButton"

export { CyberButton }
