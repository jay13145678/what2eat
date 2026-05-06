import type { Dish } from '../types'

export interface PickResult {
  primary: Dish
  alternatives: Dish[]
}

/** 加权随机选取一个，返回主推荐 + 两个备选 */
export function weightedPick(
  pool: Dish[],
  recentDishIds: string[],
  favorites: string[],
  prioritizeFavorites: boolean,
): PickResult | null {
  if (pool.length === 0) return null

  // 计算权重
  const weighted = pool.map((dish) => {
    let weight = dish.weight

    // 收藏优先
    if (prioritizeFavorites && favorites.includes(dish.id)) {
      weight *= 2
    }

    // 最近已选衰减
    const recentIndex = recentDishIds.indexOf(dish.id)
    if (recentIndex !== -1) {
      // 按时间衰减：上次选过权重极低，越久权重越高
      const decay = Math.max(0.1, 1 - (recentDishIds.length - recentIndex) / recentDishIds.length * 0.9)
      weight *= decay
    }

    return { dish, weight: Math.max(0.01, weight) }
  })

  // 用权重随机选择主推荐
  const primary = weightedPickOne(weighted)
  if (!primary) return null

  // 从剩余中选 2 个备选（去重）
  const remaining = weighted.filter((w) => w.dish.id !== primary.dish.id)
  const shuffled = remaining.sort(() => Math.random() - 0.5)
  const alternatives = shuffled.slice(0, 2).map((w) => w.dish)

  return { primary: primary.dish, alternatives }
}

function weightedPickOne(
  items: { dish: Dish; weight: number }[],
): { dish: Dish; weight: number } | null {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  if (totalWeight <= 0) return null

  let random = Math.random() * totalWeight
  for (const item of items) {
    random -= item.weight
    if (random <= 0) return item
  }

  return items[items.length - 1]
}
