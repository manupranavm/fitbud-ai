-- Create table for AI-generated workout suggestions
CREATE TABLE public.ai_workout_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workout_type TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  duration INTEGER NOT NULL,
  equipment TEXT[],
  exercises JSONB NOT NULL,
  youtube_videos JSONB,
  ai_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_workout_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own AI workout suggestions" 
ON public.ai_workout_suggestions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI workout suggestions" 
ON public.ai_workout_suggestions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI workout suggestions" 
ON public.ai_workout_suggestions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI workout suggestions" 
ON public.ai_workout_suggestions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_workout_suggestions_updated_at
BEFORE UPDATE ON public.ai_workout_suggestions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();