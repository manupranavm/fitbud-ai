import { ToastProvider } from "@/components/providers/ToastProvider";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ExerciseDetailsPage from "./pages/ExerciseDetailsPage";
import FormMonitorPage from "./pages/FormMonitorPage";
import GymEquipmentPage from "./pages/GymEquipmentPage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import NutritionPage from "./pages/NutritionPage";
import ProfilePage from "./pages/ProfilePage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import WorkoutPage from "./pages/WorkoutPage";
import WorkoutPlanDetailsPage from "./pages/WorkoutPlanDetailsPage";
import WorkoutSessionPage from "./pages/WorkoutSessionPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
        <Route path="/form-check" element={<ProtectedRoute><FormMonitorPage /></ProtectedRoute>} />
        <Route path="/form-monitor" element={<ProtectedRoute><FormMonitorPage /></ProtectedRoute>} />
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
