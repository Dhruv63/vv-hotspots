import { cn } from "@/lib/utils"
import { Coffee, TreePine, Gamepad2, Utensils, Users, MapPin } from "lucide-react"

const categoryConfig = {
  cafe: { icon: Coffee, color: "bg-cyber-primary text-cyber-black border-cyber-primary shadow-[0_0_10px_rgba(255,255,0,0.4)]" },
  park: { icon: TreePine, color: "bg-cyber-secondary text-cyber-black border-cyber-secondary shadow-[0_0_10px_rgba(204,255,0,0.4)]" },
  gaming: { icon: Gamepad2, color: "bg-cyber-accent text-cyber-black border-cyber-accent shadow-[0_0_10px_rgba(255,215,0,0.4)]" },
  food: { icon: Utensils, color: "bg-yellow-100 text-black border-yellow-100 shadow-[0_0_10px_rgba(255,255,200,0.4)]" },
  hangout: { icon: Users, color: "bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]" },
  other: { icon: MapPin, color: "bg-cyber-gray text-white border-cyber-gray" },
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
        "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-mono uppercase border rounded font-bold",
        config.color,
        className,
      )}
    >
      <Icon className="w-3 h-3" />
      {category}
    </span>
  )
}
