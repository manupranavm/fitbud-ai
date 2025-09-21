import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workoutType, difficulty, duration, equipment, goals } = await req.json();
    
    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Generating AI workout for user:', user.id);

    // Create AI prompt
    const prompt = `Create a detailed ${workoutType} workout plan with the following specifications:
    - Difficulty: ${difficulty}
    - Duration: ${duration} minutes
    - Available equipment: ${equipment?.join(', ') || 'bodyweight only'}
    - Goals: ${goals || 'general fitness'}
    
    Return a JSON object with this exact structure:
    {
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "reps": "10-12",
          "restTime": "60 seconds",
          "instructions": "Detailed instructions",
          "muscleGroups": ["chest", "triceps"],
          "difficulty": "intermediate"
        }
      ],
      "warmup": [
        {
          "name": "Warmup Exercise",
          "duration": "2 minutes",
          "instructions": "Warmup instructions"
        }
      ],
      "cooldown": [
        {
          "name": "Cooldown Exercise", 
          "duration": "3 minutes",
          "instructions": "Cooldown instructions"
        }
      ],
      "tips": ["Workout tip 1", "Workout tip 2"]
    }
    
    Make sure the workout is safe, effective, and appropriate for the specified difficulty level.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a certified fitness trainer creating personalized workout plans. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const workoutPlan = JSON.parse(data.choices[0].message.content);

    // Save to database
    const { data: savedWorkout, error: dbError } = await supabase
      .from('ai_workout_suggestions')
      .insert({
        user_id: user.id,
        workout_type: workoutType,
        difficulty_level: difficulty,
        duration: duration,
        equipment: equipment || [],
        exercises: workoutPlan,
        ai_prompt: prompt
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save workout');
    }

    console.log('AI workout generated successfully:', savedWorkout.id);

    return new Response(JSON.stringify({ 
      success: true, 
      workout: savedWorkout,
      exercises: workoutPlan 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ai-workout function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});