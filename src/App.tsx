import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import WorkoutPage from "./pages/WorkoutPage";
import WorkoutSessionPage from "./pages/WorkoutSessionPage";
import WorkoutPlanDetailsPage from "./pages/WorkoutPlanDetailsPage";
import ExerciseDetailsPage from "./pages/ExerciseDetailsPage";
import GymEquipmentPage from "./pages/GymEquipmentPage";
import FormCheckPage from "./pages/FormCheckPage";
import NutritionPage from "./pages/NutritionPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const AppContent = () => {
  const { initialize } = useAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage type="login" />} />
        <Route path="/signup" element={<AuthPage type="signup" />} />
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/workout" element={<ProtectedRoute><AppLayout><WorkoutPage /></AppLayout></ProtectedRoute>} />
        <Route path="/workout/session/:workoutId" element={<ProtectedRoute><WorkoutSessionPage /></ProtectedRoute>} />
        <Route path="/workout/plan/:planId/details" element={<ProtectedRoute><AppLayout><WorkoutPlanDetailsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/exercise/:exerciseName" element={<ProtectedRoute><ExerciseDetailsPage /></ProtectedRoute>} />
        <Route path="/gym-equipment" element={<ProtectedRoute><AppLayout><GymEquipmentPage /></AppLayout></ProtectedRoute>} />
        <Route path="/form-check" element={<ProtectedRoute><AppLayout><FormCheckPage /></AppLayout></ProtectedRoute>} />
        <Route path="/nutrition" element={<ProtectedRoute><AppLayout><NutritionPage /></AppLayout></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><AppLayout><ProgressPage /></AppLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </ToastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
