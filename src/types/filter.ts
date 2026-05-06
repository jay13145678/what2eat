import type { CategoryGroup, Cuisine, MealType, PriceRange, SpiceLevel } from './dish'

export interface FilterState {
  categoryGroup: CategoryGroup | null
  cuisines: Cuisine[]
  mealTypes: MealType[]
  spiceLevels: SpiceLevel[]
  priceRanges: PriceRange[]
  isVegetarian: boolean | null
}
