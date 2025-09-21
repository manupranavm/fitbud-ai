import React, { useState, useRef } from "react"
import toast from "react-hot-toast"
import { 
  Camera, 
  Upload, 
  Plus, 
  Search,
  Clock,
  Target,
  Utensils,
  TrendingUp
} from "lucide-react"

import { FitnessButton } from "@/components/ui/fitness-button"
import { FitnessCard, FitnessCardContent, FitnessCardDescription, FitnessCardHeader, FitnessCardTitle } from "@/components/ui/fitness-card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProgressRing } from "@/components/ui/progress-ring"
import { useNutrition } from "@/hooks/useNutrition"
import { useAuth } from "@/hooks/useAuth"
import { useEffect } from "react"
import healthyFoodImage from "@/assets/healthy-food.jpg"

const NutritionPage: React.FC = () => {
  const { addFood, getTodaysTotals, goals, dailyFoods, loadTodaysFoods, isLoading } = useNutrition()
  const { user } = useAuth()
  const [scanResult, setScanResult] = useState<any>(null)
  const [portionSize, setPortionSize] = useState(100)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get today's totals from the store
  const todaysTotals = getTodaysTotals()

  useEffect(() => {
    if (user) {
      loadTodaysFoods()
    }
  }, [user, loadTodaysFoods])
  const dailyGoals = {
    calories: { current: todaysTotals.calories, target: goals.calories },
    protein: { current: todaysTotals.protein, target: goals.protein },
    carbs: { current: todaysTotals.carbs, target: goals.carbs },
    fat: { current: todaysTotals.fat, target: goals.fat }
  }

  // Remove dummy data - using real data from database via dailyFoods

  const mockScanResult = {
    foodName: "Grilled Salmon with Quinoa",
    calories: 485,
    macros: {
      protein: 35,
      carbs: 42,
      fat: 18
    },
    confidence: 89,
    portion: "1 serving (200g)"
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        toast.success("Food image uploaded! Analyzing...")
        
        // Convert file to base64
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64Data = e.target?.result as string
          
          try {
            // Call the edge function
            const { supabase } = await import("@/integrations/supabase/client")
            const { data, error } = await supabase.functions.invoke('analyze-food-image', {
              body: { imageBase64: base64Data }
            })
            
            if (error) {
              console.error('Error analyzing food:', error)
              toast.error("Failed to analyze food image. Please try again.")
              return
            }
            
            setScanResult(data)
            toast.success("Food identified! Adjust portion size if needed.")
          } catch (err) {
            console.error('Error calling food analysis:', err)
            toast.error("Failed to analyze food image. Please try again.")
          }
        }
        
        reader.readAsDataURL(file)
      } catch (err) {
        console.error('Error processing file:', err)
        toast.error("Failed to process image. Please try again.")
      }
    }
  }

const adjustCalories = (newPortion: number) => {
  if (!scanResult) return null;

  const multiplier = newPortion / 100;
  return {
    ...scanResult,
    calories: Math.round(scanResult.calories * multiplier),
    macros: {
      protein: Math.round(scanResult.macros.protein * multiplier),
      carbs: Math.round(scanResult.macros.carbs * multiplier),
      fat: Math.round(scanResult.macros.fat * multiplier),
    }
  }
}


  const adjustedResult = adjustCalories(portionSize)

  const handleAddToDiary = async () => {
    if (adjustedResult) {
      try {
        await addFood({
          food_name: adjustedResult.foodName,
          calories: adjustedResult.calories,
          protein: adjustedResult.macros.protein,
          carbs: adjustedResult.macros.carbs,
          fat: adjustedResult.macros.fat,
          portion_size: `${portionSize}% of standard portion`,
          meal_type: 'scanned'
        })
        toast.success("Food added to diary!")
        setScanResult(null)
        setPortionSize(100)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } catch (error) {
        toast.error("Failed to add food to diary")
        console.error('Error adding food:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-8 rounded-xl overflow-hidden animate-fade-in">
          <div 
            className="h-48 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${healthyFoodImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-overlay" />
            <div className="relative z-10 p-6 flex items-end h-full">
              <div className="text-white">
                <h1 className="text-heading-lg mb-2">Nutrition Tracker</h1>
                <p className="text-body opacity-90">
                  Smart food scanning and macro tracking
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today's Intake</TabsTrigger>
            <TabsTrigger value="scan">Scan Food</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Today's Intake */}
          <TabsContent value="today" className="space-y-6">
            {/* Daily Progress Overview */}
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
              {/* Calories */}
              <FitnessCard variant="food" className="animate-slide-up">
                <FitnessCardHeader className="pb-3">
                  <FitnessCardTitle className="text-base">Calories</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <div className="flex items-center justify-center mb-4">
                    <ProgressRing 
                      progress={(dailyGoals.calories.current / dailyGoals.calories.target) * 100}
                      size={80}
                      color="success"
                    >
                      <div className="text-center">
                        <div className="text-sm font-bold">{dailyGoals.calories.current}</div>
                        <div className="text-xs text-muted-foreground">/{dailyGoals.calories.target}</div>
                      </div>
                    </ProgressRing>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    {dailyGoals.calories.target - dailyGoals.calories.current} remaining
                  </p>
                </FitnessCardContent>
              </FitnessCard>

              {/* Protein */}
              <FitnessCard variant="gradient" className="animate-slide-up" style={{ animationDelay: "100ms" }}>
                <FitnessCardHeader className="pb-3">
                  <FitnessCardTitle className="text-base">Protein</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <div className="text-center space-y-2">
                    <div className="text-xl font-bold">
                      {dailyGoals.protein.current}g
                      <span className="text-sm text-muted-foreground font-normal">
                        /{dailyGoals.protein.target}g
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(dailyGoals.protein.current / dailyGoals.protein.target) * 100}%` }}
                      />
                    </div>
                  </div>
                </FitnessCardContent>
              </FitnessCard>

              {/* Carbs */}
              <FitnessCard variant="gradient" className="animate-slide-up" style={{ animationDelay: "200ms" }}>
                <FitnessCardHeader className="pb-3">
                  <FitnessCardTitle className="text-base">Carbs</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <div className="text-center space-y-2">
                    <div className="text-xl font-bold">
                      {dailyGoals.carbs.current}g
                      <span className="text-sm text-muted-foreground font-normal">
                        /{dailyGoals.carbs.target}g
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-secondary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(dailyGoals.carbs.current / dailyGoals.carbs.target) * 100}%` }}
                      />
                    </div>
                  </div>
                </FitnessCardContent>
              </FitnessCard>

              {/* Fat */}
              <FitnessCard variant="gradient" className="animate-slide-up" style={{ animationDelay: "300ms" }}>
                <FitnessCardHeader className="pb-3">
                  <FitnessCardTitle className="text-base">Fat</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <div className="text-center space-y-2">
                    <div className="text-xl font-bold">
                      {dailyGoals.fat.current}g
                      <span className="text-sm text-muted-foreground font-normal">
                        /{dailyGoals.fat.target}g
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-success h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(dailyGoals.fat.current / dailyGoals.fat.target) * 100}%` }}
                      />
                    </div>
                  </div>
                </FitnessCardContent>
              </FitnessCard>
            </div>

            {/* Recent Meals */}
            <FitnessCard className="animate-slide-up" style={{ animationDelay: "400ms" }}>
              <FitnessCardHeader>
                <div className="flex items-center justify-between">
                  <FitnessCardTitle>Today's Meals</FitnessCardTitle>
                  <FitnessButton variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                    Add Meal
                  </FitnessButton>
                </div>
              </FitnessCardHeader>
              
              <FitnessCardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <p className="text-muted-foreground text-center py-4">Loading meals...</p>
                  ) : dailyFoods.length > 0 ? (
                    dailyFoods.slice(0, 5).map((food) => (
                      <div key={food.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">🍽️</div>
                          <div>
                            <p className="font-medium">{food.food_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(food.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{food.calories} cal</p>
                          <FitnessButton variant="ghost" size="sm" className="text-xs">
                            Edit
                          </FitnessButton>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No meals logged today</p>
                  )}
                </div>
              </FitnessCardContent>
            </FitnessCard>
          </TabsContent>

          {/* Scan Food */}
          <TabsContent value="scan" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Scanning Interface */}
              <div className="space-y-6">
                <FitnessCard className="animate-slide-up">
                  <FitnessCardHeader>
                    <FitnessCardTitle>Scan Your Food</FitnessCardTitle>
                    <FitnessCardDescription>
                      Take a photo of your meal for instant calorie and macro analysis
                    </FitnessCardDescription>
                  </FitnessCardHeader>
                  
                  <FitnessCardContent>
                    {!scanResult ? (
                      <div className="space-y-4">
                        {/* Camera Preview Area */}
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                          <div className="text-center space-y-4">
                            <Camera className="w-12 h-12 text-muted-foreground mx-auto" />
                            <p className="text-muted-foreground">Point camera at your food</p>
                          </div>
                        </div>

                        {/* Scan Options */}
                        <div className="grid grid-cols-2 gap-3">
                          <FitnessButton size="lg">
                            <Camera className="w-5 h-5" />
                            Take Photo
                          </FitnessButton>
                          
                          <div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <FitnessButton 
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              size="lg"
                              className="w-full"
                            >
                              <Upload className="w-5 h-5" />
                              Upload
                            </FitnessButton>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Food Recognition Result */}
                        <div className="aspect-square bg-success/10 rounded-lg flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <div className="text-4xl">🍽️</div>
                            <p className="font-medium">{scanResult.foodName}</p>
                            <Badge variant="outline" className="text-xs">
                              {scanResult.confidence}% confidence
                            </Badge>
                          </div>
                        </div>

                        <FitnessButton 
                          variant="outline" 
                          onClick={() => setScanResult(null)}
                          className="w-full"
                        >
                          Scan Another
                        </FitnessButton>
                      </div>
                    )}
                  </FitnessCardContent>
                </FitnessCard>
              </div>

              {/* Results and Adjustment */}
              {scanResult && (
                <div className="space-y-6">
                  <FitnessCard variant="food" className="animate-slide-up">
                    <FitnessCardHeader>
                      <FitnessCardTitle>Nutrition Information</FitnessCardTitle>
                      <FitnessCardDescription>
                        Adjust portion size to match your actual serving
                      </FitnessCardDescription>
                    </FitnessCardHeader>
                    
                    <FitnessCardContent>
                      {/* Portion Slider */}
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Portion Size</span>
                          <span className="text-sm text-muted-foreground">{portionSize}%</span>
                        </div>
                        <Slider
                          value={[portionSize]}
                          onValueChange={(value) => setPortionSize(value[0])}
                          max={200}
                          min={25}
                          step={25}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          {adjustedResult?.portion}
                        </p>
                      </div>

                      {/* Nutrition Facts */}
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-primary/10 rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {adjustedResult?.calories}
                          </div>
                          <div className="text-sm text-muted-foreground">calories</div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="font-semibold">{adjustedResult?.macros.protein}g</div>
                            <div className="text-xs text-muted-foreground">Protein</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="font-semibold">{adjustedResult?.macros.carbs}g</div>
                            <div className="text-xs text-muted-foreground">Carbs</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="font-semibold">{adjustedResult?.macros.fat}g</div>
                            <div className="text-xs text-muted-foreground">Fat</div>
                          </div>
                        </div>

                        <FitnessButton onClick={handleAddToDiary} className="w-full" size="lg">
                          Add to Diary
                        </FitnessButton>
                      </div>
                    </FitnessCardContent>
                  </FitnessCard>
                </div>
              )}
            </div>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-6">
            <FitnessCard className="animate-slide-up">
              <FitnessCardHeader>
                <div className="flex items-center justify-between">
                  <FitnessCardTitle>Nutrition History</FitnessCardTitle>
                  <FitnessButton variant="ghost" size="sm">
                    <TrendingUp className="w-4 h-4" />
                    View Trends
                  </FitnessButton>
                </div>
              </FitnessCardHeader>
              
              <FitnessCardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your nutrition history will appear here</p>
                  <p className="text-sm">Start logging meals to track your progress</p>
                </div>
              </FitnessCardContent>
            </FitnessCard>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default NutritionPage