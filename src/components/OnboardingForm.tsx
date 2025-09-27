import { FitnessButton } from "@/components/ui/fitness-button";
import {
  FitnessCard,
  FitnessCardContent,
  FitnessCardHeader,
  FitnessCardTitle,
} from "@/components/ui/fitness-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity,
  ArrowRight,
  Calculator,
  Calendar,
  CheckCircle,
  Ruler,
  Target,
  User,
  Weight,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface OnboardingData {
  height: string;
  weight: string;
  age: string;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  fitnessGoal:
    | "weight_loss"
    | "weight_gain"
    | "muscle_gain"
    | "maintenance"
    | "endurance";
  experience: "beginner" | "intermediate" | "advanced";
}

interface CalculatedMetrics {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  dailyCalories: number;
  proteinNeeds: number;
  waterIntake: number;
}

const OnboardingForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    height: "",
    weight: "",
    age: "",
    gender: "male",
    activityLevel: "moderate",
    fitnessGoal: "maintenance",
    experience: "beginner",
  });
  const [calculatedMetrics, setCalculatedMetrics] =
    useState<CalculatedMetrics | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const activityLevels = [
    {
      value: "sedentary",
      label: "Sedentary",
      description: "Little to no exercise",
    },
    {
      value: "light",
      label: "Light",
      description: "Light exercise 1-3 days/week",
    },
    {
      value: "moderate",
      label: "Moderate",
      description: "Moderate exercise 3-5 days/week",
    },
    {
      value: "active",
      label: "Active",
      description: "Heavy exercise 6-7 days/week",
    },
    {
      value: "very_active",
      label: "Very Active",
      description: "Very heavy exercise, physical job",
    },
  ];

  const fitnessGoals = [
    {
      value: "weight_loss",
      label: "Weight Loss",
      description: "Lose weight safely",
    },
    {
      value: "weight_gain",
      label: "Weight Gain",
      description: "Gain healthy weight",
    },
    {
      value: "muscle_gain",
      label: "Muscle Gain",
      description: "Build lean muscle",
    },
    {
      value: "maintenance",
      label: "Maintenance",
      description: "Maintain current weight",
    },
    {
      value: "endurance",
      label: "Endurance",
      description: "Improve cardiovascular fitness",
    },
  ];

  const experienceLevels = [
    { value: "beginner", label: "Beginner", description: "New to fitness" },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "Some experience",
    },
    { value: "advanced", label: "Advanced", description: "Very experienced" },
  ];

  const calculateMetrics = (data: OnboardingData): CalculatedMetrics => {
    const heightInMeters = parseFloat(data.height) / 100; // Convert cm to meters
    const weightInKg = parseFloat(data.weight);
    const age = parseFloat(data.age);

    // Calculate BMI
    const bmi = weightInKg / (heightInMeters * heightInMeters);

    // Determine BMI category
    let bmiCategory = "";
    if (bmi < 18.5) bmiCategory = "Underweight";
    else if (bmi < 25) bmiCategory = "Normal weight";
    else if (bmi < 30) bmiCategory = "Overweight";
    else bmiCategory = "Obese";

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (data.gender === "male") {
      bmr = 10 * weightInKg + 6.25 * heightInMeters * 100 - 5 * age + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInMeters * 100 - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    // Calculate TDEE
    const tdee = bmr * activityMultipliers[data.activityLevel];

    // Adjust calories based on fitness goal
    let calorieAdjustment = 0;
    switch (data.fitnessGoal) {
      case "weight_loss":
        calorieAdjustment = -500; // 1 lb per week
        break;
      case "weight_gain":
        calorieAdjustment = 500; // 1 lb per week
        break;
      case "muscle_gain":
        calorieAdjustment = 300; // Lean muscle gain
        break;
      case "endurance":
        calorieAdjustment = 200; // Slight surplus for endurance
        break;
      default:
        calorieAdjustment = 0; // Maintenance
    }

    const dailyCalories = Math.round(tdee + calorieAdjustment);
    const proteinNeeds = Math.round(weightInKg * 1.6); // 1.6g per kg body weight
    const waterIntake = Math.round(weightInKg * 35); // 35ml per kg body weight

    return {
      bmi: Math.round(bmi * 10) / 10,
      bmiCategory,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyCalories,
      proteinNeeds,
      waterIntake,
    };
  };

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Calculate metrics on the final step
      const metrics = calculateMetrics(formData);
      setCalculatedMetrics(metrics);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user || !calculatedMetrics) return;

    setIsLoading(true);
    try {
      // Update user profile with all the data
      const { error } = await supabase
        .from("profiles")
        .update({
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          age: parseFloat(formData.age),
          bmi: calculatedMetrics.bmi,
          workout_preference: formData.fitnessGoal,
          // Add new fields for the profile
          gender: formData.gender,
          activity_level: formData.activityLevel,
          fitness_goal: formData.fitnessGoal,
          experience_level: formData.experience,
          daily_calories: calculatedMetrics.dailyCalories,
          protein_needs: calculatedMetrics.proteinNeeds,
          water_intake: calculatedMetrics.waterIntake,
          bmr: calculatedMetrics.bmr,
          tdee: calculatedMetrics.tdee,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Also create initial weight entry
      await supabase.from("weight_entries" as any).insert({
        user_id: user.id,
        weight: parseFloat(formData.weight),
        unit: "kg",
        date: new Date().toISOString().split("T")[0],
      });

      toast({
        title: "Profile Created!",
        description: "Your fitness profile has been set up successfully",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        title: "Error",
        description: "Failed to create your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return "text-blue-600";
    if (bmi < 25) return "text-green-600";
    if (bmi < 30) return "text-yellow-600";
    return "text-red-600";
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
              <p className="text-muted-foreground">
                Let's start with your basic details
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) =>
                      handleInputChange("height", e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <div className="relative">
                  <Weight className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) =>
                      handleInputChange("weight", e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Gender</Label>
                <div className="flex gap-2 mt-2">
                  <FitnessButton
                    variant={formData.gender === "male" ? "default" : "outline"}
                    onClick={() => handleInputChange("gender", "male")}
                    className="flex-1"
                  >
                    Male
                  </FitnessButton>
                  <FitnessButton
                    variant={
                      formData.gender === "female" ? "default" : "outline"
                    }
                    onClick={() => handleInputChange("gender", "female")}
                    className="flex-1"
                  >
                    Female
                  </FitnessButton>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Activity className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Activity Level</h2>
              <p className="text-muted-foreground">
                How active are you on a typical day?
              </p>
            </div>

            <div className="space-y-3">
              {activityLevels.map((level) => (
                <div
                  key={level.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.activityLevel === level.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() =>
                    handleInputChange("activityLevel", level.value)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{level.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {level.description}
                      </p>
                    </div>
                    {formData.activityLevel === level.value && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Fitness Goals</h2>
              <p className="text-muted-foreground">
                What do you want to achieve?
              </p>
            </div>

            <div className="space-y-3">
              {fitnessGoals.map((goal) => (
                <div
                  key={goal.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.fitnessGoal === goal.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleInputChange("fitnessGoal", goal.value)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{goal.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {goal.description}
                      </p>
                    </div>
                    {formData.fitnessGoal === goal.value && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Label>Experience Level</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {experienceLevels.map((level) => (
                  <FitnessButton
                    key={level.value}
                    variant={
                      formData.experience === level.value
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleInputChange("experience", level.value)}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <span className="font-medium">{level.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {level.description}
                    </span>
                  </FitnessButton>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calculator className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Your Fitness Profile</h2>
              <p className="text-muted-foreground">
                Based on your information, here's your personalized plan
              </p>
            </div>

            {calculatedMetrics && (
              <div className="space-y-4">
                {/* BMI Section */}
                <FitnessCard>
                  <FitnessCardHeader>
                    <FitnessCardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Body Mass Index (BMI)
                    </FitnessCardTitle>
                  </FitnessCardHeader>
                  <FitnessCardContent>
                    <div className="text-center">
                      <div
                        className={`text-4xl font-bold ${getBMIColor(
                          calculatedMetrics.bmi
                        )}`}
                      >
                        {calculatedMetrics.bmi}
                      </div>
                      <div className="text-lg font-medium">
                        {calculatedMetrics.bmiCategory}
                      </div>
                    </div>
                  </FitnessCardContent>
                </FitnessCard>

                {/* Daily Goals */}
                <FitnessCard>
                  <FitnessCardHeader>
                    <FitnessCardTitle>Daily Nutrition Goals</FitnessCardTitle>
                  </FitnessCardHeader>
                  <FitnessCardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {calculatedMetrics.dailyCalories}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Daily Calories
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {calculatedMetrics.proteinNeeds}g
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Protein Needs
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {calculatedMetrics.waterIntake}ml
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Water Intake
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {calculatedMetrics.tdee}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          TDEE
                        </div>
                      </div>
                    </div>
                  </FitnessCardContent>
                </FitnessCard>

                {/* Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Your Plan Summary:</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• {formData.fitnessGoal.replace("_", " ")} focus</li>
                    <li>• {formData.activityLevel} activity level</li>
                    <li>• {formData.experience} experience level</li>
                    <li>
                      • {calculatedMetrics.dailyCalories} calories per day
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <FitnessCard>
          <FitnessCardContent className="p-8">
            {/* Progress Steps */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= currentStep
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step}
                    </div>
                    {step < 4 && (
                      <div
                        className={`w-8 h-0.5 mx-2 ${
                          step < currentStep ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <FitnessButton
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </FitnessButton>

              {currentStep < 4 ? (
                <FitnessButton onClick={handleNext}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </FitnessButton>
              ) : (
                <FitnessButton
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="bg-success hover:bg-success/90"
                >
                  {isLoading ? "Creating Profile..." : "Complete Setup"}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </FitnessButton>
              )}
            </div>
          </FitnessCardContent>
        </FitnessCard>
      </div>
    </div>
  );
};

export default OnboardingForm;
