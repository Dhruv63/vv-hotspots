import { cn } from "@/lib/utils"
import { Coffee, TreePine, Gamepad2, Utensils, Users, MapPin } from "lucide-react"

const categoryConfig = {
  cafe: { icon: Coffee, color: "bg-[#00FFFF] text-black border-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.5)]" },
  park: { icon: TreePine, color: "bg-[#39FF14] text-black border-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.5)]" },
  gaming: { icon: Gamepad2, color: "bg-[#BF00FF] text-black border-[#BF00FF] shadow-[0_0_10px_rgba(191,0,255,0.5)]" },
  food: { icon: Utensils, color: "bg-[#FF6600] text-black border-[#FF6600] shadow-[0_0_10px_rgba(255,102,0,0.5)]" },
  hangout: { icon: Users, color: "bg-[#FF1493] text-black border-[#FF1493] shadow-[0_0_10px_rgba(255,20,147,0.5)]" },
  other: { icon: MapPin, color: "bg-[#FFFF00] text-black border-[#FFFF00] shadow-[0_0_10px_rgba(255,255,0,0.5)]" },
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
