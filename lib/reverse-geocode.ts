export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'VV-Hotspots-App',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();

    if (data.address) {
      const { suburb, neighbourhood, road, city, town, village, state_district } = data.address;

      // Construct a concise location string
      // Priority 1: Specific area (Suburb/Neighbourhood)
      const area = suburb || neighbourhood || village || road;

      // Priority 2: City/Region
      const region = city || town || state_district;

      if (area && region) {
        return `${area}, ${region}`;
      } else if (area) {
        return area;
      } else if (data.display_name) {
         // If display_name is too long, truncate or split?
         // Nominatim display_name is usually comma separated.
         // Let's take the first 2 parts if we fallback to it.
         return data.display_name.split(',').slice(0, 2).join(',');
      }
    }

    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  }
}
