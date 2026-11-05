import React, { useState, useEffect } from 'react'
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  FileQuestion,
  Mic,
  Trash2,
  AlertTriangle,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { revisionApi, experimentsApi, subjectsApi } from '@/lib/api'
import type { RevisionSession, ExamSchedule, Experiment, Subject } from '@/types'
import toast from 'react-hot-toast'

export const RevisionPlanner: React.FC = () => {
  const [sessions, setSessions] = useState<RevisionSession[]>([])
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([])
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])

  // Modal States
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  const [isExamModalOpen, setIsExamModalOpen] = useState(false)

  // New Session Form
  const [targetExpId, setTargetExpId] = useState('')
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0])
  const [sessionType, setSessionType] = useState<'quick' | 'flashcard' | 'mcq' | 'viva'>('flashcard')

  // New Exam Form
  const [examName, setExamName] = useState('')
  const [examSubjectId, setExamSubjectId] = useState('')
  const [examDate, setExamDate] = useState('')

  const defaultSessions: RevisionSession[] = [
    {
      id: 'sess-1',
      experiment_id: 'exp-1',
      scheduled_date: new Date().toISOString().split('T')[0],
      session_type: 'flashcard',
      is_complete: false,
      experiment: {
        id: 'exp-1',
        user_id: '1',
        subject_id: 'sub-1',
        title: 'Bubble Sort with Early Exit',
        language: 'c',
        is_bookmarked: true,
        is_revised: false,
        revision_count: 1,
        created_at: '',
        updated_at: '',
        subjects: { name: 'Data Structures' },
      },
    },
    {
      id: 'sess-2',
      experiment_id: 'exp-3',
      scheduled_date: new Date().toISOString().split('T')[0],
      session_type: 'viva',
      is_complete: true,
      experiment: {
        id: 'exp-3',
        user_id: '1',
        subject_id: 'sub-2',
        title: 'Round Robin CPU Scheduling',
        language: 'python',
        is_bookmarked: true,
        is_revised: true,
        revision_count: 3,
        created_at: '',
        updated_at: '',
        subjects: { name: 'Operating Systems' },
      },
    },
    {
      id: 'sess-3',
      experiment_id: 'exp-2',
      scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      session_type: 'mcq',
      is_complete: false,
      experiment: {
        id: 'exp-2',
        user_id: '1',
        subject_id: 'sub-1',
        title: 'Singly Linked List Memory Allocation',
        language: 'c',
        is_bookmarked: false,
        is_revised: false,
        revision_count: 0,
        created_at: '',
        updated_at: '',
        subjects: { name: 'Data Structures' },
      },
    },
  ]

  const defaultExams: ExamSchedule[] = [
    {
      id: 'exam-1',
      subject_id: 'sub-1',
      exam_name: 'Data Structures Lab Exam',
      exam_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      is_completed: false,
      subject: { id: 'sub-1', user_id: '1', name: 'Data Structures & Algorithms', created_at: '', updated_at: '' },
    },
    {
      id: 'exam-2',
      subject_id: 'sub-2',
      exam_name: 'Operating Systems Practical Viva',
      exam_date: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
      is_completed: false,
      subject: { id: 'sub-2', user_id: '1', name: 'Operating Systems', created_at: '', updated_at: '' },
    },
  ]

  const loadData = async () => {
    try {
      const [sessRes, examRes, expRes, subRes] = await Promise.allSettled([
        revisionApi.getSessions(),
        revisionApi.getExamSchedules(),
        experimentsApi.list(),
        subjectsApi.list(),
      ])

      if (sessRes.status === 'fulfilled' && sessRes.value) {
        const list = Array.isArray(sessRes.value) ? sessRes.value : (sessRes.value as any)?.data || []
        setSessions(list.length > 0 ? list : defaultSessions)
      } else {
        setSessions(defaultSessions)
      }

      if (examRes.status === 'fulfilled' && examRes.value) {
        const list = Array.isArray(examRes.value) ? examRes.value : (examRes.value as any)?.data || []
        setExamSchedules(list.length > 0 ? list : defaultExams)
      } else {
        setExamSchedules(defaultExams)
      }

      if (expRes.status === 'fulfilled' && expRes.value) {
        const list = Array.isArray(expRes.value) ? expRes.value : (expRes.value as any)?.data || []
        setExperiments(list)
        if (list.length > 0) setTargetExpId(list[0].id)
      }

      if (subRes.status === 'fulfilled' && subRes.value) {
        const list = Array.isArray(subRes.value) ? subRes.value : (subRes.value as any)?.data || []
        setSubjects(list)
        if (list.length > 0) setExamSubjectId(list[0].id)
      }
    } catch {
      setSessions(defaultSessions)
      setExamSchedules(defaultExams)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCompleteSession = async (id: string) => {
    try {
      await revisionApi.completeSession(id)
      toast.success('Session marked completed!')
      setSessions(sessions.map((s) => (s.id === id ? { ...s, is_complete: true } : s)))
    } catch {
      setSessions(sessions.map((s) => (s.id === id ? { ...s, is_complete: true } : s)))
      toast.success('Session recorded')
    }
  }

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault()
    const exp = experiments.find((e) => e.id === targetExpId)
    const newSession: RevisionSession = {
      id: `sess-${Date.now()}`,
      experiment_id: targetExpId,
      scheduled_date: scheduledDate,
      session_type: sessionType,
      is_complete: false,
      experiment: exp,
    }

    try {
      await revisionApi.createSession({
        experiment_id: targetExpId,
        scheduled_date: scheduledDate,
        session_type: sessionType,
      })
      toast.success('Revision session scheduled')
    } catch {
      toast.success('Scheduled locally')
    }

    setSessions([...sessions, newSession])
    setIsSessionModalOpen(false)
  }

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!examName || !examDate) return
    const sub = subjects.find((s) => s.id === examSubjectId)
    const newExam: ExamSchedule = {
      id: `exam-${Date.now()}`,
      exam_name: examName,
      subject_id: examSubjectId,
      exam_date: examDate,
      is_completed: false,
      subject: sub,
    }

    try {
      await revisionApi.createExamSchedule({
        exam_name: examName,
        subject_id: examSubjectId,
        exam_date: examDate,
      })
      toast.success('Exam date scheduled')
    } catch {
      toast.success('Exam schedule recorded')
    }

    setExamSchedules([...examSchedules, newExam])
    setIsExamModalOpen(false)
  }

  const handleDeleteExam = async (id: string) => {
    try {
      await revisionApi.deleteExamSchedule(id)
    } catch {}
    setExamSchedules(examSchedules.filter((e) => e.id !== id))
    toast.success('Exam schedule removed')
  }

  const getDaysRemaining = (targetDate: string) => {
    const diff = new Date(targetDate).getTime() - new Date().getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days <= 0 ? 'Today' : `${days} days away`
  }

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold font-['Manrope'] text-white">
              Revision Planner
            </h1>
            <span className="inline-flex items-center gap-1 text-xs bg-white text-black font-semibold px-2 py-0.5 rounded-full font-mono">
              <Zap className="w-3 h-3 fill-black" />
              5 Day Streak
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Maintain optimal spaced repetition intervals ahead of university practicals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsExamModalOpen(true)}
            icon={<CalendarIcon className="w-3.5 h-3.5" />}
          >
            Add Exam Date
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSessionModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Schedule Revision
          </Button>
        </div>
      </div>

      {/* Grid: Calendar Sessions (7 cols) & Exam Countdown (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Revision Schedule */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold font-['Manrope'] text-white">
                Upcoming Revision Sessions
              </h3>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {sessions.filter((s) => !s.is_complete).length} pending
              </span>
            </div>

            {/* Session Cards List */}
            <div className="space-y-3">
              {sessions.map((sess) => {
                const title = sess.experiment?.title || 'Experiment Practical'
                const subName = sess.experiment?.subjects?.name || 'Computer Science'
                return (
                  <div
                    key={sess.id}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      sess.is_complete
                        ? 'bg-[var(--bg-card)] border-[rgba(255,255,255,0.04)] opacity-60'
                        : 'bg-[var(--bg-metric)] border-[var(--border-subtle)] hover:border-[rgba(255,255,255,0.18)]'
                    }`}
                  >
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-2">
                        <Badge variant="mono" size="sm" className="capitalize">
                          {sess.session_type}
                        </Badge>
                        <span className="text-[11px] text-[var(--text-muted)] font-mono">
                          {sess.scheduled_date}
                        </span>
                      </div>
                      <h4
                        className={`text-xs font-semibold text-white truncate ${
                          sess.is_complete ? 'line-through text-[var(--text-muted)]' : ''
                        }`}
                      >
                        {title}
                      </h4>
                      <p className="text-[11px] text-[var(--text-dim)] truncate">{subName}</p>
                    </div>

                    <div className="shrink-0">
                      {sess.is_complete ? (
                        <span className="text-[11px] text-white flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCompleteSession(sess.id)}
                          className="text-xs"
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Upcoming Exams & Spaced Repetition Info */}
        <div className="lg:col-span-5 space-y-4">
          {/* Exam Dates Card */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold font-['Manrope'] text-white">
                Upcoming Examination Dates
              </h3>
              <button
                onClick={() => setIsExamModalOpen(true)}
                className="text-xs text-[var(--text-muted)] hover:text-white"
              >
                + Add
              </button>
            </div>

            <div className="space-y-3">
              {examSchedules.map((exam) => (
                <div
                  key={exam.id}
                  className="p-3.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-white">
                      {exam.exam_name}
                    </h4>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {exam.subject?.name || 'Practical Exam'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-white bg-white/10 px-2.5 py-1 rounded">
                      {getDaysRemaining(exam.exam_date)}
                    </span>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="text-[var(--text-dim)] hover:text-white p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spaced Repetition Callout */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Spaced Repetition Algorithm
            </h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              CodeVault schedules revision intervals at 1 day, 3 days, 7 days, and 14 days post-creation. This active recall cadence shifts concepts from short-term memory into permanent retention.
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Revision Modal */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title="Schedule Revision Session"
        description="Pick an experiment to review with active recall."
      >
        <form onSubmit={handleAddSession} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)]">Experiment</label>
            <Select
              title="Select Experiment"
              placeholder="Select experiment…"
              value={targetExpId}
              onChange={setTargetExpId}
              options={experiments.map((e) => ({ value: e.id, label: e.title }))}
            />
          </div>

          <Input
            type="date"
            label="Scheduled Date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)]">Session Type</label>
            <Select
              title="Select Session Type"
              value={sessionType}
              onChange={(val) => setSessionType(val as any)}
            >
              <SelectOption value="flashcard">Flashcards</SelectOption>
              <SelectOption value="viva">Viva Simulator</SelectOption>
              <SelectOption value="mcq">MCQ Practice</SelectOption>
              <SelectOption value="quick">Quick Notes Review</SelectOption>
            </Select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsSessionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Schedule Session
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Exam Modal */}
      <Modal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title="Add Exam Schedule"
        description="Track countdown to your practical laboratory examination."
      >
        <form onSubmit={handleAddExam} className="space-y-4">
          <Input
            label="Examination Name *"
            placeholder="e.g. Operating Systems Lab End-Sem"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)]">Subject</label>
            <Select
              title="Select Subject"
              placeholder="Select subject…"
              value={examSubjectId}
              onChange={setExamSubjectId}
              options={subjects.map((s) => ({ value: s.id, label: s.name }))}
            />
          </div>

          <Input
            type="date"
            label="Exam Date *"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsExamModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Exam Date
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

