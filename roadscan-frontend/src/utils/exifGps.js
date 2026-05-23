import exifr from 'exifr'

/**
 * Attempts to extract GPS coordinates from an image File object.
 * Returns { lat, lng } or null if not available.
 */
export async function extractGpsFromExif(file) {
  try {
    const gps = await exifr.gps(file)
    if (gps && gps.latitude && gps.longitude) {
      return { lat: gps.latitude, lng: gps.longitude }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Requests GPS coordinates from the browser Geolocation API.
 * Returns a Promise that resolves to { lat, lng } or rejects with an error.
 */
export function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        const messages = {
          1: 'Location permission denied. Please allow access or pin manually.',
          2: 'Location unavailable. Please pin manually on the map.',
          3: 'Location request timed out. Please try again.',
        }
        reject(new Error(messages[error.code] || 'Could not get location.'))
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  })
}
