import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  Camera,
  Sparkles,
  BookOpen,
  FileText,
  FileCheck,
  Trash2,
  ExternalLink,
  Layers,
  Code2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectOption } from '@/components/ui/Select'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { ScanPhotoModal } from '@/components/experiments/ScanPhotoModal'
import { subjectsApi, experimentsApi, aiApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { Subject, Experiment } from '@/types'
import toast from 'react-hot-toast'

export const SubjectDetail: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [subject, setSubject] = useState<Subject | null>(null)
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modals
  const [isAddExpOpen, setIsAddExpOpen] = useState(false)
  const [isScanOpen, setIsScanOpen] = useState(false)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiModalTitle, setAiModalTitle] = useState('')
  const [aiContent, setAiContent] = useState<any>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)

  // New Experiment Form
  const [expTitle, setExpTitle] = useState('')
  const [expNumber, setExpNumber] = useState('EXP-01')
  const [expTopic, setExpTopic] = useState('')
  const [expLang, setExpLang] = useState('c')
  const [expAim, setExpAim] = useState('')
  const [isCreatingExp, setIsCreatingExp] = useState(false)

  const userStorageKey = `cv_subjects_${user?.id || user?.email || 'guest'}`
  const expStorageKey = `cv_experiments_${subjectId}`

  const loadData = async () => {
    if (!subjectId) return
    setIsLoading(true)
    try {
      const [subRes, expRes]: any = await Promise.all([
        subjectsApi.get(subjectId),
        experimentsApi.list({ subject_id: subjectId }),
      ])
      const s = subRes?.data || subRes
      setSubject(s)
      const exps = Array.isArray(expRes) ? expRes : expRes?.data || []
      setExperiments(exps)
      setExpNumber(`EXP-0${exps.length + 1}`)
      localStorage.setItem(expStorageKey, JSON.stringify(exps))
    } catch {
      // Offline / local cache fallback
      try {
        const cachedSubs = JSON.parse(localStorage.getItem(userStorageKey) || '[]')
        const found = cachedSubs.find((x: any) => x.id === subjectId)
        if (found) {
          setSubject(found)
        } else {
          setSubject({
            id: subjectId,
            user_id: user?.id || 'guest',
            name: 'Subject Overview',
            semester: user?.semester || 'Semester 4',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
        const cachedExps = JSON.parse(localStorage.getItem(expStorageKey) || '[]')
        setExperiments(cachedExps)
        setExpNumber(`EXP-0${cachedExps.length + 1}`)
      } catch {
        setExperiments([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [subjectId])

  const handleCreateExperiment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expTitle.trim()) {
      toast.error('Please enter an experiment title.')
      return
    }

    setIsCreatingExp(true)
    try {
      const res: any = await experimentsApi.create({
        subject_id: subjectId,
        title: expTitle.trim(),
        experiment_number: expNumber.trim(),
        topic: expTopic.trim() || undefined,
        language: expLang,
        aim: expAim.trim() || `Implementation of ${expTitle.trim()}`,
        code_files: [
          {
            id: 'c1',
            title: 'Code 1',
            language: expLang,
            code: `// ${expTitle.trim()}\n// Language: ${expLang}\n\n#include <stdio.h>\n\nint main() {\n    printf("Running ${expTitle.trim()}...\\n");\n    return 0;\n}`,
          },
        ],
      })
      toast.success('Experiment created.')
      setIsAddExpOpen(false)
      const newId = res?.id || res?.data?.id
      if (newId) {
        navigate(`/experiments/${newId}`)
      } else {
        loadData()
      }
    } catch {
      // Local fallback
      const localExp: Experiment = {
        id: 'exp-' + Date.now(),
        subject_id: subjectId || 'sub-default',
        user_id: user?.id || 'guest',
        title: expTitle.trim(),
        experiment_number: expNumber.trim(),
        topic: expTopic.trim() || '',
        language: expLang,
        aim: expAim.trim() || `Implementation of ${expTitle.trim()}`,
        code_files: [
          {
            id: 'c1',
            title: 'Code 1',
            language: expLang,
            code: `// ${expTitle.trim()}\n// Language: ${expLang}\n\n#include <stdio.h>\n\nint main() {\n    return 0;\n}`,
          },
        ],
        is_bookmarked: false,
        is_revised: false,
        revision_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setExperiments((prev) => {
        const next = [localExp, ...prev]
        localStorage.setItem(expStorageKey, JSON.stringify(next))
        return next
      })
      toast.success('Experiment created.')
      setIsAddExpOpen(false)
      navigate(`/experiments/${localExp.id}`)
    } finally {
      setIsCreatingExp(false)
    }
  }

  const handleDeleteExperiment = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation()
    if (!window.confirm(`Delete experiment "${title}"?`)) return

    try {
      await experimentsApi.delete(id)
    } catch {}
    toast.success('Experiment deleted.')
    setExperiments((prev) => {
      const next = prev.filter((exp) => exp.id !== id)
      localStorage.setItem(expStorageKey, JSON.stringify(next))
      return next
    })
  }

  // AI Feature: Viva Prep for this Subject
  const handleSubjectVivaPrep = async () => {
    if (experiments.length === 0) {
      toast.error('Add at least one experiment before generating viva questions.')
      return
    }

    setIsAiLoading(true)
    setAiModalTitle(`AI Viva Questions — ${subject?.name}`)
    setIsAiModalOpen(true)
    setAiContent(null)

    try {
      const firstExp = experiments[0]
      const res: any = await aiApi.generateVivaQuestions({
        experiment_id: firstExp.id,
        difficulty: 'medium',
        count: 5,
      })
      const questions = Array.isArray(res) ? res : res?.data || []
      setAiContent({ type: 'viva', items: questions })
    } catch {
      setAiContent({
        type: 'viva',
        items: [
          {
            question: 'What is the algorithmic complexity of the primary practical in this course?',
            expected_answer: 'Best case O(n) when pre-sorted; worst case O(n^2) with quadratic comparison passes.',
            topic: 'Complexity Analysis',
          },
          {
            question: 'How do you prevent memory leaks when managing dynamic memory in laboratory practicals?',
            expected_answer: 'Ensure every malloc or calloc call has a corresponding free invocation before function termination.',
            topic: 'Memory Safety',
          },
        ],
      })
    } finally {
      setIsAiLoading(false)
    }
  }

  // AI Feature: Revision Summary for this Subject
  const handleSubjectRevision = async () => {
    if (experiments.length === 0) {
      toast.error('Add at least one experiment before generating revision notes.')
      return
    }

    setIsAiLoading(true)
    setAiModalTitle(`Revision Summary — ${subject?.name}`)
    setIsAiModalOpen(true)
    setAiContent(null)

    try {
      const res: any = await aiApi.generateRevisionNotes({
        experiment_id: experiments[0].id,
      })
      setAiContent({ type: 'notes', data: res?.data || res })
    } catch {
      setAiContent({
        type: 'notes',
        data: {
          summary: `High-yield practical exam review for ${subject?.name || 'this subject'}.`,
          key_concepts: [
            'Master step-by-step whiteboard algorithm tracing for external examiner evaluation.',
            'Always state time complexity proofs and space constraints upfront.',
            'Verify border input test cases (e.g. empty inputs, duplicate keys, reverse sorted sequences).',
          ],
          exam_tips: [
            'Examiners focus on line-by-line pointer dereferencing and loop exit invariants.',
            'Keep your written practical notebook formatted and clean with signed index entries.',
          ],
        },
      })
    } finally {
      setIsAiLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#050508] text-[#F5F5F5] select-none flex flex-col overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[450px] h-[300px] bg-gradient-to-tr from-sky-500/10 to-transparent blur-[120px] pointer-events-none" />

      <AppNavbar showAddSubject={false} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-7 relative z-10">
        {/* Back Link */}
        <Link
          to="/subjects"
          className="inline-flex items-center gap-2 text-xs font-mono text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO ALL SUBJECTS</span>
        </Link>

        {/* Subject Header & Small Feature Buttons */}
        <div className="p-7 rounded-3xl bg-[#101015]/80 border border-white/[0.09] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-['Manrope'] text-white tracking-tight">
                {subject?.name || 'Subject Overview'}
              </h1>
              {subject?.semester && (
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.07] text-white/80 border border-white/15">
                  {subject.semester}
                </span>
              )}
            </div>
            {subject?.description && (
              <p className="text-xs sm:text-sm text-white/45 max-w-2xl leading-relaxed">
                {subject.description}
              </p>
            )}
          </div>

          {/* Clean Minimalist Feature Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddExpOpen(true)}
              className="h-9 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer transition-all active:scale-[0.98]"
            >
              <span>+ Add Experiment</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScanOpen(true)}
              className="h-9 px-3.5 rounded-xl bg-[#171720]/90 hover:bg-[#20202c] border border-white/10 hover:border-white/25 text-white/90 text-xs font-medium flex items-center backdrop-blur-md transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <span>Scan Code Photo</span>
            </button>

            <button
              type="button"
              onClick={handleSubjectVivaPrep}
              className="h-9 px-3.5 rounded-xl bg-[#171720]/90 hover:bg-[#20202c] border border-white/10 hover:border-white/25 text-white/90 text-xs font-medium flex items-center backdrop-blur-md transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <span>Viva Questions</span>
            </button>

            <button
              type="button"
              onClick={handleSubjectRevision}
              className="h-9 px-3.5 rounded-xl bg-[#171720]/90 hover:bg-[#20202c] border border-white/10 hover:border-white/25 text-white/90 text-xs font-medium flex items-center backdrop-blur-md transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <span>Revision Summary</span>
            </button>
          </div>
        </div>

        {/* Experiments List Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#888888]">
            <span className="font-semibold text-white">Practicals & Assignments</span>
            <span className="font-mono">
              {experiments.length} {experiments.length === 1 ? 'experiment' : 'experiments'}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-16 rounded-xl bg-[#141414] border border-[rgba(255,255,255,0.06)] animate-pulse"
                />
              ))}
            </div>
          ) : experiments.length === 0 ? (
            <div className="p-10 text-center rounded-xl bg-[#111111] border border-dashed border-[rgba(255,255,255,0.1)] space-y-3">
              <Code2 className="w-8 h-8 text-[#666666] mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">No experiments in this subject yet</p>
                <p className="text-xs text-[#888888]">
                  Click below to write code or scan from your handwritten lab notebook.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddExpOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
                className="mt-1"
              >
                Add First Experiment
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {experiments.map((exp, index) => {
                const codeCount = exp.code_files?.length || 1
                return (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                    whileHover={{ y: -2 }}
                    onClick={() => navigate(`/experiments/${exp.id}`)}
                    className="p-4 sm:p-5 rounded-2xl bg-[#121217]/80 hover:bg-[#181822] border border-white/[0.08] hover:border-white/25 backdrop-blur-xl shadow-md hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <span className="text-xs font-mono font-bold text-white/70 bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-xl">
                        {exp.experiment_number || `EXP-0${index + 1}`}
                      </span>
                      <div className="space-y-1">
                        <h4 className="text-sm sm:text-base font-bold font-['Manrope'] text-white group-hover:text-white transition-colors">
                          {exp.title}
                        </h4>
                        {exp.aim && (
                          <p className="text-xs text-white/40 line-clamp-1 max-w-xl">
                            {exp.aim}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <span className="font-mono text-[11px] text-white/60 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                        {codeCount} {codeCount === 1 ? 'code' : 'codes'} • {exp.language.toUpperCase()}
                      </span>

                      {exp.notebook_pdf_url && (
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>Notebook Scan</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDeleteExperiment(e, exp.id, exp.title)}
                        className="w-7 h-7 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-all cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                        title="Delete Experiment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-8 h-8 rounded-xl bg-white/[0.04] group-hover:bg-white group-hover:text-black text-white/40 flex items-center justify-center transition-all">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal: Add Experiment */}
      <Modal
        isOpen={isAddExpOpen}
        onClose={() => setIsAddExpOpen(false)}
        title={`Add Experiment — ${subject?.name}`}
        description="Add a new coding experiment. You can attach multiple codes, handwritten scans, and AI notes inside."
        maxWidth="md"
      >
        <form onSubmit={handleCreateExperiment} className="space-y-4">
          <Input
            label="Experiment Title"
            placeholder="e.g. Dijkstra Shortest Path Algorithm"
            value={expTitle}
            onChange={(e) => setExpTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Experiment Number"
              placeholder="e.g. EXP-01"
              value={expNumber}
              onChange={(e) => setExpNumber(e.target.value)}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#A1A1A1]">
                Initial Language
              </label>
              <Select
                title="Select Initial Language"
                value={expLang}
                onChange={setExpLang}
              >
                <SelectOption value="c">C</SelectOption>
                <SelectOption value="cpp">C++</SelectOption>
                <SelectOption value="python">Python</SelectOption>
                <SelectOption value="java">Java</SelectOption>
                <SelectOption value="javascript">JavaScript</SelectOption>
                <SelectOption value="typescript">TypeScript</SelectOption>
                <SelectOption value="other">Other</SelectOption>
              </Select>
            </div>
          </div>

          <Input
            label="Topic / Unit (Optional)"
            placeholder="e.g. Graphs & Greedy Algorithms"
            value={expTopic}
            onChange={(e) => setExpTopic(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#A1A1A1]">
              Experiment Aim (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. To compute the shortest path from a single source to all vertices"
              value={expAim}
              onChange={(e) => setExpAim(e.target.value)}
              className="bg-[#171717] text-[#F5F5F5] placeholder-[#666666] text-xs rounded-lg border border-[rgba(255,255,255,0.09)] px-3 py-2.5 focus:border-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(255,255,255,0.08)]">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setIsAddExpOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isCreatingExp}
            >
              Create & Open Workspace
            </Button>
          </div>
        </form>
      </Modal>

      {/* AI Photo Scanner Modal */}
      <ScanPhotoModal
        isOpen={isScanOpen}
        onClose={() => {
          setIsScanOpen(false)
          loadData()
        }}
        subjectId={subjectId}
      />

      {/* AI Features Modal (Viva & Revision Notes) */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title={aiModalTitle}
        maxWidth="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {isAiLoading ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#888888]">Generating analysis from subject practicals...</p>
            </div>
          ) : aiContent?.type === 'viva' ? (
            <div className="space-y-3">
              {aiContent.items?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between text-[#888888] text-[11px]">
                    <span className="font-semibold text-white">Question {idx + 1}</span>
                    <span className="font-mono">{item.topic || 'General'}</span>
                  </div>
                  <p className="text-white font-medium">{item.question}</p>
                  <div className="p-2.5 bg-[#0D0D0D] rounded-lg border border-[rgba(255,255,255,0.06)] text-[#A1A1A1]">
                    <span className="text-[11px] text-white font-semibold block mb-0.5">Model Answer:</span>
                    <p className="text-[11px] leading-relaxed">{item.expected_answer}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : aiContent?.type === 'notes' ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)] space-y-1">
                <span className="font-semibold text-white">Summary</span>
                <p className="text-[#A1A1A1] leading-relaxed">{aiContent.data?.summary}</p>
              </div>

              {aiContent.data?.key_concepts && (
                <div className="p-3 bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)] space-y-2">
                  <span className="font-semibold text-white">Key Concepts</span>
                  <ul className="space-y-1 text-[#A1A1A1] list-disc list-inside">
                    {aiContent.data.key_concepts.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiContent.data?.exam_tips && (
                <div className="p-3 bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)] space-y-2">
                  <span className="font-semibold text-white">Practical Exam Tips</span>
                  <ul className="space-y-1 text-[#A1A1A1] list-disc list-inside">
                    {aiContent.data.exam_tips.map((t: string, i: number) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          <div className="flex justify-end pt-3 border-t border-[rgba(255,255,255,0.08)]">
            <Button variant="ghost" size="sm" onClick={() => setIsAiModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

