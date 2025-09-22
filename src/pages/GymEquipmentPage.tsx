import React, { useState, useRef } from 'react';
import { FitnessButton } from "@/components/ui/fitness-button";
import { FitnessCard, FitnessCardContent, FitnessCardDescription, FitnessCardHeader, FitnessCardTitle } from "@/components/ui/fitness-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Camera, Type, Shuffle, Play, Calendar, Clock, RotateCcw, Video, StopCircle, Target, Brain } from "lucide-react";
import gymImage from "@/assets/gym-workout.jpg";

interface Exercise {
  name: string;
  equipment: string;
  sets: number;
  reps: string;
  restTime: string;
  instructions: string;
  muscleGroups: string[];
  difficulty: string;
  youtubeVideos?: Array<{
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    channelTitle: string;
    publishedAt: string;
  }>;
}

interface DayPlan {
  focusArea: string;
  exercises: Exercise[];
}

interface WorkoutPlan {
  weekPlan: Record<string, DayPlan>;
  tips: string[];
  progressionNotes: string;
}

const GymEquipmentPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("input");
  const [loading, setLoading] = useState(false);
  const [shuffling, setShuffle] = useState(false);
  
  // Input states
  const [manualEquipment, setManualEquipment] = useState("");
  const [planName, setPlanName] = useState("My Gym Plan");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  
  // Camera/Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Output states
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [currentEquipment, setCurrentEquipment] = useState<string[]>([]);

  const defaultEquipment = [
    "Dumbbells", "Barbells", "Bench", "Treadmill", "Pull-up Bar",
    "Cable Machine", "Smith Machine", "Leg Extension Machine"
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedVideo(file);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `gym-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setSelectedFiles(prev => [...prev, file]);
            toast({
              title: "Photo Captured",
              description: "Equipment photo added successfully",
            });
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const startVideoRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: true 
      });
      setStream(mediaStream);
      
      const recorder = new MediaRecorder(mediaStream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `gym-walkthrough-${Date.now()}.webm`, { type: 'video/webm' });
        setSelectedVideo(file);
        toast({
          title: "Video Recorded",
          description: "Gym walkthrough video saved successfully",
        });
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Unable to start video recording. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const generateWorkoutPlan = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate workout plans",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const equipmentList = manualEquipment
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      // TODO: Add image/video analysis here when implementing vision API
      const imageAnalysis = selectedFiles.length > 0 || selectedVideo ? 
        "User uploaded equipment media for analysis" : null;

      const { data, error } = await supabase.functions.invoke('generate-equipment-workout', {
        body: {
          equipmentList,
          imageAnalysis,
          planName
        }
      });

      if (error) throw error;

      if (data.success) {
        setWorkoutPlan(data.plan);
        setCurrentEquipment([...defaultEquipment, ...equipmentList]);
        setActiveTab("plan");
        toast({
          title: "Workout Plan Generated!",
          description: "Your personalized 7-day plan is ready",
        });
      } else {
        throw new Error(data.error || 'Failed to generate workout plan');
      }
    } catch (error) {
      console.error('Error generating workout plan:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate workout plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const shufflePlan = async () => {
    if (!workoutPlan || !user) return;
    
    setShuffle(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-equipment-workout', {
        body: {
          equipmentList: currentEquipment.filter(eq => !defaultEquipment.includes(eq)),
          planName: planName + " (Shuffled)"
        }
      });

      if (error) throw error;

      if (data.success) {
        setWorkoutPlan(data.plan);
        toast({
          title: "Plan Shuffled!",
          description: "Generated a new variation of your workout plan",
        });
      }
    } catch (error) {
      console.error('Error shuffling plan:', error);
      toast({
        title: "Shuffle Failed",
        description: "Failed to shuffle plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShuffle(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-success/20 text-success';
      case 'intermediate': return 'bg-primary/20 text-primary';
      case 'advanced': return 'bg-secondary/20 text-secondary';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  const renderExercise = (exercise: Exercise, index: number) => (
    <div key={index} className="p-4 bg-muted rounded-lg space-y-3 border border-border hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-lg">{exercise.name}</h4>
          <p className="text-sm text-muted-foreground">Equipment: {exercise.equipment}</p>
        </div>
        <Badge className={getDifficultyColor(exercise.difficulty)}>
          {exercise.difficulty}
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="font-medium">{exercise.sets}</div>
          <div className="text-muted-foreground">Sets</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{exercise.reps}</div>
          <div className="text-muted-foreground">Reps</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{exercise.restTime}</div>
          <div className="text-muted-foreground">Rest</div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm">{exercise.instructions}</p>
        <div className="flex flex-wrap gap-1">
          {exercise.muscleGroups.map((muscle, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {muscle}
            </Badge>
          ))}
        </div>
      </div>

      {exercise.youtubeVideos && exercise.youtubeVideos.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium text-sm flex items-center gap-2">
            <Play className="h-4 w-4" />
            Video Tutorials
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exercise.youtubeVideos.slice(0, 2).map((video, idx) => (
              <a
                key={idx}
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-2 p-2 bg-background rounded border hover:shadow-md transition-shadow"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-16 h-12 object-cover rounded flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium line-clamp-2">{video.title}</p>
                  <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );

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
                <h1 className="text-heading-lg mb-2">Gym Equipment Planner</h1>
                <p className="text-body opacity-90">
                  Create personalized workout plans based on your available equipment
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Equipment Input
            </TabsTrigger>
            <TabsTrigger value="plan" disabled={!workoutPlan} className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Workout Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-6">
            {/* Plan Details */}
            <FitnessCard className="animate-slide-up">
              <FitnessCardHeader>
                <FitnessCardTitle>Plan Details</FitnessCardTitle>
                <FitnessCardDescription>
                  Set up your personalized workout plan
                </FitnessCardDescription>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="planName" className="text-foreground">Plan Name</Label>
                    <Input
                      id="planName"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      placeholder="My Gym Plan"
                      className="mt-1"
                    />
                  </div>
                </div>
              </FitnessCardContent>
            </FitnessCard>

            {/* Manual Equipment Input */}
            <FitnessCard className="animate-slide-up" style={{ animationDelay: "100ms" }}>
              <FitnessCardHeader>
                <FitnessCardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Manual Equipment List
                </FitnessCardTitle>
                <FitnessCardDescription>
                  List the equipment available at your gym
                </FitnessCardDescription>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="equipment" className="text-foreground">Available Equipment</Label>
                    <Textarea
                      id="equipment"
                      value={manualEquipment}
                      onChange={(e) => setManualEquipment(e.target.value)}
                      placeholder="Leg Press, Lat Pulldown, Cable Machine, Squat Rack..."
                      className="min-h-[100px] mt-1"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Separate equipment with commas. Default equipment (dumbbells, barbells, bench, treadmill) are automatically included.
                    </p>
                  </div>
                </div>
              </FitnessCardContent>
            </FitnessCard>

            {/* Camera Equipment Capture */}
            <FitnessCard className="animate-slide-up" style={{ animationDelay: "200ms" }}>
              <FitnessCardHeader>
                <FitnessCardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Capture Equipment Photos
                </FitnessCardTitle>
                <FitnessCardDescription>
                  Take photos of your gym equipment for automatic detection
                </FitnessCardDescription>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="space-y-4">
                  {/* Camera Controls */}
                  <div className="flex gap-2">
                    {!isCameraOpen ? (
                      <FitnessButton onClick={startCamera} className="flex-1">
                        <Camera className="h-4 w-4" />
                        Start Camera
                      </FitnessButton>
                    ) : (
                      <>
                        <FitnessButton onClick={takePicture} variant="outline" className="flex-1">
                          <Camera className="h-4 w-4" />
                          Take Photo
                        </FitnessButton>
                        <FitnessButton onClick={stopCamera} variant="ghost">
                          Stop Camera
                        </FitnessButton>
                      </>
                    )}
                  </div>

                  {/* Camera Preview */}
                  {isCameraOpen && (
                    <div className="space-y-2">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-border"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}

                  {/* File Upload Option */}
                  <div className="border-t pt-4">
                    <Label htmlFor="images" className="text-foreground">Or Upload Equipment Photos</Label>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="mt-1"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload photos of your gym equipment for automatic detection (coming soon)
                    </p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="text-sm p-3 bg-muted rounded-lg border border-border">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FitnessCardContent>
            </FitnessCard>

            {/* Video Recording */}
            <FitnessCard className="animate-slide-up" style={{ animationDelay: "300ms" }}>
              <FitnessCardHeader>
                <FitnessCardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Record Gym Walkthrough
                </FitnessCardTitle>
                <FitnessCardDescription>
                  Record a video walkthrough of your gym showing all available equipment
                </FitnessCardDescription>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="space-y-4">
                  {/* Video Recording Controls */}
                  <div className="flex gap-2">
                    {!isRecording && !stream ? (
                      <FitnessButton onClick={startVideoRecording} variant="destructive" className="flex-1">
                        <Video className="h-4 w-4" />
                        Start Recording
                      </FitnessButton>
                    ) : (
                      <>
                        <FitnessButton onClick={stopVideoRecording} variant="destructive" className="flex-1">
                          <StopCircle className="h-4 w-4" />
                          Stop Recording
                        </FitnessButton>
                        {isRecording && (
                          <div className="flex items-center text-destructive font-medium">
                            <div className="w-3 h-3 bg-destructive rounded-full animate-pulse mr-2"></div>
                            Recording...
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Video Preview */}
                  {stream && (
                    <div className="space-y-2">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted={!isRecording}
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-border"
                      />
                    </div>
                  )}

                  {/* File Upload Option */}
                  <div className="border-t pt-4">
                    <Label htmlFor="video" className="text-foreground">Or Upload Gym Tour Video</Label>
                    <Input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="mt-1"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload a video walkthrough of your gym for equipment detection (coming soon)
                    </p>
                  </div>

                  {selectedVideo && (
                    <div className="text-sm p-3 bg-muted rounded-lg border border-border">
                      <p className="font-medium truncate">{selectedVideo.name}</p>
                      <p className="text-xs text-muted-foreground">{(selectedVideo.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                </div>
              </FitnessCardContent>
            </FitnessCard>

            {/* Default Equipment */}
            <FitnessCard variant="interactive" className="animate-slide-up" style={{ animationDelay: "400ms" }}>
              <FitnessCardContent className="pt-6">
                <h3 className="font-semibold mb-3 text-lg">Default Equipment Included:</h3>
                <div className="flex flex-wrap gap-2">
                  {defaultEquipment.map((equipment, index) => (
                    <Badge key={index} variant="secondary">
                      {equipment}
                    </Badge>
                  ))}
                </div>
              </FitnessCardContent>
            </FitnessCard>

            <FitnessButton
              onClick={generateWorkoutPlan}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <Brain className="h-4 w-4" />
              {loading ? "Generating Plan..." : "Generate Workout Plan"}
            </FitnessButton>
          </TabsContent>

          <TabsContent value="plan" className="space-y-6">
            {workoutPlan && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-heading-lg font-bold">{planName}</h2>
                  <FitnessButton onClick={shufflePlan} disabled={shuffling} variant="outline">
                    <Shuffle className="h-4 w-4" />
                    {shuffling ? "Shuffling..." : "Shuffle Plan"}
                  </FitnessButton>
                </div>

                <div className="grid gap-6">
                  {Object.entries(workoutPlan.weekPlan).map(([day, dayPlan], index) => (
                    <FitnessCard 
                      key={day} 
                      variant="workout" 
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <FitnessCardHeader>
                        <FitnessCardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          {day} - {dayPlan.focusArea}
                        </FitnessCardTitle>
                      </FitnessCardHeader>
                      <FitnessCardContent>
                        <div className="space-y-4">
                          {dayPlan.exercises.map((exercise, index) => 
                            renderExercise(exercise, index)
                          )}
                        </div>
                      </FitnessCardContent>
                    </FitnessCard>
                  ))}
                </div>

                {workoutPlan.tips && workoutPlan.tips.length > 0 && (
                  <FitnessCard className="animate-slide-up">
                    <FitnessCardHeader>
                      <FitnessCardTitle>Weekly Tips</FitnessCardTitle>
                    </FitnessCardHeader>
                    <FitnessCardContent>
                      <ul className="space-y-2">
                        {workoutPlan.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </FitnessCardContent>
                  </FitnessCard>
                )}

                {workoutPlan.progressionNotes && (
                  <FitnessCard className="animate-slide-up">
                    <FitnessCardHeader>
                      <FitnessCardTitle>Progression Notes</FitnessCardTitle>
                    </FitnessCardHeader>
                    <FitnessCardContent>
                      <p>{workoutPlan.progressionNotes}</p>
                    </FitnessCardContent>
                  </FitnessCard>
                )}

                <FitnessButton
                  onClick={() => setActiveTab("input")}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <RotateCcw className="h-4 w-4" />
                  Create New Plan
                </FitnessButton>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GymEquipmentPage;