"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Hotspot } from "@/lib/types"

interface MapViewProps {
  hotspots: Hotspot[]
  selectedHotspot: Hotspot | null
  onHotspotSelect: (hotspot: Hotspot) => void
  activeCheckins: Record<string, number>
  userCurrentCheckin?: string | null
  onCheckIn?: (hotspot: Hotspot) => void
  isLoading?: boolean
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

export function MapView({
  hotspots,
  selectedHotspot,
  onHotspotSelect,
  activeCheckins,
  userCurrentCheckin,
  onCheckIn,
  isLoading,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [L, setL] = useState<typeof import("leaflet") | null>(null)

  const hotspotsRef = useRef(hotspots)
  const onCheckInRef = useRef(onCheckIn)
  const userCurrentCheckinRef = useRef(userCurrentCheckin)

  useEffect(() => {
    hotspotsRef.current = hotspots
    onCheckInRef.current = onCheckIn
    userCurrentCheckinRef.current = userCurrentCheckin
  }, [hotspots, onCheckIn, userCurrentCheckin])

  useEffect(() => {
    const handlePopupClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains("popup-checkin-btn")) {
        const hotspotId = target.getAttribute("data-hotspot-id")
        if (hotspotId && onCheckInRef.current) {
          const hotspot = hotspotsRef.current.find((h) => h.id === hotspotId)
          if (hotspot) {
            console.log("[v0] Map popup check-in clicked for:", hotspot.name)
            onCheckInRef.current(hotspot)
          }
        }
      }
    }

    document.addEventListener("click", handlePopupClick)
    return () => document.removeEventListener("click", handlePopupClick)
  }, [])

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
      const isCheckedInHere = userCurrentCheckin === hotspot.id
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
          background: ${isCheckedInHere ? "#00ffff" : color}30;
          border: 3px solid ${isCheckedInHere ? "#00ffff" : color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 ${isSelected ? "20px" : hasActiveUsers ? "15px" : "8px"} ${isCheckedInHere ? "#00ffff" : color}${hasActiveUsers ? "" : "80"};
          transition: all 0.3s ease;
          ${hasActiveUsers || isCheckedInHere ? `animation: pulse 2s infinite;` : ""}
        ">
          <div style="
            width: 14px;
            height: 14px;
            background: ${isCheckedInHere ? "#00ffff" : color};
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
        ${
          isCheckedInHere
            ? `
          <div style="
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
            font-size: 9px;
            font-weight: bold;
            color: #00ffff;
            font-family: monospace;
            text-shadow: 0 0 5px #00ffff;
          ">YOU'RE HERE</div>
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
    [L, activeCheckins, userCurrentCheckin],
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
      const isCheckedInHere = userCurrentCheckin === hotspot.id
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

      const popupContent = `
        <div style="
          font-family: monospace;
          min-width: 180px;
          padding: 8px;
        ">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #e0e0e0;">
            ${hotspot.name}
          </div>
          <div style="font-size: 11px; color: #888; margin-bottom: 8px; text-transform: uppercase;">
            ${hotspot.category}
          </div>
          ${
            activeCount > 0
              ? `
            <div style="color: #00ffff; font-size: 12px; margin-bottom: 8px;">
              ⚡ ${activeCount} ${activeCount === 1 ? "person" : "people"} here now
            </div>
          `
              : ""
          }
          ${
            isCheckedInHere
              ? `
            <div style="
              background: #00ffff20;
              border: 1px solid #00ffff;
              color: #00ffff;
              padding: 8px;
              text-align: center;
              font-weight: bold;
              font-size: 12px;
              border-radius: 4px;
            ">
              ✓ YOU ARE HERE
            </div>
          `
              : `
            <button 
              class="popup-checkin-btn"
              data-hotspot-id="${hotspot.id}"
              style="
                width: 100%;
                background: #00ffff;
                color: #0a0a0f;
                border: none;
                padding: 10px;
                font-family: monospace;
                font-weight: bold;
                font-size: 12px;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.2s;
              "
              onmouseover="this.style.boxShadow='0 0 15px #00ffff'"
              onmouseout="this.style.boxShadow='none'"
            >
              ⚡ CHECK IN HERE
            </button>
          `
          }
        </div>
      `

      marker.bindPopup(popupContent, {
        className: "cyber-popup",
        closeButton: true,
      })

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
  }, [isLoaded, hotspots, selectedHotspot, onHotspotSelect, createMarkerIcon, L, activeCheckins, userCurrentCheckin])

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
        .cyber-popup .leaflet-popup-content-wrapper {
          background: #12121a !important;
          border: 1px solid #00ffff !important;
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.3) !important;
          border-radius: 4px !important;
        }
        .cyber-popup .leaflet-popup-tip {
          background: #12121a !important;
          border: 1px solid #00ffff !important;
        }
        .cyber-popup .leaflet-popup-close-button {
          color: #00ffff !important;
        }
        .cyber-popup .leaflet-popup-close-button:hover {
          color: #ff006e !important;
        }
      `}</style>
    </div>
  )
}
