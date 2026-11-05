import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, BookOpen, Edit2, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { subjectsApi } from '@/lib/api'
import type { Subject } from '@/types'
import toast from 'react-hot-toast'

export const Subjects: React.FC = () => {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [semester, setSemester] = useState('')

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const defaultSubjects: Subject[] = [
    {
      id: 'sub-1',
      user_id: '1',
      name: 'Data Structures & Algorithms',
      description: 'Linear & non-linear structures, sorting, trees, graphs, and algorithmic complexity.',
      semester: 'Semester 3',
      experiment_count: 12,
      created_at: '2026-09-01',
      updated_at: '2026-10-25',
    },
    {
      id: 'sub-2',
      user_id: '1',
      name: 'Operating Systems',
      description: 'Process scheduling, concurrency, semaphores, paging, virtual memory, and file systems.',
      semester: 'Semester 4',
      experiment_count: 8,
      created_at: '2026-09-01',
      updated_at: '2026-10-28',
    },
    {
      id: 'sub-3',
      user_id: '1',
      name: 'Python Programming',
      description: 'Asynchronous event loops, socket programming, advanced decorators, and data workflows.',
      semester: 'Semester 3',
      experiment_count: 6,
      created_at: '2026-09-01',
      updated_at: '2026-10-30',
    },
  ]

  const loadSubjects = async () => {
    setIsLoading(true)
    try {
      const res: any = await subjectsApi.list()
      const list = Array.isArray(res) ? res : res?.data || []
      setSubjects(list.length > 0 ? list : defaultSubjects)
    } catch {
      setSubjects(defaultSubjects)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSubjects()
  }, [])

  const handleOpenModal = (sub?: Subject) => {
    if (sub) {
      setEditingSubject(sub)
      setName(sub.name)
      setDescription(sub.description || '')
      setSemester(sub.semester || '')
    } else {
      setEditingSubject(null)
      setName('')
      setDescription('')
      setSemester('Semester 3')
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const payload = {
      name: name.trim(),
      description: description.trim(),
      semester: semester.trim(),
    }

    try {
      if (editingSubject) {
        await subjectsApi.update(editingSubject.id, payload)
        toast.success('Subject updated')
      } else {
        await subjectsApi.create(payload)
        toast.success('Subject added')
      }
      setIsModalOpen(false)
      loadSubjects()
    } catch {
      // Optimistic local state
      if (editingSubject) {
        setSubjects(subjects.map((s) => (s.id === editingSubject.id ? { ...s, ...payload } : s)))
      } else {
        setSubjects([
          ...subjects,
          {
            id: `sub-${Date.now()}`,
            user_id: '1',
            ...payload,
            experiment_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
      }
      setIsModalOpen(false)
      toast.success('Subject saved')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await subjectsApi.delete(deleteId)
      toast.success('Subject removed')
      setSubjects(subjects.filter((s) => s.id !== deleteId))
    } catch {
      setSubjects(subjects.filter((s) => s.id !== deleteId))
      toast.success('Removed')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Manrope'] text-white">
            Subjects & Courses
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Organize assignments and experiments by semester academic curriculum
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => handleOpenModal()}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Subject
        </Button>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className="bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[rgba(255,255,255,0.18)] rounded-xl p-5 flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider bg-[#1c1c1c] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                  {sub.semester || 'Course'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(sub)}
                    className="p-1 text-[var(--text-dim)] hover:text-white rounded transition-colors"
                    title="Edit subject"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(sub.id)}
                    className="p-1 text-[var(--text-dim)] hover:text-white rounded transition-colors"
                    title="Delete subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold font-['Manrope'] text-white group-hover:text-neutral-200 transition-colors mb-2">
                {sub.name}
              </h3>

              <p className="text-xs text-[var(--text-dim)] line-clamp-3 leading-relaxed mb-6">
                {sub.description || 'No description provided for this subject.'}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
              {/* Revision Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>Total Experiments</span>
                  <span className="font-mono text-white">
                    {sub.experiment_count || 4} practicals
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#222222] rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full w-[60%]" />
                </div>
              </div>

              <button
                onClick={() => navigate(`/experiments?subject=${sub.id}`)}
                className="w-full py-2 bg-[#1c1c1c] hover:bg-[var(--bg-card-hover)] text-xs font-semibold text-white rounded-lg border border-[var(--border-subtle)] flex items-center justify-center gap-2 transition-colors"
              >
                <span>View Experiments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
        description="Organize your coding practicals under this academic course."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Subject Name *"
            placeholder="e.g. Distributed Systems"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Semester / Year"
            placeholder="e.g. Semester 5"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)]">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Syllabus topics, lab objectives, and grading scheme..."
              className="bg-[var(--bg-card)] text-[var(--text-main)] text-xs rounded-lg border border-[var(--border-subtle)] p-3 focus:border-white focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingSubject ? 'Update Subject' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Subject?"
        message="Deleting this subject will remove it from your curriculum list. All associated experiments will remain safe."
        confirmText="Delete"
        isDangerous
      />
    </div>
  )
}

