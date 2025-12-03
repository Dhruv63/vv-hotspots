import { type HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface CyberCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "highlighted"
  noBorder?: boolean
}

const CyberCard = forwardRef<HTMLDivElement, CyberCardProps>(
  ({ className, variant = "default", noBorder = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-cyber-dark/80 backdrop-blur-sm cyber-clip",
          !noBorder && "border border-cyber-gray",
          variant === "highlighted" && "border-cyber-cyan neon-border-cyan",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
CyberCard.displayName = "CyberCard"

export { CyberCard }
