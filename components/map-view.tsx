"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import type { Hotspot } from "@/lib/types"
import { useTheme } from "next-themes"
import { themes } from "@/lib/themes"
import { CATEGORY_COLOR } from "@/lib/constants"
import { Search, Navigation, Layers, Info } from "lucide-react"
import { HotspotCard } from "@/components/hotspot-card"
import MarkerClusterGroup from "@/components/ui/marker-cluster"

// Fix for default marker icons in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon-2x.png",
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
})

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

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    if (isValidLatLng(center[0], center[1])) {
      map.flyTo(center, zoom, { duration: 1.5 })
    }
  }, [center, zoom, map])
  return null
}

function RecenterControl({ onRecenter, isTracking }: { onRecenter: () => void, isTracking: boolean }) {
    return (
        <button
            onClick={onRecenter}
            className={`leaflet-bar leaflet-control leaflet-control-custom p-2 bg-background border-2 rounded-lg shadow-lg transition-all active:scale-95 flex items-center justify-center ${
                isTracking ? "border-primary text-primary" : "border-muted-foreground/30 text-muted-foreground"
            }`}
            style={{
                position: 'absolute',
                bottom: '80px', // Raised above bottom nav
                right: '16px',
                zIndex: 400,
                width: '44px',
                height: '44px'
            }}
            aria-label="Recenter map"
        >
            <Navigation className={`w-5 h-5 ${isTracking ? "fill-current" : ""}`} />
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

const iconCache = new Map<string, L.DivIcon>();
function getNeonDotIcon(color: string) {
  const key = color.toLowerCase();
  const cached = iconCache.get(key);
  if (cached) return cached;
  const icon = L.divIcon({
    className: "vv-neon-dot",
    html: `<div class="vv-neon-dot__inner" style="--dot:${key}"></div>`,
    iconSize: [18, 18],      // larger tap target
    iconAnchor: [9, 9],      // center anchor
  });
  iconCache.set(key, icon);
  return icon;
}

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
  const isMounted = useRef(true)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [previewHotspot, setPreviewHotspot] = useState<Hotspot | null>(null)
  const [showLegend, setShowLegend] = useState(false)

  // Track mount status and cleanup map
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if (mapRef.current) {
        console.log("Cleaning up map instance")
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Sync selectedHotspot with preview
  useEffect(() => {
    if (selectedHotspot) {
        setPreviewHotspot(selectedHotspot)
    }
  }, [selectedHotspot])

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!isMounted.current) return
        const { latitude, longitude } = position.coords
        const newLoc: [number, number] = [latitude, longitude]
        setUserLocation(newLoc)
        if (onLocationUpdate) onLocationUpdate(newLoc)

        // Initial center
        if (!mapReady && mapRef.current) {
             mapRef.current.setView(newLoc, 15)
             setMapReady(true)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        if (isMounted.current) setIsTracking(false)
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [onLocationUpdate, mapReady])

  // Recenter function
  const handleRecenter = () => {
    if (userLocation && isValidLatLng(userLocation[0], userLocation[1]) && mapRef.current) {
      mapRef.current.flyTo(userLocation, 16, { duration: 1.5 })
      setIsTracking(true)
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

  // Handle map resizing and visibility changes
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (mapRef.current && isVisible) {
        timeoutId = setTimeout(() => {
            if (isMounted.current && mapRef.current) {
                mapRef.current.invalidateSize()
            }
        }, 300)
    }
    return () => clearTimeout(timeoutId)
  }, [viewMode, isVisible])

  const activeTheme = (theme as keyof typeof themes) || "cyberpunk"
  const tileLayerUrl = activeTheme === 'genshin'
    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    : activeTheme === 'lofi'
    ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
    : activeTheme === 'rdr2'
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

  return (
    <div className="relative w-full h-full bg-muted z-0">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full outline-none"
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileLayerUrl}
          maxZoom={20}
        />

        <ZoomControl position="bottomright" />

        <RecenterControl onRecenter={handleRecenter} isTracking={isTracking} />
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
                    <Marker
                        key={hotspot.id}
                        position={[Number(hotspot.latitude), Number(hotspot.longitude)]}
                        icon={getNeonDotIcon(CATEGORY_COLOR[hotspot.category] ?? CATEGORY_COLOR.other)}
                        eventHandlers={{
                            click: () => handleMarkerClick(hotspot),
                        }}
                    />
                ))}
            </MarkerClusterGroup>
        )}

        <MapUpdater
            center={selectedHotspot && isValidLatLng(selectedHotspot.latitude, selectedHotspot.longitude)
                ? [Number(selectedHotspot.latitude), Number(selectedHotspot.longitude)]
                : (userLocation && isValidLatLng(userLocation[0], userLocation[1]) ? userLocation : DEFAULT_CENTER)
            }
            zoom={selectedHotspot ? 16 : DEFAULT_ZOOM}
        />
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
                         // Click to view details
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
