import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDishes } from '@/hooks/useDishes'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useFavoriteStore } from '@/store/useFavoriteStore'
import { useBlacklistStore } from '@/store/useBlacklistStore'
import { useAppStore } from '@/store/useAppStore'
import { weightedPick } from '@/utils/random'
import { getDurationMultiplier } from '@/utils/animation'
import { PickCard } from './PickCard'
import type { Dish, CategoryGroup } from '@/types'
import { v4 as uuid } from 'uuid'

type Phase = 'idle' | 'dealing' | 'waiting' | 'revealed'

const categories = [
  { key: 'any', label: '随便' },
  { key: 'one_person', label: '一人食' },
  { key: 'chinese', label: '中餐' },
  { key: 'western', label: '西餐' },
  { key: 'fast_food', label: '快餐' },
  { key: 'snack', label: '小吃' },
] as const

export function RandomTab() {
  const navigate = useNavigate()
  const { dishes, loading } = useDishes()
  const historyStore = useHistoryStore()
  const favoriteStore = useFavoriteStore()
  const blacklistStore = useBlacklistStore()
  const prioritizeFavorites = useAppStore((s) => s.settings.prioritizeFavorites)
  const allowDuplicates = useAppStore((s) => s.settings.allowDuplicates)
  const animationDuration = useAppStore((s) => s.settings.animationDuration)

  const [phase, setPhase] = useState<Phase>('idle')
  const [selectedCategory, setSelectedCategory] = useState<string>('any')
  const [pickedDishes, setPickedDishes] = useState<Dish[]>([])
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null)
  const [recorded, setRecorded] = useState(false)
  const waitingTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (waitingTimeoutRef.current !== null) {
        window.clearTimeout(waitingTimeoutRef.current)
      }
    }
  }, [])

  const handlePick = useCallback(() => {
    if (loading || dishes.length === 0) return

    if (waitingTimeoutRef.current !== null) {
      window.clearTimeout(waitingTimeoutRef.current)
      waitingTimeoutRef.current = null
    }

    let pool = dishes
    if (selectedCategory === 'one_person') {
      pool = dishes.filter((d) => d.tags.includes('一人食'))
    } else if (selectedCategory !== 'any') {
      pool = dishes.filter((d) => d.categoryGroup === selectedCategory)
    }
    pool = pool.filter((d) => !blacklistStore.ids.includes(d.id))
    if (!allowDuplicates) {
      const recent = new Set(historyStore.entries.map((e) => e.dishId))
      pool = pool.filter((d) => !recent.has(d.id))
    }

    if (pool.length === 0) return

    const recentIds = historyStore.entries.map((e) => e.dishId)
    const favIds = favoriteStore.ids
    const result = weightedPick(pool, recentIds, favIds, prioritizeFavorites)

    if (!result) return

    setPickedDishes([result.primary, ...result.alternatives])
    setFlippedIndex(null)
    setRecorded(false)
    const durMul = getDurationMultiplier(animationDuration)
    setPhase('dealing')
    waitingTimeoutRef.current = window.setTimeout(() => {
      setPhase('waiting')
      waitingTimeoutRef.current = null
    }, Math.round(600 * durMul))
  }, [dishes, loading, selectedCategory, blacklistStore.ids, historyStore.entries, favoriteStore.ids, prioritizeFavorites, allowDuplicates, animationDuration])

  const handleFlip = useCallback((index: number) => {
    if (flippedIndex !== null) return
    setFlippedIndex(index)
    setPhase('revealed')

    if (!recorded) {
      const dish = pickedDishes[index]
      const isCategoryFilter = selectedCategory !== 'any' && selectedCategory !== 'one_person'
      historyStore.addEntry({
        id: uuid(),
        dishId: dish.id,
        dishName: dish.name,
        cuisineName: dish.cuisine,
        pickedAt: Date.now(),
        filters: isCategoryFilter ? {
          categoryGroup: selectedCategory as CategoryGroup,
          cuisines: [],
          mealTypes: [],
          spiceLevels: [],
          priceRanges: [],
          isVegetarian: null,
        } : selectedCategory === 'one_person' ? {
          categoryGroup: null,
          cuisines: [],
          mealTypes: [],
          spiceLevels: [],
          priceRanges: [],
          isVegetarian: null,
        } : null,
        rating: null,
      })
      setRecorded(true)
    }
  }, [flippedIndex, recorded, pickedDishes, historyStore, selectedCategory])

  const handleReset = useCallback(() => {
    if (waitingTimeoutRef.current !== null) {
      window.clearTimeout(waitingTimeoutRef.current)
      waitingTimeoutRef.current = null
    }
    setPhase('idle')
    setPickedDishes([])
    setFlippedIndex(null)
    setRecorded(false)
  }, [])

  const flippedDish = flippedIndex !== null ? pickedDishes[flippedIndex] : null

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink/50">
        加载菜品数据...
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center">
      {phase === 'idle' ? (
        <>
          {/* 分类选择 */}
          <div className="flex gap-2 overflow-x-auto w-full pb-2 flex-shrink-0 px-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex-shrink-0 px-4 py-2.5 border-[3px] border-ink text-sm font-semibold tracking-wider transition-none ${
                  selectedCategory === cat.key
                    ? 'bg-ink text-white'
                    : 'bg-white text-ink hover:bg-ink hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 大按钮 */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePick}
              className="w-32 h-32 border-[3px] border-ink bg-white text-ink text-base font-bold tracking-widest hover:bg-ink hover:text-white transition-none flex items-center justify-center"
            >
              选一个
            </motion.button>
            <p className="text-[11px] tracking-wider mt-6">让命运决定</p>
          </div>
        </>
      ) : (
        /* 牌桌 */
        <div className="flex-1 relative w-full flex items-center justify-center">
          {pickedDishes.map((dish, i) => (
            <PickCard
              key={dish.id}
              dish={dish}
              index={i}
              flipped={flippedIndex === i}
              disabled={flippedIndex !== null}
              onFlip={() => handleFlip(i)}
              durationMultiplier={getDurationMultiplier(animationDuration)}
            />
          ))}

          {phase === 'waiting' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-8 text-ink/50 text-xs tracking-widest"
            >
              选一张翻牌
            </motion.p>
          )}

          {phase === 'revealed' && flippedDish && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-4 inset-x-0 flex flex-col items-center gap-2 px-4"
            >
              {/* 操作按钮 */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 border-[3px] border-ink text-[10px] font-semibold tracking-wider bg-white hover:bg-ink hover:text-white transition-none"
                >
                  重新选
                </button>
                <button
                  onClick={() => favoriteStore.toggle(flippedDish.id)}
                  className={`px-3 py-1.5 border-[3px] border-ink text-[10px] font-semibold tracking-wider transition-none ${
                    favoriteStore.isFavorite(flippedDish.id) ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-ink hover:text-white'
                  }`}
                >
                  {favoriteStore.isFavorite(flippedDish.id) ? '已收藏' : '收藏'}
                </button>
                <button
                  onClick={() => blacklistStore.toggle(flippedDish.id)}
                  className={`px-3 py-1.5 border-[3px] border-ink text-[10px] font-semibold tracking-wider transition-none ${
                    blacklistStore.isBlacklisted(flippedDish.id) ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-ink hover:text-white'
                  }`}
                >
                  {blacklistStore.isBlacklisted(flippedDish.id) ? '已拉黑' : '不喜欢'}
                </button>
                <button
                  onClick={() => navigate(`/dish/${flippedDish.id}`)}
                  className="px-3 py-1.5 border-[3px] border-ink text-[10px] font-semibold tracking-wider bg-white hover:bg-ink hover:text-white transition-none"
                >
                  详情
                </button>
              </div>

              {/* 备选提示 */}
              {pickedDishes.length === 3 && (
                <p className="text-[9px] tracking-wider mt-1">
                  {flippedIndex === 0
                    ? `备选：${pickedDishes[1]?.name} ／ ${pickedDishes[2]?.name}`
                    : `主推荐：${pickedDishes[0]?.name}`}
                </p>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
