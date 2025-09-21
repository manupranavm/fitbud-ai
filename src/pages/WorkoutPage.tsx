import React, { useState } from "react"
import { Link } from "react-router-dom"
import { 
  Play, 
  Clock, 
  Target, 
  TrendingUp, 
  ChevronRight,
  Filter,
  Search,
  CheckCircle2,
  Circle,
  Brain
} from "lucide-react"

import { FitnessButton } from "@/components/ui/fitness-button"
import { FitnessCard, FitnessCardContent, FitnessCardDescription, FitnessCardHeader, FitnessCardTitle } from "@/components/ui/fitness-card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoPlayer } from "@/components/ui/video-player"
import { AIWorkoutGenerator } from "@/components/AIWorkoutGenerator"
import gymImage from "@/assets/gym-workout.jpg"

const WorkoutPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)

  // Mock data
  const todaysWorkout = {
    name: "Upper Body Strength",
    duration: 45,
    exercises: 6,
    difficulty: "Intermediate",
    completed: 65,
    exercises_list: [
      { name: "Push-ups", sets: 3, reps: 12, completed: true },
      { name: "Bench Press", sets: 4, reps: 8, completed: true },
      { name: "Dumbbell Rows", sets: 3, reps: 10, completed: true },
      { name: "Shoulder Press", sets: 3, reps: 10, completed: false },
      { name: "Tricep Dips", sets: 3, reps: 15, completed: false },
      { name: "Pull-ups", sets: 3, reps: 8, completed: false }
    ]
  }

  const workoutPlans = [
    {
      id: 1,
      name: "Beginner Full Body",
      duration: 30,
      exercises: 8,
      difficulty: "Beginner",
      category: "Full Body",
      description: "Perfect for starting your fitness journey"
    },
    {
      id: 2,
      name: "HIIT Cardio Blast",
      duration: 25,
      exercises: 6,
      difficulty: "Intermediate",
      category: "Cardio",
      description: "High-intensity interval training"
    },
    {
      id: 3,
      name: "Strength Builder",
      duration: 60,
      exercises: 10,
      difficulty: "Advanced",
      category: "Strength",
      description: "Build serious muscle and power"
    },
    {
      id: 4,
      name: "Lower Body Focus",
      duration: 45,
      exercises: 8,
      difficulty: "Intermediate",
      category: "Lower Body",
      description: "Legs, glutes, and core strength"
    }
  ]

  const exerciseLibrary = [
    {
      name: "Push-ups",
      category: "Chest",
      difficulty: "Beginner",
      equipment: "Bodyweight",
      duration: "3 sets × 12 reps"
    },
    {
      name: "Squats",
      category: "Legs", 
      difficulty: "Beginner",
      equipment: "Bodyweight",
      duration: "3 sets × 15 reps"
    },
    {
      name: "Deadlift",
      category: "Back",
      difficulty: "Advanced",
      equipment: "Barbell",
      duration: "4 sets × 6 reps"
    },
    {
      name: "Plank",
      category: "Core",
      difficulty: "Beginner",
      equipment: "Bodyweight",
      duration: "3 sets × 30s"
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner": return "bg-success/20 text-success"
      case "intermediate": return "bg-primary/20 text-primary"
      case "advanced": return "bg-secondary/20 text-secondary"
      default: return "bg-muted/20 text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-8 rounded-xl overflow-hidden animate-fade-in">
          <div 
            className="h-48 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${gymImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-overlay" />
            <div className="relative z-10 p-6 flex items-end h-full">
              <div className="text-white">
                <h1 className="text-heading-lg mb-2">Your Workouts</h1>
                <p className="text-body opacity-90">
                  Personalized training plans powered by AI
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Today's Workout</TabsTrigger>
            <TabsTrigger value="plans">Workout Plans</TabsTrigger>
            <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
            <TabsTrigger value="ai-generator" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Generator
            </TabsTrigger>
          </TabsList>

          {/* Today's Workout */}
          <TabsContent value="today" className="space-y-6">
            <FitnessCard variant="workout" className="animate-slide-up">
              <FitnessCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <FitnessCardTitle className="text-xl">{todaysWorkout.name}</FitnessCardTitle>
                    <FitnessCardDescription>
                      {todaysWorkout.exercises} exercises • {todaysWorkout.duration} minutes • {todaysWorkout.difficulty}
                    </FitnessCardDescription>
                  </div>
                  <Badge className={getDifficultyColor(todaysWorkout.difficulty)}>
                    {todaysWorkout.difficulty}
                  </Badge>
                </div>
              </FitnessCardHeader>
              
              <FitnessCardContent>
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{todaysWorkout.completed}% complete</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${todaysWorkout.completed}%` }}
                    />
                  </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-3 mb-6">
                  {todaysWorkout.exercises_list.map((exercise, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {exercise.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {exercise.sets} sets × {exercise.reps} reps
                          </p>
                        </div>
                      </div>
                      <FitnessButton 
                        variant="ghost" 
                        size="sm"
                        className={exercise.completed ? "text-success" : ""}
                      >
                        {exercise.completed ? "Completed" : "Start"}
                      </FitnessButton>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <FitnessButton asChild className="flex-1" size="lg">
                    <Link to="/workout/start">
                      <Play className="w-4 h-4" />
                      Continue Workout
                    </Link>
                  </FitnessButton>
                  <FitnessButton asChild variant="outline" size="lg">
                    <Link to="/form-check">
                      Form Check
                    </Link>
                  </FitnessButton>
                </div>
              </FitnessCardContent>
            </FitnessCard>
          </TabsContent>

          {/* Workout Plans */}
          <TabsContent value="plans" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search workout plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <FitnessButton variant="outline">
                <Filter className="w-4 h-4" />
                Filters
              </FitnessButton>
            </div>

            {/* Workout Plans Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {workoutPlans.map((plan, index) => (
                <FitnessCard 
                  key={plan.id}
                  variant="interactive"
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <FitnessCardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <FitnessCardTitle>{plan.name}</FitnessCardTitle>
                        <FitnessCardDescription className="mt-1">
                          {plan.description}
                        </FitnessCardDescription>
                      </div>
                      <Badge className={getDifficultyColor(plan.difficulty)}>
                        {plan.difficulty}
                      </Badge>
                    </div>
                  </FitnessCardHeader>
                  
                  <FitnessCardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {plan.duration} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {plan.exercises} exercises
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <FitnessButton asChild className="flex-1">
                        <Link to={`/workout/plan/${plan.id}`}>
                          Start Workout
                        </Link>
                      </FitnessButton>
                      <FitnessButton variant="outline" size="icon">
                        <ChevronRight className="w-4 h-4" />
                      </FitnessButton>
                    </div>
                  </FitnessCardContent>
                </FitnessCard>
              ))}
            </div>
          </TabsContent>

          {/* Exercise Library */}
          <TabsContent value="exercises" className="space-y-6">
            {/* Search */}
            <div className="relative animate-slide-up">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Exercise Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {exerciseLibrary.map((exercise, index) => (
                <FitnessCard 
                  key={index}
                  variant="interactive"
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <FitnessCardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{exercise.name}</h3>
                      <Badge className={getDifficultyColor(exercise.difficulty)}>
                        {exercise.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span>{exercise.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Equipment:</span>
                        <span>{exercise.equipment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{exercise.duration}</span>
                      </div>
                    </div>
                    
                    <FitnessButton asChild variant="outline" className="w-full mt-4" size="sm">
                      <Link to={`/exercise/${exercise.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        View Details
                      </Link>
                    </FitnessButton>
                  </FitnessCardContent>
                </FitnessCard>
              ))}
            </div>
          </TabsContent>

          {/* AI Workout Generator */}
          <TabsContent value="ai-generator">
            <AIWorkoutGenerator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default WorkoutPage