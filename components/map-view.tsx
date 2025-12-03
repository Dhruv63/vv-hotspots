"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Locate } from "lucide-react"
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
const DEFAULT_ZOOM = 13

const categoryColors: Record<string, { main: string; glow: string; name: string }> = {
  cafe: { main: "#00ffff", glow: "rgba(0, 255, 255, 0.6)", name: "Cafe" },
  park: { main: "#22ff22", glow: "rgba(34, 255, 34, 0.6)", name: "Park" },
  gaming: { main: "#b700ff", glow: "rgba(183, 0, 255, 0.6)", name: "Gaming" },
  food: { main: "#ff006e", glow: "rgba(255, 0, 110, 0.6)", name: "Food" },
  hangout: { main: "#ffff00", glow: "rgba(255, 255, 0, 0.6)", name: "Hangout" },
  other: { main: "#888888", glow: "rgba(136, 136, 136, 0.6)", name: "Other" },
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
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const userMarkerRef = useRef<L.Marker | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [L, setL] = useState<typeof import("leaflet") | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [openPopupId, setOpenPopupId] = useState<string | null>(null)

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
        e.preventDefault()
        e.stopPropagation()

        const hotspotId = target.getAttribute("data-hotspot-id")
        if (hotspotId && onCheckInRef.current) {
          const hotspot = hotspotsRef.current.find((h) => h.id === hotspotId)
          if (hotspot) {
            onCheckInRef.current(hotspot)
          }
        }
      }
    }

    document.addEventListener("click", handlePopupClick, true)
    return () => document.removeEventListener("click", handlePopupClick, true)
  }, [])

  // Load Leaflet dynamically
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

      const colorInfo = categoryColors[hotspot.category] || categoryColors.other
      const activeCount = activeCheckins[hotspot.id] || 0
      const isCheckedInHere = userCurrentCheckin === hotspot.id
      const hasActiveUsers = activeCount > 0

      const size = isSelected ? 44 : 32
      const glowIntensity = isSelected ? 20 : hasActiveUsers ? 12 : 6

      const html = `
      <div class="marker-wrapper" style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        cursor: pointer;
      ">
        <div style="
          width: 100%;
          height: 100%;
          background: ${isCheckedInHere ? "#00ffff" : colorInfo.main}25;
          border: 3px solid ${isCheckedInHere ? "#00ffff" : colorInfo.main};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 ${glowIntensity}px ${isCheckedInHere ? "#00ffff" : colorInfo.main};
          ${hasActiveUsers || isCheckedInHere ? `animation: markerPulse 2s infinite;` : ""}
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: ${isCheckedInHere ? "#00ffff" : colorInfo.main};
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
            min-width: 18px;
            height: 18px;
            background: ${colorInfo.main};
            border: 2px solid #0a0a0f;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            color: #0a0a0f;
            padding: 0 4px;
            font-family: monospace;
            box-shadow: 0 0 8px ${colorInfo.main};
          ">${activeCount}</div>
        `
            : ""
        }
      </div>
    `

      return L.divIcon({
        html,
        className: "custom-marker",
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size + 5],
      })
    },
    [L, activeCheckins, userCurrentCheckin],
  )

  const createUserLocationIcon = useCallback(() => {
    if (!L) return null

    const html = `
      <div style="
        width: 20px;
        height: 20px;
        background: #4285f4;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 15px #4285f4;
        animation: userPulse 2s infinite;
      "></div>
    `

    return L.divIcon({
      html,
      className: "user-location-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
  }, [L])

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation([latitude, longitude])

        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 15, { animate: true })
        }

        setIsLocating(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Unable to get your location")
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }, [])

  // Initialize map
  useEffect(() => {
    if (!L || !mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: VASAI_VIRAR_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    })

    L.control.zoom({ position: "topright" }).addTo(map)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    map.on("popupclose", () => {
      setOpenPopupId(null)
    })

    mapRef.current = map
    setIsLoaded(true)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [L])

  // Add user location marker
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !L || !userLocation) return

    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
    }

    const icon = createUserLocationIcon()
    if (icon) {
      const marker = L.marker(userLocation, { icon, zIndexOffset: 1000 }).addTo(mapRef.current)
      userMarkerRef.current = marker
    }
  }, [isLoaded, L, userLocation, createUserLocationIcon])

  const createPopupContent = useCallback(
    (hotspot: Hotspot) => {
      const activeCount = activeCheckins[hotspot.id] || 0
      const isCheckedInHere = userCurrentCheckin === hotspot.id
      const colorInfo = categoryColors[hotspot.category] || categoryColors.other

      return `
      <div style="
        font-family: monospace;
        width: 200px;
        padding: 12px;
      ">
        <div style="
          font-size: 10px;
          color: ${colorInfo.main};
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        ">${colorInfo.name}</div>
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #fff;">
          ${hotspot.name}
        </div>
        <div style="font-size: 11px; color: #888; margin-bottom: 12px;">
          ${hotspot.address || "Vasai-Virar"}
        </div>
        ${
          activeCount > 0
            ? `<div style="color: ${colorInfo.main}; font-size: 12px; margin-bottom: 12px;">
            <strong>${activeCount}</strong> here now
          </div>`
            : ""
        }
        ${
          isCheckedInHere
            ? `<div style="
            background: #00ffff20;
            border: 2px solid #00ffff;
            color: #00ffff;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            font-size: 11px;
            border-radius: 6px;
          ">YOU ARE CHECKED IN</div>`
            : `<button 
            class="popup-checkin-btn"
            data-hotspot-id="${hotspot.id}"
            type="button"
            style="
              width: 100%;
              background: ${colorInfo.main};
              color: #0a0a0f;
              border: none;
              padding: 10px;
              font-family: monospace;
              font-weight: bold;
              font-size: 11px;
              cursor: pointer;
              border-radius: 6px;
            "
          >CHECK IN HERE</button>`
        }
      </div>
    `
    },
    [activeCheckins, userCurrentCheckin],
  )

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !L) return

    const currentMarkerIds = new Set(markersRef.current.keys())
    const newHotspotIds = new Set(hotspots.map((h) => h.id))

    currentMarkerIds.forEach((id) => {
      if (!newHotspotIds.has(id)) {
        const marker = markersRef.current.get(id)
        if (marker) {
          marker.remove()
          markersRef.current.delete(id)
        }
      }
    })

    hotspots.forEach((hotspot) => {
      const isSelected = selectedHotspot?.id === hotspot.id
      const existingMarker = markersRef.current.get(hotspot.id)

      if (existingMarker) {
        const icon = createMarkerIcon(hotspot, isSelected)
        if (icon) {
          existingMarker.setIcon(icon)
        }
        existingMarker.setPopupContent(createPopupContent(hotspot))
      } else {
        const icon = createMarkerIcon(hotspot, isSelected)
        if (!icon) return

        const marker = L.marker([Number(hotspot.latitude), Number(hotspot.longitude)], {
          icon,
          title: hotspot.name,
        })
          .addTo(mapRef.current!)
          .on("click", () => {
            if (openPopupId !== hotspot.id) {
              setOpenPopupId(hotspot.id)
              onHotspotSelect(hotspot)
            }
          })

        marker.bindPopup(createPopupContent(hotspot), {
          className: "cyber-popup",
          closeButton: true,
          maxWidth: 220,
          minWidth: 200,
          autoPan: true,
          autoPanPaddingTopLeft: [100, 100],
          autoPanPaddingBottomRight: [100, 100],
          keepInView: true,
        })

        markersRef.current.set(hotspot.id, marker)
      }
    })
  }, [
    isLoaded,
    hotspots,
    selectedHotspot,
    onHotspotSelect,
    createMarkerIcon,
    createPopupContent,
    L,
    activeCheckins,
    userCurrentCheckin,
    openPopupId,
  ])

  useEffect(() => {
    if (selectedHotspot && mapRef.current) {
      mapRef.current.setView([Number(selectedHotspot.latitude), Number(selectedHotspot.longitude)], 15, {
        animate: true,
      })

      const marker = markersRef.current.get(selectedHotspot.id)
      if (marker) {
        setTimeout(() => {
          marker.openPopup()
          setOpenPopupId(selectedHotspot.id)
        }, 300)
      }
    }
  }, [selectedHotspot])

  return (
    <div className="relative w-full h-full">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />

      <style jsx global>{`
        @keyframes markerPulse {
          0%, 100% { transform: rotate(-45deg) scale(1); }
          50% { transform: rotate(-45deg) scale(1.05); }
        }
        @keyframes userPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .user-location-marker {
          background: transparent !important;
          border: none !important;
        }
        /* Fixed popup styling to prevent clipping */
        .cyber-popup {
          z-index: 1000 !important;
        }
        .cyber-popup .leaflet-popup-content-wrapper {
          background: #12121a;
          border: 2px solid #00ffff;
          border-radius: 8px;
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
          padding: 0;
          overflow: visible;
        }
        .cyber-popup .leaflet-popup-content {
          margin: 0;
          color: #e0e0e0;
        }
        .cyber-popup .leaflet-popup-tip-container {
          overflow: visible;
        }
        .cyber-popup .leaflet-popup-tip {
          background: #12121a;
          border: 2px solid #00ffff;
          border-top: none;
          border-left: none;
        }
        .cyber-popup .leaflet-popup-close-button {
          color: #00ffff !important;
          font-size: 20px;
          width: 24px;
          height: 24px;
          right: 4px !important;
          top: 4px !important;
        }
        .cyber-popup .leaflet-popup-close-button:hover {
          color: #fff !important;
        }
        .leaflet-control-zoom {
          border: 2px solid #00ffff !important;
          border-radius: 6px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          background: #12121a !important;
          color: #00ffff !important;
          border-color: #00ffff !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #00ffff20 !important;
        }
        .popup-checkin-btn:hover {
          opacity: 0.9;
        }
        .popup-checkin-btn:active {
          transform: scale(0.98);
        }
      `}</style>

      <div ref={mapContainerRef} className="w-full h-full" style={{ background: "#0a0a0f" }} />

      {/* Category Legend */}
      <div className="absolute top-4 left-4 z-[50] bg-[#12121a]/95 border-2 border-cyan-500/50 rounded-lg p-3 hidden md:block">
        <div className="text-xs font-mono text-cyan-400 mb-2 uppercase tracking-wider font-bold">Categories</div>
        <div className="space-y-1.5">
          {Object.entries(categoryColors).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: value.main, boxShadow: `0 0 6px ${value.main}` }}
              />
              <span className="text-xs font-mono text-gray-300 capitalize">{value.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Locate Me Button */}
      <button
        onClick={handleGetLocation}
        disabled={isLocating}
        className="absolute bottom-20 right-4 z-[50] w-12 h-12 bg-[#12121a] border-2 border-cyan-400 rounded-full flex items-center justify-center transition-all hover:bg-cyan-400/20 disabled:opacity-50"
        title="Find my location"
      >
        {isLocating ? (
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Locate className="w-5 h-5 text-cyan-400" />
        )}
      </button>

      {/* Loading Overlay */}
      {(!isLoaded || isLoading) && (
        <div className="absolute inset-0 bg-[#0a0a0f]/90 flex items-center justify-center z-[60]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-cyan-400 font-mono text-sm">LOADING MAP...</p>
          </div>
        </div>
      )}
    </div>
  )
}
