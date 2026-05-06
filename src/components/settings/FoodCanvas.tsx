import { BowlFood, ForkKnife, Hamburger, Cookie, ForkKnife as FallbackIcon } from '@phosphor-icons/react'
import type { CategoryGroup } from '@/types'
import type { Icon } from '@phosphor-icons/react'

interface FoodCanvasProps {
  categoryGroup: CategoryGroup
  size?: number
}

const ICON_MAP: Record<string, Icon> = {
  chinese: BowlFood,
  western: ForkKnife,
  fast_food: Hamburger,
  snack: Cookie,
}

export function FoodCanvas({ categoryGroup, size = 128 }: FoodCanvasProps) {
  const IconComp = ICON_MAP[categoryGroup] || FallbackIcon
  return (
    <div
      className="flex items-center justify-center text-ink"
      style={{ width: size, height: size }}
    >
      <IconComp size={size * 0.55} weight="thin" />
    </div>
  )
}
