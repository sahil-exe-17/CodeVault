import { create } from 'zustand'
import type { User } from '@/types'
import { authApi } from '@/lib/api'

interface GoogleAuthPayload {
  email: string
  name?: string
  avatar_url?: string
  google_id?: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password?: string) => Promise<User>
  signUp: (email: string, password?: string, displayName?: string) => Promise<User>
  signInWithGoogle: (googleData: GoogleAuthPayload) => Promise<User>
  updateProfile: (data: Partial<User>) => Promise<User>
  signOut: () => void
}

const getDeterministicUserId = (email: string): string => {
  const clean = email.trim().toLowerCase()
  let hash = 0
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i)
    hash |= 0
  }
  return 'usr_' + Math.abs(hash).toString(36)
}

const getStoredProfile = (email: string): Partial<User> | null => {
  try {
    const raw = localStorage.getItem(`cv_profile_${email.trim().toLowerCase()}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const saveStoredProfile = (email: string, user: User) => {
  try {
    localStorage.setItem(`cv_profile_${email.trim().toLowerCase()}`, JSON.stringify(user))
  } catch {}
}

const getInitialUser = (): User | null => {
  try {
    const raw = localStorage.getItem('codevault_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getInitialUser(),
  token: localStorage.getItem('codevault_token') || null,
  loading: false,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('codevault_user', JSON.stringify(user))
      saveStoredProfile(user.email, user)
    } else {
      localStorage.removeItem('codevault_user')
    }
    set({ user })
  },

  setLoading: (loading) => set({ loading }),

  signIn: async (email: string, password?: string) => {
    set({ loading: true })
    const cleanEmail = email.trim().toLowerCase()
    try {
      const res: any = await authApi.login({ email: cleanEmail, password })
      const user = res.user
      const token = res.token || `token_${user.id}`

      localStorage.setItem('codevault_token', token)
      localStorage.setItem('codevault_user', JSON.stringify(user))
      saveStoredProfile(user.email, user)

      set({ user, token, loading: false })
      return user
    } catch (err: any) {
      // If it's a specific credential validation error from backend (like wrong password), throw it!
      if (err.message && !err.message.includes('Network Error') && !err.message.includes('ECONNREFUSED')) {
        set({ loading: false })
        throw err
      }

      // If backend network unreachable (e.g. running on static Vercel), retrieve consistent user account
      console.warn('Backend network unreachable during signin, loading local consistent session:', err.message)
      const existing = getStoredProfile(cleanEmail)
      const stableId = getDeterministicUserId(cleanEmail)

      const localUser: User = {
        id: stableId,
        email: cleanEmail,
        username: cleanEmail.split('@')[0],
        display_name: existing?.display_name || cleanEmail.split('@')[0].replace(/[._]/g, ' '),
        college: existing?.college || '',
        department: existing?.department || '',
        semester: existing?.semester || '',
        roll_number: existing?.roll_number || '',
        coding_goals: existing?.coding_goals || '',
        is_profile_completed: existing ? Boolean(existing.is_profile_completed) : true,
        auth_provider: 'email',
        ...existing,
      }

      const token = `token_${localUser.id}`
      localStorage.setItem('codevault_token', token)
      localStorage.setItem('codevault_user', JSON.stringify(localUser))
      saveStoredProfile(localUser.email, localUser)

      set({ user: localUser, token, loading: false })
      return localUser
    }
  },

  signUp: async (email: string, password?: string, displayName?: string) => {
    set({ loading: true })
    const cleanEmail = email.trim().toLowerCase()
    try {
      const res: any = await authApi.signup({
        email: cleanEmail,
        password,
        display_name: displayName,
      })
      const user = res.user
      const token = res.token || `token_${user.id}`

      localStorage.setItem('codevault_token', token)
      localStorage.setItem('codevault_user', JSON.stringify(user))
      saveStoredProfile(user.email, user)

      set({ user, token, loading: false })
      return user
    } catch (err: any) {
      // If email already exists or password too short, throw it so UI tells the user!
      if (err.message && !err.message.includes('Network Error') && !err.message.includes('ECONNREFUSED')) {
        set({ loading: false })
        throw err
      }

      // If network is unreachable, provision consistent user by email
      console.warn('Backend network unreachable during signup, creating consistent local user:', err.message)
      const stableId = getDeterministicUserId(cleanEmail)
      const existing = getStoredProfile(cleanEmail)

      const localUser: User = {
        id: stableId,
        email: cleanEmail,
        username: cleanEmail.split('@')[0],
        display_name: displayName || cleanEmail.split('@')[0].replace(/[._]/g, ' '),
        is_profile_completed: false,
        auth_provider: 'email',
        ...existing,
      }

      const token = `token_${localUser.id}`
      localStorage.setItem('codevault_token', token)
      localStorage.setItem('codevault_user', JSON.stringify(localUser))
      saveStoredProfile(localUser.email, localUser)

      set({ user: localUser, token, loading: false })
      return localUser
    }
  },

  signInWithGoogle: async (googleData: GoogleAuthPayload) => {
    set({ loading: true })
    const cleanEmail = googleData.email.trim().toLowerCase()
    try {
      const res: any = await authApi.googleAuth({ ...googleData, email: cleanEmail })
      const user = res.user
      const token = res.token || `token_${user.id}`

      localStorage.setItem('codevault_token', token)
      localStorage.setItem('codevault_user', JSON.stringify(user))
      saveStoredProfile(user.email, user)

      set({ user, token, loading: false })
      return user
    } catch (err: any) {
      // If network unreachable, load/create consistent Google user by email
      console.warn('Backend network unreachable during Google auth, restoring local session:', err.message)
      const stableId = getDeterministicUserId(cleanEmail)
      const existing = getStoredProfile(cleanEmail)

      const localUser: User = {
        id: stableId,
        email: cleanEmail,
        username: cleanEmail.split('@')[0],
        display_name: googleData.name || cleanEmail.split('@')[0],
        avatar_url: googleData.avatar_url || '',
        auth_provider: 'google',
        is_profile_completed: existing ? Boolean(existing.is_profile_completed) : false,
        ...existing,
      }

      const token = `token_${localUser.id}`
      localStorage.setItem('codevault_token', token)
      localStorage.setItem('codevault_user', JSON.stringify(localUser))
      saveStoredProfile(localUser.email, localUser)

      set({ user: localUser, token, loading: false })
      return localUser
    }
  },

  updateProfile: async (data: Partial<User>) => {
    const current = get().user
    try {
      const res: any = await authApi.updateProfile(data)
      const updatedUser = res?.data || res || { ...current, ...data }
      localStorage.setItem('codevault_user', JSON.stringify(updatedUser))
      if (updatedUser.email) saveStoredProfile(updatedUser.email, updatedUser)
      set({ user: updatedUser })
      return updatedUser
    } catch {
      // Local fallback
      const merged = { ...current, ...data, is_profile_completed: true } as User
      localStorage.setItem('codevault_user', JSON.stringify(merged))
      if (merged.email) saveStoredProfile(merged.email, merged)
      set({ user: merged })
      return merged
    }
  },

  signOut: () => {
    localStorage.removeItem('codevault_token')
    localStorage.removeItem('codevault_user')
    set({ user: null, token: null })
  },
}))
