"use client"

import { type ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "cyan" | "pink" | "purple" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  glowing?: boolean
}

const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, variant = "cyan", size = "md", glowing = false, children, ...props }, ref) => {
    const variants = {
      cyan: "bg-cyber-primary border-cyber-primary text-cyber-black hover:bg-cyber-yellow hover:text-cyber-black shadow-[0_0_15px_var(--color-cyber-primary)] hover:shadow-[0_0_25px_var(--color-cyber-primary)]",
      outline: "bg-transparent border-cyber-primary text-cyber-primary hover:bg-cyber-primary/10 hover:shadow-[0_0_15px_var(--color-cyber-primary)]",
      pink: "bg-cyber-pink/10 border-cyber-pink text-cyber-pink hover:bg-cyber-pink hover:text-white dark:hover:text-black hover:shadow-[0_0_15px_var(--color-cyber-pink)]",
      purple: "bg-cyber-purple/10 border-cyber-purple text-cyber-purple hover:bg-cyber-purple hover:text-white dark:hover:text-black hover:shadow-[0_0_15px_var(--color-cyber-purple)]",
      ghost: "bg-transparent border-cyber-gray text-cyber-light hover:border-cyber-primary hover:text-cyber-primary hover:shadow-[0_0_15px_var(--color-cyber-primary)]",
    }

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    }

    const glowStyles = glowing
      ? {
          cyan: "shadow-[0_0_20px_var(--color-cyber-primary),0_0_40px_var(--color-cyber-primary),inset_0_0_20px_rgba(255,255,0,0.1)] animate-pulse",
          pink: "shadow-[0_0_20px_var(--color-cyber-pink),0_0_40px_var(--color-cyber-pink),inset_0_0_20px_rgba(204,255,0,0.1)] animate-pulse",
          purple:
            "shadow-[0_0_20px_var(--color-cyber-purple),0_0_40px_var(--color-cyber-purple),inset_0_0_20px_rgba(255,215,0,0.1)] animate-pulse",
          ghost: "",
          outline: "",
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
