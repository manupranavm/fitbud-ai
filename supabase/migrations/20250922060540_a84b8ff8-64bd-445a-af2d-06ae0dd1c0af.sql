-- Create table for equipment workouts
CREATE TABLE public.equipment_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  equipment_list TEXT[] NOT NULL,
  workout_plan JSONB NOT NULL,
  plan_name TEXT NOT NULL DEFAULT 'My Gym Plan',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.equipment_workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for equipment_workouts
CREATE POLICY "Users can view their own equipment workouts" 
ON public.equipment_workouts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own equipment workouts" 
ON public.equipment_workouts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own equipment workouts" 
ON public.equipment_workouts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own equipment workouts" 
ON public.equipment_workouts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_equipment_workouts_updated_at
BEFORE UPDATE ON public.equipment_workouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for equipment images/videos
INSERT INTO storage.buckets (id, name, public) VALUES ('equipment-media', 'equipment-media', true);

-- Create policies for equipment media storage
CREATE POLICY "Users can view equipment media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'equipment-media');

CREATE POLICY "Users can upload their own equipment media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'equipment-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own equipment media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'equipment-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own equipment media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'equipment-media' AND auth.uid()::text = (storage.foldername(name))[1]);