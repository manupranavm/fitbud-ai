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
import { Header } from "@/components/layout/header"
import { FitnessButton } from "@/components/ui/fitness-button"
import { FitnessCard, FitnessCardContent, FitnessCardDescription, FitnessCardHeader, FitnessCardTitle } from "@/components/ui/fitness-card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Badge } from "@/components/ui/badge"

const Dashboard: React.FC = () => {
  // Mock data
  const todayStats = {
    workoutProgress: 65,
    caloriesConsumed: 1450,
    caloriesTarget: 2200,
    workoutsThisWeek: 4,
    workoutTarget: 5
  }

  const recentWorkouts = [
    { name: "Upper Body Strength", date: "Today", duration: "45 min", completed: true },
    { name: "HIIT Cardio", date: "Yesterday", duration: "30 min", completed: true },
    { name: "Lower Body Focus", date: "2 days ago", duration: "50 min", completed: true }
  ]

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
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-heading-lg mb-2">Welcome back, John! 💪</h1>
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
                <div className="text-2xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">days active</p>
                <div className="text-xs text-yellow-500">🔥 Personal best!</div>
              </div>
            </FitnessCardContent>
          </FitnessCard>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
              <h2 className="text-heading-sm mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <FitnessCard 
                      key={index}
                      variant={action.variant}
                      className="cursor-pointer group"
                    >
                      <Link to={action.href} className="block">
                        <FitnessCardHeader className="pb-3">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <FitnessCardTitle className="text-base">
                              {action.title}
                            </FitnessCardTitle>
                          </div>
                        </FitnessCardHeader>
                        <FitnessCardContent>
                          <FitnessCardDescription>
                            {action.description}
                          </FitnessCardDescription>
                        </FitnessCardContent>
                      </Link>
                    </FitnessCard>
                  )
                })}
              </div>
            </div>

            {/* Today's Workout Preview */}
            <div className="animate-slide-up" style={{ animationDelay: "500ms" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-heading-sm">Today's Workout</h2>
                <FitnessButton asChild variant="ghost" size="sm">
                  <Link to="/workout">View All</Link>
                </FitnessButton>
              </div>
              
              <FitnessCard variant="workout">
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
                  <div className="space-y-3">
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
                  </div>
                  
                  <FitnessButton asChild className="w-full mt-4" size="lg">
                    <Link to="/workout/start">
                      Continue Workout
                    </Link>
                  </FitnessButton>
                </FitnessCardContent>
              </FitnessCard>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <div className="animate-slide-up" style={{ animationDelay: "600ms" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-heading-sm">Recent Workouts</h2>
                <FitnessButton asChild variant="ghost" size="sm">
                  <Link to="/progress">View All</Link>
                </FitnessButton>
              </div>
              
              <FitnessCard>
                <FitnessCardContent className="space-y-4">
                  {recentWorkouts.map((workout, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <div>
                          <p className="font-medium text-sm">{workout.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {workout.date} • {workout.duration}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Completed
                      </Badge>
                    </div>
                  ))}
                  
                  <FitnessButton asChild variant="ghost" className="w-full mt-4">
                    <Link to="/progress">
                      <TrendingUp className="w-4 h-4" />
                      View Progress
                    </Link>
                  </FitnessButton>
                </FitnessCardContent>
              </FitnessCard>
            </div>

            {/* Nutrition Quick Add */}
            <div className="animate-slide-up" style={{ animationDelay: "700ms" }}>
              <h2 className="text-heading-sm mb-4">Quick Add</h2>
              <FitnessCard variant="food">
                <FitnessCardContent className="space-y-3">
                  <FitnessButton asChild variant="outline" className="w-full">
                    <Link to="/nutrition/scan">
                      <Camera className="w-4 h-4" />
                      Scan Meal
                    </Link>
                  </FitnessButton>
                  
                  <FitnessButton asChild variant="ghost" className="w-full">
                    <Link to="/nutrition/add">
                      <Plus className="w-4 h-4" />
                      Add Manually
                    </Link>
                  </FitnessButton>
                </FitnessCardContent>
              </FitnessCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard