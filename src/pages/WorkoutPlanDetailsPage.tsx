import React from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { 
  Play, 
  Clock, 
  Target, 
  ChevronLeft,
  Users,
  Dumbbell,
  Heart,
  Zap
} from "lucide-react"

import { FitnessButton } from "@/components/ui/fitness-button"
import { FitnessCard, FitnessCardContent, FitnessCardDescription, FitnessCardHeader, FitnessCardTitle } from "@/components/ui/fitness-card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import gymImage from "@/assets/gym-workout.jpg"

const WorkoutPlanDetailsPage: React.FC = () => {
  const { planId } = useParams()
  const navigate = useNavigate()

  // Mock data - in real app, fetch from API/database based on planId
  const workoutPlans: Record<string, any> = {
    "1": {
      id: 1,
      name: "Beginner Full Body",
      duration: 30,
      exercises: 8,
      difficulty: "Beginner",
      category: "Full Body",
      description: "Perfect for starting your fitness journey",
      detailedDescription: "This comprehensive full-body workout is designed specifically for beginners who are just starting their fitness journey. It focuses on fundamental movement patterns and basic exercises that will help you build a strong foundation.",
      targetMuscles: ["Chest", "Back", "Legs", "Arms", "Core"],
      equipment: ["Dumbbells", "Bodyweight"],
      caloriesBurned: "150-200",
      exercises_list: [
        { name: "Bodyweight Squats", sets: 3, reps: 10, rest: "60s", instructions: "Stand with feet shoulder-width apart, lower down as if sitting in a chair, then stand back up." },
        { name: "Push-ups (Modified)", sets: 3, reps: 8, rest: "60s", instructions: "Start on knees if needed, lower chest to ground, push back up." },
        { name: "Bent-over Rows", sets: 3, reps: 10, rest: "60s", instructions: "Hold dumbbells, bend at waist, pull weights to chest." },
        { name: "Shoulder Press", sets: 3, reps: 8, rest: "60s", instructions: "Press dumbbells overhead from shoulder height." },
        { name: "Lunges", sets: 3, reps: "8 each leg", rest: "60s", instructions: "Step forward, lower back knee toward ground, return to start." },
        { name: "Plank", sets: 3, reps: "20-30s hold", rest: "60s", instructions: "Hold straight line from head to heels." },
        { name: "Glute Bridges", sets: 3, reps: 12, rest: "60s", instructions: "Lie on back, lift hips up, squeeze glutes." },
        { name: "Dead Bug", sets: 3, reps: "6 each side", rest: "60s", instructions: "Lie on back, alternate opposite arm and leg extensions." }
      ]
    },
    "2": {
      id: 2,
      name: "HIIT Cardio Blast",
      duration: 25,
      exercises: 6,
      difficulty: "Intermediate",
      category: "Cardio",
      description: "High-intensity interval training",
      detailedDescription: "An intense cardio workout that alternates between high-intensity exercises and short rest periods. Perfect for burning calories and improving cardiovascular fitness in a short amount of time.",
      targetMuscles: ["Full Body", "Cardiovascular System"],
      equipment: ["Bodyweight", "Optional: Jump Rope"],
      caloriesBurned: "200-300",
      exercises_list: [
        { name: "Jumping Jacks", sets: 4, reps: "30s", rest: "30s", instructions: "Jump feet apart while raising arms, then jump back to start." },
        { name: "Burpees", sets: 4, reps: "30s", rest: "30s", instructions: "Squat down, jump back to plank, do push-up, jump feet to hands, jump up." },
        { name: "High Knees", sets: 4, reps: "30s", rest: "30s", instructions: "Run in place bringing knees up toward chest." },
        { name: "Mountain Climbers", sets: 4, reps: "30s", rest: "30s", instructions: "In plank position, alternate bringing knees to chest quickly." },
        { name: "Jump Squats", sets: 4, reps: "30s", rest: "30s", instructions: "Perform squat, then jump up explosively, land softly." },
        { name: "Plank Jacks", sets: 4, reps: "30s", rest: "30s", instructions: "In plank position, jump feet apart and together." }
      ]
    },
    "3": {
      id: 3,
      name: "Strength Builder",
      duration: 60,
      exercises: 10,
      difficulty: "Advanced",
      category: "Strength",
      description: "Build serious muscle and power",
      detailedDescription: "An advanced strength training program designed to build serious muscle mass and increase overall power. This workout focuses on compound movements and progressive overload.",
      targetMuscles: ["Chest", "Back", "Legs", "Shoulders", "Arms"],
      equipment: ["Barbell", "Dumbbells", "Bench", "Pull-up Bar"],
      caloriesBurned: "300-400",
      exercises_list: [
        { name: "Barbell Squat", sets: 4, reps: 6, rest: "3min", instructions: "Place bar on upper back, squat down until thighs parallel, drive up." },
        { name: "Deadlift", sets: 4, reps: 6, rest: "3min", instructions: "Lift bar from ground keeping back straight, drive hips forward." },
        { name: "Bench Press", sets: 4, reps: 8, rest: "2min", instructions: "Lower bar to chest, press up explosively." },
        { name: "Pull-ups", sets: 4, reps: "To failure", rest: "2min", instructions: "Hang from bar, pull chin over bar, lower with control." },
        { name: "Overhead Press", sets: 4, reps: 8, rest: "2min", instructions: "Press bar from shoulders overhead, lower with control." },
        { name: "Barbell Rows", sets: 4, reps: 8, rest: "2min", instructions: "Bend over, pull bar to lower chest, squeeze shoulder blades." },
        { name: "Dips", sets: 3, reps: 10, rest: "90s", instructions: "Lower body between parallel bars, press back up." },
        { name: "Bulgarian Split Squats", sets: 3, reps: "10 each leg", rest: "90s", instructions: "Rear foot elevated, lunge down on front leg." },
        { name: "Barbell Curls", sets: 3, reps: 12, rest: "90s", instructions: "Curl bar up to chest, lower with control." },
        { name: "Close-grip Bench Press", sets: 3, reps: 10, rest: "90s", instructions: "Hands closer together, focus on triceps." }
      ]
    },
    "4": {
      id: 4,
      name: "Lower Body Focus",
      duration: 45,
      exercises: 8,
      difficulty: "Intermediate",
      category: "Lower Body",
      description: "Legs, glutes, and core strength",
      detailedDescription: "A targeted lower body workout that builds strength and definition in your legs, glutes, and core. Perfect for developing lower body power and stability.",
      targetMuscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Core"],
      equipment: ["Dumbbells", "Resistance Bands", "Bodyweight"],
      caloriesBurned: "250-350",
      exercises_list: [
        { name: "Goblet Squats", sets: 4, reps: 12, rest: "90s", instructions: "Hold dumbbell at chest, squat down, keep chest up." },
        { name: "Romanian Deadlifts", sets: 4, reps: 10, rest: "90s", instructions: "Hinge at hips, lower weights, feel stretch in hamstrings." },
        { name: "Walking Lunges", sets: 3, reps: "12 each leg", rest: "90s", instructions: "Step forward into lunge, bring back foot to meet front." },
        { name: "Bulgarian Split Squats", sets: 3, reps: "10 each leg", rest: "90s", instructions: "Rear foot elevated, focus on front leg." },
        { name: "Calf Raises", sets: 4, reps: 15, rest: "60s", instructions: "Rise up on toes, hold briefly, lower slowly." },
        { name: "Glute Bridges", sets: 3, reps: 15, rest: "60s", instructions: "Squeeze glutes, lift hips up, hold at top." },
        { name: "Wall Sit", sets: 3, reps: "30-45s", rest: "90s", instructions: "Back against wall, slide down to squat position, hold." },
        { name: "Single-leg Glute Bridges", sets: 3, reps: "8 each leg", rest: "60s", instructions: "One leg extended, lift hips with other leg." }
      ]
    }
  }

  const plan = workoutPlans[planId || "1"]

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <FitnessCard className="w-96 text-center">
          <FitnessCardContent className="p-8">
            <h2 className="text-xl font-semibold mb-4">Workout Plan Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested workout plan could not be found.</p>
            <FitnessButton asChild>
              <Link to="/workout">Back to Workouts</Link>
            </FitnessButton>
          </FitnessCardContent>
        </FitnessCard>
      </div>
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner": return "bg-success/20 text-success"
      case "intermediate": return "bg-primary/20 text-primary"
      case "advanced": return "bg-secondary/20 text-secondary"
      default: return "bg-muted/20 text-muted-foreground"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "cardio": return <Heart className="w-4 h-4" />
      case "strength": return <Dumbbell className="w-4 h-4" />
      case "full body": return <Users className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <FitnessButton asChild variant="outline" size="icon">
            <Link to="/workout">
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </FitnessButton>
          <div>
            <h1 className="text-heading-lg">{plan.name}</h1>
            <p className="text-muted-foreground">Workout Plan Details</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative mb-8 rounded-xl overflow-hidden animate-fade-in">
          <div 
            className="h-64 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${gymImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-overlay" />
            <div className="relative z-10 p-6 flex items-end h-full">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={getDifficultyColor(plan.difficulty)}>
                    {plan.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-white border-white">
                    {getCategoryIcon(plan.category)}
                    {plan.category}
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <p className="text-body opacity-90">
                  {plan.detailedDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workout Overview */}
            <FitnessCard>
              <FitnessCardHeader>
                <FitnessCardTitle>Workout Overview</FitnessCardTitle>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-semibold">{plan.duration} min</div>
                  </div>
                  <div className="text-center">
                    <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-sm text-muted-foreground">Exercises</div>
                    <div className="font-semibold">{plan.exercises}</div>
                  </div>
                  <div className="text-center">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-sm text-muted-foreground">Calories</div>
                    <div className="font-semibold">{plan.caloriesBurned}</div>
                  </div>
                  <div className="text-center">
                    <Dumbbell className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-sm text-muted-foreground">Level</div>
                    <div className="font-semibold">{plan.difficulty}</div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Target Muscles</h4>
                    <div className="flex flex-wrap gap-2">
                      {plan.targetMuscles.map((muscle: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Equipment Needed</h4>
                    <div className="flex flex-wrap gap-2">
                      {plan.equipment.map((item: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </FitnessCardContent>
            </FitnessCard>

            {/* Exercise List */}
            <FitnessCard>
              <FitnessCardHeader>
                <FitnessCardTitle>Exercise Breakdown</FitnessCardTitle>
                <FitnessCardDescription>
                  Complete list of exercises in this workout
                </FitnessCardDescription>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="space-y-4">
                  {plan.exercises_list.map((exercise: any, index: number) => (
                    <div 
                      key={index}
                      className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{exercise.name}</h4>
                        <div className="text-sm text-muted-foreground">
                          {exercise.sets} sets × {exercise.reps} • Rest: {exercise.rest}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {exercise.instructions}
                      </p>
                    </div>
                  ))}
                </div>
              </FitnessCardContent>
            </FitnessCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Start Workout */}
            <FitnessCard variant="interactive">
              <FitnessCardHeader>
                <FitnessCardTitle>Ready to Start?</FitnessCardTitle>
                <FitnessCardDescription>
                  Begin this workout session now
                </FitnessCardDescription>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="space-y-3">
                  <FitnessButton asChild className="w-full" size="lg">
                    <Link to={`/workout/session/${plan.id}`}>
                      <Play className="w-4 h-4" />
                      Start Workout
                    </Link>
                  </FitnessButton>
                  <FitnessButton asChild variant="outline" className="w-full">
                    <Link to="/form-check">
                      Form Check
                    </Link>
                  </FitnessButton>
                </div>
              </FitnessCardContent>
            </FitnessCard>

            {/* Tips */}
            <FitnessCard>
              <FitnessCardHeader>
                <FitnessCardTitle>Workout Tips</FitnessCardTitle>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Warm up for 5-10 minutes before starting</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Focus on proper form over speed</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Stay hydrated throughout the workout</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Rest as needed between sets</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Cool down and stretch after finishing</span>
                  </div>
                </div>
              </FitnessCardContent>
            </FitnessCard>
          </div>
        </div>
      </main>
    </div>
  )
}

export default WorkoutPlanDetailsPage