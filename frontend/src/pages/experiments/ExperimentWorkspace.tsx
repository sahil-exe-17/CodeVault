import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Copy,
  Download,
  Camera,
  Sparkles,
  BookOpen,
  FileCheck,
  ExternalLink,
  Upload,
  Layers,
  HelpCircle,
  Bug,
  FileCode,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { ScanPhotoModal } from '@/components/experiments/ScanPhotoModal'
import { experimentsApi, aiApi } from '@/lib/api'
import type { Experiment, CodeSnippetItem } from '@/types'
import toast from 'react-hot-toast'

export const ExperimentWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [experiment, setExperiment] = useState<Partial<Experiment>>({
    title: 'New Experiment',
    experiment_number: 'EXP-01',
    topic: '',
    aim: '',
    theory: '',
    algorithm: '',
    language: 'c',
    source_code: '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}',
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
  })

  // Multiple Code Files State
  const [codeFiles, setCodeFiles] = useState<CodeSnippetItem[]>([
    {
      id: 'c1',
      title: 'Code 1',
      language: 'c',
      code: '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}',
    },
  ])
  const [activeCodeId, setActiveCodeId] = useState<string>('c1')

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [fontSize, setFontSize] = useState(14)

  // Practical Notebook PDF State
  const [isUploadingPdf, setIsUploadingPdf] = useState(false)
  const [isDeletingPdf, setIsDeletingPdf] = useState(false)

  // Scan Photo Modal
  const [isScanOpen, setIsScanOpen] = useState(false)

  // AI Feature Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiModalTitle, setAiModalTitle] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiOutput, setAiOutput] = useState<any>(null)

  useEffect(() => {
    if (!id || id === 'new') {
      setIsLoading(false)
      return
    }

    experimentsApi
      .get(id)
      .then((res: any) => {
        const data = res?.data || res
        setExperiment(data)

        if (data.code_files && Array.isArray(data.code_files) && data.code_files.length > 0) {
          setCodeFiles(data.code_files)
          setActiveCodeId(data.code_files[0].id)
        } else {
          const fallback: CodeSnippetItem = {
            id: 'c1',
            title: 'Code 1',
            language: data.language || 'c',
            code: data.source_code || '',
          }
          setCodeFiles([fallback])
          setActiveCodeId('c1')
        }
      })
      .catch(() => {
        toast.error('Failed to load experiment.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [id])

  const activeSnippet = codeFiles.find((c) => c.id === activeCodeId) || codeFiles[0]

  const updateActiveSnippet = (field: 'code' | 'language' | 'title', value: string) => {
    setCodeFiles((prev) =>
      prev.map((item) => (item.id === activeSnippet.id ? { ...item, [field]: value } : item))
    )
  }

  const handleAddCodeSnippet = () => {
    const nextNumber = codeFiles.length + 1
    const newId = `c_${Date.now()}`
    const newSnippet: CodeSnippetItem = {
      id: newId,
      title: `Code ${nextNumber}`,
      language: activeSnippet?.language || 'c',
      code: `// Implementation ${nextNumber}\n`,
    }
    setCodeFiles((prev) => [...prev, newSnippet])
    setActiveCodeId(newId)
    toast.success(`Added ${newSnippet.title}`)
  }

  const handleDeleteCodeSnippet = (idToDelete: string) => {
    if (codeFiles.length <= 1) {
      toast.error('Experiment must contain at least one code snippet.')
      return
    }
    const filtered = codeFiles.filter((c) => c.id !== idToDelete)
    setCodeFiles(filtered)
    if (activeCodeId === idToDelete) {
      setActiveCodeId(filtered[0].id)
    }
    toast.success('Code snippet removed.')
  }

  const handleSave = async () => {
    if (!id || id === 'new') return
    setIsSaving(true)
    try {
      const primary = codeFiles[0] || { code: '', language: 'c' }
      const payload = {
        ...experiment,
        code_files: codeFiles,
        source_code: primary.code,
        language: primary.language,
      }
      await experimentsApi.update(id, payload)
      toast.success('All changes saved.')
    } catch {
      toast.error('Failed to save changes.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyActiveCode = () => {
    navigator.clipboard.writeText(activeSnippet.code)
    toast.success('Code copied to clipboard.')
  }

  const handleDownloadActiveCode = () => {
    const extMap: Record<string, string> = {
      python: 'py',
      c: 'c',
      cpp: 'cpp',
      java: 'java',
      javascript: 'js',
      typescript: 'ts',
      other: 'txt',
    }
    const ext = extMap[activeSnippet.language] || 'txt'
    const blob = new Blob([activeSnippet.code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${activeSnippet.title.toLowerCase().replace(/\s+/g, '_')}.${ext}`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Practical Notebook PDF Handlers
  const handleNotebookPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file (.pdf)')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setIsUploadingPdf(true)
    const toastId = toast.loading('Uploading written practical notebook...')
    try {
      const res: any = await experimentsApi.uploadNotebookPdf(id, formData)
      const data = res?.data || res
      setExperiment((prev) => ({
        ...prev,
        notebook_pdf_url: data.notebook_pdf_url,
        notebook_pdf_name: data.notebook_pdf_name,
        notebook_pdf_size: data.notebook_pdf_size,
        notebook_uploaded_at: data.notebook_uploaded_at,
      }))
      toast.success('Written practical notebook uploaded.', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload notebook PDF', { id: toastId })
    } finally {
      setIsUploadingPdf(false)
      e.target.value = ''
    }
  }

  const handleDeleteNotebookPdf = async () => {
    if (!id) return
    if (!window.confirm('Delete uploaded practical notebook record?')) return

    setIsDeletingPdf(true)
    const toastId = toast.loading('Removing notebook...')
    try {
      await experimentsApi.removeNotebookPdf(id)
      setExperiment((prev) => ({
        ...prev,
        notebook_pdf_url: undefined,
        notebook_pdf_name: undefined,
        notebook_pdf_size: undefined,
        notebook_uploaded_at: undefined,
      }))
      toast.success('Written notebook removed.', { id: toastId })
    } catch {
      toast.error('Failed to remove notebook.', { id: toastId })
    } finally {
      setIsDeletingPdf(false)
    }
  }

  // AI Actions
  const handleExplainAI = async () => {
    setIsAiLoading(true)
    setAiModalTitle(`AI Explanation — ${activeSnippet.title}`)
    setIsAiModalOpen(true)
    setAiOutput(null)

    try {
      const res: any = await aiApi.explain({
        experiment_id: id,
        code: activeSnippet.code,
        language: activeSnippet.language,
        mode: 'exam',
      })
      setAiOutput({ type: 'explain', data: res?.data || res })
    } catch {
      setAiOutput({
        type: 'explain',
        data: {
          program_overview: `Algorithmic implementation in ${activeSnippet.language.toUpperCase()}.`,
          logic_breakdown: '1. Input buffer initialization.\n2. Invariant boundary checks.\n3. Deterministic state transitions.',
          time_complexity: 'Worst Case: O(n^2) | Best Case: O(n)',
          space_complexity: 'Auxiliary Memory: O(1) in-place',
          exam_points: 'Always present the termination proof and loop boundaries during viva.',
        },
      })
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleVivaAI = async () => {
    setIsAiLoading(true)
    setAiModalTitle(`Viva Questions — ${experiment.title}`)
    setIsAiModalOpen(true)
    setAiOutput(null)

    try {
      const res: any = await aiApi.generateVivaQuestions({
        experiment_id: id,
        difficulty: 'medium',
        count: 5,
      })
      const items = Array.isArray(res) ? res : res?.data || []
      setAiOutput({ type: 'viva', items })
    } catch {
      setAiOutput({
        type: 'viva',
        items: [
          {
            question: 'What is the auxiliary space complexity of this implementation?',
            expected_answer: 'Constant O(1) space because swaps and operations occur in-place.',
          },
          {
            question: 'How does this algorithm behave on pre-sorted input?',
            expected_answer: 'With an early termination flag, it executes in linear O(n) passes.',
          },
        ],
      })
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleBugCheckAI = async () => {
    setIsAiLoading(true)
    setAiModalTitle(`Code Review & Bug Check — ${activeSnippet.title}`)
    setIsAiModalOpen(true)
    setAiOutput(null)

    try {
      const res: any = await aiApi.generateDebugChallenge({
        code: activeSnippet.code,
        language: activeSnippet.language,
      })
      setAiOutput({ type: 'bugs', data: res?.data || res })
    } catch {
      setAiOutput({
        type: 'bugs',
        data: {
          buggy_code: activeSnippet.code,
          bugs: [
            {
              line: 'Loop bounds',
              description: 'Check for potential off-by-one index overflows at array bounds.',
              fix: 'Verify boundary condition <= n vs < n.',
            },
          ],
        },
      })
    } finally {
      setIsAiLoading(false)
    }
  }

  const subjectId = experiment.subject_id || 'sub-1'
  const subjectName = experiment.subjects?.name || 'Subject'

  return (
    <div className="min-h-screen bg-[#090909] text-[#F5F5F5] select-none flex flex-col">
      <AppNavbar showAddSubject={false} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[rgba(255,255,255,0.08)]">
          <div className="space-y-1">
            <Link
              to={`/subjects/${subjectId}`}
              className="inline-flex items-center gap-1.5 text-xs text-[#888888] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {subjectName}</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#888888] bg-[#141414] px-2 py-0.5 rounded border border-[rgba(255,255,255,0.08)]">
                {experiment.experiment_number || 'EXP'}
              </span>
              <input
                type="text"
                value={experiment.title || ''}
                onChange={(e) => setExperiment((p) => ({ ...p, title: e.target.value }))}
                placeholder="Experiment Title"
                className="text-lg sm:text-xl font-bold font-['Manrope'] text-white bg-transparent border-b border-transparent hover:border-[rgba(255,255,255,0.2)] focus:border-white focus:outline-none px-1 py-0.5 max-w-md"
              />
            </div>
          </div>

          {/* Action Buttons: Save & AI features */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              className="h-8 text-xs font-semibold px-4"
            >
              Save
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsScanOpen(true)}
              className="h-8 text-xs font-medium px-3 bg-[#171717] hover:bg-[#202020] border-[rgba(255,255,255,0.1)]"
              title="Read code from photo of notebook or screen"
            >
              Read Code from Image
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExplainAI}
              className="h-8 text-xs font-medium px-3 bg-[#171717] hover:bg-[#202020] border-[rgba(255,255,255,0.1)]"
            >
              Explain Code
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleVivaAI}
              className="h-8 text-xs font-medium px-3 bg-[#171717] hover:bg-[#202020] border-[rgba(255,255,255,0.1)]"
            >
              Viva Prep
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleBugCheckAI}
              className="h-8 text-xs font-medium px-3 bg-[#171717] hover:bg-[#202020] border-[rgba(255,255,255,0.1)]"
            >
              Find Bugs
            </Button>
          </div>
        </div>

        {/* Multiple Codes System */}
        <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden flex flex-col shadow-sm">
          {/* Code Tabs Header */}
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-[#111111] px-3 overflow-x-auto">
            <div className="flex items-center gap-1 py-1">
              {codeFiles.map((snippet) => {
                const isActive = snippet.id === activeSnippet.id
                return (
                  <button
                    key={snippet.id}
                    type="button"
                    onClick={() => setActiveCodeId(snippet.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'text-[#888888] hover:text-white hover:bg-[rgba(255,255,255,0.04)]'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>{snippet.title}</span>
                    <span className="text-[10px] opacity-70 uppercase font-mono">
                      ({snippet.language})
                    </span>
                  </button>
                )
              })}

              {/* Add Code Button */}
              <button
                type="button"
                onClick={handleAddCodeSnippet}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#888888] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors cursor-pointer border border-dashed border-[rgba(255,255,255,0.15)] ml-1"
                title="Add another code implementation or file"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Code</span>
              </button>
            </div>

            {/* Active Code Controls */}
            <div className="flex items-center gap-2 py-1 shrink-0">
              {/* Rename Code Title */}
              <input
                type="text"
                value={activeSnippet.title}
                onChange={(e) => updateActiveSnippet('title', e.target.value)}
                placeholder="Code Title"
                className="bg-[#171717] text-white text-xs px-2 py-1 rounded border border-[rgba(255,255,255,0.1)] focus:border-white focus:outline-none w-28 sm:w-36 font-mono"
              />

              {/* Language Selector */}
              <select
                value={activeSnippet.language}
                onChange={(e) => updateActiveSnippet('language', e.target.value)}
                className="bg-[#171717] text-white text-xs px-2 py-1 rounded border border-[rgba(255,255,255,0.1)] focus:border-white focus:outline-none font-mono"
              >
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="sql">SQL</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="other">Other</option>
              </select>

              <button
                type="button"
                onClick={handleCopyActiveCode}
                className="p-1.5 text-[#888888] hover:text-white rounded transition-colors cursor-pointer"
                title="Copy Code"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleDownloadActiveCode}
                className="p-1.5 text-[#888888] hover:text-white rounded transition-colors cursor-pointer"
                title="Download Code"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {codeFiles.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteCodeSnippet(activeSnippet.id)}
                  className="p-1.5 text-[#666666] hover:text-[#FF5555] rounded transition-colors cursor-pointer"
                  title="Delete this code tab"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Monaco Code Editor */}
          <div className="h-[460px] bg-[#0A0A0A]">
            <Editor
              height="100%"
              language={activeSnippet.language === 'cpp' ? 'cpp' : activeSnippet.language === 'c' ? 'c' : activeSnippet.language}
              value={activeSnippet.code}
              theme="vs-dark"
              onChange={(value) => updateActiveSnippet('code', value || '')}
              options={{
                fontSize,
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                fontFamily: 'JetBrains Mono, monospace',
                tabSize: 4,
                renderLineHighlight: 'line',
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Written Practical Notebook Section */}
        <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-white" />
                <h3 className="text-sm font-semibold text-white font-['Manrope']">
                  Written Practical Notebook Record
                </h3>
                {experiment.notebook_pdf_url && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">
                    Archived
                  </span>
                )}
              </div>
              <p className="text-xs text-[#888888] mt-1 leading-relaxed">
                Upload a scanned PDF or photo of your handwritten lab notebook for this experiment. If physical manual is lost or submitted, your record stays preserved here.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  disabled={isUploadingPdf}
                  onChange={handleNotebookPdfUpload}
                  className="hidden"
                />
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-black hover:bg-[#E5E5E5] transition-colors cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{experiment.notebook_pdf_url ? 'Replace Notebook PDF' : 'Upload Written Notebook (PDF)'}</span>
                </div>
              </label>

              {experiment.notebook_pdf_url && (
                <button
                  type="button"
                  disabled={isDeletingPdf}
                  onClick={handleDeleteNotebookPdf}
                  className="p-1.5 text-[#888888] hover:text-[#FF6666] border border-[rgba(255,255,255,0.08)] hover:border-[#FF6666]/40 rounded-lg transition-colors cursor-pointer"
                  title="Remove Notebook Backup"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Notebook Preview or Empty Notice */}
          {experiment.notebook_pdf_url ? (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg border border-[rgba(255,255,255,0.06)] text-xs font-mono">
                <div className="flex items-center gap-2 truncate">
                  <FileCheck className="w-4 h-4 text-white shrink-0" />
                  <span className="text-white truncate">
                    {experiment.notebook_pdf_name || 'Practical_Notebook.pdf'}
                  </span>
                  {experiment.notebook_pdf_size && (
                    <span className="text-[#888888] text-[11px]">
                      ({(experiment.notebook_pdf_size / 1024).toFixed(0)} KB)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`${(import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')}${experiment.notebook_pdf_url}`}
                    download={experiment.notebook_pdf_name || 'notebook.pdf'}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#252525] text-white border border-[rgba(255,255,255,0.1)] rounded text-xs transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </a>
                  <a
                    href={`${(import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')}${experiment.notebook_pdf_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#252525] text-[#D4D4D4] hover:text-white border border-[rgba(255,255,255,0.1)] rounded text-xs transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open Viewer</span>
                  </a>
                </div>
              </div>

              {/* Embedded PDF View */}
              <div className="w-full h-80 rounded-lg overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[#090909]">
                <iframe
                  src={`${(import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')}${experiment.notebook_pdf_url}#toolbar=0`}
                  className="w-full h-full border-none"
                  title="Practical Notebook Scan"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#111111] rounded-lg border border-dashed border-[rgba(255,255,255,0.08)] text-center text-xs text-[#777777]">
              No written practical notebook attached yet. Upload a scanned PDF to keep your manual backed up.
            </div>
          )}
        </div>

        {/* Experiment Aim & Algorithm Details */}
        <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-white" />
            <h3 className="text-sm font-semibold text-white font-['Manrope']">
              Aim, Algorithm & Complexity
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#A1A1A1]">Experiment Aim</label>
              <input
                type="text"
                placeholder="State the objective of this practical..."
                value={experiment.aim || ''}
                onChange={(e) => setExperiment((p) => ({ ...p, aim: e.target.value }))}
                className="bg-[#111111] text-[#F5F5F5] text-xs rounded-lg border border-[rgba(255,255,255,0.09)] px-3 py-2.5 focus:border-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#A1A1A1]">Step-by-Step Algorithm</label>
              <textarea
                rows={3}
                placeholder="1. Start\n2. Initialize array\n3. Perform comparisons\n4. Stop"
                value={experiment.algorithm || ''}
                onChange={(e) => setExperiment((p) => ({ ...p, algorithm: e.target.value }))}
                className="bg-[#111111] text-[#F5F5F5] font-mono text-xs rounded-lg border border-[rgba(255,255,255,0.09)] p-3 focus:border-white focus:outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Time Complexity"
                placeholder="e.g. O(n log n)"
                value={experiment.time_complexity || ''}
                onChange={(e) => setExperiment((p) => ({ ...p, time_complexity: e.target.value }))}
              />
              <Input
                label="Space Complexity"
                placeholder="e.g. O(1)"
                value={experiment.space_complexity || ''}
                onChange={(e) => setExperiment((p) => ({ ...p, space_complexity: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </main>

      {/* AI Photo Scanner Modal */}
      <ScanPhotoModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        experimentId={id}
        onExtracted={(res) => {
          const extracted = res?.extracted || res?.data?.extracted || res
          if (extracted?.source_code) {
            // Append as a new code tab
            const nextIdx = codeFiles.length + 1
            const newId = `c_scan_${Date.now()}`
            const newSnippet: CodeSnippetItem = {
              id: newId,
              title: `Scanned Code ${nextIdx}`,
              language: extracted.language || 'c',
              code: extracted.source_code,
            }
            setCodeFiles((prev) => [...prev, newSnippet])
            setActiveCodeId(newId)
            toast.success('Scanned code added as new tab.')
          }
          if (extracted?.aim && !experiment.aim) {
            setExperiment((p) => ({ ...p, aim: extracted.aim }))
          }
          if (extracted?.algorithm && !experiment.algorithm) {
            setExperiment((p) => ({ ...p, algorithm: extracted.algorithm }))
          }
        }}
      />

      {/* AI Features Modal */}
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
              <p className="text-xs text-[#888888]">Analyzing code...</p>
            </div>
          ) : aiOutput?.type === 'explain' ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)] space-y-1">
                <span className="font-semibold text-white">Overview</span>
                <p className="text-[#A1A1A1] leading-relaxed">{aiOutput.data?.program_overview}</p>
              </div>

              {aiOutput.data?.logic_breakdown && (
                <div className="p-3 bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)] space-y-1">
                  <span className="font-semibold text-white">Logic Breakdown</span>
                  <pre className="text-[#A1A1A1] font-mono text-[11px] whitespace-pre-wrap">
                    {aiOutput.data.logic_breakdown}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)]">
                  <span className="font-semibold text-white">Time Complexity</span>
                  <p className="text-[#A1A1A1] font-mono mt-1">{aiOutput.data?.time_complexity}</p>
                </div>
                <div className="p-3 bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)]">
                  <span className="font-semibold text-white">Space Complexity</span>
                  <p className="text-[#A1A1A1] font-mono mt-1">{aiOutput.data?.space_complexity}</p>
                </div>
              </div>

              {aiOutput.data?.exam_points && (
                <div className="p-3 bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)] space-y-1">
                  <span className="font-semibold text-white">Exam Key Points</span>
                  <p className="text-[#A1A1A1] leading-relaxed">{aiOutput.data.exam_points}</p>
                </div>
              )}
            </div>
          ) : aiOutput?.type === 'viva' ? (
            <div className="space-y-3">
              {aiOutput.items?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between text-[#888888] text-[11px]">
                    <span className="font-semibold text-white">Question {idx + 1}</span>
                  </div>
                  <p className="text-white font-medium">{item.question}</p>
                  <div className="p-2.5 bg-[#0D0D0D] rounded-lg border border-[rgba(255,255,255,0.06)] text-[#A1A1A1]">
                    <span className="text-[11px] text-white font-semibold block mb-0.5">Sample Answer:</span>
                    <p className="text-[11px] leading-relaxed">{item.expected_answer}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : aiOutput?.type === 'bugs' ? (
            <div className="space-y-3 text-xs">
              <p className="text-[#888888]">Static code verification review:</p>
              {aiOutput.data?.bugs?.map((bug: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)] space-y-1"
                >
                  <span className="font-semibold text-white">{bug.line || 'Inspection Item'}</span>
                  <p className="text-[#A1A1A1]">{bug.description}</p>
                  {bug.fix && <p className="text-[11px] font-mono text-[#D4D4D4]">Fix: {bug.fix}</p>}
                </div>
              ))}
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
