import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllDishes, putDish, deleteDish } from '@/db'
import { DishCard } from './DishCard'
import { DishEditor } from './DishEditor'
import type { Dish } from '@/types'

const categoryFilters = [
  { key: 'all', label: '全部' },
  { key: 'chinese', label: '中餐' },
  { key: 'western', label: '西餐' },
  { key: 'fast_food', label: '快餐' },
  { key: 'snack', label: '小吃' },
]

const PAGE_SIZE = 40

export function DishManagerPanel() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null)
  const [loadMoreClicks, setLoadMoreClicks] = useState(0)

  useEffect(() => {
    getAllDishes().then((all) => { setDishes(all); setLoading(false) })
  }, [])

  const reload = async () => {
    setLoading(true)
    const all = await getAllDishes()
    setDishes(all)
    setLoading(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setLoadMoreClicks(0)
  }

  const handleCategoryFilter = (key: string) => {
    setCategoryFilter(key)
    setLoadMoreClicks(0)
  }

  const filtered = useMemo(() => {
    let list = dishes
    if (categoryFilter !== 'all') list = list.filter((d) => d.categoryGroup === categoryFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((d) => d.name.includes(q) || d.cuisine.includes(q) || d.tags.some((t) => t.includes(q)))
    }
    return list
  }, [dishes, categoryFilter, search])

  const visibleCount = PAGE_SIZE + loadMoreClicks * PAGE_SIZE
  const visible = filtered.slice(0, visibleCount)

  const handleOpenAdd = () => { setEditingDish(null); setEditorOpen(true) }
  const handleOpenEdit = (dish: Dish) => { setEditingDish(dish); setEditorOpen(true) }
  const handleSave = async (dish: Dish) => { await putDish(dish); setEditorOpen(false); await reload() }
  const handleDeleteConfirm = async () => { if (!deleteTarget) return; await deleteDish(deleteTarget.id); setDeleteTarget(null); await reload() }

  return (
    <div className="flex-1 flex flex-col">
      {/* 搜索 + 筛选 */}
      <div className="flex-shrink-0 space-y-2 pt-3 pb-2">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="搜索菜品…"
          className="w-full px-3 py-2 border-[3px] border-ink bg-white text-xs font-semibold tracking-wider outline-none placeholder:text-ink/30"
        />
        <div className="flex gap-1.5 overflow-x-auto">
          {categoryFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => handleCategoryFilter(f.key)}
              className={`flex-shrink-0 px-2.5 py-1 border-[3px] border-ink text-[10px] font-semibold tracking-wider transition-none ${
                categoryFilter === f.key ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-ink hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="flex-shrink-0 text-[10px] tracking-wider text-ink/40 self-center ml-1">{filtered.length}</span>
        </div>
      </div>

      {/* 瀑布流 */}
      <div className="flex-1 overflow-y-auto pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-xs tracking-widest">加载中…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-xs tracking-wider">
            <p className="mb-2">暂无菜品</p>
            <button onClick={handleOpenAdd} className="border-[3px] border-ink px-3 py-1 text-[10px] font-semibold hover:bg-ink hover:text-white transition-none">添加第一道菜</button>
          </div>
        ) : (
          <>
            <div className="columns-2 md:columns-2 lg:columns-3 gap-2" style={{ columnGap: '0.5rem' }}>
              {visible.map((dish) => (
                <div key={dish.id} className="inline-block w-full mb-2">
                  <DishCard dish={dish} onClick={() => handleOpenEdit(dish)} onDelete={() => setDeleteTarget(dish)} />
                </div>
              ))}
            </div>
            {visibleCount < filtered.length && (
              <button
                onClick={() => setLoadMoreClicks((c) => c + 1)}
                className="w-full py-3 border-[3px] border-ink text-[10px] font-semibold tracking-wider mt-2 bg-white hover:bg-ink hover:text-white transition-none"
              >
                加载更多（{filtered.length - visibleCount} 道）
              </button>
            )}
          </>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleOpenAdd}
        className="fixed bottom-24 right-5 md:bottom-8 md:right-8 w-12 h-12 border-[3px] border-ink bg-white text-ink text-lg font-bold hover:bg-ink hover:text-white transition-none flex items-center justify-center z-40"
      >
        +
      </motion.button>

      <DishEditor dish={editingDish} open={editorOpen} onSave={handleSave} onClose={() => setEditorOpen(false)} />

      {/* 删除确认 */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink/40" onClick={() => setDeleteTarget(null)} />
            <motion.div className="relative bg-white border-[3px] border-ink p-5 mx-4 max-w-xs w-full" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <p className="text-sm font-bold tracking-wider text-center mb-1">删除菜品</p>
              <p className="text-[10px] tracking-wider text-center mb-4">确定要删除「{deleteTarget.name}」吗？</p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 border-[3px] border-ink text-[10px] font-semibold tracking-wider bg-white text-ink hover:bg-ink hover:text-white transition-none">取消</button>
                <button onClick={handleDeleteConfirm} className="flex-1 py-2 border-[3px] border-ink text-[10px] font-semibold tracking-wider bg-ink text-white">删除</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
