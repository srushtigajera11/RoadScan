/**
 * Format a date string to readable Indian format
 * e.g. "15 May 2026, 4:30 PM"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Returns Tailwind classes for a status badge
 */
export function statusBadgeClass(status) {
  const map = {
    open: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/30',
    in_progress: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-500/30',
    resolved: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-500/30',
  }
  return map[status] || 'bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-500/30'
}

/**
 * Capitalize and format a damage type string
 * e.g. "pothole" → "Pothole", "alligator_crack" → "Alligator Crack"
 */
export function formatDamageType(type) {
  if (!type) return 'Unknown'
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Format confidence score as percentage
 * e.g. 0.87 → "87%"
 */
export function formatConfidence(score) {
  if (score === null || score === undefined) return '—'
  return `${Math.round(score * 100)}%`
}

/**
 * Truncate long address strings
 */
export function truncateAddress(address, maxLength = 60) {
  if (!address) return 'Location unavailable'
  if (address.length <= maxLength) return address
  return address.substring(0, maxLength) + '...'
}
