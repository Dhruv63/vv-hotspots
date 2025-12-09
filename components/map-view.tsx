"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Locate, Loader2, X, Compass } from "lucide-react"
import type { Hotspot } from "@/lib/types"
import { useTheme } from "next-themes"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"

interface MapViewProps {
  hotspots: Hotspot[]
  selectedHotspot: Hotspot | null
  onHotspotSelect: (hotspot: Hotspot) => void
  activeCheckins: Record<string, number>
  userCurrentCheckin?: string | null
  onCheckIn?: (hotspot: Hotspot) => void
  isLoading?: boolean
  onLocationUpdate?: (location: [number, number]) => void
}

// Vasai-Virar center coordinates
const VASAI_VIRAR_CENTER: [number, number] = [19.42, 72.82]
const DEFAULT_ZOOM = 13

// Map tile providers
const TILE_LAYERS = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
}

export const THEME_COLORS = {
  dark: {
    cafe: { main: "#00FFFF", glow: "rgba(0, 255, 255, 0.8)", name: "Cafe" },
    park: { main: "#39FF14", glow: "rgba(57, 255, 20, 0.8)", name: "Park" },
    gaming: { main: "#BF00FF", glow: "rgba(191, 0, 255, 0.8)", name: "Gaming" },
    food: { main: "#FF6600", glow: "rgba(255, 102, 0, 0.8)", name: "Food" },
    hangout: { main: "#FF1493", glow: "rgba(255, 20, 147, 0.8)", name: "Hangout" },
    other: { main: "#FFFF00", glow: "rgba(255, 255, 0, 0.8)", name: "Other" },
    highlight: "#FFFF00", // For checked in / selected
    highlightGlow: "#FFFF00",
    userLocation: "#CCFF00",
    popupBg: "#12121a",
    popupText: "#e0e0e0"
  },
  light: {
    cafe: { main: "#8B4513", glow: "rgba(139, 69, 19, 0.8)", name: "Cafe" },
    park: { main: "#228B22", glow: "rgba(34, 139, 34, 0.8)", name: "Park" },
    gaming: { main: "#6A0DAD", glow: "rgba(106, 13, 173, 0.8)", name: "Gaming" },
    food: { main: "#FF4500", glow: "rgba(255, 69, 0, 0.8)", name: "Food" },
    hangout: { main: "#FF1493", glow: "rgba(255, 20, 147, 0.8)", name: "Hangout" },
    other: { main: "#708090", glow: "rgba(112, 128, 144, 0.8)", name: "Other" },
    highlight: "#FF1493", // Hot Pink
    highlightGlow: "#FF1493",
    userLocation: "#FF1493",
    popupBg: "#FFFFFF",
    popupText: "#2A2A2A"
  }
}

export function MapView({
  hotspots,
  selectedHotspot,
  onHotspotSelect,
  activeCheckins,
  userCurrentCheckin,
  onCheckIn,
  isLoading,
  onLocationUpdate,
}: MapViewProps) {
  const { resolvedTheme } = useTheme()
  const theme = (resolvedTheme === "light" ? "light" : "dark") as keyof typeof THEME_COLORS
  const colors = THEME_COLORS[theme]

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const clusterGroupRef = useRef<any>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const userMarkerRef = useRef<L.Marker | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [L, setL] = useState<typeof import("leaflet") | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [openPopupId, setOpenPopupId] = useState<string | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  const hotspotsRef = useRef(hotspots)
  const onCheckInRef = useRef(onCheckIn)
  const userCurrentCheckinRef = useRef(userCurrentCheckin)

  useEffect(() => {
    hotspotsRef.current = hotspots
    onCheckInRef.current = onCheckIn
    userCurrentCheckinRef.current = userCurrentCheckin
  }, [hotspots, onCheckIn, userCurrentCheckin])

  // Update tile layer when theme changes
  useEffect(() => {
    if (mapRef.current && tileLayerRef.current) {
      const tileConfig = TILE_LAYERS[theme]
      tileLayerRef.current.setUrl(tileConfig.url)
    }
  }, [theme])

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

  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const leafletModule = await import("leaflet")
        const leaflet = leafletModule.default || leafletModule
        // @ts-ignore
        if (typeof window !== "undefined") window.L = leaflet
        await import("leaflet.markercluster")

        delete (leaflet.Icon.Default.prototype as any)._getIconUrl
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })
        setL(leaflet)
        setMapError(null)
      } catch (error) {
        console.error("Failed to load map library:", error)
        setMapError("Failed to load map. Please refresh the page.")
      }
    }
    loadLeaflet()
  }, [])

  const createMarkerIcon = useCallback(
    (hotspot: Hotspot, isSelected: boolean) => {
      if (!L) return null

      // Need to capture current colors inside useCallback or use ref, but useCallback depends on theme/colors
      // We are in render scope, so colors is current.
      // But dependencies must include colors.

      const colorInfo = (colors as any)[hotspot.category] || (colors as any).other
      const activeCount = activeCheckins[hotspot.id] || 0
      const isCheckedInHere = userCurrentCheckin === hotspot.id
      const hasActiveUsers = activeCount > 0

      const size = isSelected ? 44 : 32
      const glowIntensity = isSelected ? 20 : hasActiveUsers ? 12 : 6

      const mainColor = isCheckedInHere ? colors.highlight : colorInfo.main
      const glowColor = isCheckedInHere ? colors.highlightGlow : colorInfo.main

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
          background: ${mainColor}25;
          border: 3px solid ${mainColor};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 ${glowIntensity}px ${mainColor};
          ${hasActiveUsers || isCheckedInHere ? `animation: markerPulse 2s infinite;` : ""}
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: ${mainColor};
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
            background: ${mainColor};
            border: 2px solid ${theme === 'dark' ? '#000000' : '#FFFFFF'};
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            color: ${theme === 'dark' ? '#000000' : '#FFFFFF'};
            padding: 0 4px;
            font-family: monospace;
            box-shadow: 0 0 8px ${mainColor};
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
    [L, activeCheckins, userCurrentCheckin, colors, theme],
  )

  const createUserLocationIcon = useCallback(() => {
    if (!L) return null

    const html = `
      <div style="
        width: 20px;
        height: 20px;
        background: ${colors.userLocation};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 15px ${colors.userLocation};
        animation: userPulse 2s infinite;
      "></div>
    `

    return L.divIcon({
      html,
      className: "user-location-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
  }, [L, colors])

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      if (mapRef.current) {
        mapRef.current.setView(VASAI_VIRAR_CENTER, DEFAULT_ZOOM, { animate: true })
      }
      return
    }

    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation([latitude, longitude])
        if (onLocationUpdate) {
          onLocationUpdate([latitude, longitude])
        }

        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 15, { animate: true })
        }

        setIsLocating(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        if (mapRef.current) {
          mapRef.current.setView(VASAI_VIRAR_CENTER, DEFAULT_ZOOM, { animate: true })
        }
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }, [])

  useEffect(() => {
    if (!L || !mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: VASAI_VIRAR_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    })

    L.control.zoom({ position: "topright" }).addTo(map)

    const tileConfig = TILE_LAYERS[theme]

    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
    }).addTo(map)

    tileLayerRef.current = tileLayer

    // Initialize Cluster Group or Fallback
    let clusterGroup: L.MarkerClusterGroup | L.FeatureGroup
    try {
      if ((L as any).markerClusterGroup) {
        clusterGroup = (L as any).markerClusterGroup({
          maxClusterRadius: 50,
          showCoverageOnHover: false,
          iconCreateFunction: (cluster: any) => {
            const childCount = cluster.getChildCount()
            return L.divIcon({
              html: `<div class="cyber-cluster"><span>${childCount}</span></div>`,
              className: "custom-cluster-icon",
              iconSize: L.point(40, 40),
            })
          },
        })

          clusterGroup.on('clustermouseover', (a: any) => {
              if (!a.layer.getTooltip()) {
                  const childCount = a.layer.getChildCount();
                  a.layer.bindTooltip(`${childCount} hotspots in this area<br>Click to zoom in`, {
                     className: 'cyber-tooltip',
                     direction: 'top',
                     opacity: 1
                  });
              }
              a.layer.openTooltip();
          });
      } else {
        console.warn("MarkerClusterGroup not found, falling back to FeatureGroup")
        clusterGroup = L.featureGroup()
      }
    } catch (e) {
      console.error("Error initializing MarkerClusterGroup:", e)
      clusterGroup = L.featureGroup()
    }

    map.addLayer(clusterGroup)
    clusterGroupRef.current = clusterGroup

    map.on("popupclose", () => {
      setOpenPopupId(null)
    })

    mapRef.current = map
    setIsLoaded(true)

    return () => {
      map.remove()
      mapRef.current = null
      tileLayerRef.current = null
      clusterGroupRef.current = null
    }
  }, [L]) // Removed theme dependency here to prevent map re-initialization

  // Update user marker when location or theme changes
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
      const colorInfo = (colors as any)[hotspot.category] || (colors as any).other

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
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: ${colors.popupText};">
          ${hotspot.name}
        </div>
        <div style="font-size: 11px; color: ${theme === 'dark' ? '#888' : '#666'}; margin-bottom: 12px;">
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
            background: ${colors.highlight}20;
            border: 2px solid ${colors.highlight};
            color: ${colors.highlight};
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
              color: ${theme === 'dark' ? '#000000' : '#FFFFFF'};
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
    [activeCheckins, userCurrentCheckin, colors, theme],
  )

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !L) return

    // Re-create markers when dependencies (like theme/colors) change
    const currentMarkerIds = new Set(markersRef.current.keys())
    const newHotspotIds = new Set(hotspots.map((h) => h.id))

    // Remove old markers
    currentMarkerIds.forEach((id) => {
      if (!newHotspotIds.has(id)) {
        const marker = markersRef.current.get(id)
        if (marker) {
          clusterGroupRef.current?.removeLayer(marker)
          markersRef.current.delete(id)
        }
      }
    })

    // Update or add markers
    hotspots.forEach((hotspot) => {
      const isSelected = selectedHotspot?.id === hotspot.id
      let marker = markersRef.current.get(hotspot.id)

      const icon = createMarkerIcon(hotspot, isSelected)
      const popupContent = createPopupContent(hotspot)

      if (marker) {
        if (icon) marker.setIcon(icon)
        marker.setPopupContent(popupContent)
      } else {
        if (!icon) return

        marker = L.marker([Number(hotspot.latitude), Number(hotspot.longitude)], {
          icon,
          title: hotspot.name,
        })
          .on("click", () => {
            if (openPopupId !== hotspot.id) {
              setOpenPopupId(hotspot.id)
              onHotspotSelect(hotspot)
            }
          })

        marker.bindPopup(popupContent, {
          className: "cyber-popup",
          closeButton: true,
          maxWidth: 220,
          minWidth: 200,
          autoPan: true,
          autoPanPaddingTopLeft: [100, 100],
          autoPanPaddingBottomRight: [100, 100],
          keepInView: true,
        })

        clusterGroupRef.current?.addLayer(marker)
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
    openPopupId, // Re-run when popup state changes? Not strictly needed for icon update but harmless.
    theme // Ensure re-run on theme change
  ])

  useEffect(() => {
    if (selectedHotspot && mapRef.current) {
      mapRef.current.setView([Number(selectedHotspot.latitude), Number(selectedHotspot.longitude)], 15, {
        animate: true,
      })

      const marker = markersRef.current.get(selectedHotspot.id)
      if (marker) {
        if (clusterGroupRef.current) {
             clusterGroupRef.current.zoomToShowLayer(marker, () => {
                 setTimeout(() => {
                    marker.openPopup()
                    setOpenPopupId(selectedHotspot.id)
                 }, 300)
             });
        } else {
             setTimeout(() => {
                marker.openPopup()
                setOpenPopupId(selectedHotspot.id)
              }, 300)
        }
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
        .cyber-popup {
          z-index: 1000 !important;
        }
        .cyber-popup .leaflet-popup-content-wrapper {
          background: var(--color-cyber-navy) !important;
          border: 2px solid var(--color-cyber-primary) !important;
          border-radius: 8px;
          box-shadow: 0 0 20px var(--color-cyber-primary) !important;
          padding: 0;
          overflow: visible;
        }
        .cyber-popup .leaflet-popup-content {
          margin: 0;
          color: var(--color-cyber-gray);
        }
        .cyber-popup .leaflet-popup-tip-container {
          overflow: visible;
        }
        .cyber-popup .leaflet-popup-tip {
          background: var(--color-cyber-navy) !important;
          border: 2px solid var(--color-cyber-primary) !important;
          border-top: none;
          border-left: none;
        }
        .cyber-popup .leaflet-popup-close-button {
          color: var(--color-cyber-primary) !important;
          font-size: 20px;
          width: 24px;
          height: 24px;
          right: 4px !important;
          top: 4px !important;
        }
        .cyber-popup .leaflet-popup-close-button:hover {
          color: var(--color-cyber-secondary) !important;
        }
        .leaflet-control-zoom {
          border: 2px solid var(--color-cyber-primary) !important;
          border-radius: 6px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          background: var(--color-cyber-navy) !important;
          color: var(--color-cyber-primary) !important;
          border-color: var(--color-cyber-gray) !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover {
          background: var(--color-cyber-primary) !important;
          color: var(--color-cyber-black) !important;
        }
        .popup-checkin-btn:hover {
          opacity: 0.9;
        }
        .popup-checkin-btn:active {
          transform: scale(0.98);
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .map-skeleton {
          background: linear-gradient(90deg, var(--color-cyber-dark) 25%, var(--color-cyber-navy) 50%, var(--color-cyber-dark) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .cyber-cluster {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 0, 0.2);
          border: 2px solid #FFFF00;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #FFFF00;
          box-shadow: 0 0 15px #FFFF00;
          font-family: monospace;
        }
        :global(.light) .cyber-cluster {
           background: rgba(255, 20, 147, 0.2);
           border-color: #FF1493;
           color: #FF1493;
           box-shadow: 0 0 15px #FF1493;
        }
        .custom-cluster-icon {
          background: transparent !important;
          border: none !important;
        }
        .marker-wrapper {
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .marker-wrapper:hover {
            transform: scale(1.1) translateY(-5px);
            z-index: 1000;
        }
        .cyber-tooltip {
          background: var(--color-cyber-navy) !important;
          border: 1px solid var(--color-cyber-primary) !important;
          color: var(--color-cyber-primary) !important;
          font-family: monospace;
          font-size: 10px;
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        .cyber-tooltip::before {
            border-top-color: var(--color-cyber-primary) !important;
        }
      `}</style>

      <div ref={mapContainerRef} className="w-full h-full bg-cyber-black" />

      <div className="hidden md:block absolute bottom-8 left-4 z-[1000] bg-cyber-black/90 border-2 border-cyber-primary rounded-lg p-3 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
        <div className="text-xs font-mono text-cyber-primary mb-2 uppercase tracking-wider font-bold">Legend</div>
        <div className="space-y-1.5">
          {Object.entries(colors).filter(([key]) => !['highlight', 'highlightGlow', 'userLocation', 'popupBg', 'popupText'].includes(key)).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: (value as any).main, boxShadow: `0 0 6px ${(value as any).main}` }}
              />
              <span className="text-xs font-mono text-cyber-gray capitalize">{(value as any).name}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2 border-t border-cyber-gray/30 mt-1">
             <div className="w-3 h-3 rounded-full bg-[#FFFF00]/20 border border-[#FFFF00]" />
             <span className="text-xs font-mono text-cyber-gray">Cluster</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleGetLocation}
        disabled={isLocating}
        className="absolute bottom-8 right-4 z-[1000] w-12 h-12 bg-cyber-navy border-2 border-cyber-primary rounded-full flex items-center justify-center transition-all hover:bg-cyber-primary/20 hover:shadow-[0_0_15px_rgba(0,0,0,0.5)] disabled:opacity-50 min-w-[48px] min-h-[48px]"
        title="Find my location"
      >
        {isLocating ? (
          <Loader2 className="w-5 h-5 text-cyber-primary animate-spin" />
        ) : (
          <Compass className="w-5 h-5 text-cyber-primary" />
        )}
      </button>

      {!isLoaded && !mapError && (
        <div className="absolute inset-0 z-[60] flex flex-col">
          <div className="flex-1 map-skeleton" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-cyber-navy/80 p-6 rounded-lg border border-cyber-cyan/30">
              <Loader2 className="w-10 h-10 text-cyber-cyan animate-spin mx-auto mb-3" />
              <p className="text-cyber-cyan font-mono text-sm">LOADING MAP...</p>
              <p className="text-cyber-gray font-mono text-xs mt-1">Preparing hotspots</p>
            </div>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-cyber-black">
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-cyber-pink/20 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-cyber-pink" />
            </div>
            <p className="text-cyber-pink font-mono text-lg mb-2">Map Failed to Load</p>
            <p className="text-cyber-gray font-mono text-sm mb-4">{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cyber-cyan text-cyber-black font-mono font-bold rounded-lg hover:bg-cyber-cyan/80 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}

      {isLoading && isLoaded && (
        <div className="absolute inset-0 z-[55] bg-cyber-black/50 flex items-center justify-center pointer-events-none">
          <div className="bg-cyber-navy border border-cyber-cyan rounded-lg p-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-cyber-cyan animate-spin" />
            <span className="text-cyber-cyan font-mono text-sm">Processing...</span>
          </div>
        </div>
      )}
    </div>
  )
}
