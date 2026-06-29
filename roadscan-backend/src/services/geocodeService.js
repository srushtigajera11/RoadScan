import axios from 'axios'

/**
 * Convert lat/lng to a human-readable address using Nominatim (OpenStreetMap).
 * Free, no API key required.
 * Returns address string or null if unavailable.
 */
export async function reverseGeocode(lat, lng) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'RoadScan/1.0 (road damage reporter)',
      },
      timeout: 5000,
    })

    return response.data?.display_name || null
  } catch (err) {
    console.warn('Geocoding failed:', err.message)
    return null
  }
}