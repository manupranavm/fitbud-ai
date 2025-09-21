import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing food image with OpenAI Vision API');

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
            content: `You are a nutrition expert. Analyze food images and provide detailed nutritional information. 
            
            Respond ONLY with valid JSON in this exact format:
            {
              "foodName": "Name of the food dish",
              "calories": number,
              "macros": {
                "protein": number,
                "carbs": number,
                "fat": number
              },
              "confidence": number (1-100),
              "portion": "estimated serving size description",
              "ingredients": ["list", "of", "main", "ingredients"]
            }
            
            Base your analysis on standard serving sizes. Be as accurate as possible with nutritional values.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this food image and provide the nutritional information in the specified JSON format.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return new Response(JSON.stringify({ error: 'Failed to analyze image' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('OpenAI response:', content);

    try {
      // Parse the JSON response from OpenAI
      const nutritionData = JSON.parse(content);
      
      // Validate the response structure
      if (!nutritionData.foodName || !nutritionData.calories || !nutritionData.macros) {
        throw new Error('Invalid nutrition data structure');
      }

      return new Response(JSON.stringify(nutritionData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw content:', content);
      
      // Fallback response if parsing fails
      return new Response(JSON.stringify({
        foodName: "Unknown Food",
        calories: 200,
        macros: { protein: 10, carbs: 20, fat: 8 },
        confidence: 50,
        portion: "1 serving",
        ingredients: ["unknown"]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in analyze-food-image function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});