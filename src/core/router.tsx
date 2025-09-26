import { createBrowserRouter } from 'react-router-dom';

// Layouts
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Import pages directly without lazy loading for now
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import ExerciseDetailsPage from '@/pages/ExerciseDetailsPage';
import FormMonitorPage from '@/pages/FormMonitorPage';
import GymEquipmentPage from '@/pages/GymEquipmentPage';
import LandingPage from '@/pages/LandingPage';
import NotFound from '@/pages/NotFound';
import NutritionPage from '@/pages/NutritionPage';
import ProfilePage from '@/pages/ProfilePage';
import ProgressPage from '@/pages/ProgressPage';
import SettingsPage from '@/pages/SettingsPage';
import WorkoutPage from '@/pages/WorkoutPage';
import WorkoutPlanDetailsPage from '@/pages/WorkoutPlanDetailsPage';
import WorkoutSessionPage from '@/pages/WorkoutSessionPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <AuthPage type="login" />,
  },
  {
    path: '/signup',
    element: <AuthPage type="signup" />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/workout',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <WorkoutPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/workout/session/:workoutId',
    element: (
      <ProtectedRoute>
        <WorkoutSessionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/workout/plan/:planId/details',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <WorkoutPlanDetailsPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/exercise/:exerciseName',
    element: (
      <ProtectedRoute>
        <ExerciseDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/gym-equipment',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <GymEquipmentPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/form-check',
    element: (
      <ProtectedRoute>
        <FormMonitorPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/form-monitor',
    element: (
      <ProtectedRoute>
        <FormMonitorPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/nutrition',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <NutritionPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/progress',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ProgressPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <SettingsPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ProfilePage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
