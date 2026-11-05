import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
  Bookmark,
  CheckCircle2,
  Clock,
  Sparkles,
  Camera,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Select, SelectOption } from '@/components/ui/Select'
import { ExperimentCard } from '@/components/experiments/ExperimentCard'
import { NewExperimentModal } from '@/components/experiments/NewExperimentModal'
import { ScanPhotoModal } from '@/components/experiments/ScanPhotoModal'
import { experimentsApi, subjectsApi } from '@/lib/api'
import type { Experiment, Subject } from '@/types'
import toast from 'react-hot-toast'

export const AllExperiments: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'all')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all') // all, revised, pending
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest')
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false)

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [isScanModalOpen, setIsScanModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const sampleExperiments: Experiment[] = [
    {
      id: 'exp-1',
      user_id: '1',
      subject_id: 'sub-1',
      title: 'Bubble Sort with Early Termination Flag',
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
      topic: 'Dynamic Memory & Pointers',
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
      topic: 'Process Management',
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
      aim: 'Non-blocking I/O using aiohttp and asyncio event loops in modern Python.',
      time_complexity: 'O(k)',
      space_complexity: 'O(k)',
      is_bookmarked: false,
      is_revised: false,
      revision_count: 1,
      created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
      updated_at: new Date().toISOString(),
      subjects: { name: 'Python Programming' },
    },
    {
      id: 'exp-5',
      user_id: '1',
      subject_id: 'sub-1',
      title: 'Binary Search Tree Traversals (Inorder, Preorder, Postorder)',
      experiment_number: 'EXP-05',
      topic: 'Trees & Recursion',
      language: 'cpp',
      aim: 'Recursive traversal algorithms and depth calculation on binary search trees.',
      time_complexity: 'O(n)',
      space_complexity: 'O(h)',
      is_bookmarked: true,
      is_revised: false,
      revision_count: 0,
      created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
      updated_at: new Date().toISOString(),
      subjects: { name: 'Data Structures' },
    },
    {
      id: 'exp-6',
      user_id: '1',
      subject_id: 'sub-2',
      title: 'Dining Philosophers Concurrency Mutex',
      experiment_number: 'EXP-06',
      topic: 'Deadlocks & Semaphores',
      language: 'c',
      aim: 'Solve synchronization deadlocks using POSIX semaphores and mutex locks.',
      time_complexity: 'O(1)',
      space_complexity: 'O(1)',
      is_bookmarked: false,
      is_revised: true,
      revision_count: 3,
      created_at: new Date(Date.now() - 3600000 * 150).toISOString(),
      updated_at: new Date().toISOString(),
      subjects: { name: 'Operating Systems' },
    },
  ]

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [expRes, subRes] = await Promise.allSettled([
        experimentsApi.list(),
        subjectsApi.list(),
      ])

      if (expRes.status === 'fulfilled' && expRes.value) {
        const list = Array.isArray(expRes.value) ? expRes.value : (expRes.value as any)?.data || []
        setExperiments(list.length > 0 ? list : sampleExperiments)
      } else {
        setExperiments(sampleExperiments)
      }

      if (subRes.status === 'fulfilled' && subRes.value) {
        const list = Array.isArray(subRes.value) ? subRes.value : (subRes.value as any)?.data || []
        setSubjects(list)
      }
    } catch {
      setExperiments(sampleExperiments)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    try {
      await experimentsApi.delete(deleteId)
      toast.success('Experiment deleted')
      setExperiments(experiments.filter((e) => e.id !== deleteId))
    } catch {
      // Optimistic delete
      setExperiments(experiments.filter((e) => e.id !== deleteId))
      toast.success('Removed from workspace')
    } finally {
      setDeleteId(null)
    }
  }

  // Filter & Search Logic
  const filteredExperiments = experiments
    .filter((exp) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = exp.title.toLowerCase().includes(query)
        const matchesTopic = exp.topic?.toLowerCase().includes(query)
        const matchesAim = exp.aim?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesTopic && !matchesAim) return false
      }

      // Subject
      if (selectedSubject !== 'all') {
        if (exp.subject_id !== selectedSubject && exp.subjects?.name !== selectedSubject) {
          return false
        }
      }

      // Language
      if (selectedLanguage !== 'all') {
        if (exp.language.toLowerCase() !== selectedLanguage.toLowerCase()) return false
      }

      // Status
      if (selectedStatus === 'revised' && !exp.is_revised) return false
      if (selectedStatus === 'pending' && exp.is_revised) return false

      // Bookmarked
      if (bookmarkedOnly && !exp.is_bookmarked) return false

      return true
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
      }
      if (sortBy === 'az') return a.title.localeCompare(b.title)
      if (sortBy === 'za') return b.title.localeCompare(a.title)
      return 0
    })

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Manrope'] text-white">
            All Experiments
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {filteredExperiments.length} experiments organized across subjects
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsScanModalOpen(true)}
            icon={<Camera className="w-3.5 h-3.5" />}
          >
            Scan from Photo
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/ai/explain')}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            AI Explainer
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            New Experiment
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiments by title, topic, or code..."
              className="w-full bg-[var(--bg-card)] text-xs text-[var(--text-main)] placeholder-[#555555] rounded-lg pl-9 pr-3 py-2 border border-[var(--border-subtle)] focus:border-white focus:outline-none"
            />
          </div>

          {/* Controls: Subject, Language, Status, Sort */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Subject */}
            <Select
              size="compact"
              title="Filter by Subject"
              value={selectedSubject}
              onChange={setSelectedSubject}
              className="w-36"
              options={[
                { value: 'all', label: 'All Subjects' },
                ...subjects.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />

            {/* Language */}
            <Select
              size="compact"
              title="Filter by Language"
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              className="w-36"
            >
              <SelectOption value="all">All Languages</SelectOption>
              <SelectOption value="python">Python</SelectOption>
              <SelectOption value="c">C</SelectOption>
              <SelectOption value="cpp">C++</SelectOption>
              <SelectOption value="java">Java</SelectOption>
              <SelectOption value="javascript">JavaScript</SelectOption>
              <SelectOption value="typescript">TypeScript</SelectOption>
            </Select>

            {/* Status */}
            <Select
              size="compact"
              title="Filter by Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              className="w-32"
            >
              <SelectOption value="all">All Status</SelectOption>
              <SelectOption value="revised">Revised Only</SelectOption>
              <SelectOption value="pending">Pending Only</SelectOption>
            </Select>

            {/* Sort */}
            <Select
              size="compact"
              title="Sort Experiments"
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              className="w-36"
            >
              <SelectOption value="newest">Newest First</SelectOption>
              <SelectOption value="oldest">Oldest First</SelectOption>
              <SelectOption value="az">Title A-Z</SelectOption>
              <SelectOption value="za">Title Z-A</SelectOption>
            </Select>

            {/* Bookmarks Toggle */}
            <button
              onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
              className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs ${
                bookmarkedOnly
                  ? 'bg-white text-black border-white font-semibold'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-white'
              }`}
              title="Filter by bookmarks"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>

            {/* View Grid/List toggle */}
            <div className="flex items-center border border-[var(--border-subtle)] rounded-lg p-0.5 bg-[var(--bg-card)]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-[#222222] text-white' : 'text-[var(--text-dim)] hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-[#222222] text-white' : 'text-[var(--text-dim)] hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Experiment List / Grid */}
      {filteredExperiments.length === 0 ? (
        <EmptyState
          icon={<Filter className="w-8 h-8" />}
          title="No experiments found"
          description="Try adjusting your search terms or filters to find what you need."
          actionLabel="Create Experiment"
          onAction={() => setIsNewModalOpen(true)}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExperiments.map((exp) => (
            <ExperimentCard
              key={exp.id}
              experiment={exp}
              onDelete={(id) => setDeleteId(id)}
              onUpdate={(updated) =>
                setExperiments(experiments.map((e) => (e.id === updated.id ? updated : e)))
              }
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-card)] text-[var(--text-muted)] uppercase tracking-wider font-mono text-[10px] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Complexity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-[var(--text-main)]">
              {filteredExperiments.map((exp) => (
                <tr
                  key={exp.id}
                  onClick={() => navigate(`/experiments/${exp.id}`)}
                  className="hover:bg-[rgba(255,255,255,0.03)] cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono text-[var(--text-dim)]">
                    {exp.experiment_number || 'EXP'}
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
                    <div className="flex items-center gap-2">
                      {exp.is_revised ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-white">
                          <CheckCircle2 className="w-3 h-3 text-white" /> Revised
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-dim)]">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {exp.notebook_pdf_url && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-white/10 text-[var(--text-main)] border border-white/20" title="Practical Notebook PDF Backed Up">
                           PDF
                        </span>
                      )}
                    </div>
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
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Experiment?"
        message="This action will permanently delete this experiment, its source code, and any saved AI explanations."
        confirmText="Delete Experiment"
        isDangerous
      />

      {/* New Experiment Modal */}
      <NewExperimentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      {/* Scan Photo AI Modal */}
      <ScanPhotoModal
        isOpen={isScanModalOpen}
        onClose={() => {
          setIsScanModalOpen(false)
          loadData()
        }}
        subjectId={selectedSubject !== 'all' ? selectedSubject : undefined}
      />
    </div>
  )
}

