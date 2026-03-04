import { getAuthToken } from './storage'
import type {
  LoginResponse,
  SubmitJDResponse,
  SaveJobResponse,
  CompanyRating,
  RatingSubmission,
} from './types'

declare const __API_BASE_URL__: string

const API = __API_BASE_URL__

async function authHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken()
  if (!token) throw new Error('Not logged in. Please log in first.')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function fetchJSON<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data as T
}

/** Login via extension-login endpoint (no Bearer token needed) */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return fetchJSON<LoginResponse>(`${API}/api/auth/extension-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

/** Submit captured JD for parsing */
export async function submitJD(
  rawText: string,
  sourceUrl: string,
  sourceSite: string
): Promise<SubmitJDResponse> {
  return fetchJSON<SubmitJDResponse>(`${API}/api/extension/submit-jd`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      raw_text: rawText,
      source_url: sourceUrl,
      source_site: sourceSite,
    }),
  })
}

/** Save a job to the tracker */
export async function saveJob(
  company: string,
  role: string,
  url?: string
): Promise<SaveJobResponse> {
  return fetchJSON<SaveJobResponse>(`${API}/api/extension/save-job`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ company, role, url }),
  })
}

/** Fetch public company rating */
export async function getCompanyRating(
  slug: string
): Promise<CompanyRating | null> {
  try {
    const res = await fetch(`${API}/api/ghostboard/companies/${slug}`)
    if (!res.ok) return null
    const data = await res.json()
    return data as CompanyRating
  } catch {
    return null
  }
}

/** Submit a company rating */
export async function rateCompany(
  rating: RatingSubmission
): Promise<{ success: boolean }> {
  return fetchJSON<{ success: boolean }>(
    `${API}/api/extension/rate-company`,
    {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(rating),
    }
  )
}
