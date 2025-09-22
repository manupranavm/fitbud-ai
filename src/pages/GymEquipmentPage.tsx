import React, { useState } from 'react';
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
import { Upload, Camera, Type, Shuffle, Play, Calendar, Clock, RotateCcw } from "lucide-react";

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
  
  // Output states
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [currentEquipment, setCurrentEquipment] = useState<string[]>([]);

  const defaultEquipment = [
    "Dumbbells", "Barbells", "Bench", "Treadmill", "Pull-up Bar",
    "Cable Machine", "Smith Machine", "Leg Extension Machine"
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedVideo(file);
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
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Gym Equipment Planner</h1>
          <p className="text-gray-600">Create personalized workout plans based on your available equipment</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Equipment Input</TabsTrigger>
            <TabsTrigger value="plan" disabled={!workoutPlan}>Workout Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="planName">Plan Name</Label>
                    <Input
                      id="planName"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      placeholder="My Gym Plan"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Manual Equipment List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="equipment">Available Equipment</Label>
                    <Textarea
                      id="equipment"
                      value={manualEquipment}
                      onChange={(e) => setManualEquipment(e.target.value)}
                      placeholder="Leg Press, Lat Pulldown, Cable Machine, Squat Rack..."
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Separate equipment with commas. Default equipment (dumbbells, barbells, bench, treadmill) are automatically included.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Equipment Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="images">Equipment Photos</Label>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Upload photos of your gym equipment for automatic detection (coming soon)
                    </p>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="text-sm p-2 bg-gray-100 rounded">
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Gym Walkthrough Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="video">Gym Tour Video</Label>
                    <Input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Upload a video walkthrough of your gym for equipment detection (coming soon)
                    </p>
                  </div>
                  {selectedVideo && (
                    <div className="text-sm p-2 bg-gray-100 rounded">
                      {selectedVideo.name}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Default Equipment Included:</h3>
                <div className="flex flex-wrap gap-2">
                  {defaultEquipment.map((equipment, index) => (
                    <Badge key={index} variant="secondary">
                      {equipment}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={generateWorkoutPlan}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Generating Plan..." : "Generate Workout Plan"}
            </Button>
          </TabsContent>

          <TabsContent value="plan" className="space-y-6">
            {workoutPlan && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{planName}</h2>
                  <Button onClick={shufflePlan} disabled={shuffling} variant="outline">
                    <Shuffle className="h-4 w-4 mr-2" />
                    {shuffling ? "Shuffling..." : "Shuffle Plan"}
                  </Button>
                </div>

                <div className="grid gap-6">
                  {Object.entries(workoutPlan.weekPlan).map(([day, dayPlan]) => (
                    <Card key={day} className="overflow-hidden">
                      <CardHeader className="bg-gray-100">
                        <CardTitle className="flex items-center gap-2">
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Progression Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{workoutPlan.progressionNotes}</p>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={() => setActiveTab("input")}
                  variant="outline"
                  className="w-full"
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