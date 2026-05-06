import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HistoryEntry } from '../types'

interface HistoryState {
  entries: HistoryEntry[]
  addEntry: (entry: HistoryEntry) => void
  removeEntry: (id: string) => void
  clear: () => void
}

const MAX_ENTRIES = 100

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((s) => ({
          entries: [entry, ...s.entries].slice(0, MAX_ENTRIES),
        })),
      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      clear: () => set({ entries: [] }),
    }),
    { name: 'what2eat-history' },
  ),
)
