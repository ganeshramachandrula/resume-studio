import browser from './browser-polyfill'
import type { StoredAuth } from './types'

const AUTH_KEYS: (keyof StoredAuth)[] = [
  'access_token',
  'refresh_token',
  'user_email',
  'user_id',
]

export async function getAuthToken(): Promise<string | null> {
  const result = await browser.storage.local.get('access_token')
  return (result.access_token as string) || null
}

export async function getStoredAuth(): Promise<StoredAuth | null> {
  const result = await browser.storage.local.get(AUTH_KEYS)
  if (!result.access_token || !result.user_email) return null
  return result as unknown as StoredAuth
}

export async function storeAuth(auth: StoredAuth): Promise<void> {
  await browser.storage.local.set({ ...auth })
}

export async function clearAuth(): Promise<void> {
  await browser.storage.local.remove(AUTH_KEYS)
}
