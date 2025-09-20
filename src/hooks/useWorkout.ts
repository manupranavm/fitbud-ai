import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WorkoutExercise {
  name: string
  sets: number
  reps: number
  completed: boolean
  weight?: number
}

interface Workout {
  id: string
  name: string
  exercises: WorkoutExercise[]
  duration: number
  difficulty: string
  completed: boolean
  date: string
}

interface WorkoutState {
  currentWorkout: Workout | null
  workoutHistory: Workout[]
  totalWorkouts: number
  totalCaloriesBurned: number
  currentStreak: number
  startWorkout: (workout: Partial<Workout>) => void
  completeExercise: (exerciseName: string) => void
  completeWorkout: () => void
  addWorkoutToHistory: (workout: Workout) => void
  updateStats: (calories: number) => void
}

export const useWorkout = create<WorkoutState>()(
  persist(
    (set, get) => ({
      currentWorkout: null,
      workoutHistory: [],
      totalWorkouts: 0,
      totalCaloriesBurned: 0,
      currentStreak: 0,

      startWorkout: (workoutData) => {
        const workout: Workout = {
          id: Date.now().toString(),
          name: workoutData.name || 'Workout',
          exercises: workoutData.exercises || [],
          duration: workoutData.duration || 30,
          difficulty: workoutData.difficulty || 'Intermediate',
          completed: false,
          date: new Date().toISOString(),
          ...workoutData
        }
        set({ currentWorkout: workout })
      },

      completeExercise: (exerciseName) => {
        const { currentWorkout } = get()
        if (!currentWorkout) return

        const updatedExercises = currentWorkout.exercises.map(exercise =>
          exercise.name === exerciseName 
            ? { ...exercise, completed: true }
            : exercise
        )

        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: updatedExercises
          }
        })
      },

      completeWorkout: () => {
        const { currentWorkout, workoutHistory, totalWorkouts, currentStreak } = get()
        if (!currentWorkout) return

        const completedWorkout = {
          ...currentWorkout,
          completed: true,
          exercises: currentWorkout.exercises.map(ex => ({ ...ex, completed: true }))
        }

        set({
          currentWorkout: null,
          workoutHistory: [completedWorkout, ...workoutHistory],
          totalWorkouts: totalWorkouts + 1,
          currentStreak: currentStreak + 1
        })
      },

      addWorkoutToHistory: (workout) => {
        const { workoutHistory } = get()
        set({ workoutHistory: [workout, ...workoutHistory] })
      },

      updateStats: (calories) => {
        const { totalCaloriesBurned } = get()
        set({ totalCaloriesBurned: totalCaloriesBurned + calories })
      }
    }),
    {
      name: 'workout-storage',
    }
  )
)