export interface Coordinates {
  lat: number
  lng: number
}

// Robust fallback dictionary for major Sri Lankan tourist hubs
const SRILANKA_REGIONS: Record<string, Coordinates> = {
  colombo: { lat: 6.9271, lng: 79.8612 },
  kandy: { lat: 7.2906, lng: 80.6337 },
  ella: { lat: 6.8744, lng: 81.0456 },
  sigiriya: { lat: 7.9570, lng: 80.7603 },
  mirissa: { lat: 5.9483, lng: 80.4716 },
  galle: { lat: 6.0535, lng: 80.2210 },
  nuwaraeliya: { lat: 6.9497, lng: 80.7839 },
  'nuwara eliya': { lat: 6.9497, lng: 80.7839 },
  yala: { lat: 6.3687, lng: 81.5165 },
  udawalawe: { lat: 6.4716, lng: 80.8872 },
  trincomalee: { lat: 8.5874, lng: 81.2152 },
  arugambay: { lat: 6.8436, lng: 81.8266 },
  'arugam bay': { lat: 6.8436, lng: 81.8266 },
  dambulla: { lat: 7.8596, lng: 80.6483 },
  polonnaruwa: { lat: 7.9403, lng: 81.0188 },
  hikkaduwa: { lat: 6.1395, lng: 80.1063 },
  bentota: { lat: 6.4219, lng: 79.9982 },
  hiriketiya: { lat: 5.9664, lng: 80.7018 },
  weligama: { lat: 5.9737, lng: 80.4285 },
  tangalle: { lat: 6.0246, lng: 80.7936 },
  negombo: { lat: 7.2008, lng: 79.8737 },
  anuradhapura: { lat: 8.3114, lng: 80.4037 },
  minneriya: { lat: 8.0333, lng: 80.8500 }
}

/**
 * Gets exact coordinates for a tour, falling back to a regional coordinate dictionary
 * if the exact lat/lng is missing from the database.
 */
export function getTourCoordinates(
  lat: number | null | undefined, 
  lng: number | null | undefined, 
  locationString: string,
  id?: string
): Coordinates | null {
  // If we have exact GPS coordinates, use them
  if (lat != null && lng != null) {
    return { lat, lng }
  }

  // Calculate a deterministic jitter based on the ID to prevent perfect overlaps
  // If no ID is provided, jitter is 0
  let jitterLat = 0;
  let jitterLng = 0;
  if (id) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0;
    }
    // Generate a pseudo-random offset between -0.01 and +0.01 degrees (roughly +- 1km)
    jitterLat = ((hash % 100) / 100 - 0.5) * 0.02;
    jitterLng = (((hash >> 2) % 100) / 100 - 0.5) * 0.02;
  }

  // Fallback 1: Try exact match
  const locKey = locationString.toLowerCase().trim()
  if (SRILANKA_REGIONS[locKey]) {
    const base = SRILANKA_REGIONS[locKey]
    return { lat: base.lat + jitterLat, lng: base.lng + jitterLng }
  }

  // Fallback 2: Check if the string contains any of our known regions
  for (const [region, coords] of Object.entries(SRILANKA_REGIONS)) {
    if (locKey.includes(region)) {
      return { lat: coords.lat + jitterLat, lng: coords.lng + jitterLng }
    }
  }

  // Default to center of Sri Lanka if absolutely nothing is found
  return { lat: 7.8731 + jitterLat, lng: 80.7718 + jitterLng }
}
