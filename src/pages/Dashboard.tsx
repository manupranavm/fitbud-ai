import {
  Beef,
  Flame,
  Play,
  Plus,
  TrendingUp,
  UtensilsCrossed,
  Wheat,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { useEquipmentWorkouts } from "@/hooks/useEquipmentWorkouts";
import { useNutrition } from "@/hooks/useNutrition";
import { useWorkout } from "@/hooks/useWorkout";

import { FitnessButton } from "@/components/ui/fitness-button";
import {
  FitnessCard,
  FitnessCardContent,
  FitnessCardDescription,
  FitnessCardHeader,
  FitnessCardTitle,
} from "@/components/ui/fitness-card";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { totalWorkouts, currentStreak, workoutHistory, currentWorkout } =
    useWorkout();
  const { getTodaysTotals, goals, loadTodaysFoods } = useNutrition();
  const { getTodaysWorkout } = useEquipmentWorkouts();
  const [showFormMonitor, setShowFormMonitor] = useState(false); // Keep for backward compatibility but don't use

  // Load today's nutrition data on component mount
  useEffect(() => {
    loadTodaysFoods();
  }, [loadTodaysFoods]);

  // Get real data from stores
  const todaysTotals = getTodaysTotals();

  // Calculate real workout progress based on current workout
  const calculateWorkoutProgress = () => {
    if (!currentWorkout || !currentWorkout.exercises) return 0;
    const totalExercises = currentWorkout.exercises.length;
    const completedExercises = currentWorkout.exercises.filter(
      (ex) => ex.completed
    ).length;
    return Math.round((completedExercises / totalExercises) * 100);
  };

  // Calculate this week's workouts
  const calculateThisWeeksWorkouts = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week

    return workoutHistory.filter((workout) => {
      const workoutDate = new Date(workout.date);
      return (
        workoutDate >= startOfWeek && workoutDate <= today && workout.completed
      );
    }).length;
  };

  const workoutProgress = calculateWorkoutProgress();
  const thisWeeksWorkouts = calculateThisWeeksWorkouts();

  // Use real data from stores
  const todayStats = {
    workoutProgress: workoutProgress,
    caloriesConsumed: Math.round(todaysTotals.calories),
    caloriesTarget: goals.calories,
    proteinConsumed: Math.round(todaysTotals.protein),
    proteinTarget: goals.protein,
    carbsConsumed: Math.round(todaysTotals.carbs),
    carbsTarget: goals.carbs,
    fatConsumed: Math.round(todaysTotals.fat),
    fatTarget: goals.fat,
  };

  // Get the most recent or current workout for today's workout display
  const getDisplayWorkout = () => {
    // First check equipment workout
    const equipmentWorkout = getTodaysWorkout();
    if (equipmentWorkout) {
      return {
        ...equipmentWorkout,
        completed: false,
      };
    }
    const today = new Date().toDateString();
    const todaysWorkout = workoutHistory.find(
      (workout) => new Date(workout.date).toDateString() === today
    );

    if (todaysWorkout) {
      return {
        name: todaysWorkout.name,
        exercises: todaysWorkout.exercises || [],
        duration: todaysWorkout.duration,
        completed: todaysWorkout.completed,
      };
    }

    // If no workout today, show current workout or default
    if (currentWorkout) {
      return {
        name: currentWorkout.name || "Today's Workout",
        exercises: currentWorkout.exercises || [],
        duration: currentWorkout.duration || 45,
        completed: false,
      };
    }

    // Default fallback
    return {
      name: "Upper Body Strength",
      exercises: [
        { name: "Push-ups", sets: 3, reps: 12, completed: false },
        { name: "Bench Press", sets: 4, reps: 8, completed: false },
        { name: "Dumbbell Rows", sets: 3, reps: 10, completed: false },
        { name: "Shoulder Press", sets: 3, reps: 10, completed: false },
        { name: "Tricep Dips", sets: 3, reps: 15, completed: false },
        { name: "Pull-ups", sets: 3, reps: 8, completed: false },
      ],
      duration: 45,
      completed: false,
    };
  };

  const todaysWorkout = getTodaysWorkout();

  const quickActions: Array<{
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    variant: "food" | "gradient";
    onClick?: () => void;
    isNew?: boolean;
  }> = [
    {
      title: "Log Meal",
      description: "Scan or add your meals",
      icon: UtensilsCrossed,
      href: "/nutrition",
      variant: "food" as const,
    },
    {
      title: "View Progress",
      description: "Check your fitness journey",
      icon: TrendingUp,
      href: "/progress",
      variant: "gradient" as const,
    },
  ];

  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-heading-lg mb-2">
          Welcome back,{" "}
          {user?.user_metadata?.full_name || user?.email || "User"}!{" "}
        </h1>
        <p className="text-muted-foreground">
          You've consumed {todayStats.caloriesConsumed} of{" "}
          {todayStats.caloriesTarget} calories today. Keep fueling your fitness
          journey!
        </p>
      </div>

      {/* Today's Nutrition Overview */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
        {/* Calories */}
        <FitnessCard variant="food" className="animate-slide-up">
          <FitnessCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <FitnessCardTitle className="text-base">
                Calories
              </FitnessCardTitle>
              <Flame className="w-5 h-5 text-success" />
            </div>
          </FitnessCardHeader>
          <FitnessCardContent>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">
                {todayStats.caloriesConsumed}
                <span className="text-sm text-muted-foreground font-normal">
                  /{todayStats.caloriesTarget}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-success h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (todayStats.caloriesConsumed /
                        todayStats.caloriesTarget) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.max(
                  0,
                  todayStats.caloriesTarget - todayStats.caloriesConsumed
                )}{" "}
                calories remaining
              </p>
            </div>
          </FitnessCardContent>
        </FitnessCard>

        {/* Protein */}
        <FitnessCard
          variant="workout"
          className="animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          <FitnessCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <FitnessCardTitle className="text-base">Protein</FitnessCardTitle>
              <Beef className="w-5 h-5 text-primary" />
            </div>
          </FitnessCardHeader>
          <FitnessCardContent>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">
                {todayStats.proteinConsumed}g
                <span className="text-sm text-muted-foreground font-normal">
                  /{todayStats.proteinTarget}g
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (todayStats.proteinConsumed / todayStats.proteinTarget) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.max(
                  0,
                  todayStats.proteinTarget - todayStats.proteinConsumed
                )}
                g remaining
              </p>
            </div>
          </FitnessCardContent>
        </FitnessCard>

        {/* Carbs */}
        <FitnessCard
          variant="progress"
          className="animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          <FitnessCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <FitnessCardTitle className="text-base">Carbs</FitnessCardTitle>
              <Wheat className="w-5 h-5 text-secondary" />
            </div>
          </FitnessCardHeader>
          <FitnessCardContent>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">
                {todayStats.carbsConsumed}g
                <span className="text-sm text-muted-foreground font-normal">
                  /{todayStats.carbsTarget}g
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-secondary h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (todayStats.carbsConsumed / todayStats.carbsTarget) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.max(0, todayStats.carbsTarget - todayStats.carbsConsumed)}
                g remaining
              </p>
            </div>
          </FitnessCardContent>
        </FitnessCard>

        {/* Fat */}
        <FitnessCard
          variant="gradient"
          className="animate-slide-up"
          style={{ animationDelay: "300ms" }}
        >
          <FitnessCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <FitnessCardTitle className="text-base">Fat</FitnessCardTitle>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
          </FitnessCardHeader>
          <FitnessCardContent>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">
                {todayStats.fatConsumed}g
                <span className="text-sm text-muted-foreground font-normal">
                  /{todayStats.fatTarget}g
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (todayStats.fatConsumed / todayStats.fatTarget) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.max(0, todayStats.fatTarget - todayStats.fatConsumed)}g
                remaining
              </p>
            </div>
          </FitnessCardContent>
        </FitnessCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left Column - Quick Actions */}
        <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
          <h2 className="text-heading-sm mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4 h-full">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const handleClick = action.onClick || (() => {});

              return (
                <FitnessCard
                  key={index}
                  variant={action.variant}
                  className="cursor-pointer group hover:scale-[1.02] transition-all duration-200 relative"
                >
                  {action.href ? (
                    <Link to={action.href} className="block h-full">
                      <FitnessCardContent className="flex flex-col items-center text-center p-4">
                        <div className="mb-3 p-2.5 bg-primary/20 rounded-xl group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-200">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <FitnessCardTitle className="text-sm mb-1 font-semibold">
                          {action.title}
                        </FitnessCardTitle>
                        <FitnessCardDescription className="text-xs leading-relaxed">
                          {action.description}
                        </FitnessCardDescription>
                      </FitnessCardContent>
                    </Link>
                  ) : (
                    <div onClick={handleClick} className="block h-full">
                      <FitnessCardContent className="flex flex-col items-center text-center p-4">
                        {action.isNew && (
                          <div className="absolute -top-2 -right-2 bg-success text-background text-xs px-2 py-1 rounded-full font-semibold">
                            NEW
                          </div>
                        )}
                        <div className="mb-3 p-2.5 bg-primary/20 rounded-xl group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-200">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <FitnessCardTitle className="text-sm mb-1 font-semibold">
                          {action.title}
                        </FitnessCardTitle>
                        <FitnessCardDescription className="text-xs leading-relaxed">
                          {action.description}
                        </FitnessCardDescription>
                      </FitnessCardContent>
                    </div>
                  )}
                </FitnessCard>
              );
            })}
          </div>
        </div>

        {/* Right Column - Today's Workout */}
        <div className="animate-slide-up" style={{ animationDelay: "500ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-sm">Today's Workout</h2>
          </div>

          <FitnessCard variant="workout" className="h-full">
            <FitnessCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <FitnessCardTitle>
                    {todaysWorkout?.name || "No Workout Planned"}
                  </FitnessCardTitle>
                  <FitnessCardDescription>
                    {todaysWorkout
                      ? `${todaysWorkout.exercises.length} exercises • ${todaysWorkout.duration} minutes • ${todaysWorkout.difficulty}`
                      : "Create a workout plan using your gym equipment"}
                  </FitnessCardDescription>
                </div>
              </div>
            </FitnessCardHeader>
            <FitnessCardContent>
              {todaysWorkout ? (
                <>
                  <div className="space-y-3 mb-6">
                    {todaysWorkout.exercises
                      .slice(0, 6)
                      .map((exercise, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between py-2 border-l-2 pl-3 ${
                            exercise.completed
                              ? "border-primary"
                              : "border-muted"
                          }`}
                        >
                          <span
                            className={`text-sm ${
                              exercise.completed ? "font-medium" : ""
                            }`}
                          >
                            {exercise.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {exercise.sets} × {exercise.reps}
                          </span>
                        </div>
                      ))}
                    {todaysWorkout.exercises.length > 6 && (
                      <div className="text-center text-sm text-muted-foreground">
                        +{todaysWorkout.exercises.length - 6} more exercises
                      </div>
                    )}
                  </div>

                  <FitnessButton asChild className="w-full" size="lg">
                    <Link to="/gym-equipment?goto=today">
                      <Play className="w-4 h-4" />
                      {workoutProgress > 0
                        ? "Continue Workout"
                        : "Start Workout"}
                    </Link>
                  </FitnessButton>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    Create a personalized workout plan based on your available
                    gym equipment
                  </p>
                  <FitnessButton asChild className="w-full" size="lg">
                    <Link to="/gym-equipment">
                      <Plus className="w-4 h-4" />
                      Create Workout Plan
                    </Link>
                  </FitnessButton>
                </div>
              )}
            </FitnessCardContent>
          </FitnessCard>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
