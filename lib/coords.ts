
export const DEFAULT_CENTER: [number, number] = [19.3919, 72.8397] // Vasai-Virar

export function toNumber(value: any): number | null {
  if (value === null || value === undefined) return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

export function isValidLatLng(lat: any, lng: any): boolean {
  const latitude = toNumber(lat)
  const longitude = toNumber(lng)
  return (
    latitude !== null &&
    longitude !== null &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  )
}

export function getSafeLatLng(
    lat: any,
    lng: any,
    sourceName: string = "unknown"
): [number, number] | null {
    if (isValidLatLng(lat, lng)) {
        return [Number(lat), Number(lng)]
    }
    // Temporary instrumentation as requested
    console.warn(`[Sanitizer] Invalid LatLng from ${sourceName}: (${lat}, ${lng})`)
    return null
}

export function getSafeLatLngWithFallback(
  lat: any,
  lng: any,
  sourceName: string = "unknown"
): [number, number] {
  const safe = getSafeLatLng(lat, lng, sourceName)
  return safe || DEFAULT_CENTER
}
