import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectOption } from '@/components/ui/Select'
import { Camera, Upload, RefreshCw, Sparkles, FileCode, ArrowRight, Lightbulb, Image as ImageIcon } from 'lucide-react'
import { experimentsApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface ScanPhotoModalProps {
  isOpen: boolean
  onClose: () => void
  experimentId?: string
  subjectId?: string
  onExtracted?: (extractedData: any) => void
}

/**
 * High-performance, memory-efficient client-side image compression.
 * Uses URL.createObjectURL and Canvas to avoid blowing memory on mobile devices.
 * HEIC/HEIF files pass through directly so backend's pillow-heif can decode them.
 */
const compressImageIfNeeded = async (file: File): Promise<File> => {
  // If file is HEIC / HEIF, don't try canvas compression because mobile web canvas can't decode it
  const isHeic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)
  if (isHeic) {
    return file
  }

  // If already under 700KB, use directly
  if (file.size <= 700 * 1024) {
    return file
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const MAX_DIM = 2000
      let { width, height } = img

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width)
          width = MAX_DIM
        } else {
          width = Math.round((width * MAX_DIM) / height)
          height = MAX_DIM
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        resolve(file)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file)
            return
          }
          const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.jpg'
          const compressedFile = new File([blob], cleanName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          resolve(compressedFile)
        },
        'image/jpeg',
        0.86
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file)
    }

    img.src = objectUrl
  })
}

const directGeminiVisionScan = async (file: File): Promise<any> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''
  if (!apiKey) {
    throw new Error('Gemini API key is not configured for direct vision scan.')
  }

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const res = reader.result as string
      const b64 = res.split(',')[1] || res
      resolve(b64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const prompt = `Analyze this photo of a practical assignment/source code.
1. Transcribe the complete source code accurately character by character. Fix minor handwriting or camera ambiguities to make valid, clean, runnable code.
2. Identify the programming language (e.g. 'c', 'cpp', 'python', 'java', 'javascript', 'typescript').
3. Extract or infer the title, experiment number, topic, aim, and algorithm.
Output pure JSON only with keys: 'title', 'experiment_number', 'language', 'topic', 'aim', 'theory', 'algorithm', 'source_code', 'sample_input', 'expected_output', 'observations'.`

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg',
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  )

  if (!res.ok) {
    throw new Error(`Gemini Multimodal Vision API returned status ${res.status}`)
  }

  const json = await res.json()
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  let cleanText = rawText.trim()
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```json|^```/, '').replace(/```$/, '').trim()
  }
  return JSON.parse(cleanText)
}

export const ScanPhotoModal: React.FC<ScanPhotoModalProps> = ({
  isOpen,
  onClose,
  experimentId,
  subjectId,
  onExtracted,
}) => {
  const navigate = useNavigate()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanSeconds, setScanSeconds] = useState(0)
  const [scanStatus, setScanStatus] = useState('')
  const [extractedData, setExtractedData] = useState<any | null>(null)
  const [editedCode, setEditedCode] = useState('')
  const [editedTitle, setEditedTitle] = useState('')
  const [editedLanguage, setEditedLanguage] = useState('c')
  const [isSaving, setIsSaving] = useState(false)

  // Clean up object URLs on unmount or reset
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Timer while scanning so the user always sees real-time progress
  useEffect(() => {
    let timer: any = null
    if (isScanning) {
      setScanSeconds(0)
      timer = setInterval(() => {
        setScanSeconds((s) => s + 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isScanning])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Mobile file check (tolerate iPhone HEIC, empty mime types, Android WebP)
    const isImage =
      (file.type && file.type.startsWith('image/')) ||
      /\.(jpe?g|png|webp|gif|heic|heif|bmp|tiff)$/i.test(file.name)

    if (!isImage) {
      toast.error('Please select an image file (PNG, JPG, HEIC, WEBP)')
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('Image size exceeds 25MB limit')
      return
    }

    setExtractedData(null)

    // Memory-safe fast preview
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Auto-compress large phone photos in background
    if (file.size > 700 * 1024) {
      const compressed = await compressImageIfNeeded(file)
      setSelectedFile(compressed)
    } else {
      setSelectedFile(file)
    }
  }

  const handleScanPhoto = async () => {
    if (!selectedFile) {
      toast.error('Please take or select a photo of code first')
      return
    }

    if (isScanning) return // Prevent duplicate concurrent requests

    setIsScanning(true)
    setScanStatus('Optimizing image & preparing AI Vision...')
    const toastId = toast.loading('Reading handwritten & printed code...')

    try {
      // Ensure image is compressed before sending
      let fileToSend = selectedFile
      if (selectedFile.size > 700 * 1024) {
        fileToSend = await compressImageIfNeeded(selectedFile)
        setSelectedFile(fileToSend)
      }

      setScanStatus('Gemini Vision reading code & identifying algorithm...')

      const formData = new FormData()
      formData.append('file', fileToSend)

      if (experimentId) {
        try {
          const res: any = await experimentsApi.extractAndUpdateFromPhoto(experimentId, formData)
          const extracted = res?.extracted || res?.data?.extracted || res
          setExtractedData(extracted)
          setEditedCode(extracted.source_code || '')
          setEditedTitle(extracted.title || 'Photo Extracted Experiment')
          setEditedLanguage(extracted.language || 'c')
          toast.success('Code transcribed successfully!', { id: toastId })
          if (onExtracted) {
            onExtracted(res)
          }
        } catch (apiErr: any) {
          // If server returns Network Error (e.g. mobile or static deployment), run direct Gemini Vision
          console.warn('Backend endpoint unavailable, falling back to direct AI Vision:', apiErr)
          setScanStatus('Running direct Gemini Vision transcription...')
          const direct = await directGeminiVisionScan(fileToSend)
          setExtractedData(direct)
          setEditedCode(direct.source_code || '')
          setEditedTitle(direct.title || 'Photo Extracted Experiment')
          setEditedLanguage(direct.language || 'c')
          toast.success('Code transcribed via Gemini Vision!', { id: toastId })
          if (onExtracted) {
            onExtracted({ extracted: direct })
          }
        }
      } else {
        if (subjectId) {
          formData.append('subject_id', subjectId)
        }
        formData.append('auto_create', 'false')

        try {
          const res: any = await experimentsApi.extractCodeFromPhoto(formData)
          const data = res?.data || res
          setExtractedData(data)
          setEditedCode(data.source_code || '')
          setEditedTitle(data.title || 'Photo Extracted Experiment')
          setEditedLanguage(data.language || 'c')
          toast.success('Code transcribed successfully!', { id: toastId })
        } catch (apiErr: any) {
          // Direct client-side vision fallback
          console.warn('Backend endpoint unavailable, falling back to direct AI Vision:', apiErr)
          setScanStatus('Running direct Gemini Vision transcription...')
          const direct = await directGeminiVisionScan(fileToSend)
          setExtractedData(direct)
          setEditedCode(direct.source_code || '')
          setEditedTitle(direct.title || 'Photo Extracted Experiment')
          setEditedLanguage(direct.language || 'c')
          toast.success('Code transcribed via Gemini Vision!', { id: toastId })
        }
      }
    } catch (err: any) {
      console.error('Scan error:', err)
      // Intelligent fallback so user is never stranded with a raw Network Error
      const fallback = {
        title: 'Scanned Practical Assignment',
        language: 'c',
        source_code: '// [CodeVault AI Vision Scanner]\n// Note: Network connection to AI Vision was interrupted.\n// You can edit and run your code below:\n\n#include <stdio.h>\n\nint main() {\n    printf("Hello from practical assignment\\n");\n    return 0;\n}\n',
        aim: 'Code transcribed from photo.',
        experiment_number: 'EXP-SCAN',
      }
      setExtractedData(fallback)
      setEditedCode(fallback.source_code)
      setEditedTitle(fallback.title)
      setEditedLanguage(fallback.language)
      toast.error('Network connection interrupted. Provided editable draft below.', { id: toastId })
    } finally {
      setIsScanning(false)
      setScanStatus('')
    }
  }

  const handleApplyOrSave = async () => {
    if (experimentId) {
      toast.success('Code applied to experiment!')
      onClose()
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        title: editedTitle.trim() || 'Photo Extracted Experiment',
        subject_id: subjectId,
        language: editedLanguage,
        experiment_number: extractedData?.experiment_number || 'EXP-SCAN',
        topic: extractedData?.topic || 'Transcribed from Photo',
        aim: extractedData?.aim || `Implementation of ${editedTitle}`,
        theory: extractedData?.theory || '',
        algorithm: extractedData?.algorithm || '',
        source_code: editedCode,
        sample_input: extractedData?.sample_input || '',
        expected_output: extractedData?.expected_output || '',
        observations: extractedData?.observations || 'Transcribed via CodeVault AI Vision.',
      }

      const res: any = await experimentsApi.create(payload)
      const newId = res?.id || res?.data?.id
      toast.success('Experiment created from photo!')
      onClose()
      if (newId) {
        navigate(`/experiments/${newId}`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save experiment')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    setExtractedData(null)
    setEditedCode('')
    setEditedTitle('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scan Code from Photo (AI Vision)"
      description="Capture or upload a photo of your handwritten lab notebook, whiteboard, textbook, or monitor screen. Gemini Vision automatically transcribes the code and recommends program details."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Step 1: Upload / Camera Options */}
        {!selectedFile ? (
          <div className="space-y-3">
            {/* Direct Dual Action Buttons on Mobile & Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Take Photo with Camera (Rear Camera on phone) */}
              <label className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[var(--btn-cta-bg)] text-[var(--btn-cta-text)] font-semibold text-xs sm:text-sm cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all shadow-md">
                <Camera className="w-5 h-5 shrink-0" />
                <span>Take Photo (Camera)</span>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={handleFileSelect}
                />
              </label>

              {/* Upload from Gallery / Files */}
              <label className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[var(--bg-metric)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] font-semibold text-xs sm:text-sm cursor-pointer active:scale-[0.98] transition-all shadow-sm">
                <ImageIcon className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
                <span>Choose from Photos</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {/* Dropzone Container */}
            <label className="border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--border-hover)] bg-[var(--bg-metric)]/50 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-2.5 transition-colors cursor-pointer block">
              <div className="w-11 h-11 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-main)] shadow-sm mx-auto">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-semibold text-[var(--text-main)] font-['Manrope']">
                  Or drag & drop / tap to browse
                </h4>
                <p className="text-[11px] sm:text-xs text-[var(--text-muted)] max-w-sm leading-relaxed mx-auto">
                  Supports handwritten notebooks, phone camera snapshots, HEIC, PNG, JPG, and WEBP up to 25MB.
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Photo Preview & Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 p-3.5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)]">
              {previewUrl && (
                <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-black shrink-0 relative shadow-sm">
                  <img
                    src={previewUrl}
                    alt="Code snapshot"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-semibold text-[var(--text-main)] truncate max-w-[180px]">
                    {selectedFile.name}
                  </span>
                  <Badge variant="mono" size="sm">
                    {(selectedFile.size / 1024).toFixed(0)} KB
                  </Badge>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {isScanning
                    ? `${scanStatus || 'AI reading code...'} (${scanSeconds}s)`
                    : extractedData
                    ? 'AI code transcription complete. Review the code and recommended name below.'
                    : 'Photo optimized for AI Vision. Ready to transcribe.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isScanning}
                  className="flex-1 sm:flex-initial"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Retake
                </Button>
                {!extractedData && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleScanPhoto}
                    isLoading={isScanning}
                    disabled={isScanning}
                    className="flex-1 sm:flex-initial"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    <span>{isScanning ? `Reading (${scanSeconds}s)...` : 'Read Code with AI'}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Step 2: Extracted Code Review & AI Recommendations */}
            {extractedData && (
              <div className="space-y-3 pt-1">
                {/* AI Recommended Title & Language */}
                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[var(--text-main)] flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      AI Recommended Program Name:
                    </span>
                    <Badge variant="mono" size="sm" className="uppercase">
                      {editedLanguage}
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="flex items-center gap-2 flex-1 w-full">
                      <FileCode className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        placeholder="Experiment Title"
                        className="bg-[var(--bg-metric)] text-[var(--text-main)] font-bold text-xs sm:text-sm px-3 py-2 rounded-lg border border-[var(--border-subtle)] focus:border-white focus:outline-none w-full"
                      />
                    </div>
                    <Select
                      size="compact"
                      title="Select Language"
                      value={editedLanguage}
                      onChange={setEditedLanguage}
                      className="shrink-0 w-full sm:w-auto"
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

                {/* Transcribed Code Editor */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>Transcribed Source Code:</span>
                    <span className="font-mono text-[10px] text-[var(--text-dim)]">
                      {editedCode.split('\n').length} lines
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={editedCode}
                    onChange={(e) => setEditedCode(e.target.value)}
                    className="w-full bg-[var(--bg-card)] text-[var(--text-main)] font-mono text-xs rounded-xl border border-[var(--border-subtle)] p-3 focus:border-white focus:outline-none leading-relaxed resize-none shadow-inner"
                  />
                </div>

                {/* Aim & Algorithmic Notes */}
                {extractedData.aim && (
                  <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] space-y-1">
                    <span className="text-[var(--text-main)] font-medium text-[11px] flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Inferred Academic Aim:
                    </span>
                    <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">{extractedData.aim}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          {extractedData && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyOrSave}
              isLoading={isSaving}
              className="w-full sm:w-auto"
            >
              <span>{experimentId ? 'Apply Code to Editor' : 'Create Experiment from Photo'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
