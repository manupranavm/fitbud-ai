import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Camera, Type, Shuffle, Play, Calendar, Clock, RotateCcw, Video, StopCircle } from "lucide-react";

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
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderExercise = (exercise: Exercise, index: number) => (
    <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-lg">{exercise.name}</h4>
          <p className="text-sm text-gray-600">Equipment: {exercise.equipment}</p>
        </div>
        <Badge className={getDifficultyColor(exercise.difficulty)}>
          {exercise.difficulty}
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="font-medium">{exercise.sets}</div>
          <div className="text-gray-500">Sets</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{exercise.reps}</div>
          <div className="text-gray-500">Reps</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{exercise.restTime}</div>
          <div className="text-gray-500">Rest</div>
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
                className="flex gap-2 p-2 bg-white rounded border hover:shadow-md transition-shadow"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-16 h-12 object-cover rounded flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium line-clamp-2">{video.title}</p>
                  <p className="text-xs text-gray-500">{video.channelTitle}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">{/* Changed background */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gym Equipment Planner</h1>
          <p className="text-lg text-gray-600">Create personalized workout plans based on your available equipment</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-lg border border-gray-200">
            <TabsTrigger value="input" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Equipment Input</TabsTrigger>
            <TabsTrigger value="plan" disabled={!workoutPlan} className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Workout Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="text-xl">Plan Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="planName" className="text-gray-700 font-medium">Plan Name</Label>
                    <Input
                      id="planName"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      placeholder="My Gym Plan"
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Type className="h-5 w-5" />
                  Manual Equipment List
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="equipment" className="text-gray-700 font-medium">Available Equipment</Label>
                    <Textarea
                      id="equipment"
                      value={manualEquipment}
                      onChange={(e) => setManualEquipment(e.target.value)}
                      placeholder="Leg Press, Lat Pulldown, Cable Machine, Squat Rack..."
                      className="min-h-[100px] mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Separate equipment with commas. Default equipment (dumbbells, barbells, bench, treadmill) are automatically included.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Camera className="h-5 w-5" />
                  Capture Equipment Photos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Camera Controls */}
                  <div className="flex gap-2">
                    {!isCameraOpen ? (
                      <Button onClick={startCamera} className="bg-purple-500 hover:bg-purple-600">
                        <Camera className="h-4 w-4 mr-2" />
                        Start Camera
                      </Button>
                    ) : (
                      <>
                        <Button onClick={takePicture} className="bg-green-500 hover:bg-green-600">
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </Button>
                        <Button onClick={stopCamera} variant="outline">
                          Stop Camera
                        </Button>
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
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-purple-300"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}

                  {/* File Upload Option */}
                  <div className="border-t pt-4">
                    <Label htmlFor="images" className="text-gray-700 font-medium">Or Upload Equipment Photos</Label>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Upload photos of your gym equipment for automatic detection (coming soon)
                    </p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="text-sm p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Video className="h-5 w-5" />
                  Record Gym Walkthrough
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Video Recording Controls */}
                  <div className="flex gap-2">
                    {!isRecording && !stream ? (
                      <Button onClick={startVideoRecording} className="bg-red-500 hover:bg-red-600">
                        <Video className="h-4 w-4 mr-2" />
                        Start Recording
                      </Button>
                    ) : (
                      <>
                        <Button onClick={stopVideoRecording} className="bg-red-600 hover:bg-red-700">
                          <StopCircle className="h-4 w-4 mr-2" />
                          Stop Recording
                        </Button>
                        {isRecording && (
                          <div className="flex items-center text-red-600 font-medium">
                            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2"></div>
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
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-red-300"
                      />
                    </div>
                  )}

                  {/* File Upload Option */}
                  <div className="border-t pt-4">
                    <Label htmlFor="video" className="text-gray-700 font-medium">Or Upload Gym Tour Video</Label>
                    <Input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Upload a video walkthrough of your gym for equipment detection (coming soon)
                    </p>
                  </div>

                  {selectedVideo && (
                    <div className="text-sm p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="font-medium">{selectedVideo.name}</p>
                      <p className="text-xs text-gray-500">{(selectedVideo.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3 text-lg text-blue-900">Default Equipment Included:</h3>
                <div className="flex flex-wrap gap-2">
                  {defaultEquipment.map((equipment, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800 border border-blue-300">
                      {equipment}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={generateWorkoutPlan}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 shadow-lg transform transition hover:scale-105"
              size="lg"
            >
              {loading ? "Generating Plan..." : "Generate Workout Plan"}
            </Button>
          </TabsContent>

          <TabsContent value="plan" className="space-y-6">
            {workoutPlan && (
              <>
                <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-lg border-0">
                  <h2 className="text-3xl font-bold text-gray-900">{planName}</h2>
                  <Button onClick={shufflePlan} disabled={shuffling} variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                    <Shuffle className="h-4 w-4 mr-2" />
                    {shuffling ? "Shuffling..." : "Shuffle Plan"}
                  </Button>
                </div>

                <div className="grid gap-6">
                  {Object.entries(workoutPlan.weekPlan).map(([day, dayPlan]) => (
                    <Card key={day} className="overflow-hidden shadow-lg border-0 bg-white">
                      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Calendar className="h-5 w-5" />
                          {day} - {dayPlan.focusArea}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {dayPlan.exercises.map((exercise, index) => 
                            renderExercise(exercise, index)
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {workoutPlan.tips && workoutPlan.tips.length > 0 && (
                  <Card className="shadow-lg border-0 bg-white">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                      <CardTitle className="text-xl">Weekly Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ul className="space-y-2">
                        {workoutPlan.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {workoutPlan.progressionNotes && (
                  <Card className="shadow-lg border-0 bg-white">
                    <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                      <CardTitle className="text-xl">Progression Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p>{workoutPlan.progressionNotes}</p>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={() => setActiveTab("input")}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 py-4 font-semibold"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Create New Plan
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GymEquipmentPage;