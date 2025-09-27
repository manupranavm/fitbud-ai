/**
 * Application-wide constants
 */

export const APP_NAME = "FitBud AI";

// Authentication
export const AUTH_STORAGE_KEY = "auth-storage";

// Workout types
export const WORKOUT_TYPES = [
  "Strength",
  "Cardio",
  "HIIT",
  "Yoga",
  "Pilates",
  "Flexibility",
  "Balance",
] as const;

// Difficulty levels
export const DIFFICULTY_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

// Meal types
export const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

// API endpoints
export const API_ENDPOINTS = {
  workout: "/api/workout",
  nutrition: "/api/nutrition",
  progress: "/api/progress",
  user: "/api/user",
  auth: "/api/auth",
};

// Form validation
export const VALIDATION = {
  password: {
    minLength: 8,
    maxLength: 32,
    pattern:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/,
  },
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
};

// Local storage keys
export const STORAGE_KEYS = {
  theme: "theme",
  user: "user",
  token: "token",
};

// Routes
export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  workout: "/workout",
  workoutSession: "/workout/session/:workoutId",
  workoutPlanDetails: "/workout/plan/:planId/details",
  exerciseDetails: "/exercise/:exerciseName",
  gymEquipment: "/gym-equipment",
  formCheck: "/form-check",
  formMonitor: "/form-monitor",
  nutrition: "/nutrition",
  progress: "/progress",
  settings: "/settings",
  profile: "/profile",
};
