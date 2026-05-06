import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Dish, Cuisine, CategoryGroup, MealType, SpiceLevel, PriceRange } from '@/types'
import { v4 as uuid } from 'uuid'

interface DishEditorProps {
  dish: Dish | null
  open: boolean
  onSave: (dish: Dish) => void
  onClose: () => void
}

const cuisines: Cuisine[] = [
  'sichuan', 'cantonese', 'hunan', 'shandong', 'jiangsu', 'zhejiang',
  'fujian', 'anhui', 'beijing', 'shanghai', 'northeast', 'northwest',
  'western', 'japanese', 'korean', 'fast_food', 'snack', 'hotpot', 'barbecue', 'dessert',
]
const cuisineLabels: Record<string, string> = {
  sichuan: '川菜', cantonese: '粤菜', hunan: '湘菜', shandong: '鲁菜',
  jiangsu: '苏菜', zhejiang: '浙菜', fujian: '闽菜', anhui: '徽菜',
  beijing: '北京菜', shanghai: '上海菜', northeast: '东北菜', northwest: '西北菜',
  western: '西餐', japanese: '日料', korean: '韩餐', fast_food: '快餐',
  snack: '小吃', hotpot: '火锅', barbecue: '烧烤', dessert: '甜品',
}
const categoryGroups: CategoryGroup[] = ['chinese', 'western', 'fast_food', 'snack', 'any']
const categoryLabels: Record<string, string> = { chinese: '中餐', western: '西餐', fast_food: '快餐', snack: '小吃', any: '随便' }
const mealTypes: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: '早餐' }, { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' }, { value: 'late_night', label: '宵夜' }, { value: 'afternoon_tea', label: '下午茶' },
]

function emptyDish(): Dish {
  return {
    id: uuid(), name: '', cuisine: 'sichuan', categoryGroup: 'chinese', mealTypes: ['lunch'],
    spiceLevel: 1, priceRange: 2, flavorProfile: { spicy: 0, sweet: 0, sour: 0, salty: 0, umami: 0 },
    imageUrl: '', description: '', isVegetarian: false, calories: 200, tags: [], weight: 10,
  }
}

export function DishEditor({ dish, open, onSave, onClose }: DishEditorProps) {
  const [form, setForm] = useState<Dish>(dish || emptyDish())
  const [tagInput, setTagInput] = useState('')

  const handleOpen = () => { setForm(dish || emptyDish()); setTagInput('') }
  const handleSave = () => { if (!form.name.trim()) return; onSave({ ...form, name: form.name.trim() }) }
  const addTag = () => { const t = tagInput.trim(); if (t && !form.tags.includes(t)) { setForm({ ...form, tags: [...form.tags, t] })}; setTagInput('') }
  const removeTag = (tag: string) => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })

  const btnStyle = (selected: boolean) =>
    `px-2.5 py-1 border-[3px] border-ink text-[10px] font-semibold tracking-wider transition-none ${
      selected ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-ink hover:text-white'
    }`

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
          <motion.div
            className="relative w-full sm:max-w-lg max-h-[85vh] bg-white border-t-[3px] border-ink sm:border-[3px] overflow-hidden flex flex-col"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onAnimationStart={() => { if (open) handleOpen() }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b-[3px] border-ink">
              <button onClick={onClose} className="text-[10px] font-semibold tracking-wider hover:underline">取消</button>
              <h2 className="text-xs font-bold tracking-wider">{dish ? '编辑菜品' : '添加菜品'}</h2>
              <button onClick={handleSave} disabled={!form.name.trim()} className={`text-[10px] font-semibold tracking-wider ${form.name.trim() ? 'hover:underline' : 'opacity-30'}`}>保存</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="text-[9px] font-bold tracking-widest mb-1 block">菜名 *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="输入菜品名称"
                  className="w-full px-3 py-2 border-[3px] border-ink bg-white text-xs font-semibold tracking-wider outline-none placeholder:text-ink/30" />
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest mb-1 block">菜系</label>
                <div className="flex flex-wrap gap-1.5">
                  {cuisines.map((c) => (<button key={c} onClick={() => setForm({ ...form, cuisine: c })} className={btnStyle(form.cuisine === c)}>{cuisineLabels[c]}</button>))}
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest mb-1 block">分类</label>
                <div className="flex gap-1.5">
                  {categoryGroups.map((cg) => (<button key={cg} onClick={() => setForm({ ...form, categoryGroup: cg })} className={btnStyle(form.categoryGroup === cg)}>{categoryLabels[cg]}</button>))}
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest mb-1 block">适合时段</label>
                <div className="flex flex-wrap gap-1.5">
                  {mealTypes.map((mt) => (<button key={mt.value} onClick={() => { const has = form.mealTypes.includes(mt.value); setForm({ ...form, mealTypes: has ? form.mealTypes.filter((m) => m !== mt.value) : [...form.mealTypes, mt.value] }) }} className={btnStyle(form.mealTypes.includes(mt.value))}>{mt.label}</button>))}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[9px] font-bold tracking-widest mb-1 block">辣度</label>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((l) => (<button key={l} onClick={() => setForm({ ...form, spiceLevel: l as SpiceLevel })} className={`flex-1 py-1.5 border-[3px] border-ink text-[10px] font-semibold tracking-wider transition-none ${form.spiceLevel === l ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-ink hover:text-white'}`}>{l === 0 ? '不辣' : '•'.repeat(l)}</button>))}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-[9px] font-bold tracking-widest mb-1 block">价格</label>
                  <div className="flex gap-1">
                    {([1, 2, 3] as PriceRange[]).map((p) => (<button key={p} onClick={() => setForm({ ...form, priceRange: p })} className={`flex-1 py-1.5 border-[3px] border-ink text-[10px] font-semibold tracking-wider transition-none ${form.priceRange === p ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-ink hover:text-white'}`}>{'¥'.repeat(p)}</button>))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isVegetarian} onChange={(e) => setForm({ ...form, isVegetarian: e.target.checked })} className="w-4 h-4 accent-ink" />
                  <span className="text-xs font-semibold tracking-wider">素食</span>
                </label>
                <div className="flex-1">
                  <label className="text-[9px] font-bold tracking-widest mb-1 block">热量 (kcal)</label>
                  <input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border-[3px] border-ink bg-white text-xs font-semibold tracking-wider outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest mb-1 block">描述</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="简单描述这道菜" rows={2}
                  className="w-full px-3 py-2 border-[3px] border-ink bg-white text-xs font-semibold tracking-wider outline-none resize-none placeholder:text-ink/30" />
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest mb-1 block">标签</label>
                <div className="flex gap-2 mb-1.5">
                  <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTag()} placeholder="输入标签按回车"
                    className="flex-1 px-3 py-1.5 border-[3px] border-ink bg-white text-xs font-semibold tracking-wider outline-none placeholder:text-ink/30" />
                  <button onClick={addTag} className="px-3 py-1.5 border-[3px] border-ink text-[10px] font-semibold bg-white hover:bg-ink hover:text-white transition-none">+</button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">{form.tags.map((tag) => (<span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 border-[3px] border-ink text-[9px] font-semibold tracking-wider">{tag}<button onClick={() => removeTag(tag)} className="ml-1">×</button></span>))}</div>
                )}
              </div>
              <div>
                <label className="text-[9px] font-bold tracking-widest mb-1 block">权重 ({form.weight})</label>
                <input type="range" min="1" max="20" value={form.weight} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} className="w-full" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
