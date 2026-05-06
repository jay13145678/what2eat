import { motion } from 'framer-motion'
import type { Dish } from '@/types'

function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    chinese: '中餐', western: '西餐', fast_food: '快餐',
    snack: '小吃', japanese: '日料', korean: '韩餐',
  }
  return map[cat] || cat
}

interface PickCardProps {
  dish: Dish
  index: number
  flipped: boolean
  disabled: boolean
  onFlip: () => void
  durationMultiplier?: number
}

export function PickCard({ dish, index, flipped, disabled, onFlip, durationMultiplier = 1 }: PickCardProps) {
  const offsetPercent = (index - 1) * 80
  const offsetY = index === 1 ? -4 : 4

  return (
    <motion.div
      className="absolute"
      initial={{ y: '100vh', x: `${offsetPercent}%`, rotate: index === 0 ? -10 : index === 2 ? 10 : 0 }}
      animate={{
        y: `${offsetY}vh`,
        x: `${offsetPercent}%`,
        rotate: index === 0 ? -10 : index === 2 ? 10 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: (0.1 + index * 0.08) * durationMultiplier,
      }}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-[30vw] max-w-[130px] aspect-[3/4] cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        onClick={disabled ? undefined : onFlip}
        animate={flipped ? { y: -8, rotateY: 180 } : { y: 0, rotateY: 0 }}
        transition={{ duration: 0.6 * durationMultiplier, ease: 'easeOut' }}
      >
        {/* 牌背：白底 + 黑色十字 */}
        <div
          className="absolute inset-0 bg-white border-[3px] border-ink flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="relative w-8 h-8">
            <div className="absolute bg-ink w-full h-[5px] top-1/2 -translate-y-1/2" />
            <div className="absolute bg-ink h-full w-[5px] left-1/2 -translate-x-1/2" />
          </div>
        </div>

        {/* 牌面：分类 + 菜名 + 简短描述 */}
        <div
          className="absolute inset-0 bg-white border-[3px] border-ink p-4 flex flex-col"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="text-[9px] tracking-widest border-[3px] border-ink px-2 py-0.5 self-start">
            {getCategoryLabel(dish.categoryGroup)}
          </span>
          <h3 className="text-base font-bold leading-tight mt-3 tracking-wide flex-1">
            {dish.name}
          </h3>
          <p className="text-[10px] leading-relaxed pt-2 border-t-[3px] border-ink mt-auto">
            {dish.description.slice(0, 24)}{dish.description.length > 24 ? '…' : ''}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
