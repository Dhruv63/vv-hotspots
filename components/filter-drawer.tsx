"use client"

import { useTheme } from "next-themes"
import { X, Check } from "lucide-react"
import { THEME_COLORS } from "@/components/map-view"

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  currentCategory: string
  onSelectCategory: (category: string) => void
}

export function FilterDrawer({ isOpen, onClose, currentCategory, onSelectCategory }: FilterDrawerProps) {
  const { resolvedTheme } = useTheme()
  const theme = (resolvedTheme === "light" ? "light" : "dark") as keyof typeof THEME_COLORS
  const colors = THEME_COLORS[theme]

  if (!isOpen) return null

  const categories = [
    { value: "all", label: "All Categories", color: colors.other.main },
    { value: "cafe", label: "Cafes", color: colors.cafe.main },
    { value: "park", label: "Parks", color: colors.park.main },
    { value: "gaming", label: "Gaming", color: colors.gaming.main },
    { value: "food", label: "Food", color: colors.food.main },
    { value: "hangout", label: "Hangout", color: colors.hangout.main },
    { value: "other", label: "Other", color: colors.other.main },
  ]

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
        onClick={onClose}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-[100] bg-cyber-dark border-t-2 border-cyber-primary rounded-t-2xl transition-transform duration-300 md:hidden ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-cyber-gray/30">
          <h2 className="text-cyber-primary font-mono text-lg font-bold tracking-wider">FILTERS</h2>
          <button
            onClick={onClose}
            className="p-2 text-cyber-gray hover:text-cyber-primary transition-colors rounded-full hover:bg-cyber-gray/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                onSelectCategory(cat.value)
                onClose()
              }}
              className={`
                relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-300
                min-h-[56px] w-full text-left
                ${currentCategory === cat.value
                  ? "border-cyber-primary bg-cyber-primary/10 shadow-[0_0_15px_rgba(255,255,0,0.2)]"
                  : "border-cyber-gray/50 hover:border-cyber-gray bg-cyber-black/50"
                }
              `}
            >
              {cat.value !== "all" ? (
                <div
                  className="w-3 h-3 rounded-full shadow-[0_0_8px]"
                  style={{
                    backgroundColor: cat.color,
                    boxShadow: `0 0 8px ${cat.color}`
                  }}
                />
              ) : (
                <div className="w-3 h-3 rounded-full border border-current" />
              )}

              <span className={`font-mono text-sm font-bold ${
                currentCategory === cat.value ? "text-cyber-primary" : "text-cyber-light"
              }`}>
                {cat.label}
              </span>

              {currentCategory === cat.value && (
                <Check className="absolute right-3 w-4 h-4 text-cyber-primary" />
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-cyber-gray/30">
            <button
                onClick={onClose}
                className="w-full py-3 bg-cyber-primary text-cyber-black font-mono font-bold rounded-lg hover:bg-cyber-primary/90 transition-all active:scale-[0.98] min-h-[44px]"
            >
                DONE
            </button>
        </div>
      </div>
    </>
  )
}
