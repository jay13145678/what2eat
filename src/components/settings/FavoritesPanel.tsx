import { useFavoriteStore } from '@/store/useFavoriteStore'
import { useDishes } from '@/hooks/useDishes'
import { EmptyState } from './EmptyState'
import { Star } from '@phosphor-icons/react'

export function FavoritesPanel() {
  const ids = useFavoriteStore((s) => s.ids)
  const toggle = useFavoriteStore((s) => s.toggle)
  const { dishes } = useDishes()

  const favoriteDishes = dishes.filter((d) => ids.includes(d.id))

  if (favoriteDishes.length === 0) {
    return <EmptyState icon={Star} title="还没有收藏" description="在选菜结果中可以收藏喜欢的菜品" />
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="py-3 border-b-[3px] border-ink mb-3">
        <span className="text-[10px] tracking-wider">共 {favoriteDishes.length} 个收藏</span>
      </div>
      <div className="flex-1 overflow-y-auto pb-4 space-y-2">
        {favoriteDishes.map((dish) => (
          <div key={dish.id} className="flex items-center gap-3 bg-white border-[3px] border-ink px-3 py-3">
            <span className="text-sm">*</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink tracking-wide truncate">{dish.name}</p>
            </div>
            <button onClick={() => toggle(dish.id)} className="text-[10px] font-semibold tracking-wider border-[3px] border-ink px-2 py-1 hover:bg-ink hover:text-white transition-none flex-shrink-0">
              移除
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
