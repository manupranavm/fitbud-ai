import React, { useState } from "react"
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award,
  ChevronDown,
  Filter
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { FitnessButton } from "@/components/ui/fitness-button"
import { FitnessCard, FitnessCardContent, FitnessCardDescription, FitnessCardHeader, FitnessCardTitle } from "@/components/ui/fitness-card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ProgressPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState("30")

  // Mock data
  const stats = {
    totalWorkouts: 24,
    totalCaloriesBurned: 8650,
    averageWorkoutTime: 42,
    streak: 12,
    weeklyGoalProgress: 80
  }

  const workoutHistory = [
    { date: "Today", workout: "Upper Body Strength", duration: 45, calories: 380, completed: true },
    { date: "Yesterday", workout: "HIIT Cardio", duration: 30, calories: 420, completed: true },
    { date: "2 days ago", workout: "Lower Body Focus", duration: 50, calories: 310, completed: true },
    { date: "3 days ago", workout: "Core & Flexibility", duration: 25, calories: 180, completed: true },
    { date: "4 days ago", workout: "Full Body Circuit", duration: 40, calories: 350, completed: true }
  ]

  const achievements = [
    { name: "First Week Complete", description: "Completed your first week of workouts", earned: true, date: "2 weeks ago" },
    { name: "Consistency King", description: "10 days workout streak", earned: true, date: "3 days ago" },
    { name: "Calorie Crusher", description: "Burned 5000+ calories", earned: true, date: "1 week ago" },
    { name: "Monthly Goal", description: "Complete 20 workouts in a month", earned: false, progress: 75 },
    { name: "Perfect Form", description: "Get 90%+ form score 5 times", earned: false, progress: 60 }
  ]

  const monthlyData = [
    { month: "Jan", workouts: 18, calories: 6200 },
    { month: "Feb", workouts: 22, calories: 7800 },
    { month: "Mar", workouts: 24, calories: 8650 },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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
                  {workoutHistory.map((workout, index) => (
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
                          Completed
                        </Badge>
                      </div>
                    </div>
                  ))}
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