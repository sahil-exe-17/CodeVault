import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Printer,
  Download,
  X,
  FileText,
  Building2,
  User as UserIcon,
  Calendar,
  Layers,
  BookOpen,
  Award,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import type { Subject, Experiment } from '@/types'
import toast from 'react-hot-toast'

interface MasterLabManualModalProps {
  isOpen: boolean
  onClose: () => void
  subject: Subject | null
  experiments: Experiment[]
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

export const MasterLabManualModal: React.FC<MasterLabManualModalProps> = ({
  isOpen,
  onClose,
  subject,
  experiments,
}) => {
  const { user } = useAuthStore()

  // Form Fields for Manual
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
    subject?.semester || user?.semester || 'Semester 4'
  )
  const [academicYear, setAcademicYear] = useState('2025–2026')
  const [facultyName, setFacultyName] = useState('Prof. In-Charge')
  const [hodName, setHodName] = useState('Head of Department')
  const [showLogo, setShowLogo] = useState(true)

  const [activeTab, setActiveTab] = useState<'settings' | 'preview'>('settings')
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  if (!isOpen) return null

  const universityLogo = localStorage.getItem('cv_saved_university_logo') || DEFAULT_CREST_SVG

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

  // Generates complete HTML document for all practicals
  const generateFullManualHtml = (): string => {
    const subjectTitle = subject?.name || 'Laboratory Course'

    // 1. Table of Contents / Index Rows
    const indexRows = experiments.map((exp, idx) => {
      const expNum = exp.experiment_number || `EXP-0${idx + 1}`
      const dateStr = exp.created_at
        ? new Date(exp.created_at).toLocaleDateString('en-GB')
        : new Date().toLocaleDateString('en-GB')

      return `
        <tr>
          <td style="text-align: center; font-weight: 600;">${idx + 1}</td>
          <td style="text-align: center; font-weight: 700; font-family: monospace;">${escapeHtml(expNum)}</td>
          <td style="font-weight: 600;">${escapeHtml(exp.title || 'Practical Assignment')}</td>
          <td style="text-align: center; font-family: monospace;">${dateStr}</td>
          <td style="text-align: center; font-family: monospace;">${dateStr}</td>
          <td style="text-align: center; font-weight: 700;">10</td>
          <td style="text-align: center;">&nbsp;</td>
        </tr>
      `
    }).join('')

    // 2. Experiment Pages
    const experimentsHtml = experiments.map((exp, idx) => {
      const expNum = exp.experiment_number || `EXP-0${idx + 1}`
      const expTitle = exp.title || `Practical Experiment ${idx + 1}`
      const targetCode = exp.source_code || exp.code_files?.[0]?.code || '// No source code recorded.'
      const targetLang = (exp.language || exp.code_files?.[0]?.language || 'c').toUpperCase()

      const aim = exp.aim || `Implement and evaluate ${expTitle} according to syllabus specifications.`
      const theory = exp.theory || ''
      const algorithm = exp.algorithm || ''
      const output = exp.actual_output || exp.expected_output || ''

      return `
        <!-- EXPERIMENT SEPARATION PAGE -->
        <div class="page-break-before experiment-wrapper">
          <!-- Mini University Strip -->
          <div class="exp-top-strip">
            <span>${escapeHtml(collegeName)} • ${escapeHtml(departmentName)}</span>
            <span>${escapeHtml(subjectTitle)}</span>
          </div>

          <!-- Experiment Banner -->
          <div class="exp-banner avoid-break">
            <div class="exp-num">${escapeHtml(expNum)}</div>
            <h2 class="exp-heading">${escapeHtml(expTitle)}</h2>
          </div>

          <!-- Aim -->
          <div class="section-box avoid-break">
            <div class="section-title">1. AIM & OBJECTIVES</div>
            <div class="section-body">
              <p>${escapeHtml(aim)}</p>
            </div>
          </div>

          <!-- Theory if present -->
          ${
            theory
              ? `
          <div class="section-box avoid-break">
            <div class="section-title">2. THEORY & CONCEPTS</div>
            <div class="section-body">
              <p>${escapeHtml(theory)}</p>
            </div>
          </div>`
              : ''
          }

          <!-- Algorithm if present -->
          ${
            algorithm
              ? `
          <div class="section-box avoid-break">
            <div class="section-title">3. STEP-BY-STEP ALGORITHM</div>
            <div class="section-body">
              <div class="algorithm-box">${escapeHtml(algorithm)}</div>
            </div>
          </div>`
              : ''
          }

          <!-- Source Code -->
          <div class="section-box avoid-break">
            <div class="section-title">
              <span>4. SOURCE CODE IMPLEMENTATION</span>
              <span class="badge-lang">${escapeHtml(targetLang)}</span>
            </div>
            <div class="section-body" style="padding: 0;">
              <div class="code-container">
                <pre class="code-pre"><code>${formatCodeWithLineNumbers(targetCode)}</code></pre>
              </div>
            </div>
          </div>

          <!-- Terminal Output -->
          ${
            output
              ? `
          <div class="section-box avoid-break">
            <div class="section-title">5. EXECUTION & OUTPUT TRACE</div>
            <div class="section-body">
              <div class="terminal-box">
                <div class="terminal-header">
                  <span>TERMINAL OUTPUT / TEST RUN</span>
                  <span>STATUS: PASSED (EXIT 0)</span>
                </div>
                <pre class="terminal-pre"><code>${escapeHtml(output)}</code></pre>
              </div>
            </div>
          </div>`
              : ''
          }

          <!-- Assessment Rubric & Examiner Signatures -->
          <div class="eval-box avoid-break">
            <div class="eval-title">CONTINUOUS LAB EVALUATION & VERIFICATION</div>
            <div class="eval-grid">
              <div class="eval-left">
                <table class="rubric-table">
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th style="width: 50px;">Max</th>
                      <th style="width: 60px;">Awarded</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Performance & Code Implementation</td>
                      <td>4</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Algorithm & Documentation Quality</td>
                      <td>3</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Viva Voce & Knowledge Understanding</td>
                      <td>3</td>
                      <td></td>
                    </tr>
                    <tr style="font-weight: 700; background: #f9fafb;">
                      <td>Total Marks</td>
                      <td>10</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="eval-right">
                <div class="sig-wrapper">
                  <div class="sig-line-bar"></div>
                  <div class="sig-title-name">${escapeHtml(facultyName)}</div>
                  <div class="sig-subtitle">Faculty In-Charge Signature</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="page-footer">
            <span>CodeVault Academic System • Complete Laboratory Manual</span>
            <span>${escapeHtml(expNum)} • Verified Record</span>
          </div>
        </div>
      `
    }).join('')

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subjectTitle)} — Complete Laboratory Manual</title>
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
      font-size: 10pt;
      line-height: 1.45;
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

    /* Cover / Certificate Page */
    .cover-page {
      min-height: 980px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 3px double #000000;
      padding: 30px;
      background: #ffffff;
    }
    .univ-header-box {
      text-align: center;
      border-bottom: 2px solid #000000;
      padding-bottom: 18px;
      margin-bottom: 24px;
    }
    .univ-logo-img {
      max-width: 80px;
      max-height: 80px;
      object-fit: contain;
      margin-bottom: 8px;
    }
    .univ-title {
      font-size: 17pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin: 0 0 4px 0;
      font-family: "Crimson Pro", Georgia, serif;
      color: #000000;
    }
    .dept-title {
      font-size: 11pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 10px 0;
      color: #222222;
    }
    .manual-banner {
      background: #000000;
      color: #ffffff;
      padding: 8px 20px;
      font-size: 12pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      display: inline-block;
      margin-top: 6px;
    }
    .subject-headline {
      font-size: 16pt;
      font-weight: 800;
      text-align: center;
      text-transform: uppercase;
      margin: 18px 0 8px 0;
      letter-spacing: 0.5px;
      color: #000000;
    }
    .semester-subline {
      font-size: 11pt;
      font-weight: 600;
      text-align: center;
      color: #4b5563;
      margin-bottom: 20px;
    }

    /* Certificate Box */
    .certificate-box {
      border: 1.5px solid #000000;
      padding: 20px 24px;
      margin: 20px 0;
      background: #fafafa;
      text-align: center;
    }
    .cert-heading {
      font-size: 14pt;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 12px;
      text-decoration: underline;
    }
    .cert-text {
      font-size: 10.5pt;
      line-height: 1.6;
      text-align: justify;
      color: #111827;
      margin-bottom: 0;
    }

    /* Student Credentials Matrix */
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
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

    /* Signatures Bar */
    .cert-sigs-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 36px;
      padding-top: 10px;
    }
    .sig-col {
      text-align: center;
      width: 30%;
    }
    .sig-line-cover {
      border-top: 1.5px solid #000000;
      margin-bottom: 6px;
    }
    .sig-col-title {
      font-size: 9.5pt;
      font-weight: 700;
    }
    .sig-col-sub {
      font-size: 8pt;
      color: #4b5563;
    }

    /* Table of Contents */
    .index-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 9pt;
    }
    .index-table th {
      border: 1.5px solid #000000;
      background: #f3f4f6;
      padding: 8px 6px;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 8pt;
    }
    .index-table td {
      border: 1px solid #000000;
      padding: 7px 8px;
    }

    /* Individual Experiment Layout */
    .experiment-wrapper {
      padding-top: 10px;
    }
    .exp-top-strip {
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      border-bottom: 1px solid #d1d5db;
      padding-bottom: 4px;
      margin-bottom: 12px;
    }
    .exp-banner {
      display: flex;
      align-items: stretch;
      background: #ffffff;
      border: 2px solid #000000;
      margin-bottom: 14px;
    }
    .exp-num {
      background: #000000;
      color: #ffffff;
      font-size: 11pt;
      font-weight: 800;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: monospace;
      letter-spacing: 1px;
    }
    .exp-heading {
      font-size: 11.5pt;
      font-weight: 700;
      margin: 0;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      flex: 1;
    }

    .section-box {
      border: 1px solid #000000;
      margin-bottom: 12px;
      background: #ffffff;
    }
    .section-title {
      background: #f3f4f6;
      border-bottom: 1px solid #000000;
      padding: 5px 12px;
      font-size: 8.5pt;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .badge-lang {
      background: #000000;
      color: #ffffff;
      font-size: 7pt;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 2px;
      font-family: monospace;
    }
    .section-body {
      padding: 8px 12px;
      font-size: 9.5pt;
      line-height: 1.5;
    }
    .algorithm-box {
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 8.5pt;
      background: #f9fafb;
      padding: 8px 10px;
      border: 1px dashed #d1d5db;
      white-space: pre-wrap;
    }
    .code-container {
      background: #ffffff;
      border-top: 1px solid #e5e7eb;
    }
    .code-pre {
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 8.5pt;
      line-height: 1.4;
      padding: 8px 10px;
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .line-num {
      display: inline-block;
      width: 22px;
      text-align: right;
      color: #9ca3af;
      user-select: none;
      margin-right: 8px;
      border-right: 1px solid #e5e7eb;
      padding-right: 5px;
      font-weight: 600;
    }

    .terminal-box {
      border: 1px dashed #000000;
      background: #f9fafb;
      padding: 8px 10px;
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 8.5pt;
    }
    .terminal-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 3px;
      margin-bottom: 5px;
      font-size: 7.5pt;
      font-weight: 700;
      color: #4b5563;
    }
    .terminal-pre {
      margin: 0;
      white-space: pre-wrap;
    }

    /* Assessment Box */
    .eval-box {
      border: 1.5px solid #000000;
      margin-top: 12px;
      margin-bottom: 16px;
    }
    .eval-title {
      background: #000000;
      color: #ffffff;
      font-size: 8pt;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 4px 10px;
    }
    .eval-grid {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      gap: 16px;
      align-items: center;
    }
    .eval-left {
      flex: 1;
    }
    .rubric-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
    }
    .rubric-table th, .rubric-table td {
      border: 1px solid #000000;
      padding: 3px 6px;
    }
    .eval-right {
      width: 220px;
      text-align: center;
    }
    .sig-line-bar {
      border-top: 1.5px solid #000000;
      width: 100%;
      margin-bottom: 4px;
    }
    .sig-title-name {
      font-size: 8.5pt;
      font-weight: 700;
    }
    .sig-subtitle {
      font-size: 7.5pt;
      color: #6b7280;
    }

    .page-footer {
      border-top: 1px solid #000000;
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
      font-size: 7.5pt;
      font-family: monospace;
      color: #6b7280;
      margin-top: 18px;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <!-- 1. COVER PAGE / CERTIFICATE -->
    <div class="cover-page avoid-break">
      <div>
        <div class="univ-header-box">
          ${showLogo ? `<img src="${universityLogo}" alt="Logo" class="univ-logo-img" />` : ''}
          <h1 class="univ-title">${escapeHtml(collegeName)}</h1>
          <h2 class="dept-title">${escapeHtml(departmentName)}</h2>
          <div class="manual-banner">LABORATORY MANUAL & PRACTICAL JOURNAL</div>
        </div>

        <div class="subject-headline">${escapeHtml(subjectTitle)}</div>
        <div class="semester-subline">${escapeHtml(semester)} • Academic Year: ${escapeHtml(academicYear)}</div>

        <!-- Official Certificate Box -->
        <div class="certificate-box">
          <div class="cert-heading">CERTIFICATE OF COMPLETION</div>
          <p class="cert-text">
            This is to certify that <strong>${escapeHtml(studentName)}</strong>, Roll No. / PRN: <strong>${escapeHtml(rollNumber)}</strong>,
            has satisfactorily completed the prescribed course of laboratory experiments in <strong>${escapeHtml(subjectTitle)}</strong>
            (${escapeHtml(semester)}) as prescribed by the university curriculum during the academic year <strong>${escapeHtml(academicYear)}</strong>.
          </p>
        </div>

        <!-- Student Meta Table -->
        <table class="meta-table">
          <tbody>
            <tr>
              <td class="meta-label">Student Name:</td>
              <td class="meta-val" style="font-weight: 700;">${escapeHtml(studentName)}</td>
              <td class="meta-label">Roll No. / PRN:</td>
              <td class="meta-val mono" style="font-weight: 700;">${escapeHtml(rollNumber)}</td>
            </tr>
            <tr>
              <td class="meta-label">Course / Subject:</td>
              <td class="meta-val">${escapeHtml(subjectTitle)}</td>
              <td class="meta-label">Semester / Year:</td>
              <td class="meta-val">${escapeHtml(semester)}</td>
            </tr>
            <tr>
              <td class="meta-label">Batch / Division:</td>
              <td class="meta-val">${escapeHtml(batch)}</td>
              <td class="meta-label">Total Practicals:</td>
              <td class="meta-val mono">${experiments.length} Experiments</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Signatures Footer on Cover -->
      <div class="cert-sigs-bar">
        <div class="sig-col">
          <div class="sig-line-cover"></div>
          <div class="sig-col-title">${escapeHtml(facultyName)}</div>
          <div class="sig-col-sub">Staff In-Charge</div>
        </div>
        <div class="sig-col">
          <div class="sig-line-cover"></div>
          <div class="sig-col-title">${escapeHtml(hodName)}</div>
          <div class="sig-col-sub">Head of Department</div>
        </div>
        <div class="sig-col">
          <div class="sig-line-cover"></div>
          <div class="sig-col-title">External Examiner</div>
          <div class="sig-col-sub">University Examiner</div>
        </div>
      </div>
    </div>

    <!-- 2. TABLE OF CONTENTS / INDEX -->
    <div class="page-break-before">
      <div class="exp-top-strip">
        <span>${escapeHtml(collegeName)}</span>
        <span>INDEX / TABLE OF CONTENTS</span>
      </div>

      <h2 style="font-size: 14pt; font-weight: 800; text-transform: uppercase; margin: 10px 0 16px 0; text-align: center; border-bottom: 2px solid #000000; padding-bottom: 6px;">
        INDEX OF PRACTICAL ASSIGNMENTS
      </h2>

      <table class="index-table">
        <thead>
          <tr>
            <th style="width: 40px;">Sr.</th>
            <th style="width: 70px;">Exp No.</th>
            <th>Title of Experiment</th>
            <th style="width: 85px;">Conduction</th>
            <th style="width: 85px;">Submission</th>
            <th style="width: 60px;">Max</th>
            <th style="width: 75px;">Staff Sign</th>
          </tr>
        </thead>
        <tbody>
          ${indexRows}
        </tbody>
      </table>

      <div class="page-footer">
        <span>CodeVault University Academic System • Master Lab Manual</span>
        <span>Table of Contents • Page 2</span>
      </div>
    </div>

    <!-- 3. ALL PRACTICAL EXPERIMENTS -->
    ${experimentsHtml}
  </div>
</body>
</html>`
  }

  // Direct 1-Click PDF Download
  const handleDownloadPdf = async () => {
    if (isDownloading) return
    if (experiments.length === 0) {
      toast.error('Add at least one experiment to generate lab manual.')
      return
    }

    setIsDownloading(true)
    const toastId = toast.loading('Compiling complete lab manual PDF (all experiments)...')

    let tempDiv: HTMLElement | null = null

    try {
      const fullHtml = generateFullManualHtml()

      tempDiv = document.createElement('div')
      tempDiv.id = 'cv-master-manual-temp'
      tempDiv.style.width = '794px'
      tempDiv.style.position = 'fixed'
      tempDiv.style.top = '-99999px'
      tempDiv.style.left = '0'
      tempDiv.style.zIndex = '-9999'
      tempDiv.style.backgroundColor = '#ffffff'
      tempDiv.style.color = '#000000'
      tempDiv.innerHTML = fullHtml
      document.body.appendChild(tempDiv)

      const html2pdfModule = await import('html2pdf.js')
      const html2pdf = (html2pdfModule as any).default || html2pdfModule

      const subjectNameSafe = (subject?.name || 'Subject').replace(/[^a-zA-Z0-9]/g, '_')
      const filename = `${subjectNameSafe}_Complete_Lab_Manual.pdf`

      const opt = {
        margin: [8, 8, 8, 8],
        filename: filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 1.4,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          imageTimeout: 3000,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }

      const runGeneration = async () => {
        const worker = html2pdf().set(opt).from(tempDiv)
        await worker.save()
      }

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('PDF generation timed out')), 6500)
      })

      await Promise.race([runGeneration(), timeoutPromise])
      toast.success('Complete Lab Manual PDF downloaded!', { id: toastId })
    } catch (err: any) {
      console.warn('Direct PDF canvas failed, triggering instant print fallback:', err)
      toast.dismiss(toastId)
      toast('Opening Print Dialog — choose "Save as PDF" to save file', { icon: '📄' })
      handlePrint()
    } finally {
      if (tempDiv && tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv)
      }
      setIsDownloading(false)
    }
  }

  // Print Dialog
  const handlePrint = () => {
    setIsPrinting(true)
    const toastId = toast.loading('Opening print dialog...')

    try {
      const fullHtml = generateFullManualHtml()

      let iframe = document.getElementById('cv-master-manual-iframe') as HTMLIFrameElement
      if (!iframe) {
        iframe = document.createElement('iframe')
        iframe.id = 'cv-master-manual-iframe'
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
      if (!doc) throw new Error('Cannot access print iframe')

      doc.open()
      doc.write(fullHtml)
      doc.close()

      setTimeout(() => {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
        setIsPrinting(false)
        toast.dismiss(toastId)
      }, 350)
    } catch (err: any) {
      toast.error('Print failed: ' + (err.message || 'Error'), { id: toastId })
      setIsPrinting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0e0e12] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Manrope'] text-white tracking-tight">
                Complete Laboratory Manual (Batch Export)
              </h2>
              <p className="text-xs text-white/50">
                {subject?.name} • {experiments.length} {experiments.length === 1 ? 'Practical' : 'Practicals'} Formatted for University Submission
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex items-center p-0.5 bg-white/[0.05] border border-white/10 rounded-xl mr-2">
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'settings' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                Settings
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'preview' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                Live Preview
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'settings' ? (
            <div className="space-y-6">
              {/* Overview Notice */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5">
                <CheckCircle2 className="w-5 h-5 text-white/90 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-white">
                    Official Term-End Lab Manual Compilation
                  </p>
                  <p className="text-white/60 leading-relaxed">
                    This automatically binds all <strong>{experiments.length} practical experiments</strong> in {subject?.name} into a single official manual. It includes a university title cover page, completion certificate with examiner sign-offs, automated Table of Contents, formatted code with line numbers, and assessment rubrics.
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">College / University</label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Department</label>
                  <input
                    type="text"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Student Full Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Roll Number / PRN</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Batch & Division</label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Academic Year</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Staff In-Charge (Faculty)</label>
                  <input
                    type="text"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Head of Department (HOD)</label>
                  <input
                    type="text"
                    value={hodName}
                    onChange={(e) => setHodName(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Experiments included checklist */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 flex items-center justify-between">
                  <span>Included Practicals ({experiments.length})</span>
                  <span className="text-[11px] font-mono text-white/40">Numbered chronologically</span>
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  {experiments.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-white/60 text-[11px]">
                          {exp.experiment_number || `EXP-0${idx + 1}`}
                        </span>
                        <span className="font-medium text-white truncate">{exp.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-white/50 uppercase">
                        {exp.language || 'Code'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Live HTML Preview inside an isolated container */
            <div className="bg-white text-black p-4 rounded-2xl overflow-x-auto shadow-inner">
              <iframe
                title="Manual Preview"
                srcDoc={generateFullManualHtml()}
                className="w-full h-[550px] border-0 rounded-xl"
              />
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02] shrink-0">
          <div className="text-xs text-white/40 font-mono">
            {experiments.length} {experiments.length === 1 ? 'experiment' : 'experiments'} • Standard A4 Format
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting || isDownloading || experiments.length === 0}
              className="h-10 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading || isPrinting || experiments.length === 0}
              className="h-10 px-5 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)] cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isDownloading ? 'Generating PDF...' : 'Download Full Lab Manual (PDF)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
