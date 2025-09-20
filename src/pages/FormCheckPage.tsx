import React, { useState, useRef } from "react"
import toast from "react-hot-toast"
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw,
  Play,
  Pause,
  StopCircle
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { FitnessButton } from "@/components/ui/fitness-button"
import { FitnessCard, FitnessCardContent, FitnessCardDescription, FitnessCardHeader, FitnessCardTitle } from "@/components/ui/fitness-card"
import { VideoPlayer } from "@/components/ui/video-player"
import { ConfidenceMeter } from "@/components/ui/confidence-meter"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import gymImage from "@/assets/gym-workout.jpg"

const FormCheckPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [uploadMode, setUploadMode] = useState<"camera" | "upload" | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock analysis result
  const mockAnalysis = {
    confidence: 78,
    feedback: [
      { type: "good", message: "Good depth on squats - hitting parallel" },
      { type: "warning", message: "Keep knees aligned with toes" },
      { type: "tip", message: "Engage core more throughout the movement" }
    ],
    overall: "Good form overall! Focus on knee alignment for safer movement."
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    toast.success("Recording started!")
    // In real app, start camera recording
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setHasRecorded(true)
    toast.success("Recording completed! Analyzing...")
    // In real app, stop recording and process video
    
    // Simulate analysis after recording
    setTimeout(() => {
      setAnalysisResult(mockAnalysis)
      toast.success("Form analysis complete!")
    }, 2000)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setHasRecorded(true)
      setUploadMode("upload")
      toast.success("Video uploaded! Analyzing...")
      
      // Simulate analysis
      setTimeout(() => {
        setAnalysisResult(mockAnalysis)
        toast.success("Form analysis complete!")
      }, 2000)
    }
  }

  const handleRetry = () => {
    setIsRecording(false)
    setHasRecorded(false)
    setAnalysisResult(null)
    setUploadMode(null)
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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
                <h1 className="text-heading-lg mb-2">Form Check</h1>
                <p className="text-body opacity-90">
                  AI-powered analysis to perfect your technique
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Recording/Upload Section */}
          <div className="space-y-6">
            <FitnessCard className="animate-slide-up">
              <FitnessCardHeader>
                <FitnessCardTitle>Record Your Exercise</FitnessCardTitle>
                <FitnessCardDescription>
                  Record a video of your exercise form for AI analysis
                </FitnessCardDescription>
              </FitnessCardHeader>
              
              <FitnessCardContent>
                {!uploadMode && !hasRecorded && (
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
                          <StopCircle className="w-5 h-5" />
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
                      onClick={handleRetry}
                      className="w-full"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Record Again
                    </FitnessButton>
                  </div>
                )}

                {analysisResult && (
                  <div className="space-y-4">
                    {/* Recorded Video Placeholder */}
                    <VideoPlayer 
                      className="aspect-video"
                      poster={gymImage}
                    />
                    
                    <FitnessButton 
                      variant="outline" 
                      onClick={handleRetry}
                      className="w-full"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Try Again
                    </FitnessButton>
                  </div>
                )}
              </FitnessCardContent>
            </FitnessCard>

            {/* Safety Notice */}
            <Alert className="animate-slide-up" style={{ animationDelay: "200ms" }}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Safety Notice:</strong> This AI analysis is for informational purposes only 
                and should not replace professional guidance from a certified trainer or healthcare provider.
              </AlertDescription>
            </Alert>
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            {analysisResult ? (
              <>
                {/* Confidence Score */}
                <FitnessCard variant="interactive" className="animate-slide-up" style={{ animationDelay: "400ms" }}>
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
                <FitnessCard className="animate-slide-up" style={{ animationDelay: "500ms" }}>
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
            ) : (
              <FitnessCard className="animate-slide-up" style={{ animationDelay: "300ms" }}>
                <FitnessCardHeader>
                  <FitnessCardTitle>How It Works</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                      <p>Record yourself performing an exercise or upload an existing video</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                      <p>Our AI analyzes your movement patterns, posture, and technique</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                      <p>Get personalized feedback and tips to improve your form</p>
                    </div>
                  </div>
                </FitnessCardContent>
              </FitnessCard>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default FormCheckPage