import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FitnessButton } from "@/components/ui/fitness-button";
import {
  FitnessCard,
  FitnessCardContent,
  FitnessCardHeader,
  FitnessCardTitle,
} from "@/components/ui/fitness-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useNutrition } from "@/hooks/useNutrition";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity,
  Beef,
  Calculator,
  Calendar,
  Edit3,
  Flame,
  Mail,
  RefreshCw,
  Ruler,
  Save,
  Target,
  Trophy,
  User,
  Weight,
  X,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ProfileData {
  height?: number;
  weight?: number;
  age?: number;
  workout_preference?: string;
  bmi?: number;
  gender?: string;
  activity_level?: string;
  fitness_goal?: string;
  experience_level?: string;
  bmr?: number;
  tdee?: number;
  daily_calories?: number;
  protein_needs?: number;
  water_intake?: number;
}

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { goals } = useNutrition();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    height: "",
    weight: "",
    age: "",
    fitnessGoal: "",
    gender: "",
    activityLevel: "",
    experienceLevel: "",
  });

  const loadProfileData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data");
        return;
      }

      console.log("Loaded profile data:", data);
      setProfileData(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load profile data from database
  useEffect(() => {
    loadProfileData();
  }, [user, loadProfileData]);

  // Update form data when profile data loads
  useEffect(() => {
    if (profileData) {
      console.log("Setting form data from profile:", profileData);
      setFormData({
        name: user?.user_metadata?.full_name || "",
        email: user?.email || "",
        height: profileData.height?.toString() || "",
        weight: profileData.weight?.toString() || "",
        age: profileData.age?.toString() || "",
        fitnessGoal:
          profileData.fitness_goal || profileData.workout_preference || "",
        gender: profileData.gender || "",
        activityLevel: profileData.activity_level || "",
        experienceLevel: profileData.experience_level || "",
      });
    }
  }, [profileData, user]);

  const handleSave = async () => {
    try {
      // Update user metadata if needed
      await updateProfile({
        email: formData.email,
      });

      // Update or insert profile data
      if (user) {
        const profileUpdate = {
          id: user.id,
          email: formData.email,
          full_name: formData.name,
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          age: formData.age ? parseInt(formData.age) : null,
          workout_preference: formData.fitnessGoal || null,
          fitness_goal: formData.fitnessGoal || null,
          gender: formData.gender || null,
          activity_level: formData.activityLevel || null,
          experience_level: formData.experienceLevel || null,
          bmi:
            formData.height && formData.weight
              ? parseFloat(formData.weight) /
                Math.pow(parseFloat(formData.height) / 100, 2)
              : null,
        };

        const { error } = await supabase.from("profiles").upsert(profileUpdate);

        if (error) throw error;
      }

      setIsEditing(false);
      toast.success("Profile updated successfully!");
      loadProfileData(); // Reload the data
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        name: user?.user_metadata?.full_name || "",
        email: user?.email || "",
        height: profileData.height?.toString() || "",
        weight: profileData.weight?.toString() || "",
        age: profileData.age?.toString() || "",
        fitnessGoal:
          profileData.fitness_goal || profileData.workout_preference || "",
        gender: profileData.gender || "",
        activityLevel: profileData.activity_level || "",
        experienceLevel: profileData.experience_level || "",
      });
    }
    setIsEditing(false);
  };

  // Helper functions for display
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600" };
    if (bmi < 25) return { category: "Normal weight", color: "text-green-600" };
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-600" };
    return { category: "Obese", color: "text-red-600" };
  };

  const formatActivityLevel = (level: string) => {
    return (
      level?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
      "Not set"
    );
  };

  const formatFitnessGoal = (goal: string) => {
    return (
      goal?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
      "Not set"
    );
  };

  const formatExperienceLevel = (level: string) => {
    return level?.replace(/\b\w/g, (l) => l.toUpperCase()) || "Not set";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal information and fitness details
          </p>
        </div>
        <div className="flex gap-2">
          <FitnessButton
            variant="outline"
            onClick={loadProfileData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </FitnessButton>
          <FitnessButton
            variant={isEditing ? "outline" : "default"}
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            className="gap-2"
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </>
            )}
          </FitnessButton>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading profile data...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Avatar & Basic Info */}
          <FitnessCard className="lg:col-span-1">
            <FitnessCardHeader>
              <FitnessCardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </FitnessCardTitle>
            </FitnessCardHeader>
            <FitnessCardContent>
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                  <AvatarFallback className="text-xl">
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>

                {isEditing ? (
                  <div className="w-full space-y-3">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-heading font-semibold">
                      {user?.user_metadata?.full_name || user?.email || "User"}
                    </h2>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user?.email || "user@example.com"}
                    </p>
                  </>
                )}

                <Badge variant="secondary">
                  Member since{" "}
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </Badge>
              </div>
            </FitnessCardContent>
          </FitnessCard>

          {/* Physical Stats */}
          <FitnessCard className="lg:col-span-2">
            <FitnessCardHeader>
              <FitnessCardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Physical Statistics
              </FitnessCardTitle>
            </FitnessCardHeader>
            <FitnessCardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    {isEditing ? (
                      <Input
                        id="height"
                        value={formData.height}
                        onChange={(e) =>
                          setFormData({ ...formData, height: e.target.value })
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-lg font-medium flex items-center gap-2">
                        <Ruler className="w-4 h-4" />
                        {formData.height || "Not set"} cm
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    {isEditing ? (
                      <Input
                        id="weight"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({ ...formData, weight: e.target.value })
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-lg font-medium flex items-center gap-2">
                        <Weight className="w-4 h-4" />
                        {formData.weight || "Not set"} kg
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="age">Age</Label>
                    {isEditing ? (
                      <Input
                        id="age"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({ ...formData, age: e.target.value })
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-lg font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formData.age || "Not set"} years
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    {isEditing ? (
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                        className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-lg font-medium flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {formData.gender
                          ? formData.gender.charAt(0).toUpperCase() +
                            formData.gender.slice(1)
                          : "Not set"}
                      </p>
                    )}
                  </div>

                  {profileData?.bmi && (
                    <div>
                      <Label>BMI</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        <span className="text-lg font-medium">
                          {profileData.bmi.toFixed(1)}
                        </span>
                        <Badge
                          variant="outline"
                          className={getBMICategory(profileData.bmi).color}
                        >
                          {getBMICategory(profileData.bmi).category}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </FitnessCardContent>
          </FitnessCard>

          {/* Fitness Goals & Preferences */}
          <FitnessCard className="lg:col-span-3">
            <FitnessCardHeader>
              <FitnessCardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Fitness Goals & Preferences
              </FitnessCardTitle>
            </FitnessCardHeader>
            <FitnessCardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <Label htmlFor="fitnessGoal">Fitness Goal</Label>
                  {isEditing ? (
                    <select
                      id="fitnessGoal"
                      value={formData.fitnessGoal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fitnessGoal: e.target.value,
                        })
                      }
                      className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="">Select goal</option>
                      <option value="weight_loss">Weight Loss</option>
                      <option value="weight_gain">Weight Gain</option>
                      <option value="muscle_gain">Muscle Gain</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="endurance">Endurance</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-lg font-medium flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      {formatFitnessGoal(formData.fitnessGoal)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="activityLevel">Activity Level</Label>
                  {isEditing ? (
                    <select
                      id="activityLevel"
                      value={formData.activityLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          activityLevel: e.target.value,
                        })
                      }
                      className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="">Select level</option>
                      <option value="sedentary">Sedentary</option>
                      <option value="light">Light</option>
                      <option value="moderate">Moderate</option>
                      <option value="active">Active</option>
                      <option value="very_active">Very Active</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-lg font-medium flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      {formatActivityLevel(formData.activityLevel)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  {isEditing ? (
                    <select
                      id="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experienceLevel: e.target.value,
                        })
                      }
                      className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="">Select level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-lg font-medium flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      {formatExperienceLevel(formData.experienceLevel)}
                    </p>
                  )}
                </div>
              </div>

              {isEditing && (
                <>
                  <Separator className="my-6" />
                  <div className="flex justify-end gap-3">
                    <FitnessButton variant="outline" onClick={handleCancel}>
                      Cancel
                    </FitnessButton>
                    <FitnessButton onClick={handleSave} className="gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </FitnessButton>
                  </div>
                </>
              )}
            </FitnessCardContent>
          </FitnessCard>

          {/* Nutrition Goals */}
          {profileData &&
            (profileData.daily_calories ||
              profileData.protein_needs ||
              profileData.water_intake) && (
              <FitnessCard className="lg:col-span-3">
                <FitnessCardHeader>
                  <FitnessCardTitle className="flex items-center gap-2">
                    <Flame className="w-5 h-5" />
                    Daily Nutrition Goals
                  </FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    {profileData.daily_calories && (
                      <div className="text-center p-4 rounded-lg bg-muted/30">
                        <Flame className="w-6 h-6 mx-auto mb-2 text-success" />
                        <p className="text-2xl font-bold text-primary">
                          {profileData.daily_calories}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Daily Calories
                        </p>
                      </div>
                    )}
                    {profileData.protein_needs && (
                      <div className="text-center p-4 rounded-lg bg-muted/30">
                        <Beef className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold text-primary">
                          {profileData.protein_needs}g
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Protein Needs
                        </p>
                      </div>
                    )}
                    {profileData.water_intake && (
                      <div className="text-center p-4 rounded-lg bg-muted/30">
                        <Zap className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold text-primary">
                          {profileData.water_intake}ml
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Water Intake
                        </p>
                      </div>
                    )}
                    {profileData.bmr && (
                      <div className="text-center p-4 rounded-lg bg-muted/30">
                        <Calculator className="w-6 h-6 mx-auto mb-2 text-secondary" />
                        <p className="text-2xl font-bold text-primary">
                          {profileData.bmr}
                        </p>
                        <p className="text-sm text-muted-foreground">BMR</p>
                      </div>
                    )}
                  </div>
                </FitnessCardContent>
              </FitnessCard>
            )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
