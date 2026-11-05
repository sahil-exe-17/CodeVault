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
    root.setAttribute('data-theme', 'dark')
  }
}

// Apply on startup immediately
applyTheme(getInitialTheme())

export const toggleThemeWithCircularAnimation = (e?: React.MouseEvent | MouseEvent) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const current = useThemeStore.getState().theme
  const next: Theme = current === 'dark' ? 'light' : 'dark'

  // Coordinates of click, or top-right default where the button resides
  let x = window.innerWidth - 60
  let y = 30
  if (e && typeof e.clientX === 'number') {
    x = e.clientX
    y = e.clientY
  }

  const maxRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  // 1. If Document View Transitions API is supported (Chrome, Edge, Safari 18+)
  const doc = document as any
  if (doc && typeof doc.startViewTransition === 'function') {
    const isGoingToLight = next === 'light'
    const transition = doc.startViewTransition(() => {
      useThemeStore.getState().setTheme(next)
    })

    transition.ready.then(() => {
      const clipAnimation = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${maxRadius}px at ${x}px ${y}px)`,
      ]
      document.documentElement.animate(
        {
          clipPath: isGoingToLight ? clipAnimation : [...clipAnimation].reverse(),
        },
        {
          duration: 500,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: isGoingToLight ? '::view-transition-new(root)' : '::view-transition-old(root)',
        }
      )
    })
    return
  }

  // 2. Fallback: dynamic expanding circular ripple overlay for older browsers
  try {
    const ripple = document.createElement('div')
    ripple.className = 'cv-theme-circle-ripple'
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.style.width = `${maxRadius * 2}px`
    ripple.style.height = `${maxRadius * 2}px`
    ripple.style.backgroundColor = next === 'light' ? '#F8F9FA' : '#050508'
    document.body.appendChild(ripple)

    setTimeout(() => {
      useThemeStore.getState().setTheme(next)
      setTimeout(() => ripple.remove(), 400)
    }, 150)
  } catch {
    useThemeStore.getState().setTheme(next)
  }
}

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
