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

    console.log('Analyzing food image with OpenAI Vision API optimized for Indian cuisine');

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
            content: `You are a nutrition expert specializing in Indian, South Asian, and international cuisines. Analyze food images and provide detailed nutritional information with special attention to:

            - Indian dishes (dal, curry, roti, rice, sabzi, etc.)
            - Regional variations and cooking methods
            - Traditional ingredients like turmeric, ghee, coconut oil
            - Accurate portion sizes for Indian meals
            - Consider typical Indian cooking methods (fried, steamed, grilled)
            
            Return ONLY raw JSON without any markdown formatting or code blocks. The response must be valid JSON that can be parsed directly.
            
            Format:
            {
              "foodName": "Name of the food dish (use proper Indian names when applicable)",
              "calories": number (realistic for Indian cooking methods),
              "macros": {
                "protein": number (in grams),
                "carbs": number (in grams),
                "fat": number (in grams)
              },
              "confidence": number (1-100, be conservative for complex dishes),
              "portion": "estimated serving size (use Indian serving sizes)",
              "ingredients": ["list", "of", "main", "ingredients", "in", "dish"]
            }
            
            Be accurate with Indian food calories - they tend to be higher due to oil/ghee usage.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this food image and provide nutritional information. Pay special attention if this is an Indian or South Asian dish. Provide realistic calorie counts considering typical cooking methods.'
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
      // Clean the response by removing markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      console.log('Cleaned content for parsing:', cleanContent);
      
      // Parse the JSON response from OpenAI
      const nutritionData = JSON.parse(cleanContent);
      
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
      console.error('Attempted to parse:', content.trim());
      
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