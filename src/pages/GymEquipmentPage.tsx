import React, { useState, useRef, useEffect } from 'react';
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
import { Upload, Camera, Type, Shuffle, Play, Calendar, Clock, RotateCcw, Video, StopCircle, Target, Brain, Trash2 } from "lucide-react";
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

const GymEquipmentPage: React.FC = () => {
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
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  // Handle deep link to today's plan section
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('goto') === 'today') {
      // Switch to plan tab
      setActiveTab('plan')
      // Wait for tab content to render then scroll to today's day section
      setTimeout(() => {
        const today = new Date()
        const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
        const id = `day-${dayNames[today.getDay()].toLowerCase()}`
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 250)
    }
  }, [])

  const defaultEquipment = [
    "Dumbbells", "Barbells", "Bench", "Treadmill", "Pull-up Bar",
    "Cable Machine", "Smith Machine", "Leg Extension Machine"
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner": return "bg-success/20 text-success"
      case "intermediate": return "bg-primary/20 text-primary"
      case "advanced": return "bg-secondary/20 text-secondary"
      default: return "bg-muted/20 text-muted-foreground"
    }
  }

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
      console.log('Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      });
      console.log('Camera stream obtained:', mediaStream);
      console.log('Stream tracks:', mediaStream.getTracks());
      
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      // Wait for the component to re-render with isCameraOpen = true
      setTimeout(async () => {
        if (videoRef.current && mediaStream && mediaStream.active) {
          console.log('Setting video srcObject');
          videoRef.current.srcObject = mediaStream;
          
          // Add event listeners for debugging
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded:', {
              videoWidth: videoRef.current?.videoWidth,
              videoHeight: videoRef.current?.videoHeight,
              readyState: videoRef.current?.readyState
            });
          };
          
          videoRef.current.oncanplay = () => {
            console.log('Video can play');
          };
          
          videoRef.current.onplay = () => {
            console.log('Video started playing');
          };
          
          videoRef.current.onerror = (e) => {
            console.error('Video error:', e);
          };
          
          try {
            console.log('Attempting to play video...');
            await videoRef.current.play();
            console.log('Video is now playing successfully');
          } catch (playError) {
            console.error('Error playing video:', playError);
            toast({
              title: "Camera Error",
              description: "Failed to start camera preview. Try again.",
              variant: "destructive",
            });
          }
        } else {
          console.error('Video ref not available or stream inactive');
          toast({
            title: "Camera Error",
            description: "Camera setup failed. Please try again.",
            variant: "destructive",
          });
        }
      }, 200);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
      setIsCameraOpen(false);
      setStream(null);
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
      console.log('Starting video recording...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true 
      });
      console.log('Video recording stream obtained:', mediaStream);
      console.log('Recording stream tracks:', mediaStream.getTracks());
      
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
      
      // Wait for component to re-render
      setTimeout(async () => {
        if (videoRef.current && mediaStream && mediaStream.active) {
          console.log('Setting video recording srcObject');
          videoRef.current.srcObject = mediaStream;
          
          videoRef.current.onloadedmetadata = () => {
            console.log('Video recording metadata loaded');
          };
          
          try {
            await videoRef.current.play();
            console.log('Video recording is now playing');
          } catch (playError) {
            console.error('Error playing recording video:', playError);
          }
        }
      }, 200);
      
    } catch (error) {
      console.error('Error starting video recording:', error);
      toast({
        title: "Recording Error",
        description: "Unable to start video recording. Please check permissions.",
        variant: "destructive",
      });
      setIsRecording(false);
      setStream(null);
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
        const fullEquipmentList = [...defaultEquipment, ...equipmentList];
        setWorkoutPlan(data.plan);
        setCurrentEquipment(fullEquipmentList);
        
        // Save the workout plan to database
        const { error: saveError } = await supabase
          .from('equipment_workouts')
          .insert({
            user_id: user.id,
            plan_name: planName,
            equipment_list: fullEquipmentList,
            workout_plan: data.plan
          });

        if (saveError) {
          console.error('Error saving workout plan:', saveError);
          toast({
            title: "Save Warning",
            description: "Plan generated but not saved to your library.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Workout Plan Generated & Saved!",
            description: "Your personalized 7-day plan is ready and saved to your library",
          });
        }
        
        setActiveTab("plan");
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
        
        // Save the shuffled workout plan to database
        const { error: saveError } = await supabase
          .from('equipment_workouts')
          .insert({
            user_id: user.id,
            plan_name: planName + " (Shuffled)",
            equipment_list: currentEquipment,
            workout_plan: data.plan
          });

        if (saveError) {
          console.error('Error saving shuffled workout plan:', saveError);
          toast({
            title: "Plan Shuffled!",
            description: "Generated a new variation but not saved to library.",
          });
        } else {
          toast({
            title: "Plan Shuffled & Saved!",
            description: "Generated a new variation and saved to your library",
          });
        }
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

  // Load saved workout plans
  const loadSavedPlans = async () => {
    if (!user) return;
    
    setLoadingPlans(true);
    try {
      const { data, error } = await supabase
        .from('equipment_workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedPlans(data || []);
    } catch (error) {
      console.error('Error loading saved plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Load a saved workout plan
  const loadSavedPlan = (plan: any) => {
    setWorkoutPlan(plan.workout_plan as unknown as WorkoutPlan);
    setCurrentEquipment(plan.equipment_list);
    setPlanName(plan.plan_name);
    setActiveTab("plan");
    toast({
      title: "Plan Loaded",
      description: `Loaded "${plan.plan_name}" from your saved plans`,
    });
  };

  // Delete a saved workout plan
  const deleteSavedPlan = async (planId: string, planName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the load action
    
    try {
      const { error } = await supabase
        .from('equipment_workouts')
        .delete()
        .eq('id', planId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Remove from local state
      setSavedPlans(prev => prev.filter(plan => plan.id !== planId));
      
      toast({
        title: "Plan Deleted",
        description: `"${planName}" has been removed from your saved plans`,
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the workout plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load saved plans when user changes
  useEffect(() => {
    if (user) {
      loadSavedPlans();
      loadLatestPlan(); // Auto-load the latest plan
    } else {
      setSavedPlans([]);
      setWorkoutPlan(null);
      setCurrentEquipment([]);
    }
  }, [user]);

  // Load the latest workout plan automatically
  const loadLatestPlan = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('equipment_workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setWorkoutPlan(data.workout_plan as unknown as WorkoutPlan);
        setCurrentEquipment(data.equipment_list);
        setPlanName(data.plan_name);
        // Only switch to plan tab if we're currently on input tab and no plan is active
        if (activeTab === 'input' && !workoutPlan) {
          setActiveTab("plan");
        }
      }
    } catch (error) {
      console.error('Error loading latest plan:', error);
    }
  };

  const renderExercise = (exercise: Exercise, index: number) => (
    <div 
      key={index} 
      className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors bg-gradient-card"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-lg">{exercise.name}</h4>
          <p className="text-sm text-muted-foreground">Equipment: {exercise.equipment}</p>
        </div>
        <Badge className={getDifficultyColor(exercise.difficulty)}>
          {exercise.difficulty}
        </Badge>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {exercise.sets} sets
        </div>
        <div className="flex items-center gap-1">
          <Target className="w-4 h-4" />
          {exercise.reps} reps
        </div>
        <div className="text-xs">
          Rest: {exercise.restTime}
        </div>
      </div>

      <p className="text-sm mb-3">{exercise.instructions}</p>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {exercise.muscleGroups.map((muscle, idx) => (
          <Badge key={idx} variant="outline" className="text-xs">
            {muscle}
          </Badge>
        ))}
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
                className="flex gap-2 p-2 bg-card rounded border hover:shadow-md transition-shadow"
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
                    <Label htmlFor="planName">Plan Name</Label>
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
                    <Label htmlFor="equipment">Available Equipment</Label>
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
                  {/* Video Preview Area */}
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                    {stream ? (
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted={!isRecording}
                        className="w-full h-full object-cover rounded-lg"
                        style={{ 
                          display: 'block',
                          minHeight: '200px'
                        }}
                      />
                    ) : (
                      <div className="text-center space-y-4">
                        <Video className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">
                          {isRecording ? "Recording in progress..." : "Video preview will appear here"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Recording Controls */}
                  <div className="flex justify-center gap-4">
                    {!isRecording && !stream ? (
                      <FitnessButton 
                        onClick={startVideoRecording}
                        variant="destructive"
                        size="lg"
                        className="flex-1"
                      >
                        <Video className="w-5 h-5" />
                        Start Recording
                      </FitnessButton>
                    ) : (
                      <>
                        <FitnessButton 
                          onClick={stopVideoRecording}
                          variant="destructive"
                          size="lg"
                          className="flex-1"
                        >
                          <StopCircle className="w-5 h-5" />
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

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  {/* File Upload Option */}
                  <div>
                    <Label htmlFor="video">Upload Gym Tour Video</Label>
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
                    <div className="text-sm p-3 bg-card rounded-lg border border-border">
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

            {/* Saved Plans Section */}
            {user && savedPlans.length > 0 && (
              <FitnessCard className="animate-slide-up" style={{ animationDelay: "500ms" }}>
                <FitnessCardHeader>
                  <FitnessCardTitle>Your Saved Plans</FitnessCardTitle>
                  <FitnessCardDescription>
                    Load a previously generated workout plan
                  </FitnessCardDescription>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <div className="space-y-3">
                    {loadingPlans ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      savedPlans.slice(0, 3).map((plan) => (
                        <div
                          key={plan.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors cursor-pointer"
                          onClick={() => loadSavedPlan(plan)}
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{plan.plan_name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(plan.created_at).toLocaleDateString()} • {plan.equipment_list?.length || 0} equipment
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <FitnessButton variant="outline" size="sm">
                              Load
                            </FitnessButton>
                            <FitnessButton 
                              variant="destructive" 
                              size="sm"
                              onClick={(e) => deleteSavedPlan(plan.id, plan.plan_name, e)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </FitnessButton>
                          </div>
                        </div>
                      ))
                    )}
                    {savedPlans.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{savedPlans.length - 3} more saved plans
                      </p>
                    )}
                  </div>
                </FitnessCardContent>
              </FitnessCard>
            )}

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
                  <h2 className="text-heading-lg">{planName}</h2>
                  <FitnessButton onClick={shufflePlan} disabled={shuffling} variant="outline">
                    <Shuffle className="h-4 w-4" />
                    {shuffling ? "Shuffling..." : "Shuffle Plan"}
                  </FitnessButton>
                </div>

                <div className="grid gap-6">
                  {Object.entries(workoutPlan.weekPlan).map(([day, dayPlan], index) => (
                    <FitnessCard 
                      id={`day-${String(day).toLowerCase()}`}
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
                      <div className="space-y-4">
                        {workoutPlan.tips.map((tip, index) => (
                          <div 
                            key={index}
                            className="p-3 border-l-4 rounded-r-lg bg-muted/30 border-l-primary"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                              <p className="text-sm flex-1">{tip}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </FitnessCardContent>
                  </FitnessCard>
                )}

                {workoutPlan.progressionNotes && (
                  <FitnessCard className="animate-slide-up">
                    <FitnessCardHeader>
                      <FitnessCardTitle>Progression Notes</FitnessCardTitle>
                    </FitnessCardHeader>
                    <FitnessCardContent>
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <p className="text-sm">{workoutPlan.progressionNotes}</p>
                      </div>
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