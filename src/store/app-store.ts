import { create } from 'zustand'
import type { Profile } from '@/types/database'

interface AppStore {
  profile: Profile | null
  sidebarOpen: boolean
  setProfile: (profile: Profile | null) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  profile: null,
  sidebarOpen: false,
  setProfile: (profile) => set({ profile }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
