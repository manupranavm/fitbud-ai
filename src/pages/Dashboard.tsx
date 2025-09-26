import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Flame, 
  Dumbbell, 
  Camera,
  UtensilsCrossed,
  Trophy,
  Play,
  Plus,
  Eye
} from "lucide-react"
import WorkoutFormMonitor from "@/components/WorkoutFormMonitor"
import { useAuth } from "@/hooks/useAuth"
import { useWorkout } from "@/hooks/useWorkout"
import { useNutrition } from "@/hooks/useNutrition"
import { useEquipmentWorkouts } from "@/hooks/useEquipmentWorkouts"

import { FitnessButton } from "@/components/ui/fitness-button"
import { FitnessCard, FitnessCardContent, FitnessCardDescription, FitnessCardHeader, FitnessCardTitle } from "@/components/ui/fitness-card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Badge } from "@/components/ui/badge"

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const { totalWorkouts, currentStreak, workoutHistory, currentWorkout } = useWorkout()
  const { getTodaysTotals, goals, loadTodaysFoods } = useNutrition()
  const { getTodaysWorkout } = useEquipmentWorkouts()
  const [showFormMonitor, setShowFormMonitor] = useState(false)
  
  // Load today's nutrition data on component mount
  useEffect(() => {
    loadTodaysFoods()
  }, [loadTodaysFoods])
  
  // Get real data from stores
  const todaysTotals = getTodaysTotals()
  
  // Calculate real workout progress based on current workout
  const calculateWorkoutProgress = () => {
    if (!currentWorkout || !currentWorkout.exercises) return 0
    const totalExercises = currentWorkout.exercises.length
    const completedExercises = currentWorkout.exercises.filter(ex => ex.completed).length
    return Math.round((completedExercises / totalExercises) * 100)
  }
  
  // Calculate this week's workouts
  const calculateThisWeeksWorkouts = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start of current week
    
    return workoutHistory.filter(workout => {
      const workoutDate = new Date(workout.date)
      return workoutDate >= startOfWeek && workoutDate <= today && workout.completed
    }).length
  }
  
  const workoutProgress = calculateWorkoutProgress()
  const thisWeeksWorkouts = calculateThisWeeksWorkouts()
  
  // Use real data from stores
  const todayStats = {
    workoutProgress: workoutProgress,
    caloriesConsumed: Math.round(todaysTotals.calories),
    caloriesTarget: goals.calories,
    workoutsThisWeek: thisWeeksWorkouts,
    workoutTarget: 5
  }

  // Get the most recent or current workout for today's workout display
  const getDisplayWorkout = () => {
    // First check equipment workout
    const equipmentWorkout = getTodaysWorkout()
    if (equipmentWorkout) {
      return {
        ...equipmentWorkout,
        completed: false
      }
    }
    const today = new Date().toDateString()
    const todaysWorkout = workoutHistory.find(workout => 
      new Date(workout.date).toDateString() === today
    )
    
    if (todaysWorkout) {
      return {
        name: todaysWorkout.name,
        exercises: todaysWorkout.exercises || [],
        duration: todaysWorkout.duration,
        completed: todaysWorkout.completed
      }
    }
    
    // If no workout today, show current workout or default
    if (currentWorkout) {
      return {
        name: currentWorkout.name || "Today's Workout",
        exercises: currentWorkout.exercises || [],
        duration: currentWorkout.duration || 45,
        completed: false
      }
    }
    
    // Default fallback
    return {
      name: "Upper Body Strength",
      exercises: [
        { name: "Push-ups", sets: 3, reps: 12, completed: false },
        { name: "Bench Press", sets: 4, reps: 8, completed: false },
        { name: "Dumbbell Rows", sets: 3, reps: 10, completed: false },
        { name: "Shoulder Press", sets: 3, reps: 10, completed: false },
        { name: "Tricep Dips", sets: 3, reps: 15, completed: false },
        { name: "Pull-ups", sets: 3, reps: 8, completed: false }
      ],
      duration: 45,
      completed: false
    }
  }
  
  const todaysWorkout = getTodaysWorkout()

  const quickActions = [
    {
      title: "Start Workout",
      description: "Begin today's scheduled workout",
      icon: Dumbbell,
      href: "/workout",
      variant: "workout" as const
    },
    {
      title: "Monitor Your Live Workout",
      description: "Real-time form analysis with AI",
      icon: Eye,
      onClick: () => setShowFormMonitor(true),
      variant: "interactive" as const,
      isNew: true
    },
    {
      title: "Form Check",
      description: "Record and analyze your form",
      icon: Camera,
      href: "/form-check",
      variant: "interactive" as const
    },
    {
      title: "Log Meal",
      description: "Scan or add your meals",
      icon: UtensilsCrossed,
      href: "/nutrition",
      variant: "food" as const
    },
    {
      title: "View Progress",
      description: "Check your fitness journey",
      icon: TrendingUp,
      href: "/progress",
      variant: "gradient" as const
    }
  ]

  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-heading-lg mb-2">Welcome back, {user?.user_metadata?.full_name || user?.email || 'User'}! </h1>
        <p className="text-muted-foreground">
          You're {todayStats.workoutProgress}% through today's workout. Keep pushing!
        </p>
      </div>

        {/* Today's Overview */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
          {/* Workout Progress */}
          <FitnessCard variant="workout" className="animate-slide-up">
            <FitnessCardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FitnessCardTitle className="text-base">Today's Workout</FitnessCardTitle>
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
            </FitnessCardHeader>
            <FitnessCardContent>
              <div className="flex items-center justify-center mb-4">
                <ProgressRing 
                  progress={todayStats.workoutProgress} 
                  size={80}
                  color="primary"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">{todayStats.workoutProgress}%</div>
                  </div>
                </ProgressRing>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Upper Body Strength
              </p>
            </FitnessCardContent>
          </FitnessCard>

          {/* Calories */}
          <FitnessCard variant="food" className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <FitnessCardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FitnessCardTitle className="text-base">Calories</FitnessCardTitle>
                <Flame className="w-5 h-5 text-success" />
              </div>
            </FitnessCardHeader>
            <FitnessCardContent>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold">
                  {todayStats.caloriesConsumed}
                  <span className="text-sm text-muted-foreground font-normal">
                    /{todayStats.caloriesTarget}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(todayStats.caloriesConsumed / todayStats.caloriesTarget) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {todayStats.caloriesTarget - todayStats.caloriesConsumed} calories remaining
                </p>
              </div>
            </FitnessCardContent>
          </FitnessCard>

          {/* Weekly Goal */}
          <FitnessCard variant="progress" className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <FitnessCardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FitnessCardTitle className="text-base">This Week</FitnessCardTitle>
                <Target className="w-5 h-5 text-secondary" />
              </div>
            </FitnessCardHeader>
            <FitnessCardContent>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold">
                  {todayStats.workoutsThisWeek}
                  <span className="text-sm text-muted-foreground font-normal">
                    /{todayStats.workoutTarget}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">workouts completed</p>
                 <Badge variant="secondary" className="text-xs">
                   {Math.round((todayStats.workoutsThisWeek / todayStats.workoutTarget) * 100)}% to goal
                 </Badge>
              </div>
            </FitnessCardContent>
          </FitnessCard>

          {/* Streak */}
          <FitnessCard variant="gradient" className="animate-slide-up" style={{ animationDelay: "300ms" }}>
            <FitnessCardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FitnessCardTitle className="text-base">Streak</FitnessCardTitle>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
            </FitnessCardHeader>
            <FitnessCardContent>
               <div className="text-center space-y-2">
                 <div className="text-2xl font-bold">{currentStreak}</div>
                 <p className="text-sm text-muted-foreground">days active</p>
                 {currentStreak > 0 && (
                   <div className="text-xs text-yellow-500">
                     {currentStreak >= 7 ? "🔥 Amazing streak!" : "Keep it up!"}
                   </div>
                 )}
               </div>
            </FitnessCardContent>
          </FitnessCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Quick Actions */}
          <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
            <h2 className="text-heading-sm mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4 h-full">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                const handleClick = action.onClick || (() => {});
                
                return (
                  <FitnessCard 
                    key={index}
                    variant={action.variant}
                    className="cursor-pointer group hover:scale-[1.02] transition-all duration-200 relative"
                  >
                    {action.href ? (
                      <Link to={action.href} className="block h-full">
                        <FitnessCardContent className="flex flex-col items-center text-center p-4">
                          <div className="mb-3 p-2.5 bg-primary/20 rounded-xl group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-200">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <FitnessCardTitle className="text-sm mb-1 font-semibold">
                            {action.title}
                          </FitnessCardTitle>
                          <FitnessCardDescription className="text-xs leading-relaxed">
                            {action.description}
                          </FitnessCardDescription>
                        </FitnessCardContent>
                      </Link>
                    ) : (
                      <div onClick={handleClick} className="block h-full">
                        <FitnessCardContent className="flex flex-col items-center text-center p-4">
                          {action.isNew && (
                            <div className="absolute -top-2 -right-2 bg-success text-background text-xs px-2 py-1 rounded-full font-semibold">
                              NEW
                            </div>
                          )}
                          <div className="mb-3 p-2.5 bg-primary/20 rounded-xl group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-200">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <FitnessCardTitle className="text-sm mb-1 font-semibold">
                            {action.title}
                          </FitnessCardTitle>
                          <FitnessCardDescription className="text-xs leading-relaxed">
                            {action.description}
                          </FitnessCardDescription>
                        </FitnessCardContent>
                      </div>
                    )}
                  </FitnessCard>
                )
              })}
            </div>
          </div>

          {/* Right Column - Today's Workout */}
          <div className="animate-slide-up" style={{ animationDelay: "500ms" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-heading-sm">Today's Workout</h2>
              <FitnessButton asChild variant="ghost" size="sm">
                <Link to="/workout">View All</Link>
              </FitnessButton>
            </div>
            
            <FitnessCard variant="workout" className="h-full">
              <FitnessCardHeader>
                <div className="flex items-center justify-between">
                 <div>
                   <FitnessCardTitle>{todaysWorkout?.name || "No Workout Planned"}</FitnessCardTitle>
                   <FitnessCardDescription>
                     {todaysWorkout ? `${todaysWorkout.exercises.length} exercises • ${todaysWorkout.duration} minutes • ${todaysWorkout.difficulty}` : "Create a workout plan using your gym equipment"}
                   </FitnessCardDescription>
                 </div>
                  <FitnessButton size="icon" variant="secondary">
                    <Play className="w-4 h-4" />
                  </FitnessButton>
                </div>
              </FitnessCardHeader>
              <FitnessCardContent>
                {todaysWorkout ? (
                  <>
                    <div className="space-y-3 mb-6">
                      {todaysWorkout.exercises.slice(0, 6).map((exercise, index) => (
                        <div 
                          key={index}
                          className={`flex items-center justify-between py-2 border-l-2 pl-3 ${
                            exercise.completed ? 'border-primary' : 'border-muted'
                          }`}
                        >
                          <span className={`text-sm ${exercise.completed ? 'font-medium' : ''}`}>
                            {exercise.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {exercise.sets} × {exercise.reps}
                          </span>
                        </div>
                      ))}
                      {todaysWorkout.exercises.length > 6 && (
                        <div className="text-center text-sm text-muted-foreground">
                          +{todaysWorkout.exercises.length - 6} more exercises
                        </div>
                      )}
                    </div>
                   
                    <FitnessButton asChild className="w-full" size="lg">
                      <Link to="/workout/session/today">
                        <Play className="w-4 h-4" />
                        {workoutProgress > 0 ? "Continue Workout" : "Start Workout"}
                      </Link>
                    </FitnessButton>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">
                      Create a personalized workout plan based on your available gym equipment
                    </p>
                    <FitnessButton asChild className="w-full" size="lg">
                      <Link to="/gym-equipment">
                        <Plus className="w-4 h-4" />
                        Create Workout Plan
                      </Link>
                    </FitnessButton>
                  </div>
                )}
              </FitnessCardContent>
            </FitnessCard>
          </div>
        </div>

        {/* Workout Form Monitor Modal */}
        {showFormMonitor && (
          <WorkoutFormMonitor onClose={() => setShowFormMonitor(false)} />
        )}
    </main>
  )
}

export default Dashboard