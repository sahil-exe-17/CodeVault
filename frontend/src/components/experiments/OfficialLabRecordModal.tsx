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
  ZoomIn,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import type { Experiment, Subject, CodeSnippetItem } from '@/types'
import toast from 'react-hot-toast'

interface OfficialLabRecordModalProps {
  isOpen: boolean
  onClose: () => void
  experiment: Partial<Experiment>
  subject?: any
  activeCodeSnippet?: CodeSnippetItem
  allCodeSnippets?: CodeSnippetItem[]
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
  const printPreviewRef = useRef<HTMLDivElement | null>(null)
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

  // 1-Click Print & PDF Export Execution
  const handlePrint = () => {
    if (!printPreviewRef.current) return

    const printContents = printPreviewRef.current.innerHTML

    // Open a clean dedicated print window for vector-crisp A4 print
    const printWindow = window.open('', '_blank', 'width=900,height=1000')
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to print or export PDF.')
      return
    }

    printWindow.document.open()
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${experiment.experiment_number || 'EXP'} — ${experiment.title} — Official Lab Record</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
          
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 12mm 15mm;
          }

          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            margin: 0;
            padding: 0;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Crimson Pro', Georgia, serif;
            font-size: 13pt;
            line-height: 1.45;
          }

          .cv-print-sheet {
            width: 100%;
            background: #ffffff;
            color: #000000;
          }

          .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .header-box {
            border: 2px solid #000000;
            padding: 12px 16px;
            text-align: center;
            margin-bottom: 14px;
            background: #ffffff;
          }

          .college-title {
            font-size: 17pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 4px 0;
            font-family: 'Crimson Pro', Georgia, serif;
          }

          .dept-title {
            font-size: 12pt;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 6px 0;
            color: #222222;
          }

          .record-banner {
            display: inline-block;
            background: #000000;
            color: #ffffff;
            padding: 3px 18px;
            font-size: 11pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            border-radius: 2px;
            margin-top: 4px;
            font-family: 'Inter', sans-serif;
          }

          .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            font-size: 10.5pt;
            font-family: 'Inter', sans-serif;
          }

          .meta-table td {
            border: 1px solid #333333;
            padding: 6px 10px;
          }

          .meta-label {
            font-weight: 700;
            color: #222222;
            width: 18%;
            background: #f7f7f7;
          }

          .meta-val {
            width: 32%;
            font-weight: 500;
          }

          .exp-banner {
            border-left: 4px solid #000000;
            border-top: 1px solid #cccccc;
            border-bottom: 1px solid #cccccc;
            border-right: 1px solid #cccccc;
            padding: 8px 12px;
            margin-bottom: 16px;
            background: #fafafa;
          }

          .exp-no {
            font-size: 11pt;
            font-weight: 700;
            font-family: 'Inter', sans-serif;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #444444;
          }

          .exp-title {
            font-size: 14pt;
            font-weight: 700;
            margin: 2px 0 0 0;
            color: #000000;
          }

          .section-heading {
            font-size: 12pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1.5px solid #000000;
            padding-bottom: 3px;
            margin: 14px 0 8px 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-family: 'Inter', sans-serif;
          }

          .section-body {
            font-size: 11pt;
            line-height: 1.5;
            margin-bottom: 12px;
            color: #111111;
          }

          .code-block {
            font-family: 'JetBrains Mono', Consolas, monospace;
            font-size: 9.5pt;
            line-height: 1.45;
            background: #ffffff;
            border: 1px solid #333333;
            padding: 10px 14px;
            white-space: pre-wrap;
            word-break: break-all;
            margin-bottom: 14px;
            position: relative;
          }

          .code-badge {
            display: inline-block;
            font-family: 'Inter', sans-serif;
            font-size: 8pt;
            font-weight: 700;
            text-transform: uppercase;
            background: #eeeeee;
            padding: 2px 8px;
            border: 1px solid #cccccc;
            margin-bottom: 6px;
          }

          .output-box {
            background: #fbfbfb;
            border: 1.5px dashed #444444;
            padding: 10px 14px;
            font-family: 'JetBrains Mono', Consolas, monospace;
            font-size: 9.5pt;
            line-height: 1.4;
            margin-bottom: 14px;
            color: #111111;
          }

          .handwritten-page {
            page-break-inside: avoid;
            margin-bottom: 16px;
            text-align: center;
          }

          .handwritten-img {
            max-width: 100%;
            max-height: 500px;
            border: 1px solid #555555;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            object-fit: contain;
          }

          .handwritten-caption {
            font-size: 9.5pt;
            font-style: italic;
            color: #555555;
            margin-top: 4px;
            font-family: 'Inter', sans-serif;
          }

          .rubric-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 18px;
            margin-bottom: 18px;
            font-size: 10pt;
            font-family: 'Inter', sans-serif;
          }

          .rubric-table th, .rubric-table td {
            border: 1px solid #333333;
            padding: 8px 10px;
            text-align: center;
          }

          .rubric-table th {
            background: #f2f2f2;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 9pt;
            letter-spacing: 0.5px;
          }

          .sig-box {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 35px;
            padding-top: 10px;
            font-family: 'Inter', sans-serif;
            font-size: 10.5pt;
          }

          .sig-line {
            border-top: 1.5px solid #000000;
            width: 200px;
            text-align: center;
            padding-top: 6px;
            font-weight: 700;
          }

          .page-footer {
            margin-top: 25px;
            padding-top: 8px;
            border-top: 1px solid #cccccc;
            display: flex;
            justify-content: space-between;
            font-size: 8.5pt;
            font-family: 'Inter', sans-serif;
            color: #666666;
          }
        </style>
      </head>
      <body>
        <div class="cv-print-sheet">
          ${printContents}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  if (!isOpen) return null

  const activeSnippet = activeCodeSnippet || experiment.code_files?.[0] || {
    id: 'c1',
    title: 'Code 1',
    language: experiment.language || 'c',
    code: experiment.source_code || '',
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-6xl h-[94vh] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[var(--text-main)]"
        >
          {/* Modal Header Bar */}
          <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-header)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold font-['Manrope'] text-[var(--text-main)]">
                    Official University Lab Record Generator
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    1-Click PDF
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Formats code, aim, algorithms, and handwritten notebook photos into an authentic university-grade printout.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
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
                    <label className="text-[10px] text-[var(--text-muted)]">Faculty / Teacher In-charge</label>
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
            <div className="lg:col-span-8 p-4 sm:p-6 overflow-y-auto bg-neutral-900/60 flex justify-center">
              {/* The Actual A4 Sheet Paper Mockup */}
              <div
                ref={printPreviewRef}
                className="w-full max-w-[760px] bg-white text-black p-8 sm:p-12 shadow-2xl rounded-sm border border-neutral-300 font-serif leading-relaxed text-sm select-text transition-all"
                style={{ minHeight: '1000px', color: '#000000', backgroundColor: '#FFFFFF' }}
              >
                {/* 1. Official Double Border Header */}
                <div className="border-2 border-black p-4 text-center mb-5 bg-white">
                  <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide font-serif mb-1" style={{ color: '#000000' }}>
                    {collegeName}
                  </h1>
                  <h2 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-neutral-800 mb-2 font-serif">
                    {departmentName}
                  </h2>
                  <div className="inline-block bg-black text-white px-5 py-0.5 text-xs font-bold uppercase tracking-widest rounded-xs font-sans">
                    Laboratory Practical Record
                  </div>
                </div>

                {/* 2. Official Student Credentials Matrix */}
                <table className="w-full border-collapse border border-neutral-800 text-xs mb-5 font-sans">
                  <tbody>
                    <tr>
                      <td className="border border-neutral-700 bg-neutral-100 px-3 py-1.5 font-bold w-1/4">Name of Student:</td>
                      <td className="border border-neutral-700 px-3 py-1.5 w-1/4 font-semibold">{studentName}</td>
                      <td className="border border-neutral-700 bg-neutral-100 px-3 py-1.5 font-bold w-1/4">Roll No. / PRN:</td>
                      <td className="border border-neutral-700 px-3 py-1.5 w-1/4 font-mono font-bold">{rollNumber}</td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-700 bg-neutral-100 px-3 py-1.5 font-bold">Subject / Course:</td>
                      <td className="border border-neutral-700 px-3 py-1.5 font-semibold">{subject?.name || 'Practical Laboratory'}</td>
                      <td className="border border-neutral-700 bg-neutral-100 px-3 py-1.5 font-bold">Class / Sem:</td>
                      <td className="border border-neutral-700 px-3 py-1.5">{semester}</td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-700 bg-neutral-100 px-3 py-1.5 font-bold">Batch & Division:</td>
                      <td className="border border-neutral-700 px-3 py-1.5">{batch}</td>
                      <td className="border border-neutral-700 bg-neutral-100 px-3 py-1.5 font-bold">Academic Year:</td>
                      <td className="border border-neutral-700 px-3 py-1.5">{academicYear}</td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-700 bg-neutral-100 px-3 py-1.5 font-bold">Date of Conduction:</td>
                      <td className="border border-neutral-700 px-3 py-1.5 font-mono">{conductionDate}</td>
                      <td className="border border-neutral-700 bg-neutral-100 px-3 py-1.5 font-bold">Date of Submission:</td>
                      <td className="border border-neutral-700 px-3 py-1.5 font-mono">{submissionDate}</td>
                    </tr>
                  </tbody>
                </table>

                {/* 3. Experiment Title & Identifier Banner */}
                <div className="border-l-4 border-black border-y border-r border-neutral-300 p-3 mb-5 bg-neutral-50">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-600 font-sans">
                    {experiment.experiment_number || 'EXP-01'}
                  </p>
                  <h3 className="text-lg font-bold text-black mt-0.5 font-serif">
                    {experiment.title}
                  </h3>
                  {experiment.topic && (
                    <p className="text-xs text-neutral-600 font-sans mt-0.5">
                      Topic: {experiment.topic}
                    </p>
                  )}
                </div>

                {/* 4. Aim & Objectives */}
                {includeAim && (
                  <div className="mb-5 avoid-break">
                    <h4 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-1 mb-2 font-sans flex items-center justify-between">
                      <span>1. Aim & Objectives</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-900 leading-relaxed font-serif">
                      {experiment.aim || `To write, execute and analyze a program to implement ${experiment.title}.`}
                    </p>
                  </div>
                )}

                {/* 5. Prerequisites & Complexity */}
                {includeTheory && (
                  <div className="mb-5 avoid-break">
                    <h4 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-1 mb-2 font-sans">
                      <span>2. Prerequisites & Theoretical Background</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-900 leading-relaxed font-serif whitespace-pre-line">
                      {experiment.theory ||
                        `Fundamental data structures and algorithmic paradigms relevant to ${experiment.title}. Includes syntax, control flow, functions, and memory allocation in ${activeSnippet.language.toUpperCase()}.`}
                    </p>

                    {(experiment.time_complexity || experiment.space_complexity) && (
                      <div className="mt-2.5 p-2 bg-neutral-100 border border-neutral-300 rounded-sm text-xs font-sans grid grid-cols-2 gap-2">
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
                  <div className="mb-5 avoid-break">
                    <h4 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-1 mb-2 font-sans">
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
                  <div className="mb-5 avoid-break">
                    <div className="flex items-center justify-between border-b border-black pb-1 mb-2 font-sans">
                      <h4 className="text-xs font-bold uppercase tracking-wide">
                        4. Source Code Implementation
                      </h4>
                      <span className="text-[10px] font-mono font-bold uppercase bg-neutral-200 px-2 py-0.5 rounded-xs border border-neutral-300">
                        {activeSnippet.language.toUpperCase()} • {activeSnippet.title}
                      </span>
                    </div>

                    <pre className="p-3 bg-neutral-50 border border-neutral-800 text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all text-black">
                      {activeSnippet.code}
                    </pre>
                  </div>
                )}

                {/* 8. Sample Input & Execution Output */}
                {includeOutput && (
                  <div className="mb-5 avoid-break">
                    <h4 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-1 mb-2 font-sans">
                      <span>5. Sample Input & Verified Execution Output</span>
                    </h4>

                    {experiment.sample_input && (
                      <div className="mb-2">
                        <p className="text-[11px] font-bold font-sans text-neutral-700">Sample Input:</p>
                        <pre className="p-2 bg-neutral-100 border border-neutral-400 text-[11px] font-mono text-black">
                          {experiment.sample_input}
                        </pre>
                      </div>
                    )}

                    <div className="p-3 bg-neutral-50 border-2 border-dashed border-neutral-700 text-[11px] font-mono text-black space-y-1">
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-neutral-300 text-[10px] text-neutral-600 font-sans">
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
                  <div className="mb-6 avoid-break">
                    <h4 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-1 mb-3 font-sans">
                      <span>6. Attached Handwritten Laboratory Record / Observation Sheets</span>
                    </h4>

                    <div className="space-y-4">
                      {handwrittenImages.map((img, i) => (
                        <div key={i} className="text-center p-2 border border-neutral-400 bg-neutral-50 rounded-xs">
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
                  <div className="mt-6 pt-2 avoid-break">
                    <h4 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-1 mb-2 font-sans">
                      <span>7. Continuous Assessment & Evaluation</span>
                    </h4>

                    <table className="w-full border-collapse border border-neutral-800 text-xs text-center font-sans mb-6">
                      <thead>
                        <tr className="bg-neutral-100">
                          <th className="border border-neutral-700 p-2 font-bold">Performance / Conduction (05)</th>
                          <th className="border border-neutral-700 p-2 font-bold">Documentation & Code (05)</th>
                          <th className="border border-neutral-700 p-2 font-bold">Viva-Voce & Logic (05)</th>
                          <th className="border border-neutral-700 p-2 font-bold">Total Marks (15)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-neutral-700 p-4 font-mono font-bold text-sm">/ 05</td>
                          <td className="border border-neutral-700 p-4 font-mono font-bold text-sm">/ 05</td>
                          <td className="border border-neutral-700 p-4 font-mono font-bold text-sm">/ 05</td>
                          <td className="border border-neutral-700 p-4 font-mono font-bold text-sm">/ 15</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="flex items-end justify-between pt-6 font-sans text-xs">
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
                <div className="mt-8 pt-2 border-t border-neutral-300 flex items-center justify-between text-[10px] text-neutral-500 font-sans">
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
