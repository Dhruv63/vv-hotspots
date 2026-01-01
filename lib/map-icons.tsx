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
  Music,
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
const iconCache = new Map<string, L.DivIcon>()

export function getHotspotIcon(category: string, isSelected: boolean = false): L.DivIcon {
  // Normalize category
  const catKey = category.toLowerCase()
  const cacheKey = `${catKey}-${isSelected ? 'selected' : 'normal'}`

  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!
  }

  const IconComponent = HOTSPOT_ICON_MAP[catKey] || MapPin
  const color = CATEGORY_COLOR[catKey as keyof typeof CATEGORY_COLOR] || DEFAULT_COLOR

  // We use renderToStaticMarkup to generate the HTML string for Leaflet's divIcon
  const html = renderToStaticMarkup(
    <div
      className={`custom-marker-container ${isSelected ? 'selected' : ''}`}
      style={{
        '--marker-color': color
      } as React.CSSProperties}
      role="button"
      aria-label={`${catKey} marker`}
    >
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
  const anchor = isSelected ? [24, 54] : [18, 42] // Tip of the pin

  const icon = L.divIcon({
    className: 'custom-marker-wrapper',
    html,
    iconSize: [size, size], // This is the box size, but we might overflow for the pin
    iconAnchor: [size/2, size + 6], // Adjust anchor to point to location
    popupAnchor: [0, -size],
  })

  iconCache.set(cacheKey, icon)
  return icon
}
