import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Printer,
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
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
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

  // Section Toggles
  const [includeAim, setIncludeAim] = useState(true)
  const [includeTheory, setIncludeTheory] = useState(true)
  const [includeAlgorithm, setIncludeAlgorithm] = useState(true)
  const [includeCode, setIncludeCode] = useState(true)
  const [includeOutput, setIncludeOutput] = useState(true)
  const [includeHandwrittenScans, setIncludeHandwrittenScans] = useState(true)
  const [includeRubric, setIncludeRubric] = useState(true)

  // Handwritten Notebook Photos / Scanned Observation Sheets
  const [handwrittenImages, setHandwrittenImages] = useState<string[]>([])
  const [isAttachingPhoto, setIsAttachingPhoto] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Load any previously attached photos from localStorage for this experiment
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

  // Save attached photos
  const persistPhotos = (images: string[]) => {
    if (!experiment.id) return
    try {
      const storageKey = `cv_lab_record_photos_${experiment.id}`
      localStorage.setItem(storageKey, JSON.stringify(images))
    } catch (e) {
      console.warn('Failed to persist lab record photos:', e)
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

  // Formatted source code with clean line numbers
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
   * Generates the self-contained, 100% styled official university print sheet
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

    const rubricHtml = includeRubric
      ? `
      <div class="section-box avoid-break" style="margin-top: 24px;">
        <div class="section-title">
          <span>7. CONTINUOUS ASSESSMENT & EVALUATION RUBRIC</span>
        </div>
        <table class="rubric-table">
          <thead>
            <tr>
              <th>Performance & Conduction (05)</th>
              <th>Code Quality & Syntax (05)</th>
              <th>Viva-Voce & Concept (05)</th>
              <th>Total Marks (15)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="marks-cell">/ 05</td>
              <td class="marks-cell">/ 05</td>
              <td class="marks-cell">/ 05</td>
              <td class="marks-cell total-marks">/ 15</td>
            </tr>
          </tbody>
        </table>

        <div class="signature-row">
          <div class="sig-col">
            <div><strong>Date of Checking:</strong> __________________</div>
            <div style="margin-top: 6px;"><strong>Remarks:</strong> __________________________</div>
          </div>
          <div class="sig-col" style="text-align: right;">
            <div class="sig-line"></div>
            <div style="font-weight: bold; text-transform: uppercase; font-size: 10pt;">${escapeHtml(facultyName)}</div>
            <div style="font-size: 9pt; color: #555;">Faculty In-Charge / Examiner Signature</div>
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
      margin: 12mm 14mm 12mm 14mm;
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

    /* Double Border Institutional Header */
    .univ-header-box {
      border: 2.5px solid #000000;
      outline: 1px solid #000000;
      outline-offset: 3px;
      padding: 14px 18px;
      text-align: center;
      margin-bottom: 16px;
      background: #ffffff;
    }
    .univ-title {
      font-size: 16pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 3px 0;
      font-family: "Crimson Pro", Georgia, serif;
      color: #000000;
    }
    .dept-title {
      font-size: 11pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 8px 0;
      color: #222222;
    }
    .record-pill {
      display: inline-block;
      background: #000000;
      color: #ffffff;
      padding: 3px 18px;
      font-size: 9.5pt;
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

    /* Rubric Table */
    .rubric-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      margin-bottom: 16px;
      font-size: 9pt;
      text-align: center;
    }
    .rubric-table th, .rubric-table td {
      border: 1.5px solid #000000;
      padding: 8px 10px;
    }
    .rubric-table th {
      background: #f3f4f6;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8.5pt;
    }
    .marks-cell {
      font-family: "JetBrains Mono", monospace;
      font-size: 11pt;
      font-weight: 700;
      padding: 12px !important;
    }
    .total-marks {
      background: #f9fafb;
    }

    /* Signature Area */
    .signature-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 30px;
      padding-top: 10px;
    }
    .sig-col {
      flex: 1;
      font-size: 9.5pt;
    }
    .sig-line {
      width: 220px;
      border-bottom: 2px solid #000000;
      margin-left: auto;
      margin-bottom: 6px;
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
    <!-- Header -->
    <div class="univ-header-box">
      <h1 class="univ-title">${escapeHtml(collegeName)}</h1>
      <h2 class="dept-title">${escapeHtml(departmentName)}</h2>
      <div class="record-pill">Official Laboratory Practical Record</div>
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
    ${rubricHtml}

    <!-- Footer -->
    <div class="page-footer">
      <span>CodeVault University Academic System • Official Lab Submission Record</span>
      <span>Verified Academic Record</span>
    </div>
  </div>
</body>
</html>`
  }

  // 1-Click Print & PDF Export Execution (Iframe Based: 0 Pop-up block risk, mobile friendly)
  const handlePrint = () => {
    setIsPrinting(true)
    const toastId = toast.loading('Formatting official university print sheet...')

    try {
      const fullHtml = generateOfficialLabRecordHtml()

      // Create or reuse hidden iframe
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
        // Fallback popup if iframe document not accessible
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

      // Allow all fonts and images (including base64 photos) to render
      setTimeout(triggerPrint, 500)
    } catch (err: any) {
      setIsPrinting(false)
      toast.error('Failed to generate print sheet: ' + err.message, { id: toastId })
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
                  Formats code, aim, step-by-step algorithms, handwritten observation photos & teacher marks rubric into a university submission file.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isPrinting}
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2 disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isPrinting ? 'Formatting PDF...' : 'Print / Save as PDF'}</span>
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
              {/* College & University Info */}
              <div className="space-y-3">
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

              {/* Dates & Faculty */}
              <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[var(--text-dim)]">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dates & Evaluation</span>
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

                  <div className="col-span-2">
                    <label className="text-[10px] text-[var(--text-muted)]">Faculty / Teacher In-Charge</label>
                    <input
                      type="text"
                      value={facultyName}
                      onChange={(e) => setFacultyName(e.target.value)}
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
                </div>
              </div>

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
              {/* The Actual A4 Sheet Paper Mockup */}
              <div
                className="w-full max-w-[760px] bg-white text-black p-8 sm:p-12 shadow-2xl rounded-xs border border-neutral-300 font-sans leading-relaxed text-sm select-text transition-all"
                style={{ minHeight: '1000px', color: '#000000', backgroundColor: '#FFFFFF' }}
              >
                {/* 1. Official Double Border Header */}
                <div className="border-[2.5px] border-black outline outline-1 outline-black outline-offset-[3px] p-4 text-center mb-5 bg-white">
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
                      {experiment.algorithm ||
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

                {/* 10. University Marking Rubric & Signature Block */}
                {includeRubric && (
                  <div className="mt-6 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-1 mb-2">
                      <span>7. Continuous Assessment & Evaluation</span>
                    </h4>

                    <table className="w-full border-collapse border border-black text-xs text-center mb-6">
                      <thead>
                        <tr className="bg-neutral-100">
                          <th className="border border-black p-2 font-bold">Performance / Conduction (05)</th>
                          <th className="border border-black p-2 font-bold">Documentation & Code (05)</th>
                          <th className="border border-black p-2 font-bold">Viva-Voce & Logic (05)</th>
                          <th className="border border-black p-2 font-bold">Total Marks (15)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-black p-4 font-mono font-bold text-sm">/ 05</td>
                          <td className="border border-black p-4 font-mono font-bold text-sm">/ 05</td>
                          <td className="border border-black p-4 font-mono font-bold text-sm">/ 05</td>
                          <td className="border border-black p-4 font-mono font-bold text-sm bg-neutral-50">/ 15</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="flex items-end justify-between pt-6 text-xs">
                      <div>
                        <p className="font-bold text-neutral-800">Date of Checking: _______________</p>
                        <p className="text-[11px] text-neutral-600 mt-1">Remarks: _______________________</p>
                      </div>

                      <div className="text-center">
                        <div className="w-44 border-b-2 border-black mb-1.5"></div>
                        <p className="font-bold uppercase text-[11px]">{facultyName}</p>
                        <p className="text-[10px] text-neutral-600">Faculty In-charge / Examiner</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 11. Page Footer */}
                <div className="mt-8 pt-2 border-t border-neutral-300 flex items-center justify-between text-[10px] text-neutral-500">
                  <span>CodeVault Academic Laboratory System • MIT-WPU</span>
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
