import React, { useState } from "react"
import toast from "react-hot-toast"
import { 
  User, 
  Bell, 
  Shield, 
  Trash2,
  Camera,
  Edit3,
  Save,
  LogOut
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

import { FitnessButton } from "@/components/ui/fitness-button"
import { FitnessCard, FitnessCardContent, FitnessCardDescription, FitnessCardHeader, FitnessCardTitle } from "@/components/ui/fitness-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"

const SettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.user_metadata?.full_name || "John Doe",
    email: user?.email || "john@example.com",
    height: "5'10\"",
    weight: "175",
    age: "28",
    fitnessGoal: "muscle-gain"
  })

  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    nutritionAlerts: true,
    progressUpdates: true,
    emailNotifications: false
  })

  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    analytics: true,
    autoDelete: "6months"
  })

  const handleSaveProfile = () => {
    setIsEditing(false)
      updateProfile({
        email: profileData.email
      })
    toast.success("Profile updated successfully!")
  }

  const handleDeleteAccount = () => {
    // Show confirmation dialog and handle account deletion
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast.success("Account deletion requested. Please check your email.")
      console.log("Delete account")
    }
  }

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
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
                    onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                  >
                    {isEditing ? (
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
                <div className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
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
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {/* Physical Stats */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="height">Height</Label>
                      <Input
                        id="height"
                        value={profileData.height}
                        onChange={(e) => setProfileData({...profileData, height: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (lbs)</Label>
                      <Input
                        id="weight"
                        value={profileData.weight}
                        onChange={(e) => setProfileData({...profileData, weight: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        value={profileData.age}
                        onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {/* Fitness Goal */}
                  <div className="space-y-2">
                    <Label htmlFor="goal">Primary Fitness Goal</Label>
                    <Select 
                      value={profileData.fitnessGoal} 
                      onValueChange={(value) => setProfileData({...profileData, fitnessGoal: value})}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight-loss">Weight Loss</SelectItem>
                        <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                        <SelectItem value="endurance">Improve Endurance</SelectItem>
                        <SelectItem value="strength">Build Strength</SelectItem>
                        <SelectItem value="general">General Fitness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </FitnessCardContent>
            </FitnessCard>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <FitnessCard className="animate-slide-up">
              <FitnessCardHeader>
                <FitnessCardTitle>Notification Preferences</FitnessCardTitle>
                <FitnessCardDescription>
                  Choose how you want to be notified about your fitness progress
                </FitnessCardDescription>
              </FitnessCardHeader>
              
              <FitnessCardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Workout Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when it's time for your scheduled workouts
                      </p>
                    </div>
                    <Switch
                      checked={notifications.workoutReminders}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, workoutReminders: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Nutrition Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Reminders to log meals and track calories
                      </p>
                    </div>
                    <Switch
                      checked={notifications.nutritionAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, nutritionAlerts: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Progress Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Weekly summaries of your fitness achievements
                      </p>
                    </div>
                    <Switch
                      checked={notifications.progressUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, progressUpdates: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email instead of push notifications
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, emailNotifications: checked})
                      }
                    />
                  </div>
                </div>
              </FitnessCardContent>
            </FitnessCard>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy" className="space-y-6">
            <FitnessCard className="animate-slide-up">
              <FitnessCardHeader>
                <FitnessCardTitle>Privacy & Data</FitnessCardTitle>
                <FitnessCardDescription>
                  Control how your data is used and stored
                </FitnessCardDescription>
              </FitnessCardHeader>
              
              <FitnessCardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow anonymized data to be used for research and app improvement
                      </p>
                    </div>
                    <Switch
                      checked={privacy.dataSharing}
                      onCheckedChange={(checked) => 
                        setPrivacy({...privacy, dataSharing: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help us improve the app by sharing usage analytics
                      </p>
                    </div>
                    <Switch
                      checked={privacy.analytics}
                      onCheckedChange={(checked) => 
                        setPrivacy({...privacy, analytics: checked})
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Auto-delete uploaded videos</Label>
                    <Select 
                      value={privacy.autoDelete} 
                      onValueChange={(value) => setPrivacy({...privacy, autoDelete: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1month">After 1 month</SelectItem>
                        <SelectItem value="3months">After 3 months</SelectItem>
                        <SelectItem value="6months">After 6 months</SelectItem>
                        <SelectItem value="1year">After 1 year</SelectItem>
                        <SelectItem value="never">Never delete</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Form check videos will be automatically deleted after this period
                    </p>
                  </div>
                </div>
              </FitnessCardContent>
            </FitnessCard>

            <Alert className="animate-slide-up" style={{ animationDelay: "200ms" }}>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your privacy is important to us. All data is encrypted and stored securely. 
                You can delete your uploaded videos at any time from your account.
              </AlertDescription>
            </Alert>
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
                    <FitnessButton variant="destructive" onClick={handleDeleteAccount}>
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
  )
}

export default SettingsPage