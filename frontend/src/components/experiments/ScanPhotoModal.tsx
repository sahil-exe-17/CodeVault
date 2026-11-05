import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectOption } from '@/components/ui/Select'
import { Camera, Upload, RefreshCw, Sparkles, FileCode, ArrowRight, Lightbulb, Check } from 'lucide-react'
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
 * High-performance client-side image compression.
 * Scales down high-res phone camera snapshots (e.g. 4000x3000, 10MB+)
 * to max 1800px width/height and ~350KB JPEG without losing OCR text crispness.
 */
const compressImageIfNeeded = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    // If already under 600KB, use directly
    if (file.size <= 600 * 1024) {
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX_DIM = 1800
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
          0.85
        )
      }
      img.onerror = () => resolve(file)
      img.src = e.target?.result as string
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}

export const ScanPhotoModal: React.FC<ScanPhotoModalProps> = ({
  isOpen,
  onClose,
  experimentId,
  subjectId,
  onExtracted,
}) => {
  const navigate = useNavigate()
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

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, JPEG, WEBP)')
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('Image size exceeds 25MB limit')
      return
    }

    setExtractedData(null)

    // Fast preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Auto-compress large phone photos in background
    if (file.size > 800 * 1024) {
      const compressed = await compressImageIfNeeded(file)
      setSelectedFile(compressed)
    } else {
      setSelectedFile(file)
    }
  }

  const handleScanPhoto = async () => {
    if (!selectedFile) {
      toast.error('Please select or drop a photo of code first')
      return
    }

    if (isScanning) return // Prevent duplicate concurrent requests

    setIsScanning(true)
    setScanStatus('Optimizing image & preparing AI Vision...')
    const toastId = toast.loading('Reading handwritten & printed code...')

    try {
      // Ensure image is compressed before sending
      let fileToSend = selectedFile
      if (selectedFile.size > 600 * 1024) {
        fileToSend = await compressImageIfNeeded(selectedFile)
        setSelectedFile(fileToSend)
      }

      setScanStatus('Gemini Vision reading code & identifying algorithm...')

      const formData = new FormData()
      formData.append('file', fileToSend)

      if (experimentId) {
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
      } else {
        if (subjectId) {
          formData.append('subject_id', subjectId)
        }
        formData.append('auto_create', 'false')

        const res: any = await experimentsApi.extractCodeFromPhoto(formData)
        const data = res?.data || res
        setExtractedData(data)
        setEditedCode(data.source_code || '')
        setEditedTitle(data.title || 'Photo Extracted Experiment')
        setEditedLanguage(data.language || 'c')
        toast.success('Code transcribed successfully!', { id: toastId })
      }
    } catch (err: any) {
      console.error('Scan error:', err)
      toast.error(err.message || 'Failed to extract code from photo. Please verify image clarity.', { id: toastId })
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
    setSelectedFile(null)
    setPreviewUrl(null)
    setExtractedData(null)
    setEditedCode('')
    setEditedTitle('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scan Code from Photo (AI Vision)"
      description="Upload a photo of your handwritten lab notebook, textbook, or computer monitor. Gemini Vision transcribes the code and recommends the program name."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Step 1: Upload / Drop Zone */}
        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[rgba(255,255,255,0.15)] hover:border-white/40 bg-[var(--bg-card)]/40 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-metric)] border border-[var(--border-subtle)] flex items-center justify-center text-white shadow-md">
              <Camera className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white font-['Manrope']">
                Take or Select Photo of Code
              </h4>
              <p className="text-xs text-[var(--text-muted)] max-w-sm leading-relaxed">
                Supports handwritten lab notebook pages, whiteboard algorithms, lab manual prints, or monitor screens.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white text-black hover:bg-[#E5E5E5] transition-colors mt-2">
              <Upload className="w-3.5 h-3.5" />
              <span>Choose Image (PNG, JPG, WEBP)</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Photo Preview & Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)]">
              {previewUrl && (
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-black shrink-0 relative group">
                  <img
                    src={previewUrl}
                    alt="Code snapshot"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white truncate max-w-[200px]">
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
                    : 'Photo optimized. Ready to transcribe.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isScanning}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Change
                </Button>
                {!extractedData && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleScanPhoto}
                    isLoading={isScanning}
                    disabled={isScanning}
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
                <div className="p-3 bg-[#111116] rounded-xl border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white/80 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-white" />
                      AI Recommended Program Name:
                    </span>
                    <Badge variant="mono" size="sm" className="uppercase">
                      {editedLanguage}
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="flex items-center gap-2 flex-1 w-full">
                      <FileCode className="w-4 h-4 text-white/60 shrink-0" />
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        placeholder="Experiment Title"
                        className="bg-[#0c0c0e] text-white font-bold text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] focus:border-white focus:outline-none w-full"
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
                    rows={9}
                    value={editedCode}
                    onChange={(e) => setEditedCode(e.target.value)}
                    className="w-full bg-[var(--bg-card)] text-[var(--text-main)] font-mono text-xs rounded-xl border border-[var(--border-subtle)] p-3 focus:border-white focus:outline-none leading-relaxed resize-none shadow-inner"
                  />
                </div>

                {/* Aim & Algorithmic Notes */}
                {extractedData.aim && (
                  <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] space-y-1">
                    <span className="text-white font-medium text-[11px] flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-white" />
                      Inferred Academic Aim:
                    </span>
                    <p className="text-[11px] leading-relaxed text-[#CCCCCC]">{extractedData.aim}</p>
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
