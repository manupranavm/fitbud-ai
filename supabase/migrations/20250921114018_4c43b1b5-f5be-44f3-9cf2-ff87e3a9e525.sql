-- Create food_entries table to track user nutrition data
CREATE TABLE public.food_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  food_name TEXT NOT NULL,
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  portion_size TEXT,
  meal_type TEXT, -- breakfast, lunch, dinner, snack
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Enable Row Level Security
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own food entries" 
ON public.food_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own food entries" 
ON public.food_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food entries" 
ON public.food_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food entries" 
ON public.food_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_food_entries_user_date ON public.food_entries(user_id, logged_date);
CREATE INDEX idx_food_entries_user_created ON public.food_entries(user_id, created_at);