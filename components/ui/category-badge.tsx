import { cn } from "@/lib/utils"
import { Coffee, TreePine, Gamepad2, Utensils, Users, MapPin } from "lucide-react"

const categoryConfig = {
  cafe: { icon: Coffee, color: "text-amber-400 border-amber-400/50 bg-amber-400/10" },
  park: { icon: TreePine, color: "text-green-400 border-green-400/50 bg-green-400/10" },
  gaming: { icon: Gamepad2, color: "text-cyber-purple border-cyber-purple/50 bg-cyber-purple/10" },
  food: { icon: Utensils, color: "text-cyber-pink border-cyber-pink/50 bg-cyber-pink/10" },
  hangout: { icon: Users, color: "text-cyber-cyan border-cyber-cyan/50 bg-cyber-cyan/10" },
  other: { icon: MapPin, color: "text-cyber-gray border-cyber-gray/50 bg-cyber-gray/10" },
}

interface CategoryBadgeProps {
  category: keyof typeof categoryConfig
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = categoryConfig[category] || categoryConfig.other
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-mono uppercase border rounded",
        config.color,
        className,
      )}
    >
      <Icon className="w-3 h-3" />
      {category}
    </span>
  )
}
