import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Edit3, LogOut, Save, Trash2, User } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FitnessButton } from "@/components/ui/fitness-button";
import {
  FitnessCard,
  FitnessCardContent,
  FitnessCardDescription,
  FitnessCardHeader,
  FitnessCardTitle,
} from "@/components/ui/fitness-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileData {
  id: string;
  full_name: string | null;
  email: string;
  height: number | null;
  weight: number | null;
  age: number | null;
  fitness_goal: string | null;
  gender: string | null;
  activity_level: string | null;
  experience_level: string | null;
  bmi: number | null;
  bmr: number | null;
  tdee: number | null;
  daily_calories: number | null;
  protein_needs: number | null;
  water_intake: number | null;
}

const SettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    height: "",
    weight: "",
    age: "",
    fitnessGoal: "",
  });

  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    nutritionAlerts: true,
    progressUpdates: true,
    emailNotifications: false,
  });

  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    analytics: true,
    autoDelete: "6months",
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

      // Update form data with loaded profile data
      if (data) {
        setFormData({
          name: data.full_name || user.user_metadata?.full_name || "",
          email: data.email || user.email || "",
          height: data.height ? data.height.toString() : "",
          weight: data.weight ? data.weight.toString() : "",
          age: data.age ? data.age.toString() : "",
          fitnessGoal: data.fitness_goal || "",
        });
      } else {
        // Fallback to user data if no profile exists
        setFormData({
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
          height: "",
          weight: "",
          age: "",
          fitnessGoal: "",
        });
      }
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
  }, [loadProfileData]);

  const handleSaveProfile = async () => {
    if (!user || !profileData) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.name,
          email: formData.email,
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          age: formData.age ? parseInt(formData.age) : null,
          fitness_goal: formData.fitnessGoal || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Update auth profile
      updateProfile({
        email: formData.email,
      });

      setIsEditing(false);
      toast.success("Profile updated successfully!");

      // Reload profile data
      await loadProfileData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    // Show confirmation dialog and handle account deletion
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      toast.success("Account deletion requested. Please check your email.");
      console.log("Delete account");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-heading-lg mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and privacy settings
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <FitnessCard className="animate-slide-up">
              <FitnessCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <FitnessCardTitle>Profile Information</FitnessCardTitle>
                    <FitnessCardDescription>
                      Update your personal information and fitness details
                    </FitnessCardDescription>
                  </div>
                  <FitnessButton
                    variant={isEditing ? "default" : "outline"}
                    onClick={
                      isEditing ? handleSaveProfile : () => setIsEditing(true)
                    }
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {isEditing ? "Saving..." : "Loading..."}
                      </>
                    ) : isEditing ? (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </>
                    )}
                  </FitnessButton>
                </div>
              </FitnessCardHeader>

              <FitnessCardContent>
                {isLoading && !profileData ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center space-y-2">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-muted-foreground">
                        Loading profile...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center gap-6">
                      <Avatar className="w-20 h-20">
                        <AvatarImage
                          src="/placeholder-avatar.jpg"
                          alt="Profile"
                        />
                        <AvatarFallback>
                          <User className="w-8 h-8" />
                        </AvatarFallback>
                      </Avatar>

                      {isEditing && (
                        <FitnessButton variant="outline">
                          <Camera className="w-4 h-4" />
                          Change Photo
                        </FitnessButton>
                      )}
                    </div>

                    {/* Basic Information */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              name: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    {/* Physical Stats */}
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          value={formData.height}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              height: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          placeholder="e.g., 175"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          value={formData.weight}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              weight: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          placeholder="e.g., 70"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          value={formData.age}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              age: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          placeholder="e.g., 25"
                        />
                      </div>
                    </div>

                    {/* Fitness Goal */}
                    <div className="space-y-2">
                      <Label htmlFor="goal">Primary Fitness Goal</Label>
                      <Select
                        value={formData.fitnessGoal}
                        onValueChange={(value) =>
                          setFormData({ ...formData, fitnessGoal: value })
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your fitness goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight_loss">
                            Weight Loss
                          </SelectItem>
                          <SelectItem value="muscle_gain">
                            Muscle Gain
                          </SelectItem>
                          <SelectItem value="endurance">
                            Improve Endurance
                          </SelectItem>
                          <SelectItem value="strength">
                            Build Strength
                          </SelectItem>
                          <SelectItem value="maintenance">
                            Maintenance
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </FitnessCardContent>
            </FitnessCard>
          </TabsContent>

          {/* Account */}
          <TabsContent value="account" className="space-y-6">
            <FitnessCard className="animate-slide-up border-destructive/20">
              <FitnessCardHeader>
                <FitnessCardTitle>Danger Zone</FitnessCardTitle>
                <FitnessCardDescription>
                  Irreversible actions that affect your account
                </FitnessCardDescription>
              </FitnessCardHeader>

              <FitnessCardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                    <div>
                      <h4 className="font-medium">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <FitnessButton
                      variant="destructive"
                      onClick={handleDeleteAccount}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </FitnessButton>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium">Sign Out</h4>
                      <p className="text-sm text-muted-foreground">
                        Sign out of your account on this device
                      </p>
                    </div>
                    <FitnessButton variant="outline" onClick={logout}>
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </FitnessButton>
                  </div>
                </div>
              </FitnessCardContent>
            </FitnessCard>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SettingsPage;
