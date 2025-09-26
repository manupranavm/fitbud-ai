import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWorkout } from '@/hooks/useWorkout'
import { supabase } from '@/integrations/supabase/client'
import { FitnessCard } from '@/components/ui/fitness-card'
import { FitnessButton } from '@/components/ui/fitness-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Calendar, Target, Edit3, Save, X } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileData {
  height?: number
  weight?: number
  age?: number
  workout_preference?: string
  bmi?: number
}

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth()
  const { totalWorkouts, currentStreak, workoutHistory } = useWorkout()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    height: '',
    weight: '',
    age: '',
    fitnessGoal: ''
  })

  // Load profile data from database
  useEffect(() => {
    loadProfileData()
  }, [user])

  // Update form data when profile data loads
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        height: profileData.height?.toString() || '',
        weight: profileData.weight?.toString() || '',
        age: profileData.age?.toString() || '',
        fitnessGoal: profileData.workout_preference || ''
      })
    }
  }, [profileData, user])

  const loadProfileData = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
        return
      }

      setProfileData(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleSave = async () => {
    try {
      // Update user metadata if needed
      await updateProfile({
        email: formData.email
      })

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
          bmi: formData.height && formData.weight ? 
            parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2) : null
        }

        const { error } = await supabase
          .from('profiles')
          .upsert(profileUpdate)

        if (error) throw error
      }

      setIsEditing(false)
      toast.success('Profile updated successfully!')
      loadProfileData() // Reload the data
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        height: profileData.height?.toString() || '',
        weight: profileData.weight?.toString() || '',
        age: profileData.age?.toString() || '',
        fitnessGoal: profileData.workout_preference || ''
      })
    }
    setIsEditing(false)
  }

  // Calculate this week's workouts
  const calculateThisWeeksWorkouts = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    
    return workoutHistory.filter(workout => {
      const workoutDate = new Date(workout.date)
      return workoutDate >= startOfWeek && workoutDate <= today && workout.completed
    }).length
  }

  // Calculate average hours per week
  const calculateAverageHoursPerWeek = () => {
    if (workoutHistory.length === 0) return 0
    const totalMinutes = workoutHistory.reduce((sum, workout) => sum + workout.duration, 0)
    const totalHours = totalMinutes / 60
    const totalWeeks = Math.max(1, Math.ceil(workoutHistory.length / 5)) // Assume 5 workouts per week target
    return (totalHours / totalWeeks).toFixed(1)
  }

  const thisWeeksWorkouts = calculateThisWeeksWorkouts()
  const averageHoursPerWeek = calculateAverageHoursPerWeek()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your personal information and fitness details</p>
        </div>
        <FitnessButton
          variant={isEditing ? "outline" : "default"}
          onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Avatar & Basic Info */}
        <FitnessCard className="md:col-span-1">
          <div className="flex flex-col items-center text-center p-6">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
              <AvatarFallback className="text-2xl">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            
            {isEditing ? (
              <div className="w-full space-y-3">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-heading font-semibold mb-2">{user?.user_metadata?.full_name || user?.email || 'User'}</h2>
                <p className="text-muted-foreground flex items-center gap-2 mb-4">
                  <Mail className="w-4 h-4" />
                  {user?.email || 'user@example.com'}
                </p>
              </>
            )}
            
            <Badge variant="secondary" className="mt-2">
              Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Badge>
          </div>
        </FitnessCard>

        {/* Fitness Details */}
        <FitnessCard className="md:col-span-2">
          <div className="p-6">
            <h3 className="text-lg font-heading font-semibold mb-6 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Fitness Information
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  {isEditing ? (
                    <Input
                      id="height"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-lg font-medium">{formData.height} cm</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  {isEditing ? (
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-lg font-medium">{formData.weight} kg</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  {isEditing ? (
                    <Input
                      id="age"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-lg font-medium">{formData.age} years</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="goal">Fitness Goal</Label>
                  {isEditing ? (
                    <Input
                      id="goal"
                      value={formData.fitnessGoal}
                      onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-lg font-medium">{formData.fitnessGoal}</p>
                  )}
                </div>
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
          </div>
        </FitnessCard>

        {/* Stats Overview */}
        <FitnessCard className="md:col-span-3">
          <div className="p-6">
            <h3 className="text-lg font-heading font-semibold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Activity Summary
            </h3>
            
             <div className="grid gap-4 md:grid-cols-4">
               <div className="text-center p-4 rounded-lg bg-muted/30">
                 <p className="text-2xl font-bold text-primary">{totalWorkouts}</p>
                 <p className="text-sm text-muted-foreground">Workouts Completed</p>
               </div>
               <div className="text-center p-4 rounded-lg bg-muted/30">
                 <p className="text-2xl font-bold text-primary">{thisWeeksWorkouts}</p>
                 <p className="text-sm text-muted-foreground">This Week</p>
               </div>
               <div className="text-center p-4 rounded-lg bg-muted/30">
                 <p className="text-2xl font-bold text-primary">{currentStreak}</p>
                 <p className="text-sm text-muted-foreground">Days Active</p>
               </div>
               <div className="text-center p-4 rounded-lg bg-muted/30">
                 <p className="text-2xl font-bold text-primary">{averageHoursPerWeek}</p>
                 <p className="text-sm text-muted-foreground">Avg. Hours/Week</p>
               </div>
             </div>
          </div>
        </FitnessCard>
      </div>
    </div>
  )
}

export default ProfilePage