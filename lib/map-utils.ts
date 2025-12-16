
/**
 * Checks if a value is a finite number.
 * Helpful for verifying coordinates before passing them to Leaflet.
 */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * Validates latitude and longitude.
 * - Latitude must be between -90 and 90.
 * - Longitude must be between -180 and 180.
 * - Both must be finite numbers.
 */
export function isValidLatLng(lat: unknown, lng: unknown): boolean {
  const numLat = Number(lat)
  const numLng = Number(lng)

  if (!isFiniteNumber(numLat) || !isFiniteNumber(numLng)) {
    return false
  }

  return numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180
}
