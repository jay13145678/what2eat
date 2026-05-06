import { useAppStore } from '@/store/useAppStore'

const durationOptions = [
  { value: 'fast', label: '快速' },
  { value: 'normal', label: '正常' },
  { value: 'slow', label: '慢速' },
] as const

export function GeneralSettingsPanel() {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)

  return (
    <div className="flex-1 flex flex-col">
      <div className="py-3">
        <h3 className="text-[10px] font-bold tracking-widest mb-3">偏好设置</h3>
        <div className="border-[3px] border-ink divide-y-[3px] divide-ink">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-xs font-semibold tracking-wider">允许重复</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.allowDuplicates} onChange={(e) => updateSettings({ allowDuplicates: e.target.checked })} className="sr-only peer" />
              <div className="w-9 h-[18px] border-[3px] border-ink bg-white peer-checked:bg-ink transition-none after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-ink after:w-[10px] after:h-[10px] after:transition-none peer-checked:after:translate-x-[18px] peer-checked:after:bg-white" />
            </label>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <span className="text-xs font-semibold tracking-wider">收藏优先</span>
              <p className="text-[9px] text-ink/50 tracking-wider mt-0.5">随机选择时优先推荐收藏的菜品</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input type="checkbox" checked={settings.prioritizeFavorites} onChange={(e) => updateSettings({ prioritizeFavorites: e.target.checked })} className="sr-only peer" />
              <div className="w-9 h-[18px] border-[3px] border-ink bg-white peer-checked:bg-ink transition-none after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-ink after:w-[10px] after:h-[10px] after:transition-none peer-checked:after:translate-x-[18px] peer-checked:after:bg-white" />
            </label>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-xs font-semibold tracking-wider">动画速度</span>
            <select value={settings.animationDuration} onChange={(e) => updateSettings({ animationDuration: e.target.value as 'fast' | 'normal' | 'slow' })}
              className="text-[10px] font-semibold tracking-wider bg-white border-[3px] border-ink px-2 py-1 outline-none">
              {durationOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
          </div>
        </div>
      </div>
      <div className="py-3">
        <h3 className="text-[10px] font-bold tracking-widest mb-3">关于</h3>
        <div className="border-[3px] border-ink divide-y-[3px] divide-ink">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-xs font-semibold tracking-wider">应用名称</span>
            <span className="text-[10px] tracking-wider text-ink/50">今天吃什么</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-xs font-semibold tracking-wider">版本</span>
            <span className="text-[10px] tracking-wider text-ink/50">1.0.0</span>
          </div>
        </div>
      </div>
      <div className="flex-1" />
    </div>
  )
}
