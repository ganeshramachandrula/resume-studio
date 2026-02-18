import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@/store/app-store'

describe('app-store', () => {
  beforeEach(() => {
    // Reset to defaults
    useAppStore.setState({ profile: null, sidebarOpen: false })
  })

  it('has correct initial state', () => {
    const state = useAppStore.getState()
    expect(state.profile).toBeNull()
    expect(state.sidebarOpen).toBe(false)
  })

  it('setProfile sets and clears profile', () => {
    const profile = {
      id: 'user-1',
      email: 'test@example.com',
      full_name: 'Test User',
      avatar_url: null,
      plan: 'pro_annual' as const,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      usage_count: 0,
      saved_applications_count: 0,
      coach_messages_count: 0,
      country: null,
      credits: 0,
      team_id: null,
      usage_reset_at: '2026-01-01',
      role: 'user' as const,
      is_disabled: false,
      signup_ip: null,
      signup_device_id: null,
      signup_referrer: null,
      signup_metadata: null,
      parse_jd_daily_count: 0,
      parse_jd_reset_at: '2026-01-01',
      ats_score_daily_count: 0,
      ats_score_reset_at: '2026-01-01',
      job_search_daily_count: 0,
      job_search_reset_at: '2026-01-01',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    useAppStore.getState().setProfile(profile)
    expect(useAppStore.getState().profile).toEqual(profile)

    useAppStore.getState().setProfile(null)
    expect(useAppStore.getState().profile).toBeNull()
  })

  it('setSidebarOpen sets sidebar state', () => {
    useAppStore.getState().setSidebarOpen(true)
    expect(useAppStore.getState().sidebarOpen).toBe(true)
    useAppStore.getState().setSidebarOpen(false)
    expect(useAppStore.getState().sidebarOpen).toBe(false)
  })

  it('toggleSidebar flips sidebar state', () => {
    expect(useAppStore.getState().sidebarOpen).toBe(false)
    useAppStore.getState().toggleSidebar()
    expect(useAppStore.getState().sidebarOpen).toBe(true)
    useAppStore.getState().toggleSidebar()
    expect(useAppStore.getState().sidebarOpen).toBe(false)
  })

  it('toggleSidebar works from open state', () => {
    useAppStore.getState().setSidebarOpen(true)
    useAppStore.getState().toggleSidebar()
    expect(useAppStore.getState().sidebarOpen).toBe(false)
  })
})
