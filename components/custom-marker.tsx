import React from 'react'
import { Marker, Popup, Tooltip } from 'react-leaflet'
import { getHotspotIcon } from '@/lib/map-icons'
import type { Hotspot } from '@/lib/types'
import { CategoryBadge } from '@/components/ui/category-badge'
import { CATEGORY_COLOR } from '@/lib/constants'
import { MapPin } from 'lucide-react'
import Image from 'next/image'
import L from 'leaflet'

interface CustomMarkerProps {
  hotspot: Hotspot
  isSelected: boolean
  onClick: (hotspot: Hotspot) => void
}

export function CustomMarker({ hotspot, isSelected, onClick }: CustomMarkerProps) {
  // Safely cast or fallback category
  const category = hotspot.category || 'other'
  const normalizedCategory = category.toLowerCase()
  const icon = getHotspotIcon(normalizedCategory, isSelected)
  const color = CATEGORY_COLOR[normalizedCategory as keyof typeof CATEGORY_COLOR] || '#06b6d4'

  return (
    <Marker
      position={[Number(hotspot.latitude), Number(hotspot.longitude)]}
      icon={icon}
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e)
          onClick(hotspot)
        },
      }}
      zIndexOffset={isSelected ? 1000 : 0}
    >
      <Tooltip
        permanent
        direction="top"
        className="custom-tooltip font-bold"
        offset={[0, -40]}
      >
        {hotspot.name}
      </Tooltip>

      <Popup className="cyber-popup" closeButton={true}>
         <div className="flex flex-col min-w-[200px]">
             <div className="relative h-24 w-full bg-muted rounded-t-lg overflow-hidden">
                 {hotspot.image_url ? (
                   <Image
                     src={hotspot.image_url}
                     alt={hotspot.name}
                     fill
                     className="object-cover"
                   />
                 ) : (
                   <div
                       className="absolute inset-0 opacity-50"
                       style={{
                           background: `linear-gradient(to bottom right, ${color}, transparent)`
                       }}
                   />
                 )}
                 <div className="absolute bottom-2 left-2 z-10">
                     <CategoryBadge category={category} />
                 </div>
             </div>
             <div className="p-3 bg-card rounded-b-lg space-y-2">
                 <h3 className="font-bold text-sm line-clamp-1" title={hotspot.name}>{hotspot.name}</h3>
                 <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                     <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                     <span className="line-clamp-2">{hotspot.address || "No address provided"}</span>
                 </div>
                 <button
                     onClick={(e) => {
                         e.stopPropagation()
                         onClick(hotspot)
                     }}
                     className="w-full mt-2 py-1.5 text-xs font-bold bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 transition-colors"
                 >
                     VIEW DETAILS
                 </button>
             </div>
         </div>
      </Popup>
    </Marker>
  )
}
