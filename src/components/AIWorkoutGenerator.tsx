import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Loader2, Play, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restTime: string;
  instructions: string;
  muscleGroups: string[];
  difficulty: string;
}

interface WorkoutPlan {
  exercises: Exercise[];
  warmup: Array<{ name: string; duration: string; instructions: string }>;
  cooldown: Array<{ name: string; duration: string; instructions: string }>;
  tips: string[];
}

interface VideoResult {
  exerciseName: string;
  videos: Array<{
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    channelTitle: string;
    publishedAt: string;
  }>;
}

export const AIWorkoutGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [currentWorkoutId, setCurrentWorkoutId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    workoutType: '',
    difficulty: '',
    duration: '',
    equipment: '',
    goals: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateWorkout = async () => {
    if (!formData.workoutType || !formData.difficulty || !formData.duration) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-workout', {
        body: {
          workoutType: formData.workoutType,
          difficulty: formData.difficulty,
          duration: parseInt(formData.duration),
          equipment: formData.equipment ? formData.equipment.split(',').map(e => e.trim()) : [],
          goals: formData.goals
        }
      });

      if (error) throw error;

      if (data.success) {
        setWorkoutPlan(data.exercises);
        setCurrentWorkoutId(data.workout.id);
        toast.success('AI workout generated successfully!');
        
        // Auto-search for videos
        searchVideos(data.exercises.exercises, data.workout.id);
      } else {
        throw new Error(data.error || 'Failed to generate workout');
      }
    } catch (error) {
      console.error('Error generating workout:', error);
      toast.error('Failed to generate workout. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const searchVideos = async (exercises: Exercise[], workoutId: string) => {
    setIsLoadingVideos(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-youtube-videos', {
        body: {
          exercises: exercises,
          workoutId: workoutId
        }
      });

      if (error) throw error;

      if (data.success) {
        setVideos(data.videos);
        toast.success('YouTube videos found for exercises!');
      } else {
        throw new Error(data.error || 'Failed to search videos');
      }
    } catch (error) {
      console.error('Error searching videos:', error);
      toast.error('Failed to find YouTube videos');
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const openVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            AI Workout Generator
          </CardTitle>
          <CardDescription>
            Generate personalized workout plans with AI and find YouTube tutorials for each exercise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workoutType">Workout Type *</Label>
              <Select onValueChange={(value) => handleInputChange('workoutType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select workout type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength Training</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="hiit">HIIT</SelectItem>
                  <SelectItem value="pilates">Pilates</SelectItem>
                  <SelectItem value="crossfit">CrossFit</SelectItem>
                  <SelectItem value="bodyweight">Bodyweight</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level *</Label>
              <Select onValueChange={(value) => handleInputChange('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 30"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment">Available Equipment</Label>
              <Input
                id="equipment"
                placeholder="e.g., dumbbells, resistance bands (comma separated)"
                value={formData.equipment}
                onChange={(e) => handleInputChange('equipment', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Fitness Goals</Label>
            <Textarea
              id="goals"
              placeholder="Describe your fitness goals (optional)"
              value={formData.goals}
              onChange={(e) => handleInputChange('goals', e.target.value)}
            />
          </div>

          <Button 
            onClick={generateWorkout} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Workout...
              </>
            ) : (
              'Generate AI Workout'
            )}
          </Button>
        </CardContent>
      </Card>

      {workoutPlan && (
        <div className="space-y-6">
          {/* Warmup */}
          <Card>
            <CardHeader>
              <CardTitle>Warmup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workoutPlan.warmup.map((exercise, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold">{exercise.name}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {exercise.duration}
                    </p>
                    <p className="text-sm mt-1">{exercise.instructions}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Exercises */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Main Exercises
                {isLoadingVideos && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Finding YouTube videos...
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {workoutPlan.exercises.map((exercise, index) => {
                  const exerciseVideos = videos.find(v => v.exerciseName === exercise.name)?.videos || [];
                  
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-lg">{exercise.name}</h4>
                        <Badge variant="outline">{exercise.difficulty}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                        <div>
                          <span className="font-medium">Sets:</span> {exercise.sets}
                        </div>
                        <div>
                          <span className="font-medium">Reps:</span> {exercise.reps}
                        </div>
                        <div>
                          <span className="font-medium">Rest:</span> {exercise.restTime}
                        </div>
                      </div>

                      <p className="text-sm mb-3">{exercise.instructions}</p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {exercise.muscleGroups.map((muscle, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {muscle}
                          </Badge>
                        ))}
                      </div>

                      {exerciseVideos.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">Tutorial Videos:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {exerciseVideos.slice(0, 3).map((video, vidIndex) => (
                              <div key={vidIndex} className="border rounded-md overflow-hidden">
                                <img 
                                  src={video.thumbnail} 
                                  alt={video.title}
                                  className="w-full h-24 object-cover"
                                />
                                <div className="p-2">
                                  <h6 className="text-xs font-medium line-clamp-2 mb-1">
                                    {video.title}
                                  </h6>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {video.channelTitle}
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openVideo(video.videoId)}
                                    className="w-full h-6 text-xs"
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    Watch
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Cooldown */}
          <Card>
            <CardHeader>
              <CardTitle>Cooldown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workoutPlan.cooldown.map((exercise, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold">{exercise.name}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {exercise.duration}
                    </p>
                    <p className="text-sm mt-1">{exercise.instructions}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          {workoutPlan.tips && workoutPlan.tips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pro Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {workoutPlan.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};