"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, Tooltip, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import type { Hotspot } from "@/lib/types"
import { useTheme } from "@/components/theme-provider"
import { themes } from "@/lib/themes"
import { CATEGORY_COLOR } from "@/lib/constants"
import { Search, Navigation, Layers, Info, MapPin, LocateFixed } from "lucide-react"
import { HotspotCard } from "@/components/hotspot-card"
import MarkerClusterGroup from "@/components/ui/marker-cluster"
import { CategoryBadge } from "@/components/ui/category-badge"
import { CustomMarker } from "@/components/custom-marker"

// Fix for default marker icons in Next.js
// @ts-ignore
if (typeof window !== "undefined") {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/marker-icon-2x.png",
      iconUrl: "/marker-icon.png",
      shadowUrl: "/marker-shadow.png",
    })
}

const isValidLatLng = (lat: any, lng: any): boolean => {
  const latitude = Number(lat)
  const longitude = Number(lng)
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  )
}

interface MapViewProps {
  hotspots: Hotspot[]
  selectedHotspot: Hotspot | null
  onHotspotSelect: (hotspot: Hotspot) => void
  activeCheckins: Record<string, number>
  userCurrentCheckin?: string | null
  onCheckIn?: (hotspot: Hotspot) => void
  isLoading?: boolean
  onLocationUpdate?: (location: [number, number]) => void
  viewMode?: string
  onSearchClick?: () => void
  isVisible?: boolean
}

// Component to handle map events and track user interaction
function MapEventHandler({ onUserInteract }: { onUserInteract: () => void }) {
  useMapEvents({
    dragstart: () => {
      onUserInteract()
    },
    touchstart: () => {
      onUserInteract()
    }
  })
  return null
}

function RecenterControl({ onRecenter }: { onRecenter: () => void }) {
    return (
        <button
            onClick={(e) => {
              e.stopPropagation();
              onRecenter();
            }}
            className="leaflet-bar leaflet-control leaflet-control-custom p-2 bg-background border-2 border-muted-foreground/30 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center hover:shadow-xl hover:border-primary/50 text-muted-foreground hover:text-primary z-[400]"
            style={{
                position: 'absolute',
                bottom: '80px', // Raised above bottom nav
                right: '16px',
                width: '44px',
                height: '44px'
            }}
            aria-label="Recenter to my location"
        >
            <LocateFixed className="w-5 h-5" />
        </button>
    )
}

function SearchTrigger({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="md:hidden leaflet-bar leaflet-control leaflet-control-custom p-2 bg-background/90 backdrop-blur border-2 border-primary/20 rounded-full shadow-lg flex items-center gap-2 px-4"
            style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                zIndex: 400,
                height: '44px'
            }}
        >
            <Search className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Search hotspots...</span>
        </button>
    )
}

function LegendControl({ isOpen, onToggle }: { isOpen: boolean, onToggle: () => void }) {
    return (
        <>
            <button
                onClick={onToggle}
                className={`leaflet-bar leaflet-control leaflet-control-custom p-2 bg-background border-2 border-muted-foreground/30 rounded-lg shadow-lg transition-all active:scale-95 flex items-center justify-center`}
                style={{
                    position: 'absolute',
                    bottom: '132px', // Above Recenter
                    right: '16px',
                    zIndex: 400,
                    width: '44px',
                    height: '44px'
                }}
                aria-label="Toggle Legend"
            >
                <Layers className="w-5 h-5 text-muted-foreground" />
            </button>

            {isOpen && (
                 <div
                    className="leaflet-bar leaflet-control leaflet-control-custom p-3 bg-background/95 backdrop-blur border border-border rounded-lg shadow-xl"
                    style={{
                        position: 'absolute',
                        bottom: '132px',
                        right: '70px',
                        zIndex: 400,
                        width: '160px'
                    }}
                 >
                    <p className="text-xs font-bold font-mono mb-2 text-muted-foreground uppercase">Categories</p>
                    <div className="space-y-1.5">
                        {Object.entries(CATEGORY_COLOR).map(([key, color]) => (
                            <div key={key} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                                <span className="text-xs font-medium capitalize">{key}</span>
                            </div>
                        ))}
                    </div>
                 </div>
            )}
        </>
    )
}

const MAP_TILES = {
  cyberpunk: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    filter: 'none'
  },
  genshin: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    filter: 'none'
  },
  lofi: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    filter: 'none'
  },
  rdr2: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    filter: 'none'
  }
};

const DEFAULT_CENTER: [number, number] = [19.3919, 72.8397] // Vasai-Virar
const DEFAULT_ZOOM = 13

export function MapView({
  hotspots,
  selectedHotspot,
  onHotspotSelect,
  activeCheckins,
  userCurrentCheckin,
  onCheckIn,
  isLoading,
  onLocationUpdate,
  viewMode,
  onSearchClick,
  isVisible = true
}: MapViewProps) {
  const { theme } = useTheme()
  const mapRef = useRef<L.Map | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  // State to track if we have initially centered the map on user location
  const [hasInitiallyCentered, setHasInitiallyCentered] = useState(false)
  // State to track if user has manually interacted with map
  const [userHasPanned, setUserHasPanned] = useState(false)

  const [previewHotspot, setPreviewHotspot] = useState<Hotspot | null>(null)
  const [showLegend, setShowLegend] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Generate a unique ID for the container on mount to avoid reuse errors
  const containerId = useRef(`map-container-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`)

  // Handle cleanup
  useEffect(() => {
    return () => {
      // Force aggressive cleanup
      if (mapRef.current) {
        try {
            const map = mapRef.current;
            map.off();
            map.remove();

            const container = map.getContainer();
            if (container) {
                // @ts-ignore
                container._leaflet_id = null;
            }
        } catch (e) {
            console.error("Map destroy failed:", e);
        }
        mapRef.current = null;
      }
    };
  }, []);

  // Stabilized mobile detection
  useEffect(() => {
    const checkMobile = () => {
        const mobile = window.innerWidth < 768
        setIsMobile(mobile)
    }

    // Initial check
    checkMobile()

    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(checkMobile, 150) // Debounce resize
    }

    window.addEventListener("resize", handleResize)
    return () => {
        window.removeEventListener("resize", handleResize)
        clearTimeout(timeoutId)
    }
  }, [])

  // Sync selectedHotspot with preview
  useEffect(() => {
    if (selectedHotspot) {
        setPreviewHotspot(selectedHotspot)
        // Center map on selected hotspot
        if (mapRef.current && isValidLatLng(selectedHotspot.latitude, selectedHotspot.longitude)) {
            const latOffset = -0.005
            mapRef.current.flyTo([Number(selectedHotspot.latitude) + latOffset, Number(selectedHotspot.longitude)], 16, { duration: 1.5 })
        }
    }
  }, [selectedHotspot])

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const newLoc: [number, number] = [latitude, longitude]
        setUserLocation(newLoc)
        if (onLocationUpdate) onLocationUpdate(newLoc)
      },
      (error) => {
        console.error("Geolocation error:", error)
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [onLocationUpdate])

  // Initial center on user location (only once)
  useEffect(() => {
    if (userLocation && !hasInitiallyCentered && !userHasPanned && mapRef.current) {
        mapRef.current.flyTo(userLocation, 15, { duration: 1.5 })
        setHasInitiallyCentered(true)
    }
  }, [userLocation, hasInitiallyCentered, userHasPanned])

  // Recenter function
  const handleRecenter = () => {
    if (userLocation && isValidLatLng(userLocation[0], userLocation[1]) && mapRef.current) {
      mapRef.current.flyTo(userLocation, 16, { duration: 1.5 })
      // We don't necessarily reset userHasPanned here,
      // because we want the user to stay in control.
      // But clicking "Recenter" is a manual action that requests seeing the location.
    } else {
      mapRef.current?.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM)
    }
  }

  // Handle Marker Click
  const handleMarkerClick = (hotspot: Hotspot) => {
      setPreviewHotspot(hotspot)
      onHotspotSelect(hotspot)
      if (mapRef.current && isValidLatLng(hotspot.latitude, hotspot.longitude)) {
          const latOffset = -0.005
          mapRef.current.flyTo([Number(hotspot.latitude) + latOffset, Number(hotspot.longitude)], 16)
      }
  }

  // Handle map resizing
  useEffect(() => {
    if (mapRef.current && isVisible) {
        setTimeout(() => {
            mapRef.current?.invalidateSize()
        }, 300)
    }
  }, [viewMode, isVisible])

  const activeTheme = (theme as keyof typeof themes) || "cyberpunk"
  const activeMapConfig = MAP_TILES[activeTheme] || MAP_TILES.cyberpunk;

  return (
    <div
        key={containerId.current}
        id={containerId.current}
        className={`relative w-full h-full bg-muted z-0 ${isMobile ? "mobile-map-view" : "desktop-map-view"}`}
        style={{ filter: activeMapConfig.filter }}
    >
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full outline-none"
        ref={mapRef}
        zoomControl={false}
        // @ts-ignore
        tap={false} // Disable tap handler for mobile (prevents some conflicts)
        touchZoom={true}
        dragging={true}
      >
        <MapEventHandler onUserInteract={() => setUserHasPanned(true)} />

        <TileLayer
          key={activeTheme}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={activeMapConfig.url}
          maxZoom={20}
        />

        <ZoomControl position="bottomright" />

        <RecenterControl onRecenter={handleRecenter} />
        <LegendControl isOpen={showLegend} onToggle={() => setShowLegend(!showLegend)} />
        <SearchTrigger onClick={() => onSearchClick?.()} />

        {userLocation && (
             <Marker
                position={userLocation}
                icon={L.divIcon({
                    className: 'user-location-marker',
                    html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg pulse-ring"></div>',
                    iconSize: [16, 16]
                })}
             />
        )}

        {typeof window !== "undefined" && (
            <MarkerClusterGroup
                showCoverageOnHover={false}
                maxClusterRadius={40}
                spiderfyOnMaxZoom={true}
                iconCreateFunction={(cluster: any) => {
                    const count = cluster.getChildCount()
                    let size = 'small'
                    if (count > 10) size = 'medium'
                    if (count > 50) size = 'large'

                    return L.divIcon({
                        html: `<div class="cyber-cluster cluster-${size}"><span>${count}</span></div>`,
                        className: 'cyber-cluster-icon',
                        iconSize: [40, 40]
                    })
                }}
            >
                {hotspots
                  .filter(h => isValidLatLng(h.latitude, h.longitude))
                  .map((hotspot) => (
                    <CustomMarker
                        key={hotspot.id}
                        hotspot={hotspot}
                        isSelected={selectedHotspot?.id === hotspot.id}
                        onClick={handleMarkerClick}
                    />
                ))}
            </MarkerClusterGroup>
        )}
      </MapContainer>

      {/* Mobile Bottom Sheet Preview */}
      {previewHotspot && (
          <div className="md:hidden fixed bottom-[70px] left-4 right-4 z-[500] animate-in slide-in-from-bottom-10 duration-300">
              <div className="rounded-xl overflow-hidden shadow-2xl border border-primary/20">
                  <HotspotCard
                      hotspot={previewHotspot}
                      activeCheckins={activeCheckins[previewHotspot.id]}
                      isSelected={false}
                      variant="compact"
                      onClick={() => {
                          // Preview click
                      }}
                  >
                     <div className="flex gap-2 mt-2">
                        <button
                             onClick={(e) => {
                                 e.stopPropagation()
                                 onCheckIn?.(previewHotspot)
                             }}
                             className="flex-1 bg-primary text-primary-foreground py-2 text-xs font-bold font-mono rounded hover:bg-primary/90"
                        >
                            CHECK IN
                        </button>
                        <button
                             onClick={(e) => {
                                 e.stopPropagation()
                                 // Logic to show details handled by parent
                                 onHotspotSelect(previewHotspot)
                             }}
                             className="flex-1 bg-secondary/20 text-secondary py-2 text-xs font-bold font-mono rounded hover:bg-secondary/30"
                        >
                            DETAILS
                        </button>
                     </div>
                  </HotspotCard>
                  <button
                      onClick={() => {
                          setPreviewHotspot(null)
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                      <XIcon className="w-4 h-4" />
                  </button>
              </div>
          </div>
      )}
    </div>
  )
}

function XIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
