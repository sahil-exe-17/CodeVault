import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FlaskConical,
  BookOpen,
  Bookmark,
  Sparkles,
  MessageSquare,
  Brain,
  Mic,
  Calendar,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Code2,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface SidebarProps {
  isCollapsed: boolean
  toggleCollapse: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleCollapse }) => {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  const navGroups = [
    {
      label: 'WORKSPACE',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'All Experiments', path: '/experiments', icon: FlaskConical },
        { label: 'Subjects', path: '/subjects', icon: BookOpen },
        { label: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
      ],
    },
    {
      label: 'AI WORKSPACE',
      items: [
        { label: 'AI Code Explainer', path: '/ai/explain', icon: Sparkles },
        { label: 'Ask CodeVault', path: '/ai/ask', icon: MessageSquare },
        { label: 'Revision Studio', path: '/ai/revision-studio', icon: Brain },
        { label: 'Viva Practice', path: '/ai/viva-practice', icon: Mic },
      ],
    },
    {
      label: 'PRODUCTIVITY',
      items: [
        { label: 'Revision Planner', path: '/revision-planner', icon: Calendar },
        { label: 'Progress Analytics', path: '/analytics', icon: BarChart2 },
      ],
    },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[var(--bg-card)] border-r border-[var(--border-subtle)] transition-all duration-300 flex flex-col justify-between select-none ${
        isCollapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Top Header / Logo */}
      <div>
        <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
              <Code2 className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-['Manrope'] font-bold text-sm text-[var(--text-main)] tracking-tight">
                  CodeVault
                </span>
                <span className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider font-mono">
                  v1.0 • AI Studio
                </span>
              </div>
            )}
          </div>
          <button
            onClick={toggleCollapse}
            className="text-[var(--text-dim)] hover:text-[var(--text-main)] p-1 rounded transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="py-3 px-2 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 pb-1 text-[10px] font-semibold tracking-widest text-[var(--text-dim)] uppercase">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                        isActive
                          ? 'bg-[var(--bg-metric)] text-white font-semibold'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[rgba(255,255,255,0.035)]'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-white rounded-r" />
                        )}
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-white'
                          }`}
                        />
                        {!isCollapsed && <span>{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Profile / Settings */}
      <div className="p-2 border-t border-[var(--border-subtle)] space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[rgba(255,255,255,0.035)] ${
              isActive ? 'bg-[var(--bg-metric)] text-white' : ''
            } ${isCollapsed ? 'justify-center px-0' : ''}`
          }
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>

        <div
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[var(--text-muted)] ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          {!isCollapsed && (
            <div className="flex flex-col truncate pr-2">
              <span className="font-medium text-[var(--text-main)] truncate text-xs">
                {user?.display_name || user?.email?.split('@')[0] || 'Developer'}
              </span>
              <span className="text-[10px] text-[var(--text-dim)] truncate">{user?.email || 'Logged in'}</span>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="text-[var(--text-dim)] hover:text-white p-1 rounded transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}

