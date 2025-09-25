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
  loadHistoricalData: (startDate: string, endDate: string) => Promise<FoodItem[]>
  getDailyTotalsForDateRange: (startDate: string, endDate: string) => Promise<{ date: string; calories: number; protein: number; carbs: number; fat: number; meals: number }[]>
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    set({ isLoading: true })
    
    try {
      const { data, error } = await supabase
        .from('food_entries')
        .insert({
          user_id: user.id,
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    set({ isLoading: true })
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', user.id)
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    set({ isLoading: true })
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const { error } = await supabase
        .from('food_entries')
        .delete()
        .eq('user_id', user.id)
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
  },

  loadHistoricalData: async (startDate, endDate) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    try {
      const { data, error } = await supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_date', startDate)
        .lte('logged_date', endDate)
        .order('logged_date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error loading historical data:', error)
      return []
    }
  },

  getDailyTotalsForDateRange: async (startDate, endDate) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    try {
      const { data, error } = await supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_date', startDate)
        .lte('logged_date', endDate)
        .order('logged_date', { ascending: false })

      if (error) throw error

      // Group by date and calculate totals
      const dailyTotals = (data || []).reduce((acc, food) => {
        const date = food.logged_date
        if (!acc[date]) {
          acc[date] = {
            date,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            meals: 0
          }
        }
        acc[date].calories += Number(food.calories)
        acc[date].protein += Number(food.protein)
        acc[date].carbs += Number(food.carbs)
        acc[date].fat += Number(food.fat)
        acc[date].meals += 1
        return acc
      }, {} as Record<string, any>)

      return Object.values(dailyTotals)
    } catch (error) {
      console.error('Error loading daily totals:', error)
      return []
    }
  }
}))