import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import {
  Utensils,
  Coffee,
  Beer,
  Waves,
  Trees,
  Church,
  ShoppingBag,
  Heart,
  Dumbbell,
  Hotel,
  Landmark,
  Pizza,
  IceCream,
  Film,
  Store,
  Mountain,
  Train,
  Castle,
  MapPin,
  Gamepad2,
  Users,
  LucideIcon
} from 'lucide-react'
import { CATEGORY_COLOR } from '@/lib/constants'

// Extend category mapping with logical fallbacks
export const HOTSPOT_ICON_MAP: Record<string, LucideIcon> = {
  // Current known categories
  cafe: Coffee,
  park: Trees,
  gaming: Gamepad2,
  food: Utensils,
  hangout: Users,
  other: MapPin,

  // Requested mappings
  restaurant: Utensils,
  bar: Beer,
  pub: Beer,
  beach: Waves,
  temple: Church,
  church: Church,
  shopping: ShoppingBag,
  mall: ShoppingBag,
  hospital: Heart,
  gym: Dumbbell,
  hotel: Hotel,
  attraction: Landmark,
  fastfood: Pizza,
  dessert: IceCream,
  cinema: Film,
  store: Store,
  viewpoint: Mountain,
  station: Train,
  historical: Castle,
}

// Fallback color if category not found in CATEGORY_COLOR
const DEFAULT_COLOR = '#06b6d4' // Cyan

// Cache icons to prevent constant regeneration
// Key: category-selected-crowdCount
const iconCache = new Map<string, L.DivIcon>()

export function getHotspotIcon(category: string, isSelected: boolean = false, crowdCount: number = 0): L.DivIcon {
  // Normalize category
  const catKey = category.toLowerCase()
  const cacheKey = `${catKey}-${isSelected ? 'selected' : 'normal'}-${crowdCount}`

  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!
  }

  const IconComponent = HOTSPOT_ICON_MAP[catKey] || MapPin
  const color = CATEGORY_COLOR[catKey as keyof typeof CATEGORY_COLOR] || DEFAULT_COLOR

  // Badge Color Logic
  let badgeBg = '#22c55e' // Green (Empty)
  if (crowdCount >= 3) badgeBg = '#eab308' // Yellow (Moderate)
  if (crowdCount >= 9) badgeBg = '#ef4444' // Red (Busy)
  if (crowdCount >= 20) badgeBg = '#000000' // Black (Packed)

  // We use renderToStaticMarkup to generate the HTML string for Leaflet's divIcon
  const html = renderToStaticMarkup(
    <div
      className={`custom-marker-container ${isSelected ? 'selected' : ''}`}
      style={{
        '--marker-color': color,
        position: 'relative' // Ensure container is relative for absolute badge
      } as React.CSSProperties}
      role="button"
      aria-label={`${catKey} marker`}
    >
      {crowdCount > 0 && (
         <div
            style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: badgeBg,
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: '999px',
                border: '1px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                zIndex: 10,
                minWidth: '18px',
                textAlign: 'center'
            }}
         >
            {crowdCount}
         </div>
      )}

      <div className="custom-marker-bg">
        <IconComponent
          size={isSelected ? 24 : 18}
          className="custom-marker-icon"
          strokeWidth={2.5}
        />
      </div>
      <div className="custom-marker-pin" />
    </div>
  )

  const size = isSelected ? 48 : 36

  const icon = L.divIcon({
    className: 'custom-marker-wrapper',
    html,
    iconSize: [size, size], // This is the box size
    iconAnchor: [size/2, size + 6], // Adjust anchor to point to location
    popupAnchor: [0, -size],
  })

  // Limit cache size to avoid memory leak with dynamic counts
  if (iconCache.size > 1000) {
      iconCache.clear()
  }

  iconCache.set(cacheKey, icon)
  return icon
}
