import { create } from 'zustand'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

interface FoodItem {
  id: string
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  portion_size?: string
  meal_type?: string
  created_at: string
  logged_date: string
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
  isLoading: boolean
  addFood: (food: { food_name: string; calories: number; protein: number; carbs: number; fat: number; portion_size?: string; meal_type?: string }) => Promise<void>
  removeFood: (id: string) => Promise<void>
  updateGoals: (goals: Partial<NutritionGoals>) => void
  getTodaysTotals: () => { calories: number; protein: number; carbs: number; fat: number }
  loadTodaysFoods: () => Promise<void>
  clearDay: () => Promise<void>
}

export const useNutrition = create<NutritionState>()((set, get) => ({
  dailyFoods: [],
  goals: {
    calories: 2200,
    protein: 120,
    carbs: 250,
    fat: 80
  },
  isLoading: false,

  addFood: async (foodData) => {
    // Use mock auth system instead of Supabase auth
    const mockUserId = '1' // Use the same mock user ID from useAuth.ts

    set({ isLoading: true })
    
    try {
      const { data, error } = await supabase
        .from('food_entries')
        .insert({
          user_id: mockUserId,
          food_name: foodData.food_name,
          calories: foodData.calories,
          protein: foodData.protein,
          carbs: foodData.carbs,
          fat: foodData.fat,
          portion_size: foodData.portion_size,
          meal_type: foodData.meal_type,
          logged_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single()

      if (error) throw error

      const { dailyFoods } = get()
      set({ 
        dailyFoods: [data, ...dailyFoods],
        isLoading: false 
      })
    } catch (error) {
      console.error('Error adding food:', error)
      set({ isLoading: false })
      throw error
    }
  },

  removeFood: async (id) => {
    set({ isLoading: true })
    
    try {
      const { error } = await supabase
        .from('food_entries')
        .delete()
        .eq('id', id)

      if (error) throw error

      const { dailyFoods } = get()
      set({ 
        dailyFoods: dailyFoods.filter(food => food.id !== id),
        isLoading: false 
      })
    } catch (error) {
      console.error('Error removing food:', error)
      set({ isLoading: false })
      throw error
    }
  },

  updateGoals: (newGoals) => {
    const { goals } = get()
    set({ goals: { ...goals, ...newGoals } })
  },

  loadTodaysFoods: async () => {
    // Use mock auth system
    const mockUserId = '1'

    set({ isLoading: true })
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', mockUserId)
        .eq('logged_date', today)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ 
        dailyFoods: data || [],
        isLoading: false 
      })
    } catch (error) {
      console.error('Error loading foods:', error)
      set({ isLoading: false })
    }
  },

  getTodaysTotals: () => {
    const { dailyFoods } = get()
    
    return dailyFoods.reduce(
      (totals, food) => ({
        calories: totals.calories + Number(food.calories),
        protein: totals.protein + Number(food.protein),
        carbs: totals.carbs + Number(food.carbs),
        fat: totals.fat + Number(food.fat)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  },

  clearDay: async () => {
    // Use mock auth system
    const mockUserId = '1'

    set({ isLoading: true })
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const { error } = await supabase
        .from('food_entries')
        .delete()
        .eq('user_id', mockUserId)
        .eq('logged_date', today)

      if (error) throw error

      set({ 
        dailyFoods: [],
        isLoading: false 
      })
    } catch (error) {
      console.error('Error clearing day:', error)
      set({ isLoading: false })
    }
  }
}))