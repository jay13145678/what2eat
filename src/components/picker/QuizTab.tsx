import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useDishes } from '@/hooks/useDishes'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useFavoriteStore } from '@/store/useFavoriteStore'
import { useBlacklistStore } from '@/store/useBlacklistStore'
import { useAppStore } from '@/store/useAppStore'
import { filterDishes } from '@/utils/filter'
import { weightedPick } from '@/utils/random'
import { getDurationMultiplier } from '@/utils/animation'
import { FoodCanvas } from '@/components/settings/FoodCanvas'
import type { Dish, MealType, PriceRange, SpiceLevel, FilterState } from '@/types'
import { v4 as uuid } from 'uuid'

type Phase = 'welcome' | 'questions' | 'ready' | 'result'

interface Answers {
  mealType: MealType | null
  priceRange: PriceRange | null
  spiceLevel: SpiceLevel | null
  isVegetarian: boolean | null
}

const STEPS = [
  {
    key: 'mealType' as const,
    question: '什么时候吃？',
    options: [
      { value: 'breakfast', label: '早餐' },
      { value: 'lunch', label: '午餐' },
      { value: 'dinner', label: '晚餐' },
      { value: 'late_night', label: '宵夜' },
    ],
  },
  {
    key: 'priceRange' as const,
    question: '预算多少？',
    options: [
      { value: 1, label: '随便吃吃' },
      { value: 2, label: '正常' },
      { value: 3, label: '今天吃好点' },
    ],
  },
  {
    key: 'spiceLevel' as const,
    question: '吃辣吗？',
    options: [
      { value: 0, label: '不辣' },
      { value: 1, label: '微辣' },
      { value: 2, label: '中辣' },
      { value: 3, label: '无辣不欢' },
    ],
  },
  {
    key: 'isVegetarian' as const,
    question: '吃荤吃素？',
    options: [
      { value: false, label: '吃肉' },
      { value: true, label: '吃素' },
      { value: null, label: '都可以' },
    ],
  },
]

function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    chinese: '中餐', western: '西餐', fast_food: '快餐',
    snack: '小吃', sichuan: '川菜', cantonese: '粤菜',
    japanese: '日料', korean: '韩餐',
  }
  return map[cat] || cat
}

export function QuizTab() {
  const navigate = useNavigate()
  const { dishes, loading } = useDishes()
  const historyStore = useHistoryStore()
  const favoriteStore = useFavoriteStore()
  const blacklistStore = useBlacklistStore()
  const prioritizeFavorites = useAppStore((s) => s.settings.prioritizeFavorites)
  const allowDuplicates = useAppStore((s) => s.settings.allowDuplicates)
  const animationDuration = useAppStore((s) => s.settings.animationDuration)

  const [phase, setPhase] = useState<Phase>('welcome')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({
    mealType: null, priceRange: null, spiceLevel: null, isVegetarian: null,
  })
  const [resultDish, setResultDish] = useState<Dish | null>(null)
  const revealTimeoutRef = useRef<number | null>(null)
  const durMul = getDurationMultiplier(animationDuration)

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current !== null) {
        window.clearTimeout(revealTimeoutRef.current)
      }
    }
  }, [])

  const handleSelect = (key: keyof Answers, value: MealType | PriceRange | SpiceLevel | boolean | null) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      handleReveal()
    }
  }

  const handleReveal = () => {
    if (revealTimeoutRef.current !== null) {
      window.clearTimeout(revealTimeoutRef.current)
      revealTimeoutRef.current = null
    }

    const filters: FilterState[] = [
      // 全部条件
      {
        categoryGroup: null, cuisines: [],
        mealTypes: answers.mealType ? [answers.mealType] : [],
        spiceLevels: answers.spiceLevel !== null ? [answers.spiceLevel] : [],
        priceRanges: answers.priceRange !== null ? [answers.priceRange] : [],
        isVegetarian: answers.isVegetarian,
      },
      // 去掉素食
      {
        categoryGroup: null, cuisines: [],
        mealTypes: answers.mealType ? [answers.mealType] : [],
        spiceLevels: answers.spiceLevel !== null ? [answers.spiceLevel] : [],
        priceRanges: answers.priceRange !== null ? [answers.priceRange] : [],
        isVegetarian: null,
      },
      // 去掉素食 + 辣度
      {
        categoryGroup: null, cuisines: [],
        mealTypes: answers.mealType ? [answers.mealType] : [],
        spiceLevels: [],
        priceRanges: answers.priceRange !== null ? [answers.priceRange] : [],
        isVegetarian: null,
      },
      // 去掉素食 + 辣度 + 价格
      {
        categoryGroup: null, cuisines: [],
        mealTypes: answers.mealType ? [answers.mealType] : [],
        spiceLevels: [],
        priceRanges: [],
        isVegetarian: null,
      },
      // 全去掉
      {
        categoryGroup: null, cuisines: [],
        mealTypes: [], spiceLevels: [],
        priceRanges: [], isVegetarian: null,
      },
    ]

    let dish: Dish | null = null
    const historyIds = historyStore.entries.map((e) => e.dishId)
    for (const f of filters) {
      let pool = filterDishes(dishes, f)
      pool = pool.filter((d) => !blacklistStore.ids.includes(d.id))
      if (!allowDuplicates) {
        const recent = new Set(historyIds)
        pool = pool.filter((d) => !recent.has(d.id))
      }
      if (pool.length === 0) continue
      const result = weightedPick(
        pool, historyIds, favoriteStore.ids, prioritizeFavorites,
      )
      if (result) { dish = result.primary; break }
    }

    if (!dish) return

    setResultDish(dish)
    setPhase('ready')

    const durMul = getDurationMultiplier(animationDuration)
    const appliedFilter: FilterState = {
      categoryGroup: null, cuisines: [],
      mealTypes: answers.mealType ? [answers.mealType] : [],
      spiceLevels: answers.spiceLevel !== null ? [answers.spiceLevel] : [],
      priceRanges: answers.priceRange !== null ? [answers.priceRange] : [],
      isVegetarian: answers.isVegetarian,
    }

    revealTimeoutRef.current = window.setTimeout(() => {
      setPhase('result')
      historyStore.addEntry({
        id: uuid(), dishId: dish.id, dishName: dish.name,
        cuisineName: dish.cuisine, pickedAt: Date.now(),
        filters: appliedFilter, rating: null,
      })
      revealTimeoutRef.current = null
    }, Math.round(800 * durMul))
  }

  const handleReset = () => {
    if (revealTimeoutRef.current !== null) {
      window.clearTimeout(revealTimeoutRef.current)
      revealTimeoutRef.current = null
    }
    setPhase('welcome')
    setStep(0)
    setAnswers({ mealType: null, priceRange: null, spiceLevel: null, isVegetarian: null })
    setResultDish(null)
  }

  const canProceed = () => {
    const key = STEPS[step].key
    const val = answers[key]
    if (key === 'isVegetarian') return true // null is valid for "都可以"
    return val !== null
  }

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-xs tracking-widest">加载中…</div>
  }

  /* ─── 结果页 ─── */
  if (phase === 'ready' || phase === 'result') {
    const dish = resultDish
    if (!dish) return null

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {phase === 'ready' ? (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2 * durMul, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-[3px] border-ink border-t-transparent mx-auto mb-4"
            />
            <p className="text-xs tracking-widest">帮你筛选中…</p>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center w-full flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mb-5"
            >
              <FoodCanvas categoryGroup={dish.categoryGroup} size={96} />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * durMul }}
              className="text-2xl font-bold tracking-tight mb-2"
            >
              {dish.name}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 * durMul }}
              className="flex items-center gap-2 mb-3"
            >
              <span className="text-[10px] font-semibold tracking-wider border-[3px] border-ink px-2 py-0.5">
                {getCategoryLabel(dish.cuisine)}
              </span>
              <span className="text-[10px] tracking-wider opacity-50">
                {'•'.repeat(dish.spiceLevel)}{' '}{'¥'.repeat(dish.priceRange)}
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 * durMul }}
              className="text-xs leading-relaxed tracking-wider opacity-60 max-w-[280px] mb-8"
            >
              {dish.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 * durMul }}
              className="flex items-center gap-1.5 flex-wrap justify-center"
            >
              <button onClick={handleReset} className="px-3 py-1.5 border-[3px] border-ink text-[10px] font-semibold tracking-wider bg-white hover:bg-ink hover:text-white transition-none">
                重新选
              </button>
              <button onClick={() => favoriteStore.toggle(dish.id)}
                className={`px-3 py-1.5 border-[3px] border-ink text-[10px] font-semibold tracking-wider transition-none ${favoriteStore.isFavorite(dish.id) ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-ink hover:text-white'}`}>
                {favoriteStore.isFavorite(dish.id) ? '已收藏' : '收藏'}
              </button>
              <button onClick={() => blacklistStore.toggle(dish.id)}
                className={`px-3 py-1.5 border-[3px] border-ink text-[10px] font-semibold tracking-wider transition-none ${blacklistStore.isBlacklisted(dish.id) ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-ink hover:text-white'}`}>
                {blacklistStore.isBlacklisted(dish.id) ? '已拉黑' : '不喜欢'}
              </button>
              <button onClick={() => navigate(`/dish/${dish.id}`)} className="px-3 py-1.5 border-[3px] border-ink text-[10px] font-semibold tracking-wider bg-white hover:bg-ink hover:text-white transition-none">
                详情
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    )
  }

  /* ─── 问答 ─── */
  if (phase === 'questions') {
    const stepData = STEPS[step]
    const currentAnswers = answers[stepData.key]

    return (
      <div className="flex-1 flex flex-col px-4">
        {/* 进度 */}
        <div className="flex gap-1 py-5">
          {STEPS.map((_, i) => (
            <div key={i} className={`flex-1 h-[6px] border-[3px] border-ink ${i < step ? 'bg-ink' : 'bg-white'} ${i === step ? 'shadow-[0_0_0_3px_#1A1A1A]' : ''}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 * durMul }}
            className="flex-1 flex flex-col"
          >
            <div className="text-center mb-8 mt-4">
              <h3 className="text-lg font-bold tracking-tight leading-relaxed">{stepData.question}</h3>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              {stepData.options.map((opt: { value: unknown; label: string }) => {
                const isSelected = currentAnswers === opt.value || (opt.value === null && currentAnswers === null)
                return (
                  <button
                    key={String(opt.value)}
                    onClick={() => handleSelect(stepData.key, opt.value as MealType | PriceRange | SpiceLevel | boolean | null)}
                    className={`w-full py-3.5 border-[3px] border-ink text-sm font-semibold tracking-wider transition-none ${
                      isSelected ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-ink hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t-[3px] border-ink">
              <button onClick={() => step > 0 ? setStep((s) => s - 1) : setPhase('welcome')}
                className="text-[11px] font-semibold tracking-wider bg-none border-none cursor-pointer">
                ← {step > 0 ? '上一步' : '返回'}
              </button>
              <button onClick={handleNext} disabled={!canProceed()}
                className={`px-6 py-2.5 text-[11px] font-semibold tracking-wider border-[3px] border-ink transition-none ${
                  canProceed() ? 'bg-ink text-white' : 'bg-white text-ink opacity-40'
                }`}>
                {step < STEPS.length - 1 ? '下一步 →' : '看看结果 →'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  /* ─── 欢迎页 ─── */
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <svg viewBox="0 0 64 64" fill="none" stroke="#1A1A1A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 mx-auto">
          <path d="M18 32 Q18 54 32 54 Q46 54 46 32" />
          <line x1="10" y1="32" x2="54" y2="32" />
          <line x1="28" y1="20" x2="26" y2="46" strokeWidth="3" />
          <line x1="36" y1="20" x2="38" y2="46" strokeWidth="3" />
        </svg>
        <h2 className="text-xl font-bold tracking-tighter mt-5 mb-3">今天吃什么</h2>
        <p className="text-[11px] leading-[2] tracking-wider mb-8">回答几个问题<br />让命运帮你决定</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setPhase('questions')}
          className="bg-ink text-white font-bold px-10 py-3.5 text-[13px] tracking-[0.2em] border-[3px] border-ink"
        >
          开始
        </motion.button>
      </motion.div>
    </div>
  )
}
