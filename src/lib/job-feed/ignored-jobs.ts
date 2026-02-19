const STORAGE_KEY = 'resumestudio_ignored_jobs'
const MAX_IGNORED = 500

/**
 * Get the set of ignored job IDs from localStorage.
 */
export function getIgnoredJobIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const ids: string[] = JSON.parse(raw)
    return new Set(ids)
  } catch {
    return new Set()
  }
}

/**
 * Add a job ID to the ignored list.
 */
export function ignoreJob(id: string): Set<string> {
  const ids = getIgnoredJobIds()
  ids.add(id)

  // Trim oldest entries if over limit (Set preserves insertion order)
  if (ids.size > MAX_IGNORED) {
    const arr = Array.from(ids)
    const trimmed = arr.slice(arr.length - MAX_IGNORED)
    const newSet = new Set(trimmed)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    return newSet
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)))
  return ids
}

/**
 * Clear all ignored job IDs.
 */
export function clearIgnoredJobs(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
