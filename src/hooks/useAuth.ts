import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/integrations/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
  initialize: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,

      initialize: () => {
        // Set up auth state listener
        supabase.auth.onAuthStateChange((event, session) => {
          set({
            session,
            user: session?.user ?? null,
            isAuthenticated: !!session,
            isLoading: false
          })
        })

        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
          set({
            session,
            user: session?.user ?? null,
            isAuthenticated: !!session,
            isLoading: false
          })
        })
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })
          
          if (error) throw error
          
          // Redirect handled by auth state change
          window.location.href = '/dashboard'
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true })
        try {
          const redirectUrl = `${window.location.origin}/`
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: redirectUrl,
              data: {
                full_name: name
              }
            }
          })
          
          if (error) throw error
          
          // Check if user needs email confirmation
          if (data.user && !data.session) {
            throw new Error('Please check your email to confirm your account')
          }
          
          // Redirect handled by auth state change
          window.location.href = '/dashboard'
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut()
          set({ user: null, session: null, isAuthenticated: false })
          window.location.href = '/'
        } catch (error) {
          console.error('Error signing out:', error)
        }
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
        session: state.session,
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)