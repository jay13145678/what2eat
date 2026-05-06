import type { FilterState } from './filter'

export interface HistoryEntry {
  id: string
  dishId: string
  dishName: string
  cuisineName: string
  pickedAt: number
  filters: FilterState | null
  rating: number | null
}
