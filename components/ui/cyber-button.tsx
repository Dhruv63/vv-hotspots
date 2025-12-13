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
    // Semantic mappings:
    // cyan -> primary
    // pink -> secondary
    // purple -> accent

    const variants = {
      cyan: "bg-primary border-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_var(--color-primary)] hover:shadow-[0_0_25px_var(--color-primary)]",
      outline: "bg-transparent border-primary text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_var(--color-primary)]",
      pink: "bg-secondary/10 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_15px_var(--color-secondary)]",
      purple: "bg-accent/10 border-accent text-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_15px_var(--color-accent)]",
      ghost: "bg-transparent border-muted-foreground text-foreground hover:border-primary hover:text-primary hover:shadow-[0_0_15px_var(--color-primary)]",
    }

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    }

    const glowStyles = glowing
      ? {
          cyan: "shadow-[0_0_20px_var(--color-primary),0_0_40px_var(--color-primary),inset_0_0_20px_rgba(255,255,0,0.1)] animate-pulse",
          pink: "shadow-[0_0_20px_var(--color-secondary),0_0_40px_var(--color-secondary),inset_0_0_20px_rgba(204,255,0,0.1)] animate-pulse",
          purple:
            "shadow-[0_0_20px_var(--color-accent),0_0_40px_var(--color-accent),inset_0_0_20px_rgba(255,215,0,0.1)] animate-pulse",
          ghost: "",
          outline: "",
        }[variant]
      : ""

    return (
      <button
        ref={ref}
        className={cn(
          "font-heading font-semibold border-2 transition-all duration-300 relative overflow-hidden rounded-md",
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
