import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const spoonacularApiKey = Deno.env.get('SPOONACULAR_API_KEY');

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

    console.log('Analyzing food image with Spoonacular API');

    // Convert base64 to blob for Spoonacular
    const base64Data = imageBase64.split(',')[1];
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Create form data for image upload
    const formData = new FormData();
    const blob = new Blob([binaryData], { type: 'image/jpeg' });
    formData.append('file', blob, 'food.jpg');

    // First, classify the food using Spoonacular's classify endpoint
    const classifyResponse = await fetch(`https://api.spoonacular.com/food/images/classify?apiKey=${spoonacularApiKey}`, {
      method: 'POST',
      body: formData,
    });

    if (!classifyResponse.ok) {
      const error = await classifyResponse.text();
      console.error('Spoonacular classify error:', error);
      return new Response(JSON.stringify({ error: 'Failed to classify image' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const classifyData = await classifyResponse.json();
    console.log('Spoonacular classify response:', classifyData);

    // Get the top classified food category
    const topCategory = classifyData.category;
    const confidence = Math.round(classifyData.probability * 100);

    // Search for nutritional information based on the classified food
    const searchResponse = await fetch(
      `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(topCategory)}&number=1&apiKey=${spoonacularApiKey}`
    );

    let nutritionData = {
      foodName: topCategory || "Unknown Food",
      calories: 200,
      macros: { protein: 10, carbs: 20, fat: 8 },
      confidence: confidence || 50,
      portion: "1 serving",
      ingredients: [topCategory || "unknown"]
    };

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('Spoonacular search response:', searchData);

      if (searchData.results && searchData.results.length > 0) {
        const ingredient = searchData.results[0];
        
        // Get detailed nutrition information
        const nutritionResponse = await fetch(
          `https://api.spoonacular.com/food/ingredients/${ingredient.id}/information?amount=100&unit=grams&apiKey=${spoonacularApiKey}`
        );

        if (nutritionResponse.ok) {
          const nutrition = await nutritionResponse.json();
          console.log('Spoonacular nutrition response:', nutrition);

          if (nutrition.nutrition && nutrition.nutrition.nutrients) {
            const nutrients = nutrition.nutrition.nutrients;
            
            const caloriesNutrient = nutrients.find(n => n.name === 'Calories');
            const proteinNutrient = nutrients.find(n => n.name === 'Protein');
            const carbsNutrient = nutrients.find(n => n.name === 'Carbohydrates');
            const fatNutrient = nutrients.find(n => n.name === 'Fat');

            nutritionData = {
              foodName: nutrition.name || topCategory,
              calories: Math.round(caloriesNutrient?.amount || 200),
              macros: {
                protein: Math.round(proteinNutrient?.amount || 10),
                carbs: Math.round(carbsNutrient?.amount || 20),
                fat: Math.round(fatNutrient?.amount || 8)
              },
              confidence: confidence,
              portion: "100 grams",
              ingredients: [nutrition.name || topCategory]
            };
          }
        }
      }
    }

    return new Response(JSON.stringify(nutritionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-food-image function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});