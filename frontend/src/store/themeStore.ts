import { create } from 'zustand'

type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

const getInitialTheme = (): Theme => {
  try {
    const stored = localStorage.getItem('cv_theme') as Theme | null
    return stored === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement
  if (theme === 'light') {
    root.classList.remove('dark')
    root.classList.add('light')
    root.setAttribute('data-theme', 'light')
  } else {
    root.classList.remove('light')
    root.classList.add('dark')
    root.removeAttribute('data-theme')
  }
}

// Apply on startup immediately
applyTheme(getInitialTheme())

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),

  setTheme: (theme) => {
    localStorage.setItem('cv_theme', theme)
    applyTheme(theme)
    set({ theme })
  },

  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },
}))
