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

  const userStorageKey = `cv_subjects_${user?.id || user?.email || 'guest'}`

  const loadSubjects = async () => {
    setIsLoading(true)
    try {
      const res: any = await subjectsApi.list()
      const list = Array.isArray(res) ? res : res?.data || []
      setSubjects(list)
      localStorage.setItem(userStorageKey, JSON.stringify(list))
    } catch {
      // Load user's own saved subjects from localStorage (defaults to empty array - NO DEMO SUBJECTS)
      try {
        const cached = localStorage.getItem(userStorageKey)
        setSubjects(cached ? JSON.parse(cached) : [])
      } catch {
        setSubjects([])
      }
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
    try {
      const res: any = await subjectsApi.create({
        name: newSubjectName.trim(),
        semester: newSubjectSemester.trim() || undefined,
        description: newSubjectDesc.trim() || undefined,
      })
      const created: Subject = res?.data || res || {
        id: 'sub-' + Date.now(),
        user_id: user?.id || 'guest',
        name: newSubjectName.trim(),
        semester: newSubjectSemester.trim() || 'Semester 4',
        description: newSubjectDesc.trim() || '',
        experiment_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      toast.success('Subject created successfully.')
      setNewSubjectName('')
      setNewSubjectSemester('')
      setNewSubjectDesc('')
      setIsModalOpen(false)

      setSubjects((prev) => {
        const next = [created, ...prev.filter((s) => s.id !== created.id)]
        localStorage.setItem(userStorageKey, JSON.stringify(next))
        return next
      })

      if (created?.id) {
        navigate(`/subjects/${created.id}`)
      }
    } catch {
      // Local fallback for offline / serverless
      const localSub: Subject = {
        id: 'sub-' + Date.now(),
        user_id: user?.id || 'guest',
        name: newSubjectName.trim(),
        semester: newSubjectSemester.trim() || 'Semester 4',
        description: newSubjectDesc.trim() || '',
        experiment_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setSubjects((prev) => {
        const next = [localSub, ...prev]
        localStorage.setItem(userStorageKey, JSON.stringify(next))
        return next
      })
      toast.success('Subject created.')
      setNewSubjectName('')
      setNewSubjectSemester('')
      setNewSubjectDesc('')
      setIsModalOpen(false)
      navigate(`/subjects/${localSub.id}`)
    } finally {
      setIsCreating(false)
    }
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
      localStorage.setItem(userStorageKey, JSON.stringify(next))
      return next
    })
  }

  const displayName = user?.display_name || user?.email?.split('@')[0] || 'Student'
  const totalExperiments = subjects.reduce((sum, s) => sum + (s.experiment_count || 0), 0)

  return (
    <div className="relative min-h-screen bg-[#050508] text-[#F5F5F5] select-none flex flex-col overflow-hidden">
      {/* Dynamic Ambient Aurora Glow in Background */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-gradient-to-br from-pink-500/10 via-purple-600/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-gradient-to-bl from-sky-500/10 via-emerald-500/10 to-transparent blur-[120px] pointer-events-none" />

      {/* 1 Top Button: Crazy Animated Add Subject Bar */}
      <AppNavbar
        showAddSubject={true}
        onAddSubject={() => setIsModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10">
        {/* Welcome & Stats Hero Section */}
        <div className="relative p-7 sm:p-8 rounded-3xl bg-[#101015]/75 border border-white/[0.09] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Subtle Top Edge Laser Accent */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>WORKSPACE ACTIVE</span>
                {user?.college && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{user.college}</span>
                  </>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold font-['Manrope'] text-white tracking-tight">
                Welcome back, {displayName}
              </h1>
              <p className="text-xs sm:text-sm text-white/45 max-w-xl leading-relaxed">
                Your practical experiments, handwritten notebook records, and AI viva revision center in one unified workspace.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-center min-w-[100px]">
                <p className="text-xl font-bold font-mono text-white">{subjects.length}</p>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider mt-0.5">Subjects</p>
              </div>

              <div className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-center min-w-[100px]">
                <p className="text-xl font-bold font-mono text-white">{totalExperiments}</p>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider mt-0.5">Practicals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-['Manrope'] text-white">
              Academic Subjects
            </h2>
            <p className="text-xs text-white/40">
              Select a subject to view practical experiments
            </p>
          </div>

          <span className="text-xs font-mono text-white/40 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
            {subjects.length} active
          </span>
        </div>

        {/* Subjects List / Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-44 rounded-2xl bg-white/[0.02] border border-white/[0.06] animate-pulse"
              />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#101015]/80 border border-dashed border-white/15 space-y-4 max-w-md mx-auto my-12 backdrop-blur-xl">
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-white">No Subjects Added Yet</h3>
              <p className="text-xs text-white/40 leading-relaxed">
                Create your first subject to start adding practical coding experiments and handwritten notebook scans.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-2 px-5 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-all cursor-pointer shadow-lg inline-flex items-center gap-1.5"
            >
              <span>+ Create Subject</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((sub, index) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/subjects/${sub.id}`)}
                className="group relative p-6 rounded-3xl bg-[#121217]/80 hover:bg-[#16161d] border border-white/[0.09] hover:border-white/30 backdrop-blur-xl shadow-lg hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Glowing Card Accent Line on Top */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-500/60 via-amber-300/60 to-cyan-400/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-mono font-medium text-white/70">
                      {sub.semester || 'Semester 4'}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSubject(e, sub.id, sub.name)}
                      className="w-7 h-7 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-all cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-['Manrope'] text-white group-hover:text-white transition-colors tracking-tight line-clamp-1">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-white/40 line-clamp-2 mt-1 leading-relaxed">
                      {sub.description || 'Manage practical programs, execution flows, and viva questions.'}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-white/60 font-mono">
                    {sub.experiment_count || 0} practicals
                  </span>

                  <span className="text-white/40 group-hover:text-white flex items-center gap-1 font-medium transition-colors">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#121217] border border-white/15 rounded-3xl p-7 shadow-2xl space-y-6 text-[#F5F5F5]"
            >
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold font-['Manrope'] text-white">
                  Add New Subject
                </h3>
                <p className="text-xs text-white/45">
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
                  <label className="text-[11px] font-medium text-white/50 uppercase tracking-wide">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the curriculum or lab practicals..."
                    value={newSubjectDesc}
                    onChange={(e) => setNewSubjectDesc(e.target.value)}
                    className="w-full bg-[#17171b]/80 border border-white/[0.08] focus:border-white/20 rounded-xl p-3 text-xs text-white placeholder-white/25 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-11 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-white/70 hover:text-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-[2] h-11 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
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
