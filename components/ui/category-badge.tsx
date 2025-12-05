import { cn } from "@/lib/utils"
import { Coffee, TreePine, Gamepad2, Utensils, Users, MapPin } from "lucide-react"

const categoryConfig = {
  cafe: { icon: Coffee, color: "bg-cat-cafe border-cat-cafe shadow-[0_0_10px_var(--color-cat-cafe)]" },
  park: { icon: TreePine, color: "bg-cat-park border-cat-park shadow-[0_0_10px_var(--color-cat-park)]" },
  gaming: { icon: Gamepad2, color: "bg-cat-gaming border-cat-gaming shadow-[0_0_10px_var(--color-cat-gaming)]" },
  food: { icon: Utensils, color: "bg-cat-food border-cat-food shadow-[0_0_10px_var(--color-cat-food)]" },
  hangout: { icon: Users, color: "bg-cat-hangout border-cat-hangout shadow-[0_0_10px_var(--color-cat-hangout)]" },
  other: { icon: MapPin, color: "bg-cat-other border-cat-other shadow-[0_0_10px_var(--color-cat-other)]" },
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
        "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-mono uppercase border rounded font-bold text-white dark:text-black",
        config.color,
        className,
      )}
    >
      <Icon className="w-3 h-3" />
      {category}
    </span>
  )
}
