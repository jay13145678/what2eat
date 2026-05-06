import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings } from '../types'
import { defaultSettings } from '../types/settings'

interface AppState {
  settings: AppSettings
  updateSettings: (partial: Partial<AppSettings>) => void
  onboarded: boolean
  setOnboarded: (v: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      onboarded: false,
      updateSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),
      setOnboarded: (v) => set({ onboarded: v }),
    }),
    { name: 'what2eat-app' },
  ),
)
