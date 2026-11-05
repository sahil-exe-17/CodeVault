import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Upload,
  Brain,
  MessageSquare,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Bookmark,
  ChevronRight,
  Camera,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ActivityChart } from '@/components/charts/ActivityChart'
import { NewExperimentModal } from '@/components/experiments/NewExperimentModal'
import { ScanPhotoModal } from '@/components/experiments/ScanPhotoModal'
import { experimentsApi, subjectsApi, analyticsApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { Experiment, Subject } from '@/types'
import toast from 'react-hot-toast'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([])
  const [overview, setOverview] = useState({
    total_experiments: 6,
    total_subjects: 3,
    revised_count: 3,
    pending_revision: 3,
    revision_completion_percent: 50,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [isScanModalOpen, setIsScanModalOpen] = useState(false)

  // Demo fallback seed data if backend is offline or empty
  const defaultExperiments: Experiment[] = [
    {
      id: 'exp-1',
      user_id: '1',
      subject_id: 'sub-1',
      title: 'Bubble Sort and Optimized Early Exit',
      experiment_number: 'EXP-01',
      topic: 'Sorting & Complexity',
      language: 'c',
      aim: 'To implement bubble sort in C and measure comparison passes with an early exit flag.',
      time_complexity: 'O(n²)',
      space_complexity: 'O(1)',
      is_bookmarked: true,
      is_revised: true,
      revision_count: 2,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date().toISOString(),
      subjects: { name: 'Data Structures' },
    },
    {
      id: 'exp-2',
      user_id: '1',
      subject_id: 'sub-1',
      title: 'Singly Linked List Insertion & Deletion',
      experiment_number: 'EXP-02',
      topic: 'Dynamic Data Structures',
      language: 'c',
      aim: 'Dynamic memory allocation and node pointer manipulation for linked lists.',
      time_complexity: 'O(n)',
      space_complexity: 'O(n)',
      is_bookmarked: false,
      is_revised: false,
      revision_count: 0,
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      updated_at: new Date().toISOString(),
      subjects: { name: 'Data Structures' },
    },
    {
      id: 'exp-3',
      user_id: '1',
      subject_id: 'sub-2',
      title: 'Round Robin CPU Scheduling Simulator',
      experiment_number: 'EXP-03',
      topic: 'Process Scheduling',
      language: 'python',
      aim: 'Simulate preemptive Round Robin scheduling with configurable time quantum.',
      time_complexity: 'O(n)',
      space_complexity: 'O(n)',
      is_bookmarked: true,
      is_revised: true,
      revision_count: 4,
      created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
      updated_at: new Date().toISOString(),
      subjects: { name: 'Operating Systems' },
    },
    {
      id: 'exp-4',
      user_id: '1',
      subject_id: 'sub-3',
      title: 'Multithreaded Web Scraper with Asyncio',
      experiment_number: 'EXP-04',
      topic: 'Asynchronous Programming',
      language: 'python',
      aim: 'Non-blocking I/O using aiohttp and asyncio event loops.',
      time_complexity: 'O(k)',
      space_complexity: 'O(k)',
      is_bookmarked: false,
      is_revised: false,
      revision_count: 1,
      created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
      updated_at: new Date().toISOString(),
      subjects: { name: 'Python Programming' },
    },
  ]

  const defaultSubjects: Subject[] = [
    {
      id: 'sub-1',
      user_id: '1',
      name: 'Data Structures & Algorithms',
      description: 'Linear & non-linear structures, sorting, trees, and graphs.',
      semester: 'Sem 3',
      experiment_count: 12,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'sub-2',
      user_id: '1',
      name: 'Operating Systems',
      description: 'Process management, concurrency, virtual memory and file systems.',
      semester: 'Sem 4',
      experiment_count: 8,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'sub-3',
      user_id: '1',
      name: 'Python Programming',
      description: 'Advanced Python paradigms, asynchronous programming, sockets.',
      semester: 'Sem 3',
      experiment_count: 6,
      created_at: '',
      updated_at: '',
    },
  ]

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [expRes, subRes, ovRes, actRes] = await Promise.allSettled([
        experimentsApi.list(),
        subjectsApi.list(),
        analyticsApi.getOverview(),
        analyticsApi.getWeeklyActivity(),
      ])

      if (expRes.status === 'fulfilled' && expRes.value) {
        const list = Array.isArray(expRes.value) ? expRes.value : (expRes.value as any)?.data || []
        setExperiments(list.length > 0 ? list : defaultExperiments)
      } else {
        setExperiments(defaultExperiments)
      }

      if (subRes.status === 'fulfilled' && subRes.value) {
        const list = Array.isArray(subRes.value) ? subRes.value : (subRes.value as any)?.data || []
        setSubjects(list.length > 0 ? list : defaultSubjects)
      } else {
        setSubjects(defaultSubjects)
      }

      if (ovRes.status === 'fulfilled' && ovRes.value) {
        setOverview(ovRes.value as any)
      }

      if (actRes.status === 'fulfilled' && actRes.value) {
        setWeeklyActivity(actRes.value as any)
      }
    } catch {
      setExperiments(defaultExperiments)
      setSubjects(defaultSubjects)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const name = user?.display_name || user?.email?.split('@')[0] || 'Developer'

  return (
    <div className="space-y-8 select-none">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-['Manrope'] text-[var(--text-main)] tracking-tight">
            {greeting()}, {name}.
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Your coding knowledge, organised in one place.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={<Camera className="w-3.5 h-3.5" />}
            onClick={() => setIsScanModalOpen(true)}
          >
            Scan Photo
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Brain className="w-3.5 h-3.5" />}
            onClick={() => navigate('/ai/revision-studio')}
          >
            Revision Studio
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsNewModalOpen(true)}
          >
            Add Experiment
          </Button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-metric)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2 text-xs">
            <span>Total Experiments</span>
            <BookOpen className="w-4 h-4 text-[var(--text-dim)]" />
          </div>
          <div className="text-3xl font-extrabold font-['Manrope'] text-white">
            {overview.total_experiments || experiments.length}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1.5 flex items-center gap-1">
            <span>Across {overview.total_subjects || subjects.length} subjects</span>
          </div>
        </div>

        <div className="bg-[var(--bg-metric)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2 text-xs">
            <span>Active Subjects</span>
            <BookOpen className="w-4 h-4 text-[var(--text-dim)]" />
          </div>
          <div className="text-3xl font-extrabold font-['Manrope'] text-white">
            {overview.total_subjects || subjects.length}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1.5">
            <span>Organized curriculum</span>
          </div>
        </div>

        <div className="bg-[var(--bg-metric)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2 text-xs">
            <span>Revision Completed</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--text-dim)]" />
          </div>
          <div className="text-3xl font-extrabold font-['Manrope'] text-white">
            {overview.revision_completion_percent}%
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1.5">
            <span>{overview.revised_count} of {overview.total_experiments} completed</span>
          </div>
        </div>

        <div className="bg-[var(--bg-metric)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2 text-xs">
            <span>Pending Revision</span>
            <Clock className="w-4 h-4 text-[var(--text-dim)]" />
          </div>
          <div className="text-3xl font-extrabold font-['Manrope'] text-white">
            {overview.pending_revision}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1.5">
            <span>Ready for flashcards</span>
          </div>
        </div>
      </div>

      {/* Grid: Continue Learning & Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold font-['Manrope'] text-[var(--text-main)]">
              Continue Learning
            </h3>
            <button
              onClick={() => navigate('/experiments')}
              className="text-xs text-[var(--text-muted)] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {experiments.slice(0, 4).map((exp) => (
              <div
                key={exp.id}
                onClick={() => navigate(`/experiments/${exp.id}`)}
                className="bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[rgba(255,255,255,0.2)] rounded-xl p-4 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="mono" size="sm">
                      {exp.experiment_number || 'EXP'}
                    </Badge>
                    <Badge variant="default" size="sm">
                      {exp.language}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--text-main)] group-hover:text-white transition-colors line-clamp-1 mb-1 font-['Manrope']">
                    {exp.title}
                  </h4>
                  <p className="text-xs text-[var(--text-dim)] line-clamp-1">
                    {exp.subjects?.name || 'Computer Science'}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-dim)]">
                  <span>Complexity: {exp.time_complexity || 'O(n)'}</span>
                  <span className="text-[var(--text-muted)] group-hover:text-white flex items-center gap-1">
                    Resume <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity Chart (1 col) */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold font-['Manrope'] text-white">
                Weekly Activity
              </h3>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">Last 7 Days</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Experiments revised and added
            </p>
            <ActivityChart data={weeklyActivity} />
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Keep up the daily momentum</span>
            <button
              onClick={() => navigate('/revision-planner')}
              className="text-white hover:underline text-xs"
            >
              Planner →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5">
        <h3 className="text-sm font-semibold font-['Manrope'] text-white mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-metric)] border border-[var(--border-subtle)] hover:border-[rgba(255,255,255,0.18)] hover:bg-[var(--bg-card-hover)] transition-all text-left"
          >
            <Plus className="w-4 h-4 text-white" />
            <div>
              <div className="text-xs font-semibold text-white">Add Experiment</div>
              <div className="text-[10px] text-[var(--text-muted)]">New program</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/experiments/new')}
            className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-metric)] border border-[var(--border-subtle)] hover:border-[rgba(255,255,255,0.18)] hover:bg-[var(--bg-card-hover)] transition-all text-left"
          >
            <Upload className="w-4 h-4 text-white" />
            <div>
              <div className="text-xs font-semibold text-white">Import Code</div>
              <div className="text-[10px] text-[var(--text-muted)]">Upload file</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/ai/revision-studio')}
            className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-metric)] border border-[var(--border-subtle)] hover:border-[rgba(255,255,255,0.18)] hover:bg-[var(--bg-card-hover)] transition-all text-left"
          >
            <Brain className="w-4 h-4 text-white" />
            <div>
              <div className="text-xs font-semibold text-white">Start Revision</div>
              <div className="text-[10px] text-[var(--text-muted)]">Flashcards & MCQs</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/ai/ask')}
            className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-metric)] border border-[var(--border-subtle)] hover:border-[rgba(255,255,255,0.18)] hover:bg-[var(--bg-card-hover)] transition-all text-left"
          >
            <MessageSquare className="w-4 h-4 text-white" />
            <div>
              <div className="text-xs font-semibold text-white">Ask AI</div>
              <div className="text-[10px] text-[var(--text-muted)]">Contextual chat</div>
            </div>
          </button>
        </div>
      </div>

      {/* Subject Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold font-['Manrope'] text-[var(--text-main)]">
            Subject Overview
          </h3>
          <button
            onClick={() => navigate('/subjects')}
            className="text-xs text-[var(--text-muted)] hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Manage subjects</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              onClick={() => navigate(`/experiments?subject=${sub.id}`)}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[rgba(255,255,255,0.2)] rounded-xl p-5 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
                  {sub.semester || 'Semester'}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {sub.experiment_count || 4} experiments
                </span>
              </div>
              <h4 className="text-base font-semibold text-white font-['Manrope'] group-hover:text-neutral-200 transition-colors mb-1">
                {sub.name}
              </h4>
              <p className="text-xs text-[var(--text-dim)] line-clamp-2 mb-4 leading-relaxed">
                {sub.description || 'Core engineering coursework and laboratory practicals.'}
              </p>
              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>Revision Progress</span>
                  <span className="font-mono text-white">65%</span>
                </div>
                <div className="w-full h-1.5 bg-[#222222] rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full w-[65%]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Experiments Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h3 className="text-base font-semibold font-['Manrope'] text-white">
            Recent Experiments
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/experiments')}
            className="text-xs text-[var(--text-muted)]"
          >
            All Experiments →
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-card)] text-[var(--text-muted)] uppercase tracking-wider font-mono text-[10px] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Experiment Name</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Complexity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-[var(--text-main)]">
              {experiments.map((exp, idx) => (
                <tr
                  key={exp.id}
                  onClick={() => navigate(`/experiments/${exp.id}`)}
                  className="hover:bg-[rgba(255,255,255,0.03)] cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono text-[var(--text-dim)]">
                    {exp.experiment_number || `0${idx + 1}`}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {exp.title}
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-muted)]">
                    {exp.subjects?.name || 'Computer Science'}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="mono" size="sm">
                      {exp.language}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[var(--text-muted)]">
                    {exp.time_complexity || 'O(n)'}
                  </td>
                  <td className="py-3.5 px-4">
                    {exp.is_revised ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-white">
                        <CheckCircle2 className="w-3 h-3 text-white" /> Revised
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-dim)]">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/experiments/${exp.id}`)
                      }}
                      className="text-xs text-[var(--text-muted)] hover:text-white transition-colors"
                    >
                      Open →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Experiment Modal */}
      <NewExperimentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      {/* AI Photo Code Scanner Modal */}
      <ScanPhotoModal
        isOpen={isScanModalOpen}
        onClose={() => {
          setIsScanModalOpen(false)
          loadData()
        }}
      />
    </div>
  )
}

