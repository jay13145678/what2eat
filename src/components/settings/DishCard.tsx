import type { Dish } from '@/types'
import { FoodCanvas } from './FoodCanvas'

interface DishCardProps {
  dish: Dish
  onClick: () => void
  onDelete: () => void
}

const cuisineLabels: Record<string, string> = {
  sichuan: '川菜', cantonese: '粤菜', hunan: '湘菜', shandong: '鲁菜',
  jiangsu: '苏菜', zhejiang: '浙菜', fujian: '闽菜', anhui: '徽菜',
  beijing: '北京', shanghai: '上海', northeast: '东北', northwest: '西北',
  western: '西餐', japanese: '日料', korean: '韩餐', fast_food: '快餐',
  snack: '小吃', hotpot: '火锅', barbecue: '烧烤', dessert: '甜品',
}

export function DishCard({ dish, onClick, onDelete }: DishCardProps) {
  return (
    <div
      className="bg-white border-[3px] border-ink p-3 mb-2 cursor-pointer hover:bg-ink hover:text-white transition-none"
      onClick={onClick}
      onContextMenu={(e) => { e.preventDefault(); onDelete() }}
    >
      <div className="w-full aspect-square bg-white border-[3px] border-ink flex items-center justify-center mb-2 overflow-hidden">
        <FoodCanvas categoryGroup={dish.categoryGroup} />
      </div>
      <h3 className="font-bold text-sm tracking-tight leading-tight mb-1.5">{dish.name}</h3>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[10px] font-semibold tracking-wider border-[3px] border-ink px-1.5 py-0.5">{cuisineLabels[dish.cuisine] || dish.cuisine}</span>
        <span className="text-[9px] tracking-wider opacity-50">{'•'.repeat(dish.spiceLevel)}</span>
        <span className="text-[9px] tracking-wider opacity-50">{'¥'.repeat(dish.priceRange)}</span>
        {dish.isVegetarian && <span className="text-[9px] tracking-wider opacity-50">V</span>}
      </div>
      {dish.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {dish.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 border border-ink tracking-wider">{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}
