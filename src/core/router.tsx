import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Layouts
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Pages
const LandingPage = lazy(() => import('@/features/landing/LandingPage'));
const AuthPage = lazy(() => import('@/features/auth/AuthPage'));
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard'));
const WorkoutPage = lazy(() => import('@/features/workout/WorkoutPage'));
const WorkoutSessionPage = lazy(() => import('@/features/workout/WorkoutSessionPage'));
const WorkoutPlanDetailsPage = lazy(() => import('@/features/workout/WorkoutPlanDetailsPage'));
const ExerciseDetailsPage = lazy(() => import('@/features/workout/ExerciseDetailsPage'));
const GymEquipmentPage = lazy(() => import('@/features/gym/GymEquipmentPage'));
const FormMonitorPage = lazy(() => import('@/features/form-monitor/FormMonitorPage'));
const NutritionPage = lazy(() => import('@/features/nutrition/NutritionPage'));
const ProgressPage = lazy(() => import('@/features/progress/ProgressPage'));
const SettingsPage = lazy(() => import('@/features/profile/SettingsPage'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'));
const NotFound = lazy(() => import('@/features/errors/NotFound'));

// Loading fallback
const LoadingFallback = () => <div className="flex items-center justify-center min-h-screen">Loading...</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Suspense fallback={<LoadingFallback />}><LandingPage /></Suspense>,
  },
  {
    path: '/login',
    element: <Suspense fallback={<LoadingFallback />}><AuthPage type="login" /></Suspense>,
  },
  {
    path: '/signup',
    element: <Suspense fallback={<LoadingFallback />}><AuthPage type="signup" /></Suspense>,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/workout',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <WorkoutPage />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/workout/session/:workoutId',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <WorkoutSessionPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/workout/plan/:planId/details',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <WorkoutPlanDetailsPage />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/exercise/:exerciseName',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <ExerciseDetailsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/gym-equipment',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <GymEquipmentPage />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/form-check',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <FormMonitorPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/form-monitor',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <FormMonitorPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/nutrition',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <NutritionPage />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/progress',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <ProgressPage />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <SettingsPage />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <ProfilePage />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>,
  },
]);
