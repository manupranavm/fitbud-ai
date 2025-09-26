import React, { useState, useRef, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  CheckCircle2, 
  Circle,
  Camera,
  Upload,
  Video,
  Clock,
  Target,
  AlertTriangle,
  RotateCcw,
  Home,
  X
} from "lucide-react"

import { FitnessButton } from "@/components/ui/fitness-button"
import { FitnessCard, FitnessCardContent, FitnessCardDescription, FitnessCardHeader, FitnessCardTitle } from "@/components/ui/fitness-card"
import { VideoPlayer } from "@/components/ui/video-player"
import { ConfidenceMeter } from "@/components/ui/confidence-meter"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import gymImage from "@/assets/gym-workout.jpg"
import { useWorkout } from "@/hooks/useWorkout"
import { useEquipmentWorkouts } from "@/hooks/useEquipmentWorkouts"

interface Exercise {
  name: string
  sets: number
  reps: number | string
  restTime?: string
  instructions?: string
  demoVideoUrl?: string
  completed: boolean
}

interface WorkoutData {
  id: string
  name: string
  duration: number
  exercises: Exercise[]
  difficulty: string
}

const WorkoutSessionPage: React.FC = () => {
  const { workoutId } = useParams()
  const navigate = useNavigate()
  const { completeWorkout, addWorkoutToHistory } = useWorkout()
  const { getTodaysWorkout } = useEquipmentWorkouts()
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [isResting, setIsResting] = useState(false)
  const [restTimeLeft, setRestTimeLeft] = useState(0)
  const [showFormCheck, setShowFormCheck] = useState(false)
  const [showDemoVideo, setShowDemoVideo] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get workout data from equipment planner or use default
  const getWorkoutData = (): WorkoutData => {
    if (workoutId === 'today') {
      const equipmentWorkout = getTodaysWorkout()
      if (equipmentWorkout) {
        return {
          id: 'today',
          name: equipmentWorkout.name,
          duration: equipmentWorkout.duration,
          difficulty: equipmentWorkout.difficulty,
          exercises: equipmentWorkout.exercises.map(ex => ({
            ...ex,
            restTime: "60s",
            instructions: `Perform ${ex.reps} repetitions for ${ex.sets} sets.`,
            demoVideoUrl: "https://www.youtube.com/embed/IODxDxX7oi4",
            completed: false
          }))
        }
      }
    }

    // Default workout data for other workout IDs
    return {
      id: workoutId || "1",
      name: "Upper Body Strength",
      duration: 45,
      difficulty: "Intermediate",
      exercises: [
        {
          name: "Push-ups",
          sets: 3,
          reps: 12,
          restTime: "60s",
          instructions: "Keep your body straight, lower until chest nearly touches the ground, then push back up.",
          demoVideoUrl: "https://www.youtube.com/embed/IODxDxX7oi4",
          completed: false
        },
        {
          name: "Bench Press",
          sets: 4,
          reps: 8,
          restTime: "90s",
          instructions: "Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up.",
          demoVideoUrl: "https://www.youtube.com/embed/rT7DgCr-3pg",
          completed: false
        },
        {
          name: "Dumbbell Rows",
          sets: 3,
          reps: 10,
          restTime: "60s",
          instructions: "Bend over slightly, pull dumbbells to your sides, squeeze shoulder blades together.",
          demoVideoUrl: "https://www.youtube.com/embed/6TSP1TRKn_w",
          completed: false
        },
        {
          name: "Shoulder Press",
          sets: 3,
          reps: 10,
          restTime: "60s",
          instructions: "Press dumbbells overhead, keep core tight, lower with control.",
          demoVideoUrl: "https://www.youtube.com/embed/qEwKCR5JCog",
          completed: false
        }
      ]
    }
  }

  const workoutData = getWorkoutData()

  const currentExercise = workoutData.exercises[currentExerciseIndex]
  const totalSets = currentExercise?.sets || 0
  const progressPercentage = ((currentExerciseIndex * 100) + ((currentSet - 1) / totalSets * 100)) / workoutData.exercises.length

  // Mock analysis result
  const mockAnalysis = {
    confidence: 78,
    feedback: [
      { type: "good", message: "Good depth and form - hitting proper range of motion" },
      { type: "warning", message: "Keep your core engaged throughout the movement" },
      { type: "tip", message: "Try to control the movement more on the way down" }
    ],
    overall: "Good form overall! Focus on core engagement for better stability."
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setIsResting(false)
            toast.success("Rest time over! Ready for next set.")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isResting, restTimeLeft])

  const completeSet = () => {
    if (currentSet < totalSets) {
      setCurrentSet(prev => prev + 1)
      if (currentExercise.restTime) {
        const restSeconds = parseInt(currentExercise.restTime.replace('s', ''))
        setRestTimeLeft(restSeconds)
        setIsResting(true)
        toast.success(`Set ${currentSet} completed! Rest for ${currentExercise.restTime}`)
      }
    } else {
      // Exercise completed
      workoutData.exercises[currentExerciseIndex].completed = true
      toast.success(`${currentExercise.name} completed!`)
      
      if (currentExerciseIndex < workoutData.exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1)
        setCurrentSet(1)
      } else {
        // Workout completed
        const completedWorkout = {
          id: workoutData.id,
          name: workoutData.name,
          date: new Date().toISOString(),
          duration: workoutData.duration,
          exercises: workoutData.exercises.map(ex => ({ 
            name: ex.name,
            sets: ex.sets,
            reps: typeof ex.reps === 'string' ? parseInt(ex.reps) || 12 : ex.reps,
            completed: true
          })),
          difficulty: workoutData.difficulty,
          completed: true
        }
        
        addWorkoutToHistory(completedWorkout)
        completeWorkout()
        toast.success("Workout completed! Great job!")
        navigate("/dashboard")
      }
    }
  }

  const skipExercise = () => {
    if (currentExerciseIndex < workoutData.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1)
      setCurrentSet(1)
      setIsResting(false)
    }
  }

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1)
      setCurrentSet(1)
      setIsResting(false)
    }
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    toast.success("Recording started!")
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setHasRecorded(true)
    toast.success("Recording completed! Analyzing...")
    
    setTimeout(() => {
      setAnalysisResult(mockAnalysis)
      toast.success("Form analysis complete!")
    }, 2000)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setHasRecorded(true)
      toast.success("Video uploaded! Analyzing...")
      
      setTimeout(() => {
        setAnalysisResult(mockAnalysis)
        toast.success("Form analysis complete!")
      }, 2000)
    }
  }

  const resetFormCheck = () => {
    setIsRecording(false)
    setHasRecorded(false)
    setAnalysisResult(null)
  }

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case "good": return <CheckCircle2 className="w-4 h-4 text-success" />
      case "warning": return <AlertTriangle className="w-4 h-4 text-secondary" />
      default: return <CheckCircle2 className="w-4 h-4 text-primary" />
    }
  }

  const getFeedbackColor = (type: string) => {
    switch (type) {
      case "good": return "border-l-success"
      case "warning": return "border-l-secondary" 
      default: return "border-l-primary"
    }
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <FitnessCard className="w-96 text-center">
          <FitnessCardContent className="p-8">
            <h2 className="text-xl font-semibold mb-4">Workout Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested workout could not be found.</p>
            <FitnessButton asChild>
              <Link to="/workout">Back to Workouts</Link>
            </FitnessButton>
          </FitnessCardContent>
        </FitnessCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-heading-lg">{workoutData.name}</h1>
            <p className="text-muted-foreground">
              Exercise {currentExerciseIndex + 1} of {workoutData.exercises.length}
            </p>
          </div>
          <FitnessButton asChild variant="outline">
            <Link to="/workout">
              <X className="w-4 h-4" />
              Exit Workout
            </Link>
          </FitnessButton>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Rest Timer */}
        {isResting && (
          <Alert className="mb-6 animate-pulse">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Rest Time:</strong> {Math.floor(restTimeLeft / 60)}:{(restTimeLeft % 60).toString().padStart(2, '0')} remaining
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Exercise Details */}
          <div className="space-y-6">
            <FitnessCard>
              <FitnessCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <FitnessCardTitle className="text-xl">{currentExercise.name}</FitnessCardTitle>
                    <FitnessCardDescription>
                      Set {currentSet} of {totalSets} • {currentExercise.reps} reps
                    </FitnessCardDescription>
                  </div>
                  <Badge variant="outline">
                    {workoutData.difficulty}
                  </Badge>
                </div>
              </FitnessCardHeader>
              
              <FitnessCardContent>
                {currentExercise.instructions && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Instructions:</h4>
                    <p className="text-sm text-muted-foreground">{currentExercise.instructions}</p>
                  </div>
                )}

                <div className="flex gap-3 mb-4">
                  <FitnessButton 
                    onClick={() => setShowDemoVideo(true)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Video className="w-4 h-4" />
                    Watch Demo
                  </FitnessButton>
                  <FitnessButton 
                    onClick={() => setShowFormCheck(true)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4" />
                    Check Form
                  </FitnessButton>
                </div>

                <div className="flex gap-3">
                  <FitnessButton 
                    onClick={completeSet}
                    disabled={isResting}
                    className="flex-1"
                    size="lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Set
                  </FitnessButton>
                </div>
              </FitnessCardContent>
            </FitnessCard>

            {/* Exercise Navigation */}
            <div className="flex gap-3">
              <FitnessButton 
                onClick={previousExercise}
                disabled={currentExerciseIndex === 0}
                variant="outline"
              >
                <SkipBack className="w-4 h-4" />
                Previous
              </FitnessButton>
              <FitnessButton 
                onClick={skipExercise}
                disabled={currentExerciseIndex === workoutData.exercises.length - 1}
                variant="outline"
              >
                Skip
                <SkipForward className="w-4 h-4" />
              </FitnessButton>
            </div>
          </div>

          {/* Exercise List */}
          <div>
            <FitnessCard>
              <FitnessCardHeader>
                <FitnessCardTitle>Exercise List</FitnessCardTitle>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="space-y-3">
                  {workoutData.exercises.map((exercise, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        index === currentExerciseIndex 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {exercise.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : index === currentExerciseIndex ? (
                          <Target className="w-5 h-5 text-primary" />
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
                    </div>
                  ))}
                </div>
              </FitnessCardContent>
            </FitnessCard>
          </div>
        </div>
      </main>

      {/* Demo Video Dialog */}
      <Dialog open={showDemoVideo} onOpenChange={setShowDemoVideo}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{currentExercise.name} - Demo Video</DialogTitle>
            <DialogDescription>
              Watch this demonstration to learn proper form and technique
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {currentExercise.demoVideoUrl ? (
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={currentExercise.demoVideoUrl}
                  title={`${currentExercise.name} Demo`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Demo video not available</p>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <FitnessButton onClick={() => setShowDemoVideo(false)}>
                Close
              </FitnessButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Check Dialog */}
      <Dialog open={showFormCheck} onOpenChange={setShowFormCheck}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Check - {currentExercise.name}</DialogTitle>
            <DialogDescription>
              Record or upload a video to get AI-powered form analysis
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="record" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="record">Record Video</TabsTrigger>
              <TabsTrigger value="analysis" disabled={!analysisResult}>
                Analysis Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="record" className="space-y-4">
              {!hasRecorded && (
                <div className="space-y-4">
                  {/* Camera Preview Area */}
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                    <div className="text-center space-y-4">
                      <Camera className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">
                        {isRecording ? "Recording in progress..." : "Camera preview will appear here"}
                      </p>
                    </div>
                  </div>

                  {/* Recording Controls */}
                  <div className="flex justify-center gap-4">
                    {!isRecording ? (
                      <FitnessButton 
                        onClick={handleStartRecording}
                        size="lg"
                        className="flex-1"
                      >
                        <Camera className="w-5 h-5" />
                        Start Recording
                      </FitnessButton>
                    ) : (
                      <FitnessButton 
                        onClick={handleStopRecording}
                        variant="destructive"
                        size="lg"
                        className="flex-1"
                      >
                        <Pause className="w-5 h-5" />
                        Stop Recording
                      </FitnessButton>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  {/* Upload Option */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <FitnessButton 
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      size="lg"
                    >
                      <Upload className="w-5 h-5" />
                      Upload Video
                    </FitnessButton>
                  </div>
                </div>
              )}

              {hasRecorded && !analysisResult && (
                <div className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="animate-pulse">
                        <Play className="w-12 h-12 text-primary mx-auto" />
                      </div>
                      <p className="text-muted-foreground">Analyzing your form...</p>
                      <div className="text-xs text-muted-foreground">This may take a few seconds</div>
                    </div>
                  </div>
                  
                  <FitnessButton 
                    variant="outline" 
                    onClick={resetFormCheck}
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Record Again
                  </FitnessButton>
                </div>
              )}

              {analysisResult && (
                <div className="space-y-4">
                  <VideoPlayer 
                    className="aspect-video"
                    poster={gymImage}
                  />
                  
                  <FitnessButton 
                    variant="outline" 
                    onClick={resetFormCheck}
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </FitnessButton>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              {analysisResult && (
                <>
                  {/* Confidence Score */}
                  <FitnessCard variant="interactive">
                    <FitnessCardHeader>
                      <FitnessCardTitle>Form Analysis Score</FitnessCardTitle>
                    </FitnessCardHeader>
                    <FitnessCardContent>
                      <div className="flex items-center justify-center">
                        <ConfidenceMeter 
                          confidence={analysisResult.confidence}
                          size="lg"
                        />
                      </div>
                    </FitnessCardContent>
                  </FitnessCard>

                  {/* Detailed Feedback */}
                  <FitnessCard>
                    <FitnessCardHeader>
                      <FitnessCardTitle>Detailed Feedback</FitnessCardTitle>
                      <FitnessCardDescription>
                        AI-generated insights to improve your form
                      </FitnessCardDescription>
                    </FitnessCardHeader>
                    
                    <FitnessCardContent>
                      <div className="space-y-4">
                        {analysisResult.feedback.map((item: any, index: number) => (
                          <div 
                            key={index}
                            className={`p-3 border-l-4 rounded-r-lg bg-muted/30 ${getFeedbackColor(item.type)}`}
                          >
                            <div className="flex items-start gap-3">
                              {getFeedbackIcon(item.type)}
                              <p className="text-sm flex-1">{item.message}</p>
                            </div>
                          </div>
                        ))}
                        
                        <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            Overall Assessment
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {analysisResult.overall}
                          </p>
                        </div>
                      </div>
                    </FitnessCardContent>
                  </FitnessCard>
                </>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3">
            <FitnessButton variant="outline" onClick={() => setShowFormCheck(false)}>
              Close
            </FitnessButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WorkoutSessionPage