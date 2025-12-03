"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Hotspot } from "@/lib/types"

interface MapViewProps {
  hotspots: Hotspot[]
  selectedHotspot: Hotspot | null
  onHotspotSelect: (hotspot: Hotspot) => void
  activeCheckins: Record<string, number>
}

// Vasai-Virar center coordinates
const VASAI_VIRAR_CENTER: [number, number] = [19.42, 72.82]

// Category colors for markers
const categoryColors: Record<string, string> = {
  cafe: "#f59e0b",
  park: "#22c55e",
  gaming: "#b700ff",
  food: "#ff006e",
  hangout: "#00ffff",
  other: "#6b7280",
}

export function MapView({ hotspots, selectedHotspot, onHotspotSelect, activeCheckins }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [L, setL] = useState<typeof import("leaflet") | null>(null)

  // Load Leaflet dynamically (client-side only)
  useEffect(() => {
    const loadLeaflet = async () => {
      const leaflet = await import("leaflet")
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })
      setL(leaflet)
    }
    loadLeaflet()
  }, [])

  const createMarkerIcon = useCallback(
    (hotspot: Hotspot, isSelected: boolean) => {
      if (!L) return null

      const color = categoryColors[hotspot.category] || categoryColors.other
      const activeCount = activeCheckins[hotspot.id] || 0
      const size = isSelected ? 48 : 40
      const hasActiveUsers = activeCount > 0

      const html = `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        cursor: pointer;
      ">
        <div style="
          width: 100%;
          height: 100%;
          background: ${color}30;
          border: 3px solid ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 ${isSelected ? "20px" : hasActiveUsers ? "15px" : "8px"} ${color}${hasActiveUsers ? "" : "80"};
          transition: all 0.3s ease;
          ${hasActiveUsers ? `animation: pulse 2s infinite;` : ""}
        ">
          <div style="
            width: 14px;
            height: 14px;
            background: ${color};
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
        ${
          hasActiveUsers
            ? `
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            min-width: 22px;
            height: 22px;
            background: linear-gradient(135deg, #00ffff 0%, #00cccc 100%);
            border: 2px solid #0a0a0f;
            border-radius: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            color: #0a0a0f;
            padding: 0 5px;
            font-family: monospace;
            box-shadow: 0 0 10px #00ffff;
            animation: glow 1.5s ease-in-out infinite alternate;
          ">${activeCount}</div>
        `
            : ""
        }
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: rotate(-45deg) scale(1); }
          50% { transform: rotate(-45deg) scale(1.05); }
        }
        @keyframes glow {
          from { box-shadow: 0 0 5px #00ffff; }
          to { box-shadow: 0 0 15px #00ffff, 0 0 20px #00ffff; }
        }
      </style>
    `

      return L.divIcon({
        html,
        className: "custom-marker",
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
      })
    },
    [L, activeCheckins],
  )

  // Initialize map
  useEffect(() => {
    if (!L || !mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: VASAI_VIRAR_CENTER,
      zoom: 12,
      zoomControl: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    mapRef.current = map
    setIsLoaded(true)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [L])

  // Update markers when hotspots, selection, or activeCheckins changes
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !L) return

    markersRef.current.forEach((marker) => {
      marker.remove()
    })
    markersRef.current = []

    hotspots.forEach((hotspot) => {
      const isSelected = selectedHotspot?.id === hotspot.id
      const icon = createMarkerIcon(hotspot, isSelected)

      if (!icon) return

      const marker = L.marker([Number(hotspot.latitude), Number(hotspot.longitude)], {
        icon,
        title: hotspot.name,
      })
        .addTo(mapRef.current!)
        .on("click", () => {
          onHotspotSelect(hotspot)
        })

      const activeCount = activeCheckins[hotspot.id] || 0
      const tooltipContent =
        activeCount > 0
          ? `<strong>${hotspot.name}</strong><br/><span style="color: #00ffff;">${activeCount} here now</span>`
          : hotspot.name

      marker.bindTooltip(tooltipContent, {
        permanent: false,
        direction: "top",
        className: "cyber-tooltip",
      })

      markersRef.current.push(marker)
    })
  }, [isLoaded, hotspots, selectedHotspot, onHotspotSelect, createMarkerIcon, L, activeCheckins])

  // Pan to selected hotspot
  useEffect(() => {
    if (selectedHotspot && mapRef.current) {
      mapRef.current.panTo([Number(selectedHotspot.latitude), Number(selectedHotspot.longitude)])
    }
  }, [selectedHotspot])

  return (
    <div className="relative w-full h-full">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />

      <div ref={mapContainerRef} className="w-full h-full" />

      {!isLoaded && (
        <div className="absolute inset-0 bg-cyber-dark flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-mono text-cyber-cyan">LOADING MAP...</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        .cyber-tooltip {
          background: #12121a !important;
          border: 1px solid #00ffff !important;
          color: #e0e0e0 !important;
          font-family: monospace !important;
          padding: 6px 10px !important;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.3) !important;
        }
        .cyber-tooltip::before {
          border-top-color: #00ffff !important;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  )
}
