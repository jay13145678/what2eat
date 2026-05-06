export type Cuisine =
  | 'sichuan' | 'cantonese' | 'hunan' | 'shandong'
  | 'jiangsu' | 'zhejiang' | 'fujian' | 'anhui'
  | 'beijing' | 'shanghai' | 'northeast' | 'northwest'
  | 'western' | 'japanese' | 'korean'
  | 'fast_food' | 'snack' | 'hotpot' | 'barbecue' | 'dessert'

export type CategoryGroup = 'chinese' | 'western' | 'fast_food' | 'snack' | 'any'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'late_night' | 'afternoon_tea'

export type SpiceLevel = 0 | 1 | 2 | 3

export type PriceRange = 1 | 2 | 3

export interface FlavorProfile {
  spicy: number
  sweet: number
  sour: number
  salty: number
  umami: number
}

export interface Dish {
  id: string
  name: string
  cuisine: Cuisine
  categoryGroup: CategoryGroup
  mealTypes: MealType[]
  spiceLevel: SpiceLevel
  priceRange: PriceRange
  flavorProfile: FlavorProfile
  imageUrl: string
  description: string
  isVegetarian: boolean
  calories: number
  tags: string[]
  weight: number
}
