import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, ArrowRight, Trash2, FolderPlus, Sparkles, Layers, Terminal, GraduationCap } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { GlassInput } from '@/components/auth/GlassInput'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { useAuthStore } from '@/store/authStore'
import { subjectsApi } from '@/lib/api'
import type { Subject } from '@/types'
import toast from 'react-hot-toast'

export const SubjectsHome: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Add Subject Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectSemester, setNewSubjectSemester] = useState('')
  const [newSubjectDesc, setNewSubjectDesc] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const userStorageKey = `cv_subjects_${user?.id || (user?.email ? encodeURIComponent(user.email.toLowerCase().trim()) : 'guest')}`

  /**
   * Strictly user-isolated subject retrieval (never cross-contaminates across accounts)
   */
  const getLocalSubjects = (): Subject[] => {
    if (!user) return []
    const map = new Map<string, Subject>()
    const userKeys = [
      userStorageKey,
      user.id ? `cv_subjects_${user.id}` : null,
      user.email ? `cv_subjects_${user.email.toLowerCase().trim()}` : null,
    ].filter(Boolean) as string[]

    for (const k of userKeys) {
      try {
        const raw = localStorage.getItem(k)
        if (raw) {
          const list = JSON.parse(raw)
          if (Array.isArray(list)) {
            list.forEach((s) => {
              if (s && s.id && !map.has(s.id)) {
                // Verify subject ownership: only accept subjects created by this user
                if (!s.user_id || s.user_id === user.id || s.user_id === user.email) {
                  map.set(s.id, s)
                }
              }
            })
          }
        }
      } catch {}
    }

    return Array.from(map.values())
  }

  const persistSubjects = (list: Subject[]) => {
    try {
      const serialized = JSON.stringify(list)
      localStorage.setItem(userStorageKey, serialized)
      if (user?.id) {
        localStorage.setItem(`cv_subjects_${user.id}`, serialized)
      }
      if (user?.email) {
        localStorage.setItem(`cv_subjects_${user.email.toLowerCase().trim()}`, serialized)
      }
      // Purge legacy global keys that leaked data across user accounts
      localStorage.removeItem('cv_subjects_all')
      localStorage.removeItem('cv_subjects_guest')
    } catch (e) {
      console.warn('Failed to persist subjects in localStorage:', e)
    }
  }

  const loadSubjects = async () => {
    setIsLoading(true)
    // 1. Immediately hydrate from local storage strictly for this user (clears immediately if new user)
    const local = getLocalSubjects()
    setSubjects(local)

    // 2. Fetch from backend API if active and update
    try {
      const res: any = await subjectsApi.list()
      if (Array.isArray(res) && res.length > 0 && typeof res[0] === 'object' && res[0] !== null && 'id' in res[0]) {
        setSubjects(res)
        persistSubjects(res)
      } else if (Array.isArray(res) && res.length === 0) {
        // Backend successfully confirmed 0 subjects for this user — keep 0
        setSubjects(local)
        persistSubjects(local)
      } else {
        setSubjects(local)
      }
    } catch {
      // Backend unavailable or static deployment — keep this user's local subjects
      const freshLocal = getLocalSubjects()
      setSubjects(freshLocal)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSubjects()
  }, [user?.id, user?.email])

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubjectName.trim()) {
      toast.error('Please enter a subject name.')
      return
    }

    setIsCreating(true)
    const newId = 'sub-' + Date.now()
    const newSubject: Subject = {
      id: newId,
      user_id: user?.id || 'guest',
      name: newSubjectName.trim(),
      semester: newSubjectSemester.trim() || 'Semester 4',
      description: newSubjectDesc.trim() || '',
      experiment_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Instant local state update so it shows up on the home page IMMEDIATELY
    setSubjects((prev) => {
      const next = [newSubject, ...prev.filter((s) => s.id !== newId)]
      persistSubjects(next)
      return next
    })

    try {
      const res: any = await subjectsApi.create({
        name: newSubject.name,
        semester: newSubject.semester,
        description: newSubject.description,
      })
      if (res?.id || res?.data?.id) {
        const serverId = res?.id || res?.data?.id
        newSubject.id = serverId
        setSubjects((prev) => {
          const next = [newSubject, ...prev.filter((s) => s.id !== newId && s.id !== serverId)]
          persistSubjects(next)
          return next
        })
      }
    } catch (apiErr) {
      console.warn('API create subject failed (using reliable local subject):', apiErr)
    }

    toast.success('Subject created successfully.')
    setNewSubjectName('')
    setNewSubjectSemester('')
    setNewSubjectDesc('')
    setIsModalOpen(false)
    setIsCreating(false)
  }

  const handleDeleteSubject = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    if (!window.confirm(`Are you sure you want to delete "${name}" and all its experiments?`)) {
      return
    }

    try {
      await subjectsApi.delete(id)
    } catch {}
    toast.success('Subject removed.')
    setSubjects((prev) => {
      const next = prev.filter((s) => s.id !== id)
      persistSubjects(next)
      return next
    })
  }

  const displayName = user?.display_name || user?.email?.split('@')[0] || 'Student'
  const totalExperiments = subjects.reduce((sum, s) => sum + (s.experiment_count || 0), 0)

  return (
    <div className="relative min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] select-none flex flex-col overflow-hidden transition-colors duration-200">
      {/* Dynamic Ambient Aurora Glow in Background (Optimized: hidden on mobile to guarantee 60fps buttery scrolling) */}
      <div className="hidden md:block absolute top-0 left-1/4 w-[600px] h-[350px] bg-gradient-to-br from-pink-500/10 via-purple-600/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="hidden md:block absolute top-1/3 right-10 w-[500px] h-[350px] bg-gradient-to-bl from-sky-500/10 via-emerald-500/10 to-transparent blur-[120px] pointer-events-none" />

      {/* 1 Top Button: Crazy Animated Add Subject Bar */}
      <AppNavbar
        showAddSubject={true}
        onAddSubject={() => setIsModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10">
        {/* Welcome & Stats Hero Section */}
        <div className="relative p-7 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] backdrop-blur-2xl shadow-sm overflow-hidden transition-colors duration-200">
          {/* Subtle Top Edge Laser Accent */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-pink-500/40 via-amber-300/40 to-transparent" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-dim)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>WORKSPACE ACTIVE</span>
                {user?.college && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{user.college}</span>
                  </>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold font-['Manrope'] text-[var(--text-main)] tracking-tight">
                Welcome back, {displayName}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl leading-relaxed">
                Your practical experiments, handwritten notebook records, and AI viva revision center in one unified workspace.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-4 py-3 rounded-2xl bg-[var(--bg-metric)] border border-[var(--border-subtle)] backdrop-blur-md text-center min-w-[100px]">
                <p className="text-xl font-bold font-mono text-[var(--text-main)]">{subjects.length}</p>
                <p className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-wider mt-0.5">Subjects</p>
              </div>

              <div className="px-4 py-3 rounded-2xl bg-[var(--bg-metric)] border border-[var(--border-subtle)] backdrop-blur-md text-center min-w-[100px]">
                <p className="text-xl font-bold font-mono text-[var(--text-main)]">{totalExperiments}</p>
                <p className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-wider mt-0.5">Practicals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-['Manrope'] text-[var(--text-main)]">
              Academic Subjects
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Select a subject to view practical experiments
            </p>
          </div>

          <span className="text-xs font-mono text-[var(--text-dim)] px-3 py-1 rounded-full bg-[var(--bg-metric)] border border-[var(--border-subtle)]">
            {subjects.length} active
          </span>
        </div>

        {/* Subjects List / Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-44 rounded-2xl bg-[var(--bg-metric)] border border-[var(--border-subtle)] animate-pulse"
              />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] space-y-4 max-w-md mx-auto my-12 backdrop-blur-xl">
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-[var(--text-main)]">No Subjects Added Yet</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Create your first subject to start adding practical coding experiments and handwritten notebook scans.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-2 px-5 py-2.5 rounded-xl bg-[var(--btn-cta-bg)] text-[var(--btn-cta-text)] text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-sm inline-flex items-center gap-1.5"
            >
              <span>+ Create Subject</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects
              .filter((sub) => sub && typeof sub === 'object' && sub.id && sub.name)
              .map((sub, index) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/subjects/${sub.id}`)}
                className="group relative p-6 rounded-3xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] backdrop-blur-xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Glowing Card Accent Line on Top */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-500/60 via-amber-300/60 to-cyan-400/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--bg-metric)] border border-[var(--border-subtle)] text-[11px] font-mono font-medium text-[var(--text-muted)]">
                      {sub.semester || 'Semester 4'}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSubject(e, sub.id, sub.name)}
                      className="w-7 h-7 rounded-lg text-[var(--text-dim)] hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-all cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-['Manrope'] text-[var(--text-main)] group-hover:text-[var(--text-main)] transition-colors tracking-tight line-clamp-1">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
                      {sub.description || 'Manage practical programs, execution flows, and viva questions.'}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <span className="text-[var(--text-dim)] font-mono">
                    {sub.experiment_count || 0} practicals
                  </span>

                  <span className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] flex items-center gap-1 font-medium transition-colors">
                    <span>Open lab</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-7 shadow-2xl space-y-6 text-[var(--text-main)]"
            >
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold font-['Manrope'] text-[var(--text-main)]">
                  Add New Subject
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Organize your coding practicals, laboratory experiments, and handwritten notebooks.
                </p>
              </div>

              <form onSubmit={handleCreateSubject} className="space-y-4">
                <GlassInput
                  label="Subject Name"
                  placeholder="e.g. Design & Analysis of Algorithms"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  required
                  autoFocus
                />

                <GlassInput
                  label="Semester / Year"
                  placeholder="e.g. Semester 5 / Year 3"
                  value={newSubjectSemester}
                  onChange={(e) => setNewSubjectSemester(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-[var(--text-dim)] uppercase tracking-wide">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the curriculum or lab practicals..."
                    value={newSubjectDesc}
                    onChange={(e) => setNewSubjectDesc(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[var(--border-hover)] rounded-xl p-3 text-xs text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-11 rounded-xl bg-[var(--bg-metric)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-[2] h-11 rounded-xl bg-[var(--btn-cta-bg)] text-[var(--btn-cta-text)] font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isCreating ? 'Creating Subject...' : 'Create Subject'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
