export interface AppSettings {
  allowDuplicates: boolean
  prioritizeFavorites: boolean
  animationDuration: 'fast' | 'normal' | 'slow'
}

export const defaultSettings: AppSettings = {
  allowDuplicates: false,
  prioritizeFavorites: true,
  animationDuration: 'normal',
}
