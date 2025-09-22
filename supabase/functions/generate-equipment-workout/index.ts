import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { equipmentList, imageAnalysis, planName } = await req.json();
    
    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Generating equipment workout for user:', user.id);

    // Default equipment available in most gyms
    const defaultEquipment = [
      'Dumbbells', 'Barbells', 'Bench', 'Treadmill', 'Pull-up Bar',
      'Cable Machine', 'Smith Machine', 'Leg Extension Machine'
    ];

    // Combine user equipment with defaults
    const allEquipment = [...new Set([...defaultEquipment, ...equipmentList])];

    // Create AI prompt for workout generation
    const prompt = `Create a comprehensive 7-day workout plan using the following available gym equipment: ${allEquipment.join(', ')}

    ${imageAnalysis ? `Additional context from gym images: ${imageAnalysis}` : ''}

    Return a JSON object with this exact structure:
    {
      "weekPlan": {
        "Monday": {
          "focusArea": "Chest & Triceps",
          "exercises": [
            {
              "name": "Bench Press",
              "equipment": "Barbell, Bench",
              "sets": 4,
              "reps": "8-12",
              "restTime": "90 seconds",
              "instructions": "Detailed form instructions",
              "muscleGroups": ["chest", "triceps", "shoulders"],
              "difficulty": "intermediate"
            }
          ]
        },
        "Tuesday": { ... },
        "Wednesday": { ... },
        "Thursday": { ... },
        "Friday": { ... },
        "Saturday": { ... },
        "Sunday": { ... }
      },
      "tips": ["Weekly workout tip 1", "Weekly workout tip 2"],
      "progressionNotes": "How to progress over time"
    }
    
    Guidelines:
    - Create a balanced 7-day split
    - Use only the equipment provided
    - Include 4-6 exercises per day
    - Vary intensity throughout the week
    - Include one rest day or active recovery
    - Focus on compound movements when possible
    - Provide clear form instructions`;

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
            content: 'You are a certified personal trainer creating equipment-specific workout plans. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    let workoutContent = data.choices[0].message.content;
    
    // Clean the response - remove markdown code blocks if present
    if (workoutContent.includes('```json')) {
      workoutContent = workoutContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    } else if (workoutContent.includes('```')) {
      workoutContent = workoutContent.replace(/```\s*/g, '').replace(/```\s*$/g, '');
    }
    
    let workoutPlan;
    try {
      workoutPlan = JSON.parse(workoutContent.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', workoutContent);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Add YouTube videos for each exercise
    if (youtubeApiKey) {
      console.log('Adding YouTube videos to exercises...');
      
      for (const day of Object.keys(workoutPlan.weekPlan)) {
        const dayPlan = workoutPlan.weekPlan[day];
        if (dayPlan.exercises) {
          for (let i = 0; i < dayPlan.exercises.length; i++) {
            const exercise = dayPlan.exercises[i];
            try {
              const searchQuery = `${exercise.name} exercise form tutorial`;
              const youtubeResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${encodeURIComponent(searchQuery)}&type=video&key=${youtubeApiKey}`
              );
              
              if (youtubeResponse.ok) {
                const youtubeData = await youtubeResponse.json();
                const videos = youtubeData.items.map((item: any) => ({
                  videoId: item.id.videoId,
                  title: item.snippet.title,
                  description: item.snippet.description,
                  thumbnail: item.snippet.thumbnails.medium.url,
                  channelTitle: item.snippet.channelTitle,
                  publishedAt: item.snippet.publishedAt
                }));
                
                exercise.youtubeVideos = videos;
              }
            } catch (error) {
              console.error(`Error fetching YouTube videos for ${exercise.name}:`, error);
              exercise.youtubeVideos = [];
            }
          }
        }
      }
    }

    // Save to database
    const { data: savedWorkout, error: dbError } = await supabase
      .from('equipment_workouts')
      .insert({
        user_id: user.id,
        equipment_list: allEquipment,
        workout_plan: workoutPlan,
        plan_name: planName || 'My Gym Plan'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save workout plan');
    }

    console.log('Equipment workout generated successfully:', savedWorkout.id);

    return new Response(JSON.stringify({ 
      success: true, 
      workout: savedWorkout,
      plan: workoutPlan 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-equipment-workout function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});