import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getDish } from '@/db'
import { useFavoriteStore } from '@/store/useFavoriteStore'
import { useBlacklistStore } from '@/store/useBlacklistStore'
import { FoodCanvas } from '@/components/settings/FoodCanvas'
import type { Dish } from '@/types'

const cuisineLabels: Record<string, string> = {
  sichuan: '川菜', cantonese: '粤菜', hunan: '湘菜', shandong: '鲁菜',
  jiangsu: '苏菜', zhejiang: '浙菜', fujian: '闽菜', anhui: '徽菜',
  beijing: '北京菜', shanghai: '上海菜', northeast: '东北菜', northwest: '西北菜',
  western: '西餐', japanese: '日料', korean: '韩餐', fast_food: '快餐',
  snack: '小吃', hotpot: '火锅', barbecue: '烧烤', dessert: '甜品',
}

const mealTypeLabels: Record<string, string> = {
  breakfast: '早餐', lunch: '午餐', dinner: '晚餐',
  late_night: '宵夜', afternoon_tea: '下午茶',
}

const flavorLabels: Record<string, string> = {
  spicy: '辣度', sweet: '甜度', sour: '酸度', salty: '咸度', umami: '鲜度',
}

export default function DishDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dish, setDish] = useState<Dish | null>(null)
  const [loading, setLoading] = useState(true)
  const favoriteStore = useFavoriteStore()
  const blacklistStore = useBlacklistStore()

  useEffect(() => {
    if (!id) return
    getDish(id).then((d) => { setDish(d || null); setLoading(false) })
  }, [id])

  if (loading) return <div className="flex-1 flex items-center justify-center text-xs tracking-widest">加载中…</div>

  if (!dish) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-xs tracking-wider">未找到该菜品</p>
        <button onClick={() => navigate(-1)} className="border-[3px] border-ink px-3 py-1 text-[10px] font-semibold hover:bg-ink hover:text-white transition-none">返回</button>
      </div>
    )
  }

  const maxFlavor = 5

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* 顶部图片区 */}
      <div className="relative w-full aspect-[4/3] bg-white border-b-[3px] border-ink flex items-center justify-center overflow-hidden">
        <FoodCanvas categoryGroup={dish.categoryGroup} size={256} />

        {/* 返回 + 操作 */}
        <div className="absolute top-3 left-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 border-[3px] border-ink bg-white flex items-center justify-center text-xs font-bold hover:bg-ink hover:text-white transition-none">←</button>
        </div>
        <div className="absolute top-3 right-3 flex gap-1.5">
          <button onClick={() => favoriteStore.toggle(dish.id)}
            className={`w-8 h-8 border-[3px] border-ink flex items-center justify-center text-xs font-bold transition-none ${
              favoriteStore.isFavorite(dish.id) ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-ink hover:text-white'
            }`}>
            {favoriteStore.isFavorite(dish.id) ? '*' : '☆'}
          </button>
          <button onClick={() => blacklistStore.toggle(dish.id)}
            className={`w-8 h-8 border-[3px] border-ink flex items-center justify-center text-xs font-bold transition-none ${
              blacklistStore.isBlacklisted(dish.id) ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-ink hover:text-white'
            }`}>
            {blacklistStore.isBlacklisted(dish.id) ? '✕' : '○'}
          </button>
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1 px-4 pt-4 pb-8 space-y-5">
        {/* 菜名 + 分类 */}
        <div>
          <h1 className="text-xl font-bold tracking-wide">{dish.name}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-semibold tracking-wider border-[3px] border-ink px-2 py-0.5">{cuisineLabels[dish.cuisine] || dish.cuisine}</span>
            <span className="text-[10px] tracking-wider text-ink/50">{dish.calories} kcal</span>
          </div>
        </div>

        {dish.description && <p className="text-xs leading-relaxed tracking-wider">{dish.description}</p>}

        {/* 口味评分 */}
        <div>
          <h3 className="text-[10px] font-bold tracking-widest mb-2">口味评分</h3>
          <div className="border-[3px] border-ink p-4 space-y-2">
            {(Object.entries(flavorLabels) as [keyof typeof dish.flavorProfile, string][]).map(([key, label]) => {
              const value = dish.flavorProfile[key]
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-[10px] tracking-wider w-6 text-right">{label}</span>
                  <div className="flex-1 h-3 border-[3px] border-ink bg-white overflow-hidden">
                    <div className="h-full bg-ink transition-all" style={{ width: `${(value / maxFlavor) * 100}%` }} />
                  </div>
                  <span className="text-[10px] tracking-wider w-4 text-right">{value}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 信息网格 */}
        <div>
          <h3 className="text-[10px] font-bold tracking-widest mb-2">详细信息</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="border-[3px] border-ink p-3">
              <span className="text-[8px] tracking-widest text-ink/50">辣度</span>
              <p className="text-xs font-bold tracking-wider mt-0.5">{dish.spiceLevel === 0 ? '不辣' : '•'.repeat(dish.spiceLevel)}</p>
            </div>
            <div className="border-[3px] border-ink p-3">
              <span className="text-[8px] tracking-widest text-ink/50">价格</span>
              <p className="text-xs font-bold tracking-wider mt-0.5">{'¥'.repeat(dish.priceRange)}</p>
            </div>
            <div className="border-[3px] border-ink p-3">
              <span className="text-[8px] tracking-widest text-ink/50">素食</span>
              <p className="text-xs font-bold tracking-wider mt-0.5">{dish.isVegetarian ? '是' : '否'}</p>
            </div>
            <div className="border-[3px] border-ink p-3">
              <span className="text-[8px] tracking-widest text-ink/50">热量</span>
              <p className="text-xs font-bold tracking-wider mt-0.5">{dish.calories} kcal</p>
            </div>
          </div>
        </div>

        {/* 适合时段 */}
        <div>
          <h3 className="text-[10px] font-bold tracking-widest mb-2">适合时段</h3>
          <div className="flex flex-wrap gap-1.5">
            {dish.mealTypes.map((mt) => (
              <span key={mt} className="px-2.5 py-1 border-[3px] border-ink text-[10px] font-semibold tracking-wider">{mealTypeLabels[mt] || mt}</span>
            ))}
          </div>
        </div>

        {/* 标签 */}
        {dish.tags.length > 0 && (
          <div>
            <h3 className="text-[10px] font-bold tracking-widest mb-2">标签</h3>
            <div className="flex flex-wrap gap-1.5">
              {dish.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 border-[3px] border-ink text-[10px] font-semibold tracking-wider">#{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
