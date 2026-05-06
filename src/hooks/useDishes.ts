import { useEffect, useState } from 'react'
import { seedDishes, getAllDishes } from '../db'
import type { Dish } from '../types'

export function useDishes() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await seedDishes()
      if (cancelled) return
      const all = await getAllDishes()
      if (!cancelled) {
        setDishes(all)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return { dishes, loading }
}
