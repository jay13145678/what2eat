import type { Dish, FilterState } from '../types'

export function matchDish(dish: Dish, filter: FilterState): boolean {
  if (filter.categoryGroup && filter.categoryGroup !== 'any') {
    if (dish.categoryGroup !== filter.categoryGroup) return false
  }

  if (filter.cuisines.length > 0 && !filter.cuisines.includes(dish.cuisine)) {
    return false
  }

  if (filter.mealTypes.length > 0) {
    if (!dish.mealTypes.some((mt) => filter.mealTypes.includes(mt))) return false
  }

  if (filter.spiceLevels.length > 0 && !filter.spiceLevels.includes(dish.spiceLevel)) {
    return false
  }

  if (filter.priceRanges.length > 0 && !filter.priceRanges.includes(dish.priceRange)) {
    return false
  }

  if (filter.isVegetarian !== null && dish.isVegetarian !== filter.isVegetarian) {
    return false
  }

  return true
}

export function filterDishes(dishes: Dish[], filter: FilterState): Dish[] {
  return dishes.filter((dish) => matchDish(dish, filter))
}
