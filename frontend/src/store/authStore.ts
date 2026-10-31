import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  session: any | null
  loading: boolean
  setUser: (user: User | null) => void
  setSession: (session: any | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
  signInDemo: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'alex@codevault.dev',
    username: 'alexdev',
    display_name: 'Alex Rivera',
    avatar_url: '',
  },
  session: { access_token: 'demo-token' },
  loading: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),

  signIn: async (email, password) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        // If Supabase is unconfigured, fallback to demo user
        if (error.message.includes('FetchError') || error.message.includes('NetworkError') || error.message.includes('Invalid API key')) {
          const demoUser: User = {
            id: '00000000-0000-0000-0000-000000000001',
            email,
            username: email.split('@')[0],
            display_name: email.split('@')[0],
          }
          localStorage.setItem('codevault_demo_token', 'demo-token')
          set({ user: demoUser, session: { access_token: 'demo-token' }, loading: false })
          return
        }
        throw error
      }
      set({ session: data.session, user: data.user as any, loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  signUp: async (email, password, displayName) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      })
      if (error) {
        if (error.message.includes('FetchError') || error.message.includes('NetworkError') || error.message.includes('Invalid API key')) {
          const demoUser: User = {
            id: '00000000-0000-0000-0000-000000000001',
            email,
            username: email.split('@')[0],
            display_name: displayName || email.split('@')[0],
          }
          set({ user: demoUser, session: { access_token: 'demo-token' }, loading: false })
          return
        }
        throw error
      }
      set({ session: data.session, user: data.user as any, loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // Ignore signOut errors on demo mode
    }
    localStorage.removeItem('codevault_demo_token')
    set({ user: null, session: null })
  },

  signInDemo: () => {
    const demoUser: User = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'alex@codevault.dev',
      username: 'alexdev',
      display_name: 'Alex Rivera',
    }
    localStorage.setItem('codevault_demo_token', 'demo-token')
    set({ user: demoUser, session: { access_token: 'demo-token' }, loading: false })
  },
}))
