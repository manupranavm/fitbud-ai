import React, { useState, useEffect } from "react"
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award,
  ChevronDown,
  Filter
} from "lucide-react"

import { FitnessButton } from "@/components/ui/fitness-button"
import { FitnessCard, FitnessCardContent, FitnessCardDescription, FitnessCardHeader, FitnessCardTitle } from "@/components/ui/fitness-card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWorkout } from "@/hooks/useWorkout"
import { useNutrition } from "@/hooks/useNutrition"

const ProgressPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState("30")
  const { totalWorkouts, currentStreak, workoutHistory, totalCaloriesBurned } = useWorkout()
  const { getDailyTotalsForDateRange } = useNutrition()

  // Calculate average workout time from history
  const calculateAverageWorkoutTime = () => {
    if (workoutHistory.length === 0) return 0
    const totalDuration = workoutHistory.reduce((sum, workout) => sum + workout.duration, 0)
    return Math.round(totalDuration / workoutHistory.length)
  }

  // Calculate this week's workouts
  const calculateThisWeeksWorkouts = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    
    return workoutHistory.filter(workout => {
      const workoutDate = new Date(workout.date)
      return workoutDate >= startOfWeek && workoutDate <= today && workout.completed
    }).length
  }

  // Calculate weekly goal progress
  const calculateWeeklyProgress = () => {
    const thisWeekWorkouts = calculateThisWeeksWorkouts()
    const weeklyGoal = 5 // Target 5 workouts per week
    return Math.round((thisWeekWorkouts / weeklyGoal) * 100)
  }

  // Real data from stores
  const stats = {
    totalWorkouts: totalWorkouts,
    totalCaloriesBurned: totalCaloriesBurned,
    averageWorkoutTime: calculateAverageWorkoutTime(),
    streak: currentStreak,
    weeklyGoalProgress: calculateWeeklyProgress()
  }

  // Format workout history for display
  const formatWorkoutHistory = () => {
    return workoutHistory.slice(0, 5).map(workout => {
      const workoutDate = new Date(workout.date)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      
      let displayDate = workoutDate.toLocaleDateString()
      if (workoutDate.toDateString() === today.toDateString()) {
        displayDate = "Today"
      } else if (workoutDate.toDateString() === yesterday.toDateString()) {
        displayDate = "Yesterday"
      } else {
        const diffTime = Math.abs(today.getTime() - workoutDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays <= 7) {
          displayDate = `${diffDays} days ago`
        }
      }

      return {
        date: displayDate,
        workout: workout.name,
        duration: workout.duration,
        calories: Math.round(workout.duration * 7), // Estimate 7 calories per minute
        completed: workout.completed
      }
    })
  }

  // Get monthly data from workout history
  const getMonthlyData = () => {
    const monthlyStats: Record<string, { workouts: number; calories: number }> = {}
    
    workoutHistory.forEach(workout => {
      const date = new Date(workout.date)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { workouts: 0, calories: 0 }
      }
      
      if (workout.completed) {
        monthlyStats[monthKey].workouts += 1
        monthlyStats[monthKey].calories += Math.round(workout.duration * 7) // Estimate
      }
    })

    // Get last 3 months or fill with current data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    const last3Months = []
    
    for (let i = 2; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const monthName = months[monthIndex]
      last3Months.push({
        month: monthName,
        workouts: monthlyStats[monthName]?.workouts || 0,
        calories: monthlyStats[monthName]?.calories || 0
      })
    }
    
    return last3Months
  }

  const workoutHistoryFormatted = formatWorkoutHistory()
  const monthlyData = getMonthlyData()

  // Generate achievements based on real data
  const generateAchievements = () => {
    const achievements = []
    
    // First Week Complete
    if (totalWorkouts >= 5) {
      achievements.push({
        name: "First Week Complete",
        description: "Completed your first week of workouts",
        earned: true,
        date: "Achievement unlocked!"
      })
    } else {
      achievements.push({
        name: "First Week Complete",
        description: "Complete 5 workouts",
        earned: false,
        progress: Math.round((totalWorkouts / 5) * 100)
      })
    }

    // Consistency Achievement
    if (currentStreak >= 7) {
      achievements.push({
        name: "Consistency Champion",
        description: `${currentStreak} days workout streak`,
        earned: true,
        date: "Keep it up!"
      })
    } else {
      achievements.push({
        name: "Consistency Champion",
        description: "Maintain a 7-day workout streak",
        earned: false,
        progress: Math.round((currentStreak / 7) * 100)
      })
    }

    // Calorie Crusher
    if (stats.totalCaloriesBurned >= 1000) {
      achievements.push({
        name: "Calorie Crusher",
        description: `Burned ${stats.totalCaloriesBurned}+ calories`,
        earned: true,
        date: "Amazing progress!"
      })
    } else {
      achievements.push({
        name: "Calorie Crusher",
        description: "Burn 1000+ calories total",
        earned: false,
        progress: Math.round((stats.totalCaloriesBurned / 1000) * 100)
      })
    }

    // Monthly Goal
    const monthlyTarget = 20
    achievements.push({
      name: "Monthly Goal",
      description: `Complete ${monthlyTarget} workouts in a month`,
      earned: totalWorkouts >= monthlyTarget,
      ...(totalWorkouts >= monthlyTarget 
        ? { date: "Goal achieved!" }
        : { progress: Math.round((totalWorkouts / monthlyTarget) * 100) }
      )
    })

    // Workout Variety
    const uniqueWorkouts = new Set(workoutHistory.map(w => w.name)).size
    if (uniqueWorkouts >= 5) {
      achievements.push({
        name: "Variety Master",
        description: `Tried ${uniqueWorkouts} different workout types`,
        earned: true,
        date: "Great variety!"
      })
    } else {
      achievements.push({
        name: "Variety Master",
        description: "Try 5 different workout types",
        earned: false,
        progress: Math.round((uniqueWorkouts / 5) * 100)
      })
    }

    return achievements
  }

  const achievements = generateAchievements()

  return (
    <div className="min-h-screen bg-background">
      
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-heading-lg mb-2">Your Progress</h1>
            <p className="text-muted-foreground">
              Track your fitness journey and celebrate achievements
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <FitnessButton variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </FitnessButton>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Stats */}
            <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-6">
              <FitnessCard variant="workout" className="animate-slide-up">
                <FitnessCardHeader className="pb-3">
                  <FitnessCardTitle className="text-sm">Total Workouts</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <div className="text-2xl font-bold text-primary">{stats.totalWorkouts}</div>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </FitnessCardContent>
              </FitnessCard>

              <FitnessCard variant="gradient" className="animate-slide-up" style={{ animationDelay: "100ms" }}>
                <FitnessCardHeader className="pb-3">
                  <FitnessCardTitle className="text-sm">Calories Burned</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <div className="text-2xl font-bold text-secondary">{stats.totalCaloriesBurned.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total</p>
                </FitnessCardContent>
              </FitnessCard>

              <FitnessCard variant="gradient" className="animate-slide-up" style={{ animationDelay: "200ms" }}>
                <FitnessCardHeader className="pb-3">
                  <FitnessCardTitle className="text-sm">Avg Workout</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <div className="text-2xl font-bold text-success">{stats.averageWorkoutTime}</div>
                  <p className="text-xs text-muted-foreground mt-1">minutes</p>
                </FitnessCardContent>
              </FitnessCard>

              <FitnessCard variant="interactive" className="animate-slide-up" style={{ animationDelay: "300ms" }}>
                <FitnessCardHeader className="pb-3">
                  <FitnessCardTitle className="text-sm">Current Streak</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <div className="text-2xl font-bold">{stats.streak}</div>
                  <p className="text-xs text-yellow-500 mt-1">🔥 Days active</p>
                </FitnessCardContent>
              </FitnessCard>

              <FitnessCard variant="progress" className="animate-slide-up" style={{ animationDelay: "400ms" }}>
                <FitnessCardHeader className="pb-3">
                  <FitnessCardTitle className="text-sm">Weekly Goal</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <div className="flex items-center justify-center">
                    <ProgressRing 
                      progress={stats.weeklyGoalProgress}
                      size={60}
                      color="primary"
                    >
                      <div className="text-center">
                        <div className="text-sm font-bold">{stats.weeklyGoalProgress}%</div>
                      </div>
                    </ProgressRing>
                  </div>
                </FitnessCardContent>
              </FitnessCard>
            </div>

            {/* Monthly Progress Chart */}
            <FitnessCard className="animate-slide-up" style={{ animationDelay: "500ms" }}>
              <FitnessCardHeader>
                <FitnessCardTitle>Monthly Progress</FitnessCardTitle>
                <FitnessCardDescription>
                  Your workout consistency over the past 3 months
                </FitnessCardDescription>
              </FitnessCardHeader>
              
              <FitnessCardContent>
                <div className="space-y-6">
                  {monthlyData.map((month, index) => (
                    <div key={month.month} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{month.month}</span>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span>{month.workouts} workouts</span>
                          <span>{month.calories.toLocaleString()} cal</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(month.workouts / Math.max(...monthlyData.map(m => m.workouts))) * 100}%`,
                            animationDelay: `${index * 200}ms`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </FitnessCardContent>
            </FitnessCard>
          </TabsContent>

          {/* Workouts */}
          <TabsContent value="workouts" className="space-y-6">
            <FitnessCard className="animate-slide-up">
              <FitnessCardHeader>
                <FitnessCardTitle>Recent Workouts</FitnessCardTitle>
                <FitnessCardDescription>
                  Your workout history for the past week
                </FitnessCardDescription>
              </FitnessCardHeader>
              
               <FitnessCardContent>
                 <div className="space-y-4">
                   {workoutHistoryFormatted.length > 0 ? (
                     workoutHistoryFormatted.map((workout, index) => (
                       <div 
                         key={index}
                         className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                       >
                         <div className="flex items-center gap-4">
                           <div className="w-2 h-2 bg-primary rounded-full" />
                           <div>
                             <p className="font-medium">{workout.workout}</p>
                             <p className="text-sm text-muted-foreground">{workout.date}</p>
                           </div>
                         </div>
                         
                         <div className="flex items-center gap-6 text-sm text-muted-foreground">
                           <div className="text-center">
                             <div className="font-medium text-foreground">{workout.duration}</div>
                             <div>minutes</div>
                           </div>
                           <div className="text-center">
                             <div className="font-medium text-foreground">{workout.calories}</div>
                             <div>calories</div>
                           </div>
                           <Badge variant="outline" className="text-xs">
                             {workout.completed ? "Completed" : "Incomplete"}
                           </Badge>
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-8 text-muted-foreground">
                       <p>No workout history available yet.</p>
                       <p className="text-sm">Start your first workout to see your progress here!</p>
                     </div>
                   )}
                 </div>
               </FitnessCardContent>
            </FitnessCard>
          </TabsContent>

          {/* Nutrition */}
          <TabsContent value="nutrition" className="space-y-6">
            <FitnessCard className="animate-slide-up">
              <FitnessCardContent className="text-center py-12">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">Nutrition Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed nutrition progress tracking will be available here
                </p>
              </FitnessCardContent>
            </FitnessCard>
          </TabsContent>

          {/* Achievements */}
          <TabsContent value="achievements" className="space-y-6">
            <FitnessCard className="animate-slide-up">
              <FitnessCardHeader>
                <FitnessCardTitle>Your Achievements</FitnessCardTitle>
                <FitnessCardDescription>
                  Milestones you've reached on your fitness journey
                </FitnessCardDescription>
              </FitnessCardHeader>
              
              <FitnessCardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border transition-all ${
                        achievement.earned 
                          ? "border-primary/50 bg-primary/5" 
                          : "border-border bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          achievement.earned 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <Award className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {achievement.description}
                          </p>
                          
                          {achievement.earned ? (
                            <Badge variant="outline" className="text-xs">
                              Earned {achievement.date}
                            </Badge>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span>Progress</span>
                                <span>{achievement.progress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1">
                                <div 
                                  className="bg-primary h-1 rounded-full transition-all duration-500"
                                  style={{ width: `${achievement.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </FitnessCardContent>
            </FitnessCard>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default ProgressPage