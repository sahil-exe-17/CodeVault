import { create } from 'zustand'
import type { User } from '@/types'
import { authApi } from '@/lib/api'

interface GoogleAuthPayload {
  email: string
  name?: string
  avatar_url?: string
  google_id?: string
  credential?: string
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

const isAccountRegistered = (email: string): boolean => {
  const clean = email.trim().toLowerCase()
  try {
    if (localStorage.getItem(`cv_profile_${clean}`)) return true
    if (localStorage.getItem(`cv_pwd_${clean}`)) return true
    const listRaw = localStorage.getItem('cv_registered_accounts')
    if (listRaw) {
      const list = JSON.parse(listRaw)
      if (Array.isArray(list) && list.includes(clean)) return true
    }
    const current = localStorage.getItem('codevault_user')
    if (current) {
      const u = JSON.parse(current)
      if (u?.email?.trim().toLowerCase() === clean) return true
    }
  } catch {}
  return false
}

const registerAccount = (email: string, user: User, password?: string) => {
  const clean = email.trim().toLowerCase()
  try {
    const listRaw = localStorage.getItem('cv_registered_accounts')
    const list: string[] = listRaw ? JSON.parse(listRaw) : []
    if (!list.includes(clean)) {
      list.push(clean)
      localStorage.setItem('cv_registered_accounts', JSON.stringify(list))
    }
  } catch {}
  saveStoredProfile(clean, user)
  if (password) {
    try { localStorage.setItem(`cv_pwd_${clean}`, password) } catch {}
  }
}

const getInitialUser = (): User | null => {
  try {
    const raw = localStorage.getItem('codevault_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const isRealBackendValidationError = (err: any): boolean => {
  if (!err) return false

  const status = err.status || err.response?.status
  const detail = err.response?.data?.detail

  // If server returned a meaningful domain or validation error string from our API (e.g. from FastAPI HTTPException):
  if (typeof detail === 'string' && detail.trim().length > 0 && !detail.includes('Cannot GET') && !detail.includes('Cannot POST')) {
    return true
  }

  // HTTP 405 (Method Not Allowed), 404 (Not Found), 502/503/504 (Server/Proxy offline) are infrastructure errors on static/Vercel hosting
  if (status === 405 || status === 404 || status === 502 || status === 503 || status === 504) {
    return false
  }

  const msg = String(err.message || '')
  if (
    msg.includes('405') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('Network Error') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('Failed to fetch') ||
    msg.includes('HTML instead of JSON') ||
    msg.includes('Method Not Allowed')
  ) {
    return false
  }

  return false
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
      registerAccount(cleanEmail, user, password)
      localStorage.removeItem('cv_subjects_all')
      localStorage.removeItem('cv_subjects_guest')

      set({ user, token, loading: false })
      return user
    } catch (err: any) {
      if (isRealBackendValidationError(err)) {
        set({ loading: false })
        throw err
      }

      // If backend network unreachable (e.g. running on static Vercel), verify account exists
      console.warn('Backend network unreachable during signin, checking local account registry:', err.message)
      const existing = getStoredProfile(cleanEmail)
      const isRegistered = isAccountRegistered(cleanEmail)

      if (!isRegistered && !existing) {
        set({ loading: false })
        throw new Error('No account found with this email. Please sign up first to create an account.')
      }

      // Check offline password if one was previously stored
      const storedPwd = localStorage.getItem(`cv_pwd_${cleanEmail}`)
      if (storedPwd && password && storedPwd !== password) {
        set({ loading: false })
        throw new Error('Incorrect password. Please verify your credentials.')
      }

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

      registerAccount(cleanEmail, localUser, password)

      const token = `token_${localUser.id}`
      localStorage.setItem('codevault_token', token)
      localStorage.setItem('codevault_user', JSON.stringify(localUser))

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
      registerAccount(cleanEmail, user, password)
      localStorage.removeItem('cv_subjects_all')
      localStorage.removeItem('cv_subjects_guest')

      set({ user, token, loading: false })
      return user
    } catch (err: any) {
      if (isRealBackendValidationError(err)) {
        set({ loading: false })
        throw err
      }

      // Local fallback for offline/static hosting
      console.warn('Backend network unreachable during signup, creating local account:', err.message)
      const existing = getStoredProfile(cleanEmail)
      const isRegistered = isAccountRegistered(cleanEmail)

      // If user already registered this email
      if (isRegistered || existing) {
        const storedPwd = localStorage.getItem(`cv_pwd_${cleanEmail}`)
        if (storedPwd && password && storedPwd !== password) {
          set({ loading: false })
          throw new Error('An account with this email already exists. Please switch to Sign in above.')
        }
      }

      const stableId = getDeterministicUserId(cleanEmail)
      const localUser: User = {
        id: stableId,
        email: cleanEmail,
        username: cleanEmail.split('@')[0],
        display_name: displayName?.trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' '),
        college: existing?.college || '',
        department: existing?.department || '',
        semester: existing?.semester || '',
        roll_number: existing?.roll_number || '',
        coding_goals: existing?.coding_goals || '',
        is_profile_completed: existing?.is_profile_completed ?? false,
        auth_provider: 'email',
        ...existing,
      }

      const token = `token_${localUser.id}`
      localStorage.setItem('codevault_token', token)
      localStorage.setItem('codevault_user', JSON.stringify(localUser))
      registerAccount(cleanEmail, localUser, password)
      localStorage.removeItem('cv_subjects_all')
      localStorage.removeItem('cv_subjects_guest')

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
      localStorage.removeItem('cv_subjects_all')
      localStorage.removeItem('cv_subjects_guest')

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
    const current = get().user || getInitialUser() || {
      id: 'usr_' + Date.now().toString(36),
      email: 'student@codevault.dev',
      username: 'student',
      display_name: 'Student',
      is_profile_completed: true,
    }

    const guaranteedUser: User = {
      ...current,
      ...data,
      is_profile_completed: true,
    } as User

    try {
      const res: any = await authApi.updateProfile({ ...data, is_profile_completed: true })
      const serverUser = (res && typeof res === 'object') ? (res.data || res) : null
      const finalUser: User = {
        ...guaranteedUser,
        ...(serverUser && typeof serverUser === 'object' ? serverUser : {}),
        is_profile_completed: true,
      }
      localStorage.setItem('codevault_user', JSON.stringify(finalUser))
      if (finalUser.email) saveStoredProfile(finalUser.email, finalUser)
      set({ user: finalUser, loading: false })
      return finalUser
    } catch {
      // Local fallback for static hosting or network error
      localStorage.setItem('codevault_user', JSON.stringify(guaranteedUser))
      if (guaranteedUser.email) saveStoredProfile(guaranteedUser.email, guaranteedUser)
      set({ user: guaranteedUser, loading: false })
      return guaranteedUser
    }
  },

  signOut: () => {
    localStorage.removeItem('codevault_token')
    localStorage.removeItem('codevault_user')
    localStorage.removeItem('cv_subjects_all')
    localStorage.removeItem('cv_subjects_guest')
    set({ user: null, token: null })
  },
}))
