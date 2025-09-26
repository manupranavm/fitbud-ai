import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

interface EquipmentWorkout {
  id: string
  plan_name: string
  equipment_list: string[]
  workout_plan: any
  created_at: string
  updated_at: string
}

export const useEquipmentWorkouts = () => {
  const [workouts, setWorkouts] = useState<EquipmentWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchWorkouts = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('equipment_workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWorkouts(data || [])
    } catch (error) {
      console.error('Error fetching equipment workouts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLatestWorkout = (): EquipmentWorkout | null => {
    return workouts.length > 0 ? workouts[0] : null
  }

  const getTodaysWorkout = () => {
    const latest = getLatestWorkout()
    const planRoot = latest?.workout_plan
    if (!planRoot) return null

    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const todayName = dayNames[dayOfWeek]

    // Support shape A: { plan: { days: [{ day: 'Monday', exercises: [...] }], difficulty } }
    const planDays = planRoot?.plan?.days
    if (Array.isArray(planDays)) {
      const todaysWorkout = planDays.find((day: any) =>
        (day.day || day.name || '').toLowerCase() === todayName.toLowerCase()
      )
      if (todaysWorkout && todaysWorkout.exercises?.length > 0) {
        return {
          name: todaysWorkout.focus || todaysWorkout.name || `${todayName} Workout`,
          exercises: todaysWorkout.exercises.map((ex: any) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            completed: false
          })),
          duration: 45,
          difficulty: planRoot?.plan?.difficulty || 'Intermediate'
        }
      }
    }

    // Support shape B: { weekPlan: { Monday: { focus, exercises: [...] }, ... }, difficulty }
    const weekPlan = planRoot?.weekPlan
    if (weekPlan && typeof weekPlan === 'object') {
      // Try exact key, then case-insensitive match
      let dayPlan = weekPlan[todayName] || weekPlan[todayName.toLowerCase()] || weekPlan[todayName.toUpperCase()]
      if (!dayPlan) {
        const key = Object.keys(weekPlan).find(k => k.toLowerCase() === todayName.toLowerCase())
        if (key) dayPlan = weekPlan[key]
      }
      if (dayPlan && Array.isArray(dayPlan.exercises) && dayPlan.exercises.length > 0) {
        return {
          name: dayPlan.focus || dayPlan.name || `${todayName} Workout`,
          exercises: dayPlan.exercises.map((ex: any) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            completed: false
          })),
          duration: 45,
          difficulty: planRoot?.difficulty || planRoot?.plan?.difficulty || 'Intermediate'
        }
      }
    }

    return null
  }

  useEffect(() => {
    fetchWorkouts()
  }, [user])

  return {
    workouts,
    loading,
    fetchWorkouts,
    getLatestWorkout,
    getTodaysWorkout
  }
}