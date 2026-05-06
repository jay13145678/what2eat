import { openDB, type IDBPDatabase } from 'idb'
import type { Dish } from '../types'
import dishesData from '../data/dishes.json'

const DB_NAME = 'what2eat'
const DB_VERSION = 3

let dbPromise: Promise<IDBPDatabase> | null = null

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const dishStore = db.createObjectStore('dishes', { keyPath: 'id' })
          dishStore.createIndex('cuisine', 'cuisine')
          dishStore.createIndex('categoryGroup', 'categoryGroup')
        }
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' })
          }
          if (!db.objectStoreNames.contains('favorites')) {
            db.createObjectStore('favorites', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('blacklist')) {
            db.createObjectStore('blacklist', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('history')) {
            db.createObjectStore('history', { keyPath: 'id' })
          }
        }
        if (oldVersion < 3) {
          // 刷新菜品数据（清空后 seedDishes 会重新写入）
        }
      },
    })
  }
  return dbPromise
}

export async function seedDishes(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('dishes', 'readwrite')
  for (const dish of dishesData as Dish[]) {
    const existing = await tx.store.get(dish.id)
    if (!existing) {
      await tx.store.put(dish)
    }
  }
  await tx.done
}

export async function getAllDishes(): Promise<Dish[]> {
  const db = await getDB()
  return db.getAll('dishes')
}

export async function getDish(id: string): Promise<Dish | undefined> {
  const db = await getDB()
  return db.get('dishes', id)
}

export async function putDish(dish: Dish): Promise<void> {
  const db = await getDB()
  await db.put('dishes', dish)
}

export async function deleteDish(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('dishes', id)
}
