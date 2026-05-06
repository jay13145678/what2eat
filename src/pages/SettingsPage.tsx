import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ClockCounterClockwise, Star, Prohibit, ListDashes, Gear, CaretRight } from '@phosphor-icons/react'
import { useAppStore } from '@/store/useAppStore'
import { getDurationMultiplier } from '@/utils/animation'
import { HistoryPanel } from '@/components/settings/HistoryPanel'
import { FavoritesPanel } from '@/components/settings/FavoritesPanel'
import { BlacklistPanel } from '@/components/settings/BlacklistPanel'
import { DishManagerPanel } from '@/components/settings/DishManagerPanel'
import { GeneralSettingsPanel } from '@/components/settings/GeneralSettingsPanel'

type Panel = 'history' | 'favorites' | 'blacklist' | 'dishes' | 'general'

const menuItems: { key: Panel; icon: typeof ClockCounterClockwise; label: string }[] = [
  { key: 'history', icon: ClockCounterClockwise, label: '历史记录' },
  { key: 'favorites', icon: Star, label: '我的收藏' },
  { key: 'blacklist', icon: Prohibit, label: '黑名单' },
  { key: 'dishes', icon: ListDashes, label: '菜品管理' },
  { key: 'general', icon: Gear, label: '通用设置' },
]

export default function SettingsPage() {
  const [activePanel, setActivePanel] = useState<Panel | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const animationDuration = useAppStore((s) => s.settings.animationDuration)

  useEffect(() => {
    if (!menuRef.current) return
    const durMul = getDurationMultiplier(animationDuration)
    const tween = gsap.fromTo(menuRef.current.children, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, stagger: 0.06 * durMul, ease: 'power2.out', duration: 0.5 * durMul })
    return () => { tween.kill() }
  }, [animationDuration])

  useEffect(() => {
    if (!activePanel || !panelRef.current) return
    const durMul = getDurationMultiplier(animationDuration)
    const tween = gsap.fromTo(panelRef.current, { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.4 * durMul, ease: 'power2.out' })
    return () => { tween.kill() }
  }, [activePanel, animationDuration])

  const renderPanel = () => {
    switch (activePanel) {
      case 'history': return <HistoryPanel />
      case 'favorites': return <FavoritesPanel />
      case 'blacklist': return <BlacklistPanel />
      case 'dishes': return <DishManagerPanel />
      case 'general': return <GeneralSettingsPanel />
      default: return null
    }
  }

  if (activePanel) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 px-4 py-3 border-b-[3px] border-ink">
          <button onClick={() => setActivePanel(null)} className="hover:underline text-sm font-semibold tracking-wider">
            ← 设置
          </button>
        </div>
        <div ref={panelRef} className="flex-1 flex flex-col px-4 pb-4" style={{ willChange: 'transform, opacity' }}>
          {renderPanel()}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 py-3 border-b-[3px] border-ink">
        <h1 className="text-base font-bold tracking-tighter">设置</h1>
      </div>

      <div className="flex-1 px-4 pt-4 pb-4">
        <div ref={menuRef} className="border-[3px] border-ink divide-y-[3px] divide-ink">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                onClick={() => setActivePanel(item.key)}
                className="w-full flex items-center justify-between px-4 py-4 bg-white hover:bg-ink hover:text-white transition-none text-ink"
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} weight="thin" />
                  <span className="text-sm font-semibold tracking-wider">{item.label}</span>
                </div>
                <CaretRight size={16} weight="thin" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
