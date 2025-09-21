import React from "react"
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
  Plus
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useWorkout } from "@/hooks/useWorkout"
import { useNutrition } from "@/hooks/useNutrition"

import { FitnessButton } from "@/components/ui/fitness-button"
import { FitnessCard, FitnessCardContent, FitnessCardDescription, FitnessCardHeader, FitnessCardTitle } from "@/components/ui/fitness-card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Badge } from "@/components/ui/badge"

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const { totalWorkouts, currentStreak, workoutHistory } = useWorkout()
  const { getTodaysTotals, goals } = useNutrition()
  
  // Get real data from stores
  const todaysTotals = getTodaysTotals()
  
  // Calculate workout progress (mock for today's workout)
  const workoutProgress = 65
  // Use real data from stores
  const todayStats = {
    workoutProgress: workoutProgress,
    caloriesConsumed: todaysTotals.calories,
    caloriesTarget: goals.calories,
    workoutsThisWeek: Math.min(totalWorkouts, 5), // Cap at target
    workoutTarget: 5
  }

  const recentWorkouts = workoutHistory.slice(0, 3).map(workout => ({
    name: workout.name,
    date: new Date(workout.date).toLocaleDateString() === new Date().toLocaleDateString() ? "Today" : 
          new Date(workout.date).toLocaleDateString() === new Date(Date.now() - 86400000).toLocaleDateString() ? "Yesterday" :
          new Date(workout.date).toLocaleDateString(),
    duration: `${workout.duration} min`,
    completed: workout.completed
  }))

  const quickActions = [
    {
      title: "Start Workout",
      description: "Begin today's scheduled workout",
      icon: Dumbbell,
      href: "/workout",
      variant: "workout" as const
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
        <h1 className="text-heading-lg mb-2">Welcome back, {user?.name || 'User'}! 💪</h1>
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
                  80% to goal
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
                <div className="text-2xl font-bold">{currentStreak || 12}</div>
                <p className="text-sm text-muted-foreground">days active</p>
                <div className="text-xs text-yellow-500">🔥 Personal best!</div>
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
                return (
                  <FitnessCard 
                    key={index}
                    variant={action.variant}
                    className="cursor-pointer group hover:scale-[1.02] transition-all duration-200"
                  >
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
                    <FitnessCardTitle>Upper Body Strength</FitnessCardTitle>
                    <FitnessCardDescription>
                      6 exercises • 45 minutes • Intermediate
                    </FitnessCardDescription>
                  </div>
                  <FitnessButton size="icon" variant="secondary">
                    <Play className="w-4 h-4" />
                  </FitnessButton>
                </div>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between py-2 border-l-2 border-primary pl-3">
                    <span className="text-sm font-medium">Push-ups</span>
                    <span className="text-sm text-muted-foreground">3 × 12</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-l-2 border-muted pl-3">
                    <span className="text-sm">Bench Press</span>
                    <span className="text-sm text-muted-foreground">4 × 8</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-l-2 border-muted pl-3">
                    <span className="text-sm">Dumbbell Rows</span>
                    <span className="text-sm text-muted-foreground">3 × 10</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-l-2 border-muted pl-3">
                    <span className="text-sm">Shoulder Press</span>
                    <span className="text-sm text-muted-foreground">3 × 10</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-l-2 border-muted pl-3">
                    <span className="text-sm">Tricep Dips</span>
                    <span className="text-sm text-muted-foreground">3 × 15</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-l-2 border-muted pl-3">
                    <span className="text-sm">Pull-ups</span>
                    <span className="text-sm text-muted-foreground">3 × 8</span>
                  </div>
                </div>
                
                <FitnessButton asChild className="w-full" size="lg">
                  <Link to="/workout/session/today">
                    Continue Workout
                  </Link>
                </FitnessButton>
              </FitnessCardContent>
            </FitnessCard>
          </div>
        </div>
    </main>
  )
}

export default Dashboard