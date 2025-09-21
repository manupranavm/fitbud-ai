import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const user: User = {
            id: '1',
            name: 'John Doe',
            email: email,
            avatar: '/placeholder-avatar.jpg'
          }
          
          set({ user, isAuthenticated: true, isLoading: false })
          
          // Redirect to dashboard after successful login
          window.location.href = '/dashboard'
        } catch (error) {
          set({ isLoading: false })
          throw new Error('Invalid credentials')
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true })
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const user: User = {
            id: '1',
            name: name,
            email: email,
            avatar: '/placeholder-avatar.jpg'
          }
          
          set({ user, isAuthenticated: true, isLoading: false })
          
          // Redirect to dashboard after successful signup
          window.location.href = '/dashboard'
        } catch (error) {
          set({ isLoading: false })
          throw new Error('Signup failed')
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
        window.location.href = '/'
      },

      updateProfile: (data: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...data } })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)