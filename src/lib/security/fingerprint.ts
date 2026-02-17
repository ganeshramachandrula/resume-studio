'use client'

const DEVICE_ID_KEY = 'rs_device_id'
const DEVICE_LABEL_KEY = 'rs_device_label'

/**
 * Generates a stable browser fingerprint using canvas, screen, timezone, and language.
 * Returns a 64-char hex SHA-256 hash. Cached in localStorage for stability across reloads.
 * No external dependencies — uses Web Crypto API.
 */
export async function getDeviceFingerprint(): Promise<string> {
  // Return cached fingerprint if available
  const cached = localStorage.getItem(DEVICE_ID_KEY)
  if (cached && cached.length === 64) return cached

  const components: string[] = []

  // Screen dimensions + color depth
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`)

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // Language
  components.push(navigator.language)

  // Platform
  components.push(navigator.platform)

  // Hardware concurrency
  components.push(String(navigator.hardwareConcurrency || 0))

  // Canvas fingerprint
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 50
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = '#f60'
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = '#069'
      ctx.font = '14px Arial'
      ctx.fillText('ResumeStudio', 2, 15)
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
      ctx.font = '18px Times New Roman'
      ctx.fillText('fingerprint', 4, 45)
      components.push(canvas.toDataURL())
    }
  } catch {
    components.push('canvas-unavailable')
  }

  // Hash all components into a stable fingerprint
  const raw = components.join('|')
  const encoded = new TextEncoder().encode(raw)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const fingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  localStorage.setItem(DEVICE_ID_KEY, fingerprint)
  return fingerprint
}

/**
 * Returns a human-readable device label (OS + Browser).
 * Cached in localStorage.
 */
export function getDeviceLabel(): string {
  const cached = localStorage.getItem(DEVICE_LABEL_KEY)
  if (cached) return cached

  const ua = navigator.userAgent
  let os = 'Unknown OS'
  let browser = 'Unknown Browser'

  // Detect OS
  if (ua.includes('Mac OS X')) os = 'macOS'
  else if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  else if (ua.includes('CrOS')) os = 'ChromeOS'

  // Detect Browser (order matters — Chrome UA includes Safari)
  if (ua.includes('Edg/')) browser = 'Edge'
  else if (ua.includes('OPR/') || ua.includes('Opera')) browser = 'Opera'
  else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Chrome'
  else if (ua.includes('Firefox/')) browser = 'Firefox'
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari'

  const label = `${browser} on ${os}`
  localStorage.setItem(DEVICE_LABEL_KEY, label)
  return label
}
