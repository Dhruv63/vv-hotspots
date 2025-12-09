import React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  variant?: "cyan" | "purple" | "pink" | "yellow"
  className?: string
}

const variantStyles = {
  cyan: "text-cyber-cyan border-cyber-cyan bg-cyber-cyan/10",
  purple: "text-cyber-purple border-cyber-purple bg-cyber-purple/10",
  pink: "text-cyber-pink border-cyber-pink bg-cyber-pink/10",
  yellow: "text-[#FFFF00] border-[#FFFF00] bg-[#FFFF00]/10",
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "cyan",
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 h-full min-h-[300px]", className)}>
      <div className={cn(
        "w-20 h-20 rounded-full flex items-center justify-center mb-6 border-2 shadow-[0_0_20px_rgba(0,0,0,0.3)]",
        variantStyles[variant]
      )}>
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-bold font-mono text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-sm mx-auto mb-6">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
