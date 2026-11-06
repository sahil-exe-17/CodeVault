import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, Plus, LogOut, User as UserIcon, ChevronDown, Cpu, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore, toggleThemeWithCircularAnimation } from '@/store/themeStore'

interface AppNavbarProps {
  onAddSubject?: () => void
  showAddSubject?: boolean
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  onAddSubject,
  showAddSubject = true,
}) => {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { theme, toggle: toggleTheme } = useThemeStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navRef = useRef<HTMLElement | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!navRef.current) return
    const rect = navRef.current.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left })
  }

  const handleSignOut = () => {
    signOut()
    navigate('/auth')
  }

  const displayName = user?.display_name || user?.email?.split('@')[0] || 'Student'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <header
      ref={navRef}
      onMouseMove={handleMouseMove}
      className="sticky top-0 z-40 w-full bg-[var(--bg-header)] backdrop-blur-2xl border-b border-[var(--border-subtle)] select-none transition-colors duration-200"
    >
      {/* 1. Dynamic Cursor Spotlight across Top Bar */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none transition-opacity duration-300 w-96 -translate-x-1/2 opacity-20 blur-2xl"
        style={{
          left: `${mousePos.x}px`,
          background: 'radial-gradient(ellipse at top, rgba(244, 63, 94, 0.2), rgba(56, 189, 248, 0.15), transparent 70%)',
        }}
      />

      {/* 2. Traveling Animated Laser Beam along the bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] overflow-hidden pointer-events-none">
        <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-pink-500 via-amber-300 via-emerald-400 via-sky-400 to-transparent animate-[laser-pan_6s_linear_infinite] opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4 relative z-10">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link to="/subjects" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[var(--bg-metric)] border border-[var(--border-subtle)] p-1 flex items-center justify-center group-hover:border-[var(--border-hover)] transition-all shadow-sm">
              <img
                src="/logo-tight.png"
                alt="CodeVault Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]"
              />
            </div>
            <span className="font-bold text-base tracking-tight text-[var(--text-main)] font-['Manrope'] group-hover:opacity-90 transition-opacity">
              CodeVault
            </span>
          </Link>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Crazy Animated + Add Subject Button */}
          {showAddSubject && onAddSubject && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onAddSubject}
              className="relative group overflow-hidden px-4 py-2 rounded-xl bg-[var(--btn-cta-bg)] text-[var(--btn-cta-text)] text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-all duration-200"
            >
              {/* Shimmer light sweep */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="tracking-tight font-medium">+ Add Subject</span>
            </motion.button>
          )}

          {/* Theme Toggle with Circular Reveal Animation */}
          <button
            type="button"
            onClick={(e) => toggleThemeWithCircularAnimation(e)}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-hover)] bg-[var(--bg-metric)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-main)] shadow-sm active:scale-95"
          >
            {theme === 'dark'
              ? <Sun className="w-3.5 h-3.5" />
              : <Moon className="w-3.5 h-3.5" />
            }
          </button>

          {/* User Profile Capsule */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-all cursor-pointer shadow-sm group"
            >
              {/* Avatar / Initials with glowing border */}
              <div className="relative">
                <div className="w-7 h-7 rounded-lg bg-[var(--bg-metric)] border border-[var(--border-subtle)] flex items-center justify-center text-xs font-mono font-bold text-[var(--text-main)] shadow-sm">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={displayName}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-[var(--text-main)] leading-tight max-w-[110px] truncate">
                  {displayName}
                </p>
                <p className="text-[10px] font-mono text-[var(--text-dim)] leading-none mt-0.5">
                  {user?.semester || 'Semester 4'}
                </p>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-dim)] group-hover:text-[var(--text-main)] transition-transform duration-200" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div
                    onClick={() => setShowUserMenu(false)}
                    className="fixed inset-0 z-40"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="absolute right-0 top-12 w-64 bg-[var(--bg-card)] backdrop-blur-2xl border border-[var(--border-subtle)] rounded-2xl shadow-xl p-2 z-50 text-xs text-[var(--text-main)] overflow-hidden"
                  >
                    {/* User Info Header */}
                    <div className="px-3 py-2.5 bg-[var(--bg-metric)] rounded-xl border border-[var(--border-subtle)] mb-1.5">
                      <p className="font-semibold text-[var(--text-main)] truncate text-sm">{displayName}</p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate font-mono mt-0.5">{user?.email}</p>
                      {user?.college && (
                        <p className="text-[10px] text-[var(--text-dim)] truncate mt-1">
                          {user.college} {user.department ? `• ${user.department}` : ''}
                        </p>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false)
                          navigate('/onboarding')
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-metric)] flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                        <span>Academic Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
