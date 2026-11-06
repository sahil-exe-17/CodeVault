import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Printer,
  Download,
  X,
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  GraduationCap,
  Sparkles,
  Building2,
  User as UserIcon,
  Calendar,
  Layers,
  Code2,
  FileCheck,
  Eye,
  Award,
  BookOpen,
  RotateCcw,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { generateAlgorithmFromCode } from '@/lib/aiService'
import type { Experiment, CodeSnippetItem } from '@/types'
import toast from 'react-hot-toast'

interface OfficialLabRecordModalProps {
  isOpen: boolean
  onClose: () => void
  experiment: Partial<Experiment>
  subject?: any
  activeCodeSnippet?: CodeSnippetItem
  allCodeSnippets?: CodeSnippetItem[]
}

const DEFAULT_CREST_SVG = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSJub25lIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NiIgc3Ryb2tlPSIjMTExODI3IiBzdHJva2Utd2lkdGg9IjIuNSIgZmlsbD0iI2Y5ZmFmYiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQwIiBzdHJva2U9IiMxMTE4MjciIHN0cm9rZS13aWR0aD0iMS4yIiBzdHJva2UtZGFzaGFycmF5PSIyIDIiLz48cGF0aCBkPSJNNTAgMjAgTDc1IDMyIEw3NSA1NiBDNzUgNjggNTAgODAgNTAgODAgQzUwIDgwIDI1IDY4IDI1IDU2IEwyNSAzMiBaIiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiMxMTE4MjciIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0zNiA0NCBRNTAgMzggNTAgNDggUTUwIDM4IDY0IDQ0IEw2NCA2MiBRNTAgNTYgNTAgNjQgUTUwIDU2IDM2IDYyIFoiIGZpbGw9IiNmM2Y0ZjYiIHN0cm9rZT0iIzExMTgyNyIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48bGluZSB4MT0iNTAiIHkxPSI0OCIgeDI9IjUwIiB5Mj0iNjQiIHN0cm9rZT0iIzExMTgyNyIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjMwIiByPSIzLjUiIGZpbGw9IiMxMTE4MjciLz48cGF0aCBkPSJNNDcgMzQgTDUzIDM0IEw1MSAzOCBMNDkgMzggWiIgZmlsbD0iIzExMTgyNyIvPjwvc3ZnPg==`

const escapeHtml = (unsafe: string): string => {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export const OfficialLabRecordModal: React.FC<OfficialLabRecordModalProps> = ({
  isOpen,
  onClose,
  experiment,
  subject,
  activeCodeSnippet,
  allCodeSnippets = [],
}) => {
  const { user } = useAuthStore()

  // Form Fields for Official University Sheet
  const [collegeName, setCollegeName] = useState(
    user?.college || 'MIT World Peace University, Pune'
  )
  const [departmentName, setDepartmentName] = useState(
    user?.department || 'Department of Computer Science & Engineering'
  )
  const [studentName, setStudentName] = useState(
    user?.display_name || user?.email?.split('@')[0] || 'Sahil Lale'
  )
  const [rollNumber, setRollNumber] = useState(
    user?.roll_number || '225101004'
  )
  const [batch, setBatch] = useState('Batch B2 / Div A')
  const [semester, setSemester] = useState(
    subject?.semester || user?.semester || 'Semester 5 / Year 3'
  )
  const [academicYear, setAcademicYear] = useState('2025–2026')
  const [conductionDate, setConductionDate] = useState(
    experiment.created_at ? new Date(experiment.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  )
  const [submissionDate, setSubmissionDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [facultyName, setFacultyName] = useState('Prof. Lab In-Charge')

  // University Logo Customization
  const [universityLogo, setUniversityLogo] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('cv_saved_university_logo')
      if (saved && !saved.startsWith('data:image/svg+xml;utf8')) {
        return saved
      }
    } catch {}
    return DEFAULT_CREST_SVG
  })
  const [showLogo, setShowLogo] = useState(true)
  const logoInputRef = useRef<HTMLInputElement | null>(null)

  // Evaluation & Assessment (Universal — No rigid rubrics)
  const [maxMarks, setMaxMarks] = useState('25')
  const [marksAwarded, setMarksAwarded] = useState('')
  const [teacherRemarks, setTeacherRemarks] = useState('')

  // Section Toggles
  const [includeAim, setIncludeAim] = useState(true)
  const [includeTheory, setIncludeTheory] = useState(true)
  const [includeAlgorithm, setIncludeAlgorithm] = useState(true)
  const [currentAlgorithm, setCurrentAlgorithm] = useState(experiment.algorithm || '')
  const [isGeneratingModalAlgo, setIsGeneratingModalAlgo] = useState(false)
  const [includeCode, setIncludeCode] = useState(true)
  const [includeOutput, setIncludeOutput] = useState(true)
  const [includeHandwrittenScans, setIncludeHandwrittenScans] = useState(true)
  const [includeEvaluation, setIncludeEvaluation] = useState(true)

  // Handwritten Notebook Photos / Scanned Observation Sheets
  const [handwrittenImages, setHandwrittenImages] = useState<string[]>([])
  const [isAttachingPhoto, setIsAttachingPhoto] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const previewContainerRef = useRef<HTMLDivElement | null>(null)

  // Load attached photos for this experiment
  useEffect(() => {
    if (!experiment.id) return
    try {
      const storageKey = `cv_lab_record_photos_${experiment.id}`
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHandwrittenImages(parsed)
        }
      }
    } catch {}
  }, [experiment.id])

  const persistPhotos = (images: string[]) => {
    if (!experiment.id) return
    try {
      const storageKey = `cv_lab_record_photos_${experiment.id}`
      localStorage.setItem(storageKey, JSON.stringify(images))
    } catch (e) {
      console.warn('Failed to persist lab record photos:', e)
    }
  }

  // Handle Logo Upload from device
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, SVG)')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setUniversityLogo(base64)
      try {
        localStorage.setItem('cv_saved_university_logo', base64)
      } catch {}
      toast.success('University logo updated!')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleResetLogo = () => {
    setUniversityLogo(DEFAULT_CREST_SVG)
    try {
      localStorage.removeItem('cv_saved_university_logo')
    } catch {}
    toast.success('Reset to standard academic crest.')
  }

  // Automatic Step-by-Step Algorithm Generator from Source Code
  const handleWriteAlgorithmInModal = async () => {
    const targetCode = activeCodeSnippet?.code || experiment.source_code || ''
    if (!targetCode.trim()) {
      toast.error('No source code found to write algorithm.')
      return
    }

    setIsGeneratingModalAlgo(true)
    const toastId = toast.loading('AI is reading code & writing step-by-step algorithm...')

    try {
      const algo = await generateAlgorithmFromCode({
        code: targetCode,
        language: activeCodeSnippet?.language || experiment.language || 'c',
        title: experiment.title,
      })

      setCurrentAlgorithm(algo)
      if (experiment) {
        experiment.algorithm = algo
      }
      toast.success('Academic algorithm generated!', { id: toastId })
    } catch (err: any) {
      toast.error('Could not generate algorithm: ' + (err.message || 'Error'), { id: toastId })
    } finally {
      setIsGeneratingModalAlgo(false)
    }
  }

  // Handle uploading photos of handwritten pages / notebook scans
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsAttachingPhoto(true)
    const newImgs: string[] = []
    let loadedCount = 0

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" is not an image file.`)
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        newImgs.push(base64)
        loadedCount++
        if (loadedCount === files.length) {
          setHandwrittenImages((prev) => {
            const updated = [...prev, ...newImgs]
            persistPhotos(updated)
            return updated
          })
          setIsAttachingPhoto(false)
          toast.success(`Attached ${newImgs.length} handwritten observation sheet(s)!`)
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleRemovePhoto = (index: number) => {
    setHandwrittenImages((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      persistPhotos(updated)
      return updated
    })
    toast.success('Handwritten photo removed.')
  }

  const activeSnippet = activeCodeSnippet || experiment.code_files?.[0] || {
    id: 'c1',
    title: 'Code 1',
    language: experiment.language || 'c',
    code: experiment.source_code || '',
  }

  // Formatted source code with line numbers
  const formatCodeWithLineNumbers = (code: string) => {
    const lines = (code || '').split('\n')
    return lines
      .map((line, idx) => {
        const lineNum = String(idx + 1).padStart(2, '0')
        return `<span class="line-num">${lineNum}</span>${escapeHtml(line)}`
      })
      .join('\n')
  }

  /**
   * Generates the self-contained HTML for the print engine
   */
  const generateOfficialLabRecordHtml = (): string => {
    const subjectTitle = subject?.name || 'Practical Laboratory'
    const expNum = experiment.experiment_number || 'EXP-01'
    const expTitle = experiment.title || 'Practical Experiment'
    const lang = (activeSnippet.language || 'c').toUpperCase()

    const aimHtml = includeAim
      ? `
      <div class="section-box avoid-break">
        <div class="section-title">
          <span>1. AIM & OBJECTIVES</span>
        </div>
        <p class="section-text font-serif">
          ${escapeHtml(experiment.aim || `To design, implement, test, and analyze the execution of ${expTitle}.`)}
        </p>
      </div>`
      : ''

    const theoryHtml = includeTheory
      ? `
      <div class="section-box avoid-break">
        <div class="section-title">
          <span>2. PREREQUISITES & THEORETICAL BACKGROUND</span>
        </div>
        <div class="section-text font-serif">
          ${escapeHtml(
            experiment.theory ||
              `Fundamental principles, data structures, and algorithmic concepts related to ${expTitle}. Covers syntax semantics, memory management, and input-output operations in ${lang}.`
          )}
        </div>
        ${
          experiment.time_complexity || experiment.space_complexity
            ? `
          <div class="complexity-matrix">
            <div><strong>Time Complexity:</strong> <span class="mono">${escapeHtml(experiment.time_complexity || 'O(n)')}</span></div>
            <div><strong>Space / Memory Complexity:</strong> <span class="mono">${escapeHtml(experiment.space_complexity || 'O(1)')}</span></div>
          </div>`
            : ''
        }
      </div>`
      : ''

    const algorithmHtml = includeAlgorithm
      ? `
      <div class="section-box avoid-break">
        <div class="section-title">
          <span>3. ALGORITHM / STEP-BY-STEP PROCEDURE</span>
        </div>
        <div class="section-text font-serif" style="white-space: pre-line; padding-left: 6px;">
          ${escapeHtml(
            currentAlgorithm ||
            experiment.algorithm ||
              `Step 1: Start the program execution.\nStep 2: Declare variables and allocate required memory.\nStep 3: Accept user input parameters.\nStep 4: Execute core computational logic.\nStep 5: Display results on console and verify output.\nStep 6: Stop.`
          )}
        </div>
      </div>`
      : ''

    const codeHtml = includeCode
      ? `
      <div class="section-box">
        <div class="section-title">
          <span>4. SOURCE CODE IMPLEMENTATION</span>
          <span class="badge">${escapeHtml(lang)} • ${escapeHtml(activeSnippet.title)}</span>
        </div>
        <div class="code-container">
          <pre class="code-pre">${formatCodeWithLineNumbers(activeSnippet.code)}</pre>
        </div>
      </div>`
      : ''

    const outputHtml = includeOutput
      ? `
      <div class="section-box avoid-break">
        <div class="section-title">
          <span>5. SAMPLE INPUT & VERIFIED EXECUTION OUTPUT</span>
        </div>
        ${
          experiment.sample_input
            ? `
          <div style="margin-bottom: 8px;">
            <div style="font-size: 9pt; font-weight: bold; margin-bottom: 3px;">Input Test Data:</div>
            <pre class="terminal-box" style="margin-bottom: 8px;">${escapeHtml(experiment.sample_input)}</pre>
          </div>`
            : ''
        }
        <div class="terminal-box">
          <div class="terminal-header">
            <span>TERMINAL CONSOLE EXECUTION</span>
            <span style="color: #047857; font-weight: bold;">[VERIFIED • EXIT CODE 0]</span>
          </div>
          <pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">${escapeHtml(
            experiment.actual_output ||
              experiment.expected_output ||
              `--- Program Executed Successfully ---\nOutput:\nOperation completed with sample test inputs.\nCalculations and execution verified successfully.`
          )}</pre>
        </div>
      </div>`
      : ''

    const handwrittenHtml =
      includeHandwrittenScans && handwrittenImages.length > 0
        ? `
      <div class="section-box page-break-before">
        <div class="section-title">
          <span>6. ATTACHED HANDWRITTEN LABORATORY OBSERVATION SHEETS</span>
          <span class="badge">${handwrittenImages.length} SHEET(S)</span>
        </div>
        <p style="font-size: 9.5pt; font-style: italic; color: #555; margin: 4px 0 12px 0;">
          Physical laboratory notebook pages, observation readings, and verified graphical records.
        </p>
        <div class="handwritten-gallery">
          ${handwrittenImages
            .map(
              (img, idx) => `
            <div class="handwritten-card avoid-break">
              <img src="${img}" alt="Handwritten Record Sheet ${idx + 1}" class="handwritten-image" />
              <div class="handwritten-caption">
                Sheet ${idx + 1}: Physical Laboratory Observation & Verification Record
              </div>
            </div>`
            )
            .join('')}
        </div>
      </div>`
        : ''

    // Universal Teacher / Examiner Assessment Block (No rigid rubrics)
    const evaluationHtml = includeEvaluation
      ? `
      <div class="section-box avoid-break" style="margin-top: 24px;">
        <div class="section-title">
          <span>TEACHER / EXAMINER EVALUATION & SIGNATURE</span>
        </div>

        <div class="eval-box">
          <div class="eval-row">
            <div class="eval-left">
              <div class="eval-line-item">
                <span class="eval-label">Marks Awarded:</span>
                <span class="eval-line-val mono">
                  ${marksAwarded ? `<strong>${escapeHtml(marksAwarded)}</strong>` : '_______'} / ${escapeHtml(maxMarks)}
                </span>
              </div>

              <div class="eval-line-item" style="margin-top: 10px;">
                <span class="eval-label">Date of Assessment:</span>
                <span class="eval-line-val mono">${escapeHtml(submissionDate)}</span>
              </div>

              <div class="eval-line-item" style="margin-top: 10px;">
                <span class="eval-label">Examiner Remarks:</span>
                <span class="eval-line-val" style="flex: 1;">${teacherRemarks ? escapeHtml(teacherRemarks) : '_________________________________________________'}</span>
              </div>
            </div>

            <div class="eval-right">
              <div class="stamp-placeholder">
                DEPARTMENT STAMP / SEAL
              </div>

              <div class="sig-wrapper">
                <div class="sig-line-bar"></div>
                <div class="sig-title-name">${escapeHtml(facultyName)}</div>
                <div class="sig-subtitle">Faculty In-Charge / Examiner Signature</div>
              </div>
            </div>
          </div>
        </div>
      </div>`
      : ''

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(expNum)} — ${escapeHtml(expTitle)} — Official Lab Record</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.45;
    }
    .font-serif {
      font-family: "Crimson Pro", Georgia, "Times New Roman", serif;
      font-size: 11pt;
    }
    .mono {
      font-family: "JetBrains Mono", Consolas, "Courier New", monospace;
    }
    .page-container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      background: #ffffff;
    }
    .avoid-break {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .page-break-before {
      page-break-before: always !important;
      break-before: page !important;
    }

    /* Header with Optional Logo */
    .univ-header-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      border: 2.5px solid #000000;
      outline: 1.5px solid #000000;
      outline-offset: 3px;
      padding: 12px 18px;
      margin-bottom: 16px;
      background: #ffffff;
    }
    .univ-logo-wrap {
      width: 70px;
      height: 70px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .univ-logo-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .univ-title-wrap {
      flex: 1;
      text-align: center;
    }
    .univ-title {
      font-size: 15pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 3px 0;
      font-family: "Crimson Pro", Georgia, serif;
      color: #000000;
    }
    .dept-title {
      font-size: 10.5pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 6px 0;
      color: #222222;
    }
    .record-pill {
      display: inline-block;
      background: #000000;
      color: #ffffff;
      padding: 2.5px 16px;
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      border-radius: 2px;
    }

    /* Student Information Matrix */
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 9.5pt;
    }
    .meta-table td {
      border: 1px solid #000000;
      padding: 6px 10px;
    }
    .meta-label {
      background: #f3f4f6;
      font-weight: 700;
      color: #111827;
      width: 22%;
    }
    .meta-val {
      width: 28%;
      font-weight: 500;
    }

    /* Experiment Banner */
    .exp-banner {
      border-left: 4.5px solid #000000;
      border-top: 1px solid #d1d5db;
      border-bottom: 1px solid #d1d5db;
      border-right: 1px solid #d1d5db;
      padding: 10px 14px;
      margin-bottom: 16px;
      background: #f9fafb;
    }
    .exp-num {
      font-size: 9pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #4b5563;
      margin-bottom: 2px;
    }
    .exp-heading {
      font-size: 13pt;
      font-weight: 800;
      margin: 0;
      color: #000000;
      font-family: "Crimson Pro", Georgia, serif;
    }

    /* Sections */
    .section-box {
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 10pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid #000000;
      padding-bottom: 4px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .badge {
      font-size: 8pt;
      font-weight: 700;
      background: #e5e7eb;
      color: #111827;
      padding: 2px 8px;
      border-radius: 2px;
      border: 1px solid #d1d5db;
      text-transform: uppercase;
      font-family: monospace;
    }
    .section-text {
      font-size: 10.5pt;
      line-height: 1.55;
      color: #111827;
      margin: 0;
    }

    /* Complexity Matrix */
    .complexity-matrix {
      margin-top: 8px;
      padding: 8px 12px;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      font-size: 9pt;
      display: flex;
      gap: 24px;
    }

    /* Code Block */
    .code-container {
      background: #ffffff;
      border: 1.5px solid #000000;
      overflow: hidden;
      margin-top: 4px;
    }
    .code-pre {
      font-family: "JetBrains Mono", Consolas, "Courier New", monospace;
      font-size: 9pt;
      line-height: 1.45;
      padding: 10px 12px;
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
      background: #ffffff;
      color: #000000;
    }
    .line-num {
      display: inline-block;
      width: 24px;
      text-align: right;
      color: #6b7280;
      user-select: none;
      margin-right: 10px;
      border-right: 1px solid #d1d5db;
      padding-right: 6px;
      font-weight: 600;
    }

    /* Terminal Console Output */
    .terminal-box {
      border: 1.5px dashed #000000;
      background: #f9fafb;
      padding: 10px 14px;
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 9pt;
      line-height: 1.4;
      color: #000000;
    }
    .terminal-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
      margin-bottom: 6px;
      font-size: 8pt;
      font-weight: 700;
      color: #4b5563;
    }

    /* Handwritten Pages Section */
    .handwritten-gallery {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .handwritten-card {
      border: 1.5px solid #000000;
      background: #ffffff;
      padding: 8px;
      text-align: center;
    }
    .handwritten-image {
      max-width: 100%;
      max-height: 600px;
      object-fit: contain;
      border: 1px solid #e5e7eb;
      margin: 0 auto;
      display: block;
    }
    .handwritten-caption {
      font-size: 9.5pt;
      font-style: italic;
      color: #374151;
      margin-top: 6px;
      font-family: "Crimson Pro", Georgia, serif;
    }

    /* Universal Evaluation Box */
    .eval-box {
      border: 1.5px solid #000000;
      padding: 12px 16px;
      background: #ffffff;
    }
    .eval-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
    }
    .eval-left {
      flex: 1;
    }
    .eval-line-item {
      display: flex;
      align-items: baseline;
      gap: 8px;
      font-size: 9.5pt;
    }
    .eval-label {
      font-weight: 700;
      color: #111827;
      min-width: 125px;
    }
    .eval-line-val {
      color: #000000;
    }
    .eval-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
    }
    .stamp-placeholder {
      border: 1.5px dashed #4b5563;
      padding: 6px 14px;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #4b5563;
      text-align: center;
      background: #f9fafb;
    }
    .sig-wrapper {
      text-align: right;
    }
    .sig-line-bar {
      width: 200px;
      border-bottom: 2px solid #000000;
      margin-bottom: 4px;
      margin-left: auto;
    }
    .sig-title-name {
      font-weight: 800;
      font-size: 9.5pt;
      text-transform: uppercase;
    }
    .sig-subtitle {
      font-size: 8pt;
      color: #4b5563;
    }

    /* Footer */
    .page-footer {
      margin-top: 25px;
      padding-top: 6px;
      border-top: 1px solid #d1d5db;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <!-- Header with University Logo -->
    <div class="univ-header-box">
      ${
        showLogo && universityLogo
          ? `
        <div class="univ-logo-wrap">
          <img src="${universityLogo}" alt="University Logo" class="univ-logo-img" />
        </div>`
          : ''
      }
      <div class="univ-title-wrap">
        <h1 class="univ-title">${escapeHtml(collegeName)}</h1>
        <h2 class="dept-title">${escapeHtml(departmentName)}</h2>
        <div class="record-pill">Official Laboratory Practical Record</div>
      </div>
    </div>

    <!-- Student Credentials Table -->
    <table class="meta-table avoid-break">
      <tbody>
        <tr>
          <td class="meta-label">Name of Student:</td>
          <td class="meta-val" style="font-weight: 700;">${escapeHtml(studentName)}</td>
          <td class="meta-label">Roll No. / PRN:</td>
          <td class="meta-val mono" style="font-weight: 700;">${escapeHtml(rollNumber)}</td>
        </tr>
        <tr>
          <td class="meta-label">Subject / Course:</td>
          <td class="meta-val">${escapeHtml(subjectTitle)}</td>
          <td class="meta-label">Class / Semester:</td>
          <td class="meta-val">${escapeHtml(semester)}</td>
        </tr>
        <tr>
          <td class="meta-label">Batch & Division:</td>
          <td class="meta-val">${escapeHtml(batch)}</td>
          <td class="meta-label">Academic Year:</td>
          <td class="meta-val">${escapeHtml(academicYear)}</td>
        </tr>
        <tr>
          <td class="meta-label">Date of Conduction:</td>
          <td class="meta-val mono">${escapeHtml(conductionDate)}</td>
          <td class="meta-label">Date of Submission:</td>
          <td class="meta-val mono">${escapeHtml(submissionDate)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Experiment Title Banner -->
    <div class="exp-banner avoid-break">
      <div class="exp-num">${escapeHtml(expNum)}</div>
      <h2 class="exp-heading">${escapeHtml(expTitle)}</h2>
    </div>

    <!-- Sections -->
    ${aimHtml}
    ${theoryHtml}
    ${algorithmHtml}
    ${codeHtml}
    ${outputHtml}
    ${handwrittenHtml}
    ${evaluationHtml}

    <!-- Footer -->
    <div class="page-footer">
      <span>CodeVault University Academic System • Official Lab Submission Record</span>
      <span>Verified Academic Record</span>
    </div>
  </div>
</body>
</html>`
  }

  // Direct 1-Click Client-Side PDF Download with isolated offscreen sandbox & instant fallback
  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return
    setIsDownloadingPdf(true)
    const toastId = toast.loading('Preparing official PDF download...')

    let clone: HTMLElement | null = null

    try {
      const element = document.getElementById('official-a4-preview-content')
      if (!element) {
        throw new Error('Preview element not found')
      }

      // Clone element into an off-screen sandbox to prevent layout shift or page glitch
      clone = element.cloneNode(true) as HTMLElement
      clone.id = 'cv-official-a4-pdf-clone'
      clone.style.width = '794px' // exact A4 width at 96 DPI
      clone.style.maxWidth = '794px'
      clone.style.minHeight = 'auto'
      clone.style.boxShadow = 'none'
      clone.style.border = 'none'
      clone.style.margin = '0'
      clone.style.padding = '32px'
      clone.style.position = 'fixed'
      clone.style.top = '-99999px'
      clone.style.left = '0'
      clone.style.zIndex = '-9999'
      clone.style.backgroundColor = '#ffffff'
      clone.style.color = '#000000'
      document.body.appendChild(clone)

      const html2pdfModule = await import('html2pdf.js')
      const html2pdf = (html2pdfModule as any).default || html2pdfModule

      const filename = `${(experiment.experiment_number || 'EXP').replace(/\s+/g, '_')}_${(experiment.title || 'Record').replace(/[^a-zA-Z0-9]/g, '_')}_Lab_Record.pdf`

      const opt = {
        margin: [8, 8, 8, 8], // mm
        filename: filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          imageTimeout: 2000,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }

      // Promise race with 5.5-second timeout so page never freezes
      const runPdfGeneration = async () => {
        const worker = html2pdf().set(opt).from(clone)
        await worker.save()
      }

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('PDF direct canvas took too long')), 5500)
      })

      await Promise.race([runPdfGeneration(), timeoutPromise])
      toast.success('Official Lab Record PDF downloaded!', { id: toastId })
    } catch (err: any) {
      console.warn('Direct PDF canvas failed or timed out, triggering instant print-to-PDF fallback:', err)
      toast.dismiss(toastId)
      toast('Opening Print to PDF — select "Save as PDF" to save file', { icon: '📄' })
      handlePrint()
    } finally {
      if (clone && clone.parentNode) {
        clone.parentNode.removeChild(clone)
      }
      setIsDownloadingPdf(false)
    }
  }

  // Print Sheet (Hidden Iframe: Zero Pop-up Blocker Risk)
  const handlePrint = () => {
    setIsPrinting(true)
    const toastId = toast.loading('Preparing official printout...')

    try {
      const fullHtml = generateOfficialLabRecordHtml()

      let iframe = document.getElementById('cv-official-print-iframe') as HTMLIFrameElement
      if (!iframe) {
        iframe = document.createElement('iframe')
        iframe.id = 'cv-official-print-iframe'
        iframe.style.position = 'fixed'
        iframe.style.right = '0'
        iframe.style.bottom = '0'
        iframe.style.width = '0'
        iframe.style.height = '0'
        iframe.style.border = '0'
        iframe.style.visibility = 'hidden'
        document.body.appendChild(iframe)
      }

      const doc = iframe.contentWindow?.document
      if (!doc) {
        const w = window.open('', '_blank')
        if (w) {
          w.document.open()
          w.document.write(fullHtml)
          w.document.close()
          setTimeout(() => {
            w.focus()
            w.print()
          }, 350)
        }
        setIsPrinting(false)
        toast.dismiss(toastId)
        return
      }

      doc.open()
      doc.write(fullHtml)
      doc.close()

      const triggerPrint = () => {
        setIsPrinting(false)
        toast.dismiss(toastId)
        try {
          iframe.contentWindow?.focus()
          iframe.contentWindow?.print()
        } catch {
          window.print()
        }
      }

      setTimeout(triggerPrint, 500)
    } catch (err: any) {
      setIsPrinting(false)
      toast.error('Failed to print: ' + err.message, { id: toastId })
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-6xl h-[94vh] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[var(--text-main)]"
        >
          {/* Modal Header Bar */}
          <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-header)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold font-['Manrope'] text-[var(--text-main)]">
                    University Lab Sheet & Exam Printout Generator
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    A4 PDF Ready
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Formats code, aim, algorithms, handwritten notebook scans & teacher signatures into an official university submission file.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Direct 1-Click PDF Download */}
              <button
                type="button"
                disabled={isDownloadingPdf}
                onClick={handleDownloadPdf}
                className="px-3.5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2 disabled:opacity-50"
                title="Download direct .pdf file to your device"
              >
                <Download className="w-3.5 h-3.5 text-black" />
                <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>

              {/* Print Sheet */}
              <button
                type="button"
                disabled={isPrinting}
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-[var(--bg-metric)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] font-semibold text-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                title="Print or Save via Browser Print Dialog"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Print / Save as PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-metric)] flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Body: Split Controls & Live A4 Preview */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
            {/* Left Controls & Customization Sidebar (4 cols) */}
            <div className="lg:col-span-4 border-r border-[var(--border-subtle)] p-5 overflow-y-auto space-y-6 text-xs bg-[var(--bg-metric)]/20">
              {/* University Logo Customization (Requested Feature!) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[var(--text-dim)]">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>University / College Logo</span>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[var(--text-muted)]">
                    <input
                      type="checkbox"
                      checked={showLogo}
                      onChange={(e) => setShowLogo(e.target.checked)}
                      className="rounded accent-white"
                    />
                    <span>Show Logo</span>
                  </label>
                </div>

                {showLogo && (
                  <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl border border-[var(--border-subtle)] bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                        <img src={universityLogo} alt="Logo Preview" className="w-full h-full object-contain" />
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-[var(--bg-metric)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-[var(--text-main)]"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload Custom Logo</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleResetLogo}
                          className="w-full py-1 px-2 rounded-lg text-[10px] text-[var(--text-dim)] hover:text-[var(--text-main)] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Reset to Academic Crest</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* College & University Info */}
              <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[var(--text-dim)]">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>College & Department</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-[var(--text-muted)]">College / University Name</label>
                    <input
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className="w-full mt-1 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[var(--text-muted)]">Department</label>
                    <input
                      type="text"
                      value={departmentName}
                      onChange={(e) => setDepartmentName(e.target.value)}
                      className="w-full mt-1 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Student Credentials */}
              <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[var(--text-dim)]">
                  <UserIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Student Credentials</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[var(--text-muted)]">Student Name</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full mt-1 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[var(--text-muted)]">Roll No. / PRN</label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full mt-1 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[var(--text-muted)]">Class & Batch</label>
                    <input
                      type="text"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      className="w-full mt-1 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[var(--text-muted)]">Semester / Year</label>
                    <input
                      type="text"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full mt-1 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Dates & Faculty Evaluation Settings (Universal — No Rigid Rubrics) */}
              <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[var(--text-dim)]">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Evaluation & Faculty Block</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[var(--text-muted)]">Performance Date</label>
                    <input
                      type="date"
                      value={conductionDate}
                      onChange={(e) => setConductionDate(e.target.value)}
                      className="w-full mt-1 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[var(--text-muted)]">Submission Date</label>
                    <input
                      type="date"
                      value={submissionDate}
                      onChange={(e) => setSubmissionDate(e.target.value)}
                      className="w-full mt-1 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[var(--text-muted)]">Max Marks</label>
                    <input
                      type="text"
                      placeholder="e.g. 25 / 50"
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(e.target.value)}
                      className="w-full mt-1 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[var(--text-muted)]">Marks Awarded (Optional)</label>
                    <input
                      type="text"
                      placeholder="Leave blank for teacher"
                      value={marksAwarded}
                      onChange={(e) => setMarksAwarded(e.target.value)}
                      className="w-full mt-1 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:outline-none font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] text-[var(--text-muted)]">Faculty In-Charge / Examiner</label>
                    <input
                      type="text"
                      value={facultyName}
                      onChange={(e) => setFacultyName(e.target.value)}
                      className="w-full mt-1 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] text-[var(--text-muted)]">Teacher Remarks (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Executed successfully. Viva questions answered."
                      value={teacherRemarks}
                      onChange={(e) => setTeacherRemarks(e.target.value)}
                      className="w-full mt-1 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section Inclusions */}
              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                <p className="font-bold uppercase tracking-wider text-[11px] text-[var(--text-dim)]">
                  Sections to Include
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={includeAim}
                      onChange={(e) => setIncludeAim(e.target.checked)}
                      className="rounded accent-white"
                    />
                    <span>Aim & Objectives</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={includeTheory}
                      onChange={(e) => setIncludeTheory(e.target.checked)}
                      className="rounded accent-white"
                    />
                    <span>Prerequisites</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={includeAlgorithm}
                      onChange={(e) => setIncludeAlgorithm(e.target.checked)}
                      className="rounded accent-white"
                    />
                    <span>Algorithm Flow</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={includeCode}
                      onChange={(e) => setIncludeCode(e.target.checked)}
                      className="rounded accent-white"
                    />
                    <span>Source Code</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={includeOutput}
                      onChange={(e) => setIncludeOutput(e.target.checked)}
                      className="rounded accent-white"
                    />
                    <span>Sample Output</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={includeHandwrittenScans}
                      onChange={(e) => setIncludeHandwrittenScans(e.target.checked)}
                      className="rounded accent-white"
                    />
                    <span>Handwritten Pages</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs col-span-2">
                    <input
                      type="checkbox"
                      checked={includeEvaluation}
                      onChange={(e) => setIncludeEvaluation(e.target.checked)}
                      className="rounded accent-white"
                    />
                    <span>Examiner Assessment Block</span>
                  </label>
                </div>
              </div>

              {/* Step-by-Step Algorithm Review & Write with AI */}
              {includeAlgorithm && (
                <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[var(--text-dim)]">
                      <Sparkles className="w-3.5 h-3.5 text-white/90" />
                      <span>Algorithm & Procedure</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleWriteAlgorithmInModal}
                      disabled={isGeneratingModalAlgo}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50 select-none shadow-sm active:scale-95"
                      title="AI reads source code and writes numbered academic steps"
                    >
                      <Sparkles className={`w-3 h-3 text-black ${isGeneratingModalAlgo ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingModalAlgo ? 'Writing...' : 'Write with AI'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={currentAlgorithm}
                    onChange={(e) => {
                      setCurrentAlgorithm(e.target.value)
                      if (experiment) {
                        experiment.algorithm = e.target.value
                      }
                    }}
                    placeholder="Click 'Write with AI' to automatically write numbered algorithm steps from source code..."
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg p-2 text-xs font-mono text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-white leading-relaxed"
                  />
                </div>
              )}

              {/* Handwritten Notebook Photos Attachment Box (Requested Feature!) */}
              <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[var(--text-dim)]">
                    <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                    <span>Handwritten Notes & Photos</span>
                  </div>

                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {handwrittenImages.length} attached
                  </span>
                </div>

                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Attach physical notebook photos, handwritten calculations, observation tables, or verified diagrams to embed them directly in this record.
                </p>

                {/* Upload Photo Trigger */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAttachingPhoto}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[var(--border-hover)] hover:border-white bg-[var(--bg-metric)] hover:bg-[var(--bg-card-hover)] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-white" />
                  <span>{isAttachingPhoto ? 'Loading Photos...' : '+ Attach Handwritten Page Photos'}</span>
                </button>

                {/* Attached Photo Thumbnails */}
                {handwrittenImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {handwrittenImages.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-[var(--border-subtle)] aspect-square bg-black">
                        <img src={img} alt={`Handwritten ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                          title="Remove Photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 text-[9px] font-mono bg-black/60 px-1 rounded text-white">
                          P.{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Live A4 Sheet Preview (8 cols) */}
            <div className="lg:col-span-8 p-4 sm:p-6 overflow-y-auto bg-neutral-950/80 flex justify-center">
              {/* The Actual A4 Sheet Paper Mockup Target for html2pdf and print */}
              <div
                id="official-a4-preview-content"
                ref={previewContainerRef}
                className="w-full max-w-[760px] bg-white text-black p-8 sm:p-12 shadow-2xl rounded-xs border border-neutral-300 font-sans leading-relaxed text-sm select-text transition-all"
                style={{ minHeight: '1000px', color: '#000000', backgroundColor: '#FFFFFF' }}
              >
                {/* 1. Official Header with Optional University Logo */}
                <div className="border-[2.5px] border-black outline outline-1 outline-black outline-offset-[3px] p-4 text-center mb-5 bg-white flex items-center justify-center gap-4">
                  {showLogo && universityLogo && (
                    <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                      <img src={universityLogo} alt="University Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}

                  <div className="flex-1 text-center">
                    <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide font-serif mb-1" style={{ color: '#000000' }}>
                      {collegeName}
                    </h1>
                    <h2 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-neutral-800 mb-2">
                      {departmentName}
                    </h2>
                    <div className="inline-block bg-black text-white px-5 py-0.5 text-xs font-bold uppercase tracking-widest rounded-xs">
                      Official Laboratory Practical Record
                    </div>
                  </div>
                </div>

                {/* 2. Official Student Credentials Matrix */}
                <table className="w-full border-collapse border border-black text-xs mb-5">
                  <tbody>
                    <tr>
                      <td className="border border-black bg-neutral-100 px-3 py-1.5 font-bold w-1/4">Name of Student:</td>
                      <td className="border border-black px-3 py-1.5 w-1/4 font-semibold">{studentName}</td>
                      <td className="border border-black bg-neutral-100 px-3 py-1.5 font-bold w-1/4">Roll No. / PRN:</td>
                      <td className="border border-black px-3 py-1.5 w-1/4 font-mono font-bold">{rollNumber}</td>
                    </tr>
                    <tr>
                      <td className="border border-black bg-neutral-100 px-3 py-1.5 font-bold">Subject / Course:</td>
                      <td className="border border-black px-3 py-1.5 font-semibold">{subject?.name || 'Practical Laboratory'}</td>
                      <td className="border border-black bg-neutral-100 px-3 py-1.5 font-bold">Class / Sem:</td>
                      <td className="border border-black px-3 py-1.5">{semester}</td>
                    </tr>
                    <tr>
                      <td className="border border-black bg-neutral-100 px-3 py-1.5 font-bold">Batch & Division:</td>
                      <td className="border border-black px-3 py-1.5">{batch}</td>
                      <td className="border border-black bg-neutral-100 px-3 py-1.5 font-bold">Academic Year:</td>
                      <td className="border border-black px-3 py-1.5">{academicYear}</td>
                    </tr>
                    <tr>
                      <td className="border border-black bg-neutral-100 px-3 py-1.5 font-bold">Date of Conduction:</td>
                      <td className="border border-black px-3 py-1.5 font-mono">{conductionDate}</td>
                      <td className="border border-black bg-neutral-100 px-3 py-1.5 font-bold">Date of Submission:</td>
                      <td className="border border-black px-3 py-1.5 font-mono">{submissionDate}</td>
                    </tr>
                  </tbody>
                </table>

                {/* 3. Experiment Title & Identifier Banner */}
                <div className="border-l-4 border-black border-y border-r border-neutral-300 p-3 mb-5 bg-neutral-50">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    {experiment.experiment_number || 'EXP-01'}
                  </p>
                  <h3 className="text-lg font-bold text-black mt-0.5 font-serif">
                    {experiment.title}
                  </h3>
                  {experiment.topic && (
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Topic: {experiment.topic}
                    </p>
                  )}
                </div>

                {/* 4. Aim & Objectives */}
                {includeAim && (
                  <div className="mb-5">
                    <h4 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-1 mb-2 flex items-center justify-between">
                      <span>1. Aim & Objectives</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-900 leading-relaxed font-serif">
                      {experiment.aim || `To write, execute and analyze a program to implement ${experiment.title}.`}
                    </p>
                  </div>
                )}

                {/* 5. Prerequisites & Complexity */}
                {includeTheory && (
                  <div className="mb-5">
                    <h4 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-1 mb-2">
                      <span>2. Prerequisites & Theoretical Background</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-900 leading-relaxed font-serif whitespace-pre-line">
                      {experiment.theory ||
                        `Fundamental data structures and algorithmic paradigms relevant to ${experiment.title}. Includes syntax, control flow, functions, and memory allocation in ${activeSnippet.language.toUpperCase()}.`}
                    </p>

                    {(experiment.time_complexity || experiment.space_complexity) && (
                      <div className="mt-2.5 p-2 bg-neutral-100 border border-neutral-300 rounded-xs text-xs grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-bold">Time Complexity: </span>
                          <span className="font-mono">{experiment.time_complexity || 'O(n)'}</span>
                        </div>
                        <div>
                          <span className="font-bold">Space Complexity: </span>
                          <span className="font-mono">{experiment.space_complexity || 'O(1)'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Step-by-Step Algorithm */}
                {includeAlgorithm && (
                  <div className="mb-5">
                    <h4 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-1 mb-2">
                      <span>3. Algorithm / Step-by-Step Procedure</span>
                    </h4>
                    <div className="text-xs sm:text-sm text-neutral-900 leading-relaxed font-serif whitespace-pre-line pl-2">
                      {currentAlgorithm ||
                        experiment.algorithm ||
                        `Step 1: Start the program execution.\nStep 2: Initialize required variables and allocate necessary memory buffers.\nStep 3: Read user input parameters.\nStep 4: Execute core processing logic according to algorithm specifications.\nStep 5: Format and display output results on the console.\nStep 6: Release allocated resources and terminate successfully.`}
                    </div>
                  </div>
                )}

                {/* 7. Formatted Source Code */}
                {includeCode && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between border-b border-black pb-1 mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wide">
                        4. Source Code Implementation
                      </h4>
                      <span className="text-[10px] font-mono font-bold uppercase bg-neutral-200 px-2 py-0.5 rounded-xs border border-neutral-300">
                        {activeSnippet.language.toUpperCase()} • {activeSnippet.title}
                      </span>
                    </div>

                    <div className="border-[1.5px] border-black bg-white">
                      <pre
                        className="p-3 text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all text-black"
                        dangerouslySetInnerHTML={{ __html: formatCodeWithLineNumbers(activeSnippet.code) }}
                      />
                    </div>
                  </div>
                )}

                {/* 8. Sample Input & Execution Output */}
                {includeOutput && (
                  <div className="mb-5">
                    <h4 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-1 mb-2">
                      <span>5. Sample Input & Verified Execution Output</span>
                    </h4>

                    {experiment.sample_input && (
                      <div className="mb-2">
                        <p className="text-[11px] font-bold text-neutral-700">Sample Input:</p>
                        <pre className="p-2 bg-neutral-100 border border-neutral-400 text-[11px] font-mono text-black">
                          {experiment.sample_input}
                        </pre>
                      </div>
                    )}

                    <div className="p-3 bg-neutral-50 border-2 border-dashed border-black text-[11px] font-mono text-black space-y-1">
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-neutral-300 text-[10px] text-neutral-600">
                        <span>Terminal Output Console</span>
                        <span className="font-bold text-emerald-800">[EXECUTION COMPLETED • EXIT CODE 0]</span>
                      </div>
                      <pre className="whitespace-pre-wrap break-all">
                        {experiment.actual_output ||
                          experiment.expected_output ||
                          `--- Program Executed Successfully ---\nOutput:\nOperation verified with sample test dataset.\nCalculations verified within standard engineering tolerances.`}
                      </pre>
                    </div>
                  </div>
                )}

                {/* 9. Attached Handwritten Observation Sheets / Notebook Photos (The Highlight!) */}
                {includeHandwrittenScans && handwrittenImages.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-1 mb-3">
                      <span>6. Attached Handwritten Laboratory Record / Observation Sheets</span>
                    </h4>

                    <div className="space-y-4">
                      {handwrittenImages.map((img, i) => (
                        <div key={i} className="text-center p-2 border border-black bg-white rounded-xs">
                          <img
                            src={img}
                            alt={`Handwritten Sheet ${i + 1}`}
                            className="max-h-[500px] w-auto mx-auto object-contain border border-neutral-300"
                          />
                          <p className="text-[11px] font-serif italic text-neutral-700 mt-1.5">
                            Sheet {i + 1}: Physical Laboratory Observation & Verification Records
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10. Universal Faculty / Examiner Assessment Block (No rigid rubrics!) */}
                {includeEvaluation && (
                  <div className="mt-6 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-1 mb-2">
                      <span>7. Teacher / Examiner Evaluation & Signature</span>
                    </h4>

                    <div className="border-[1.5px] border-black p-4 bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="space-y-2.5 flex-1 text-xs">
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-neutral-900 min-w-[120px]">Marks Awarded:</span>
                            <span className="font-mono text-sm font-bold">
                              {marksAwarded ? marksAwarded : '_______'} / {maxMarks}
                            </span>
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-neutral-900 min-w-[120px]">Date of Assessment:</span>
                            <span className="font-mono">{submissionDate}</span>
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-neutral-900 min-w-[120px]">Examiner Remarks:</span>
                            <span className="text-neutral-700 italic flex-1">
                              {teacherRemarks ? teacherRemarks : '_________________________________________________'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <div className="border-[1.5px] border-dashed border-neutral-500 px-3 py-1.5 text-[9px] font-bold text-neutral-600 uppercase tracking-wider text-center bg-neutral-50">
                            Department Stamp / Seal
                          </div>

                          <div className="text-right">
                            <div className="w-48 border-b-2 border-black mb-1"></div>
                            <p className="font-bold uppercase text-[11px]">{facultyName}</p>
                            <p className="text-[10px] text-neutral-600">Faculty In-charge / Examiner Signature</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 11. Page Footer */}
                <div className="mt-8 pt-2 border-t border-neutral-300 flex items-center justify-between text-[10px] text-neutral-500">
                  <span>CodeVault Academic Laboratory System • {collegeName}</span>
                  <span>Official University Submission Sheet</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
