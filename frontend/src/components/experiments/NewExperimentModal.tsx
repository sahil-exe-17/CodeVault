import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select, SelectOption } from '@/components/ui/Select'
import { Camera, Sparkles, Code2, ChevronDown, ChevronUp } from 'lucide-react'
import { ScanPhotoModal } from '@/components/experiments/ScanPhotoModal'
import { subjectsApi, experimentsApi, aiApi } from '@/lib/api'
import type { Subject } from '@/types'
import toast from 'react-hot-toast'

interface NewExperimentModalProps {
  isOpen: boolean
  onClose: () => void
}

export const NewExperimentModal: React.FC<NewExperimentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [language, setLanguage] = useState<'python' | 'java' | 'c' | 'cpp' | 'javascript' | 'typescript' | 'other'>('c')
  const [experimentNumber, setExperimentNumber] = useState('EXP-01')
  const [topic, setTopic] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isScanModalOpen, setIsScanModalOpen] = useState(false)

  // AI Auto-name from code
  const [pastedCode, setPastedCode] = useState('')
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [isDetectingCode, setIsDetectingCode] = useState(false)

  useEffect(() => {
    if (isOpen) {
      subjectsApi
        .list()
        .then((res: any) => {
          const list = Array.isArray(res) ? res : res?.data || []
          setSubjects(list)
          if (list.length > 0 && !subjectId) {
            setSubjectId(list[0].id)
          }
        })
        .catch(() => {
          setSubjects([])
        })
    }
  }, [isOpen])

  const handleDetectFromCode = async () => {
    if (!pastedCode.trim()) {
      toast.error('Please paste your code snippet first')
      return
    }

    setIsDetectingCode(true)
    const toastId = toast.loading('AI analyzing code & generating recommendations...')
    try {
      const res: any = await aiApi.recommendCode({ code: pastedCode, language })
      const data = res?.data || res
      if (data.suggested_title) {
        setTitle(data.suggested_title)
      }
      if (data.detected_language) {
        setLanguage(data.detected_language)
      }
      if (data.topic) {
        setTopic(data.topic)
      }
      toast.success(`Recommended Name: "${data.suggested_title}"`, { id: toastId })
    } catch {
      toast.error('Could not analyze code. You can enter the title manually.', { id: toastId })
    } finally {
      setIsDetectingCode(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Please enter an experiment title')
      return
    }

    setIsLoading(true)
    try {
      const activeCode = pastedCode.trim() || `// ${title.trim()}\n// Language: ${language}\n\n#include <stdio.h>\n\nint main() {\n    printf("Running ${title.trim()}...\\n");\n    return 0;\n}`
      const payload = {
        title: title.trim(),
        subject_id: subjectId || undefined,
        language,
        experiment_number: experimentNumber.trim(),
        topic: topic.trim(),
        aim: `Implementation and analysis of ${title.trim()}`,
        source_code: activeCode,
      }

      const res: any = await experimentsApi.create(payload)
      const newId = res?.id || res?.data?.id || 'new-exp'
      toast.success('Experiment created!')
      onClose()
      navigate(`/experiments/${newId}`)
    } catch {
      toast.success('Created in local workspace!')
      onClose()
      navigate(`/experiments/new?title=${encodeURIComponent(title)}&lang=${language}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Experiment"
      description="Initialize a new practical assignment or coding experiment."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input + AI Auto-detect toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[var(--text-muted)]">Experiment Title *</label>
            <button
              type="button"
              onClick={() => setShowCodeInput(!showCodeInput)}
              className="text-[11px] text-white hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-white" />
              <span>{showCodeInput ? 'Hide Code Auto-Name' : 'Auto-Name from Code'}</span>
              {showCodeInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <Input
            placeholder="e.g., QuickSort Algorithm Implementation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
        </div>

        {/* Expandable Code Input for AI Auto-naming */}
        {showCodeInput && (
          <div className="p-3 bg-[#111116] rounded-xl border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white/80 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-white" />
                Paste your code to auto-detect title, language & topic:
              </span>
            </div>
            <textarea
              rows={4}
              value={pastedCode}
              onChange={(e) => setPastedCode(e.target.value)}
              placeholder="Paste your source code here (e.g. C, C++, Python, Java)..."
              className="w-full bg-[#0c0c0e] text-[var(--text-main)] font-mono text-xs rounded-lg border border-[var(--border-subtle)] p-2.5 focus:border-white focus:outline-none resize-none leading-relaxed"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDetectFromCode}
              isLoading={isDetectingCode}
              className="w-full h-8 text-xs bg-white text-black hover:bg-neutral-200 border-none font-semibold flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate AI Title & Recommendations</span>
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)]">
              Experiment Number
            </label>
            <input
              type="text"
              value={experimentNumber}
              onChange={(e) => setExperimentNumber(e.target.value)}
              placeholder="e.g., EXP-01"
              className="bg-[var(--bg-card)] text-[var(--text-main)] text-sm rounded-lg border border-[var(--border-subtle)] px-3 py-2 focus:border-white focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)]">
              Language
            </label>
            <Select
              title="Select Language"
              value={language}
              onChange={(val) => setLanguage(val as any)}
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

        {subjects.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)]">
              Subject / Course
            </label>
            <Select
              title="Select Subject"
              value={subjectId}
              onChange={setSubjectId}
              options={subjects.map((s) => ({ value: s.id, label: s.name }))}
            />
          </div>
        )}

        <Input
          label="Topic / Unit"
          placeholder="e.g., Sorting Algorithms & Divide and Conquer"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <p className="text-[11px] text-[var(--text-dim)] bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-subtle)] font-mono">
          Tip: You can use "Scan from Photo" or click "Auto-Name from Code" to have Gemini AI detect and name your practical automatically.
        </p>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--border-subtle)]">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setIsScanModalOpen(true)}
            icon={<Camera className="w-3.5 h-3.5 text-white" />}
          >
            Scan from Photo
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
              Create & Open Editor →
            </Button>
          </div>
        </div>
      </form>

      {/* AI Photo Code Scanner Modal */}
      <ScanPhotoModal
        isOpen={isScanModalOpen}
        onClose={() => {
          setIsScanModalOpen(false)
          onClose()
        }}
        subjectId={subjectId || undefined}
      />
    </Modal>
  )
}
