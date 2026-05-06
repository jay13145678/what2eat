import { useBlacklistStore } from '@/store/useBlacklistStore'
import { useDishes } from '@/hooks/useDishes'
import { EmptyState } from './EmptyState'
import { Prohibit } from '@phosphor-icons/react'

export function BlacklistPanel() {
  const ids = useBlacklistStore((s) => s.ids)
  const toggle = useBlacklistStore((s) => s.toggle)
  const { dishes } = useDishes()

  const blacklistedDishes = dishes.filter((d) => ids.includes(d.id))

  if (blacklistedDishes.length === 0) {
    return <EmptyState icon={Prohibit} title="黑名单是空的" description="不喜欢的菜品可以加入黑名单" />
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="py-3 border-b-[3px] border-ink mb-3">
        <span className="text-[10px] tracking-wider">共 {blacklistedDishes.length} 个黑名单</span>
      </div>
      <div className="flex-1 overflow-y-auto pb-4 space-y-2">
        {blacklistedDishes.map((dish) => (
          <div key={dish.id} className="flex items-center gap-3 bg-white border-[3px] border-ink px-3 py-3">
            <span className="text-sm">✕</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink tracking-wide truncate">{dish.name}</p>
            </div>
            <button onClick={() => toggle(dish.id)} className="text-[10px] font-semibold tracking-wider border-[3px] border-ink px-2 py-1 hover:bg-ink hover:text-white transition-none flex-shrink-0">
              移出
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
