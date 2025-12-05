import { cn } from "@/lib/utils"
import { Coffee, TreePine, Gamepad2, Utensils, Users, MapPin } from "lucide-react"

const categoryConfig = {
  cafe: { icon: Coffee, color: "bg-[#FFFF00] text-black border-[#FFFF00] shadow-[0_0_10px_rgba(255,255,0,0.5)]" },
  park: { icon: TreePine, color: "bg-[#FFFF00] text-black border-[#FFFF00] shadow-[0_0_10px_rgba(255,255,0,0.5)]" },
  gaming: { icon: Gamepad2, color: "bg-[#FFFF00] text-black border-[#FFFF00] shadow-[0_0_10px_rgba(255,255,0,0.5)]" },
  food: { icon: Utensils, color: "bg-[#FFFF00] text-black border-[#FFFF00] shadow-[0_0_10px_rgba(255,255,0,0.5)]" },
  hangout: { icon: Users, color: "bg-[#FFFF00] text-black border-[#FFFF00] shadow-[0_0_10px_rgba(255,255,0,0.5)]" },
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
