import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { exercises, workoutId } = await req.json();
    
    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Searching YouTube videos for workout:', workoutId);

    const videoResults = [];

    // Search for videos for each exercise
    for (const exercise of exercises) {
      const searchQuery = `${exercise.name} exercise form tutorial`;
      
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${encodeURIComponent(searchQuery)}&type=video&videoDefinition=high&videoDuration=medium&key=${youtubeApiKey}`
        );

        if (!response.ok) {
          console.error(`YouTube API error for ${exercise.name}:`, response.statusText);
          continue;
        }

        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          const videos = data.items.map((item: any) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt
          }));

          videoResults.push({
            exerciseName: exercise.name,
            videos: videos
          });
        }
      } catch (error) {
        console.error(`Error searching videos for ${exercise.name}:`, error);
      }
    }

    // Update the workout with video results
    const { error: updateError } = await supabase
      .from('ai_workout_suggestions')
      .update({ youtube_videos: videoResults })
      .eq('id', workoutId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating workout with videos:', updateError);
      throw new Error('Failed to save video results');
    }

    console.log('YouTube videos found and saved:', videoResults.length);

    return new Response(JSON.stringify({ 
      success: true, 
      videos: videoResults 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in search-youtube-videos function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});