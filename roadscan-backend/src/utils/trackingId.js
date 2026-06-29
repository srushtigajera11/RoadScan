import Report from '../models/Report.js'

/**
 * Generates a unique tracking ID in format RDS-YYYYXXXX
 * e.g. RDS-20260001
 */
export async function generateTrackingId() {
  const year = new Date().getFullYear()
  const prefix = `RDS-${year}`

  // Count existing reports this year to get next sequence number
  const count = await Report.countDocuments({
    trackingId: { $regex: `^${prefix}` },
  })

  const sequence = String(count + 1).padStart(4, '0')
  return `${prefix}${sequence}`
}
