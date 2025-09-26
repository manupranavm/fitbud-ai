import React from "react"
import { useParams, Link } from "react-router-dom"
import { 
  ChevronLeft,
  Play,
  Clock,
  Target,
  Dumbbell,
  Users,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"

import { FitnessButton } from "@/components/ui/fitness-button"
import { FitnessCard, FitnessCardContent, FitnessCardDescription, FitnessCardHeader, FitnessCardTitle } from "@/components/ui/fitness-card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { VideoPlayer } from "@/components/ui/video-player"
import gymImage from "@/assets/gym-workout.jpg"

const ExerciseDetailsPage: React.FC = () => {
  const { exerciseName } = useParams()

  // Exercise database - in a real app, this would come from an API/database
  const exercises: Record<string, any> = {
    "push-ups": {
      name: "Push-ups",
      category: "Chest",
      difficulty: "Beginner",
      equipment: "Bodyweight",
      primaryMuscles: ["Chest", "Triceps", "Shoulders"],
      secondaryMuscles: ["Core", "Back"],
      description: "A fundamental bodyweight exercise that builds upper body strength and stability.",
      instructions: [
        "Start in a plank position with hands placed slightly wider than shoulders",
        "Keep your body in a straight line from head to heels",
        "Lower your chest toward the ground, maintaining proper form",
        "Push back up to the starting position",
        "Repeat for desired repetitions"
      ],
      tips: [
        "Keep your core engaged throughout the movement",
        "Don't let your hips sag or pike up",
        "Control the movement - don't rush",
        "If too difficult, modify by doing knee push-ups"
      ],
      commonMistakes: [
        "Letting hips sag or rise too high",
        "Not going through full range of motion",
        "Placing hands too wide or too narrow",
        "Not engaging the core"
      ],
      variations: [
        { name: "Knee Push-ups", difficulty: "Easier" },
        { name: "Incline Push-ups", difficulty: "Easier" },
        { name: "Diamond Push-ups", difficulty: "Harder" },
        { name: "Decline Push-ups", difficulty: "Harder" }
      ],
      videoUrl: "https://www.youtube.com/embed/IODxDxX7oi4",
      sets: "3",
      reps: "12",
      restTime: "60s"
    },
    "squats": {
      name: "Squats",
      category: "Legs",
      difficulty: "Beginner",
      equipment: "Bodyweight",
      primaryMuscles: ["Quadriceps", "Glutes"],
      secondaryMuscles: ["Hamstrings", "Calves", "Core"],
      description: "A fundamental lower body exercise that builds leg strength and improves mobility.",
      instructions: [
        "Stand with feet shoulder-width apart",
        "Lower your body as if sitting back into a chair",
        "Keep your chest up and knees tracking over your toes",
        "Lower until thighs are parallel to the ground",
        "Drive through your heels to return to standing"
      ],
      tips: [
        "Keep your weight on your heels",
        "Don't let knees cave inward",
        "Maintain an upright torso",
        "Go as low as your mobility allows"
      ],
      commonMistakes: [
        "Knees caving inward",
        "Not going deep enough",
        "Leaning too far forward",
        "Rising up on toes"
      ],
      variations: [
        { name: "Wall Squats", difficulty: "Easier" },
        { name: "Box Squats", difficulty: "Easier" },
        { name: "Jump Squats", difficulty: "Harder" },
        { name: "Pistol Squats", difficulty: "Harder" }
      ],
      videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
      sets: "3",
      reps: "15",
      restTime: "60s"
    },
    "deadlift": {
      name: "Deadlift",
      category: "Back",
      difficulty: "Advanced",
      equipment: "Barbell",
      primaryMuscles: ["Hamstrings", "Glutes", "Lower Back"],
      secondaryMuscles: ["Quadriceps", "Traps", "Forearms"],
      description: "A compound exercise that works the entire posterior chain and builds total-body strength.",
      instructions: [
        "Stand with feet hip-width apart, bar over mid-foot",
        "Hinge at hips and knees to grab the bar",
        "Keep chest up and back straight",
        "Drive through heels and extend hips to lift the bar",
        "Stand tall, then reverse the movement to lower"
      ],
      tips: [
        "Keep the bar close to your body",
        "Engage your lats to protect your back",
        "Drive through your heels",
        "Don't round your back"
      ],
      commonMistakes: [
        "Rounding the back",
        "Bar drifting away from body",
        "Not engaging the lats",
        "Hyperextending at the top"
      ],
      variations: [
        { name: "Romanian Deadlift", difficulty: "Intermediate" },
        { name: "Sumo Deadlift", difficulty: "Intermediate" },
        { name: "Trap Bar Deadlift", difficulty: "Intermediate" },
        { name: "Single-leg Deadlift", difficulty: "Harder" }
      ],
      videoUrl: "https://www.youtube.com/embed/ytGaGIn3SjE",
      sets: "4",
      reps: "6",
      restTime: "3min"
    },
    "plank": {
      name: "Plank",
      category: "Core",
      difficulty: "Beginner",
      equipment: "Bodyweight",
      primaryMuscles: ["Core", "Abs"],
      secondaryMuscles: ["Shoulders", "Back", "Glutes"],
      description: "An isometric core exercise that builds stability and strength throughout the midsection.",
      instructions: [
        "Start in a push-up position",
        "Lower onto your forearms",
        "Keep body in a straight line from head to heels",
        "Engage your core and hold the position",
        "Breathe normally throughout the hold"
      ],
      tips: [
        "Don't let hips sag or pike up",
        "Keep neck in neutral position",
        "Breathe normally, don't hold your breath",
        "Start with shorter holds and build up"
      ],
      commonMistakes: [
        "Hips too high or too low",
        "Not engaging the core",
        "Holding breath",
        "Looking up instead of down"
      ],
      variations: [
        { name: "Knee Plank", difficulty: "Easier" },
        { name: "Wall Plank", difficulty: "Easier" },
        { name: "Side Plank", difficulty: "Harder" },
        { name: "Plank with Leg Lifts", difficulty: "Harder" }
      ],
      videoUrl: "https://www.youtube.com/embed/ASdvN_XEl_c",
      sets: "3",
      reps: "30-60s hold",
      restTime: "60s"
    }
  }

  const exercise = exercises[exerciseName || ""]

  if (!exercise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <FitnessCard className="w-96 text-center">
          <FitnessCardContent className="p-8">
            <h2 className="text-xl font-semibold mb-4">Exercise Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested exercise could not be found.</p>
            <FitnessButton asChild>
              <Link to="/workout">Back to Exercises</Link>
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
      case "chest": return <Dumbbell className="w-4 h-4" />
      case "legs": return <Target className="w-4 h-4" />
      case "back": return <Users className="w-4 h-4" />
      case "core": return <Target className="w-4 h-4" />
      default: return <Dumbbell className="w-4 h-4" />
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
            <h1 className="text-heading-lg">{exercise.name}</h1>
            <p className="text-muted-foreground">Exercise Details</p>
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
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-white border-white">
                    {getCategoryIcon(exercise.category)}
                    {exercise.category}
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold mb-2">{exercise.name}</h2>
                <p className="text-body opacity-90">
                  {exercise.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Demo */}
            <FitnessCard>
              <FitnessCardHeader>
                <FitnessCardTitle>Video Demonstration</FitnessCardTitle>
                <FitnessCardDescription>
                  Watch this video to learn proper form and technique
                </FitnessCardDescription>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={exercise.videoUrl}
                    title={`${exercise.name} Demo`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </FitnessCardContent>
            </FitnessCard>

            {/* Instructions */}
            <FitnessCard>
              <FitnessCardHeader>
                <FitnessCardTitle>How to Perform</FitnessCardTitle>
              </FitnessCardHeader>
              <FitnessCardContent>
                <ol className="space-y-2">
                  {exercise.instructions.map((instruction: string, index: number) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </FitnessCardContent>
            </FitnessCard>

            {/* Tips & Common Mistakes */}
            <div className="grid md:grid-cols-2 gap-6">
              <FitnessCard>
                <FitnessCardHeader>
                  <FitnessCardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    Pro Tips
                  </FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <ul className="space-y-2">
                    {exercise.tips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-success font-bold">•</span>
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </FitnessCardContent>
              </FitnessCard>

              <FitnessCard>
                <FitnessCardHeader>
                  <FitnessCardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-secondary" />
                    Common Mistakes
                  </FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <ul className="space-y-2">
                    {exercise.commonMistakes.map((mistake: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-secondary font-bold">•</span>
                        <span className="text-sm">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </FitnessCardContent>
              </FitnessCard>
            </div>

            {/* Variations */}
            <FitnessCard>
              <FitnessCardHeader>
                <FitnessCardTitle>Exercise Variations</FitnessCardTitle>
                <FitnessCardDescription>
                  Try these variations to modify difficulty or target different muscles
                </FitnessCardDescription>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {exercise.variations.map((variation: any, index: number) => (
                    <div 
                      key={index}
                      className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{variation.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {variation.difficulty}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </FitnessCardContent>
            </FitnessCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Exercise Stats */}
            <FitnessCard>
              <FitnessCardHeader>
                <FitnessCardTitle>Exercise Info</FitnessCardTitle>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Equipment:</span>
                    <span className="font-medium">{exercise.equipment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sets:</span>
                    <span className="font-medium">{exercise.sets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reps:</span>
                    <span className="font-medium">{exercise.reps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rest:</span>
                    <span className="font-medium">{exercise.restTime}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Primary Muscles</h4>
                    <div className="flex flex-wrap gap-1">
                      {exercise.primaryMuscles.map((muscle: string, index: number) => (
                        <Badge key={index} variant="default" className="text-xs">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Secondary Muscles</h4>
                    <div className="flex flex-wrap gap-1">
                      {exercise.secondaryMuscles.map((muscle: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </FitnessCardContent>
            </FitnessCard>

            {/* Quick Actions */}
            <FitnessCard>
              <FitnessCardHeader>
                <FitnessCardTitle>Quick Actions</FitnessCardTitle>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="space-y-3">
                  <FitnessButton asChild className="w-full">
                    <Link to="/form-check">
                      <Play className="w-4 h-4" />
                      Check My Form
                    </Link>
                  </FitnessButton>
                  <FitnessButton asChild variant="outline" className="w-full">
                    <Link to="/workout">
                      Start Workout
                    </Link>
                  </FitnessButton>
                </div>
              </FitnessCardContent>
            </FitnessCard>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ExerciseDetailsPage