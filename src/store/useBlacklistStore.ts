import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BlacklistState {
  ids: string[]
  toggle: (id: string) => void
  isBlacklisted: (id: string) => boolean
}

export const useBlacklistStore = create<BlacklistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((i) => i !== id) : [...s.ids, id],
        })),
      isBlacklisted: (id) => get().ids.includes(id),
    }),
    { name: 'what2eat-blacklist' },
  ),
)
