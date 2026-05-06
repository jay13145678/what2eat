import type { AppSettings } from '../types'

export function getDurationMultiplier(duration: AppSettings['animationDuration']): number {
  switch (duration) {
    case 'fast': return 0.5
    case 'slow': return 1.5
    default: return 1
  }
}
