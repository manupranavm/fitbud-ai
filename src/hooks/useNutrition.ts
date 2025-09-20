import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FoodItem {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  time: string
  date: string
}

interface NutritionGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface NutritionState {
  dailyFoods: FoodItem[]
  goals: NutritionGoals
  addFood: (food: Omit<FoodItem, 'id' | 'time' | 'date'>) => void
  removeFood: (id: string) => void
  updateGoals: (goals: Partial<NutritionGoals>) => void
  getTodaysTotals: () => { calories: number; protein: number; carbs: number; fat: number }
  clearDay: () => void
}

export const useNutrition = create<NutritionState>()(
  persist(
    (set, get) => ({
      dailyFoods: [],
      goals: {
        calories: 2200,
        protein: 120,
        carbs: 250,
        fat: 80
      },

      addFood: (foodData) => {
        const food: FoodItem = {
          ...foodData,
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString(),
          date: new Date().toDateString()
        }
        
        const { dailyFoods } = get()
        set({ dailyFoods: [food, ...dailyFoods] })
      },

      removeFood: (id) => {
        const { dailyFoods } = get()
        set({ dailyFoods: dailyFoods.filter(food => food.id !== id) })
      },

      updateGoals: (newGoals) => {
        const { goals } = get()
        set({ goals: { ...goals, ...newGoals } })
      },

      getTodaysTotals: () => {
        const { dailyFoods } = get()
        const today = new Date().toDateString()
        const todaysFoods = dailyFoods.filter(food => food.date === today)
        
        return todaysFoods.reduce(
          (totals, food) => ({
            calories: totals.calories + food.calories,
            protein: totals.protein + food.protein,
            carbs: totals.carbs + food.carbs,
            fat: totals.fat + food.fat
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        )
      },

      clearDay: () => {
        const { dailyFoods } = get()
        const today = new Date().toDateString()
        set({ 
          dailyFoods: dailyFoods.filter(food => food.date !== today) 
        })
      }
    }),
    {
      name: 'nutrition-storage',
    }
  )
)