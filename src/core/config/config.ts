/**
 * Application configuration
 */

export const config = {
  app: {
    name: 'DynamoPulseFit',
    version: '1.0.0',
    description: 'A comprehensive fitness and nutrition tracking application'
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'https://api.example.com',
  },
  supabase: {
    url: "https://tkyyhbvxxvtgxizkecso.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRreXloYnZ4eHZ0Z3hpemtlY3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNDk1NzksImV4cCI6MjA3MzkyNTU3OX0.BKy2VNpriSJeiXZPGPl0ZW_HhfhSe9yeS_OV9qptUg8"
  },
  routes: {
    home: '/',
    login: '/login',
    signup: '/signup',
    dashboard: '/dashboard',
    workout: '/workout',
    nutrition: '/nutrition',
    progress: '/progress',
    profile: '/profile',
    settings: '/settings',
  }
}
