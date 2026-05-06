import { useHistoryStore } from '@/store/useHistoryStore'
import { useDishes } from '@/hooks/useDishes'
import { EmptyState } from './EmptyState'
import { ClockCounterClockwise } from '@phosphor-icons/react'

function formatTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export function HistoryPanel() {
  const entries = useHistoryStore((s) => s.entries)
  const removeEntry = useHistoryStore((s) => s.removeEntry)
  const clear = useHistoryStore((s) => s.clear)
  const { dishes } = useDishes()

  const dishMap = new Map(dishes.map((d) => [d.id, d]))

  if (entries.length === 0) {
    return <EmptyState icon={ClockCounterClockwise} title="暂无历史记录" description="去首页选一道美食吧" />
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between py-3 border-b-[3px] border-ink mb-3">
        <span className="text-xs tracking-wider">共 {entries.length} 条记录</span>
        <button onClick={clear} className="text-xs font-semibold tracking-wider border-[3px] border-ink px-2 py-1 hover:bg-ink hover:text-white transition-none">
          清空
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pb-4 space-y-2">
        {entries.map((entry) => {
          const dish = dishMap.get(entry.dishId)
          const displayName = entry.dishName || dish?.name || '未知'
          return (
            <div key={entry.id} className="flex items-center gap-3 bg-white border-[3px] border-ink px-3 py-3">
              <span className="text-xs">{entry.filters ? '?' : '*'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-ink tracking-wide truncate">{displayName}</p>
                <p className="text-xs text-ink/50 tracking-wider mt-0.5">{formatTime(entry.pickedAt)}</p>
              </div>
              <button onClick={() => removeEntry(entry.id)} className="text-xs font-semibold tracking-wider border-[3px] border-ink px-2 py-1 hover:bg-ink hover:text-white transition-none flex-shrink-0">
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
