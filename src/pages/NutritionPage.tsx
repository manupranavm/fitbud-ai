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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts"

const NutritionPage: React.FC = () => {
  const { addFood, getTodaysTotals, goals, dailyFoods, loadTodaysFoods, isLoading, getDailyTotalsForDateRange } = useNutrition()
  const { user } = useAuth()
  const [scanResult, setScanResult] = useState<any>(null)
  const [portionSize, setPortionSize] = useState(100)
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [editableValues, setEditableValues] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Get today's totals from the store
  const todaysTotals = getTodaysTotals()

  useEffect(() => {
    if (user) {
      loadTodaysFoods()
    }
  }, [user, loadTodaysFoods])

  // Prepare hourly calorie data for the chart
  const getHourlyCalorieData = () => {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      calories: 0,
      meals: []
    }))

    dailyFoods.forEach(food => {
      const hour = new Date(food.created_at).getHours()
      hourlyData[hour].calories += Number(food.calories)
      hourlyData[hour].meals.push(food.food_name)
    })

    // Only return hours with data or the current hour
    const currentHour = new Date().getHours()
    return hourlyData.filter((data, index) => 
      data.calories > 0 || index === currentHour || index <= currentHour
    )
  }

  const hourlyCalorieData = getHourlyCalorieData()
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

  // Load historical data for the past month
  useEffect(() => {
    if (user) {
      loadHistoryData()
    }
  }, [user])

  const loadHistoryData = async () => {
    setIsLoadingHistory(true)
    try {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const data = await getDailyTotalsForDateRange(startDate, endDate)
      setHistoricalData(data)
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      setStream(mediaStream)
      setIsCameraOpen(true)
      
      // Wait for the modal to render and video element to be available
      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          console.log('NutritionPage: Setting video srcObject');
          videoRef.current.srcObject = mediaStream;
          
          const setupVideo = async () => {
            if (!videoRef.current) return;
            
            try {
              // Wait for video to load
              await new Promise((resolve) => {
                if (videoRef.current) {
                  videoRef.current.onloadedmetadata = () => {
                    console.log('NutritionPage: Video metadata loaded');
                    resolve(true);
                  };
                }
              });
              
              // Now try to play
              await videoRef.current.play();
              console.log('NutritionPage: Video playing successfully');
            } catch (err) {
              console.error('NutritionPage: Error playing video:', err);
              toast.error("Camera preview failed to load");
            }
          };
          
          setupVideo();
        }
      }, 100); // Small delay to ensure DOM is ready
      
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraOpen(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      if (context) {
        context.drawImage(video, 0, 0)
        canvas.toBlob(async (blob) => {
          if (blob) {
            const reader = new FileReader()
            reader.onload = async (e) => {
              const base64Data = e.target?.result as string
              await processImageData(base64Data)
            }
            reader.readAsDataURL(blob)
          }
        }, 'image/jpeg', 0.8)
      }
      stopCamera()
    }
  }

  const processImageData = async (base64Data: string) => {
    try {
      toast.success("Food image captured! Analyzing...")
      
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64Data = e.target?.result as string
          await processImageData(base64Data)
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

  // Update editable values when scan result changes
  useEffect(() => {
    if (adjustedResult) {
      setEditableValues({
        calories: adjustedResult.calories,
        protein: adjustedResult.macros.protein,
        carbs: adjustedResult.macros.carbs,
        fat: adjustedResult.macros.fat
      });
    }
  }, [scanResult]); // Only depend on scanResult, not adjustedResult to avoid infinite loops

  const handleAddToDiary = async () => {
    // Allow adding either from scan result or manual input
    const foodData = scanResult ? {
      food_name: scanResult.foodName,
      calories: editableValues.calories,
      protein: editableValues.protein,
      carbs: editableValues.carbs,
      fat: editableValues.fat,
      portion_size: `${portionSize}% of standard portion`,
      meal_type: 'scanned'
    } : {
      food_name: "Manual Entry",
      calories: editableValues.calories,
      protein: editableValues.protein,
      carbs: editableValues.carbs,
      fat: editableValues.fat,
      portion_size: "Manual input",
      meal_type: 'manual'
    };

    try {
      await addFood(foodData)
      toast.success("Food added to diary!")
      setScanResult(null)
      setPortionSize(100)
      setEditableValues({ calories: 0, protein: 0, carbs: 0, fat: 0 })
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      toast.error("Failed to add food to diary")
      console.error('Error adding food:', error)
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

            {/* Calorie Intake Chart */}
            <FitnessCard className="animate-slide-up" style={{ animationDelay: "400ms" }}>
              <FitnessCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <FitnessCardTitle>Daily Calorie Intake</FitnessCardTitle>
                    <FitnessCardDescription>
                      Your calorie consumption throughout the day
                    </FitnessCardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {todaysTotals.calories} cal total
                  </Badge>
                </div>
              </FitnessCardHeader>
              
              <FitnessCardContent>
                {dailyFoods.length > 0 ? (
                  <div className="h-64 w-full">
                    <ChartContainer
                      config={{
                        calories: {
                          label: "Calories",
                          color: "hsl(var(--primary))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourlyCalorieData}>
                          <XAxis 
                            dataKey="hour" 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <ChartTooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload
                                return (
                                  <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                    <p className="font-medium">{label}</p>
                                    <p className="text-primary font-semibold">
                                      {payload[0].value} calories
                                    </p>
                                    {data.meals.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        <p className="text-xs text-muted-foreground">Meals:</p>
                                        {data.meals.map((meal, index) => (
                                          <p key={index} className="text-xs">{meal}</p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Bar 
                            dataKey="calories" 
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center space-y-2">
                      <Utensils className="w-12 h-12 mx-auto opacity-50" />
                      <p>No meals logged yet today</p>
                      <p className="text-sm">Start tracking to see your calorie chart</p>
                    </div>
                  </div>
                )}
              </FitnessCardContent>
            </FitnessCard>

            {/* Recent Meals */}
            <FitnessCard className="animate-slide-up" style={{ animationDelay: "500ms" }}>
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
                          <FitnessButton size="lg" onClick={startCamera}>
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

              {/* Results and Adjustment - Always show nutrition input */}
              <div className="space-y-6">
                <FitnessCard variant="food" className="animate-slide-up">
                  <FitnessCardHeader>
                    <FitnessCardTitle>Nutrition Information</FitnessCardTitle>
                    <FitnessCardDescription>
                      {scanResult ? "Adjust portion size to match your actual serving" : "Enter nutrition values manually"}
                    </FitnessCardDescription>
                  </FitnessCardHeader>
                  
                  <FitnessCardContent>
                    {/* Portion Slider - Only show if there's a scan result */}
                    {scanResult && (
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
                    )}

                    {/* Nutrition Facts - Always editable */}
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <Input
                          type="number"
                          value={editableValues.calories || ''}
                          onChange={(e) => setEditableValues(prev => ({ ...prev, calories: Number(e.target.value) || 0 }))}
                          className="text-2xl font-bold text-primary text-center border border-border/50 hover:border-border focus:border-primary bg-background/50"
                          min="0"
                          placeholder="Enter calories"
                        />
                        <div className="text-sm text-muted-foreground mt-1">calories</div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <Input
                            type="number"
                            value={editableValues.protein || ''}
                            onChange={(e) => setEditableValues(prev => ({ ...prev, protein: Number(e.target.value) || 0 }))}
                            className="font-semibold text-center border border-border/50 hover:border-border focus:border-primary bg-background/50"
                            min="0"
                            step="0.1"
                            placeholder="0"
                          />
                          <div className="text-xs text-muted-foreground mt-1">Protein (g)</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <Input
                            type="number"
                            value={editableValues.carbs || ''}
                            onChange={(e) => setEditableValues(prev => ({ ...prev, carbs: Number(e.target.value) || 0 }))}
                            className="font-semibold text-center border border-border/50 hover:border-border focus:border-primary bg-background/50"
                            min="0"
                            step="0.1"
                            placeholder="0"
                          />
                          <div className="text-xs text-muted-foreground mt-1">Carbs (g)</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <Input
                            type="number"
                            value={editableValues.fat || ''}
                            onChange={(e) => setEditableValues(prev => ({ ...prev, fat: Number(e.target.value) || 0 }))}
                            className="font-semibold text-center border border-border/50 hover:border-border focus:border-primary bg-background/50"
                            min="0"
                            step="0.1"
                            placeholder="0"
                          />
                          <div className="text-xs text-muted-foreground mt-1">Fat (g)</div>
                        </div>
                      </div>

                      <FitnessButton 
                        onClick={handleAddToDiary} 
                        className="w-full" 
                        size="lg"
                        disabled={editableValues.calories === 0}
                      >
                        Add to Diary
                      </FitnessButton>
                    </div>
                  </FitnessCardContent>
                </FitnessCard>
              </div>
            </div>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Monthly Overview Chart */}
              <div className="lg:col-span-2">
                <FitnessCard className="animate-slide-up">
                  <FitnessCardHeader>
                    <FitnessCardTitle>Monthly Calorie Tracking</FitnessCardTitle>
                    <FitnessCardDescription>
                      Your daily calorie intake over the past 30 days
                    </FitnessCardDescription>
                  </FitnessCardHeader>
                  
                  <FitnessCardContent>
                    {isLoadingHistory ? (
                      <div className="h-64 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-muted-foreground">Loading history...</p>
                        </div>
                      </div>
                    ) : historicalData.length > 0 ? (
                      <div className="h-64 w-full">
                        <ChartContainer
                          config={{
                            calories: {
                              label: "Calories",
                              color: "hsl(var(--primary))",
                            },
                          }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={historicalData.reverse()}>
                              <XAxis 
                                dataKey="date"
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              />
                              <YAxis 
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                              />
                              <ChartTooltip
                                content={({ active, payload, label }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                        <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
                                        <p className="text-primary font-semibold">
                                          {payload[0].value} calories
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {data.meals} meals logged
                                        </p>
                                      </div>
                                    )
                                  }
                                  return null
                                }}
                              />
                              <Line 
                                type="monotone"
                                dataKey="calories" 
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-muted-foreground">
                        <div className="text-center space-y-2">
                          <Utensils className="w-12 h-12 mx-auto opacity-50" />
                          <p>No nutrition history available</p>
                          <p className="text-sm">Start logging meals to see your progress</p>
                        </div>
                      </div>
                    )}
                  </FitnessCardContent>
                </FitnessCard>
              </div>

              {/* Summary Stats */}
              <div className="space-y-4">
                <FitnessCard className="animate-slide-up" style={{ animationDelay: "100ms" }}>
                  <FitnessCardHeader>
                    <FitnessCardTitle className="text-base">30-Day Summary</FitnessCardTitle>
                  </FitnessCardHeader>
                  <FitnessCardContent>
                    {historicalData.length > 0 ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {Math.round(historicalData.reduce((sum, day) => sum + day.calories, 0) / historicalData.length)}
                          </div>
                          <div className="text-xs text-muted-foreground">Avg calories/day</div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Days tracked:</span>
                            <span className="font-medium">{historicalData.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Total meals:</span>
                            <span className="font-medium">{historicalData.reduce((sum, day) => sum + day.meals, 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Highest day:</span>
                            <span className="font-medium">{Math.max(...historicalData.map(d => d.calories))} cal</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <p className="text-sm">No data available</p>
                      </div>
                    )}
                  </FitnessCardContent>
                </FitnessCard>

                <FitnessCard className="animate-slide-up" style={{ animationDelay: "200ms" }}>
                  <FitnessCardHeader>
                    <FitnessCardTitle className="text-base">Quick Actions</FitnessCardTitle>
                  </FitnessCardHeader>
                  <FitnessCardContent>
                    <div className="space-y-2">
                      <FitnessButton 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={loadHistoryData}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Refresh Data
                      </FitnessButton>
                    </div>
                  </FitnessCardContent>
                </FitnessCard>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Camera Modal */}
        {isCameraOpen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg p-6 max-w-md w-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Capture Food Image</h3>
                  <FitnessButton variant="ghost" size="sm" onClick={stopCamera}>
                    ✕
                  </FitnessButton>
                </div>
                
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ 
                      display: 'block',
                      minHeight: '300px'
                    }}
                  />
                </div>
                
                <FitnessButton onClick={capturePhoto} className="w-full" size="lg">
                  <Camera className="w-5 h-5 mr-2" />
                  Capture Photo
                </FitnessButton>
              </div>
            </div>
          </div>
        )}

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  )
}

export default NutritionPage