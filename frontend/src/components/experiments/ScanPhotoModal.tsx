import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Camera, Upload, CheckCircle2, AlertCircle, RefreshCw, Sparkles, FileCode, ArrowRight } from 'lucide-react'
import { experimentsApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface ScanPhotoModalProps {
  isOpen: boolean
  onClose: () => void
  experimentId?: string
  subjectId?: string
  onExtracted?: (extractedData: any) => void
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
  const [extractedData, setExtractedData] = useState<any | null>(null)
  const [editedCode, setEditedCode] = useState('')
  const [editedTitle, setEditedTitle] = useState('')
  const [editedLanguage, setEditedLanguage] = useState('c')
  const [isSaving, setIsSaving] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, JPEG, WEBP)')
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image size exceeds 20MB limit')
      return
    }

    setSelectedFile(file)
    setExtractedData(null)

    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleScanPhoto = async () => {
    if (!selectedFile) {
      toast.error('Please select or drop a photo of code first')
      return
    }

    setIsScanning(true)
    const toastId = toast.loading('AI Vision reading handwritten & printed code...')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      if (experimentId) {
        // Direct extract for existing experiment
        const res: any = await experimentsApi.extractAndUpdateFromPhoto(experimentId, formData)
        const extracted = res?.extracted || res?.data?.extracted || res
        setExtractedData(extracted)
        setEditedCode(extracted.source_code || '')
        setEditedTitle(extracted.title || 'Photo Extracted Experiment')
        setEditedLanguage(extracted.language || 'c')
        toast.success('Code transcribed successfully from photo!', { id: toastId })
        if (onExtracted) {
          onExtracted(res)
        }
      } else {
        // General extract (can preview then create)
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
        toast.success('Code transcribed successfully from photo!', { id: toastId })
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to extract code from photo', { id: toastId })
    } finally {
      setIsScanning(false)
    }
  }

  const handleApplyOrSave = async () => {
    if (experimentId) {
      // Already updated or update with edits
      toast.success('Code applied to experiment!')
      onClose()
      return
    }

    // Creating new experiment from photo
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scan Code from Photo (AI Vision)"
      description="Upload a photo of your handwritten lab notebook, textbook, or computer monitor. AI will transcribe the code and link it to this experiment."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Step 1: Upload / Drop Zone */}
        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[rgba(255,255,255,0.15)] hover:border-white/40 bg-[#111111]/40 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#171717] border border-[rgba(255,255,255,0.09)] flex items-center justify-center text-white">
              <Camera className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white font-['Manrope']">
                Take or Select Photo of Code
              </h4>
              <p className="text-xs text-[#888888] max-w-sm leading-relaxed">
                Supports phone snapshots of handwritten notebook pages, whiteboard algorithms, lab manual prints, or monitor screens.
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
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-[#111111] rounded-xl border border-[rgba(255,255,255,0.08)]">
              {previewUrl && (
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)] bg-black shrink-0 relative group">
                  <img
                    src={previewUrl}
                    alt="Code snapshot"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white truncate max-w-[240px]">
                    {selectedFile.name}
                  </span>
                  <Badge variant="mono" size="sm">
                    {(selectedFile.size / 1024).toFixed(0)} KB
                  </Badge>
                </div>
                <p className="text-[11px] text-[#888888]">
                  {extractedData
                    ? 'AI code transcription complete. Review the extracted code below.'
                    : 'Photo ready for scanning. Click below to transcribe.'}
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
                  >
                    Read Code with AI
                  </Button>
                )}
              </div>
            </div>

            {/* Step 2: Extracted Code Review */}
            {extractedData && (
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <FileCode className="w-4 h-4 text-white shrink-0" />
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      placeholder="Experiment Title"
                      className="bg-[#111111] text-white font-semibold text-xs px-2.5 py-1 rounded border border-[rgba(255,255,255,0.1)] focus:border-white focus:outline-none w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[#888888]">Language:</span>
                    <select
                      value={editedLanguage}
                      onChange={(e) => setEditedLanguage(e.target.value)}
                      className="bg-[#111111] text-white text-xs px-2 py-1 rounded border border-[rgba(255,255,255,0.1)] focus:border-white focus:outline-none font-mono"
                    >
                      <option value="c">C</option>
                      <option value="cpp">C++</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#888888]">
                    <span>Transcribed Source Code:</span>
                    <span className="font-mono text-[10px] text-[#666666]">
                      {editedCode.split('\n').length} lines
                    </span>
                  </div>
                  <textarea
                    rows={10}
                    value={editedCode}
                    onChange={(e) => setEditedCode(e.target.value)}
                    className="w-full bg-[#090909] text-[#F5F5F5] font-mono text-xs rounded-xl border border-[rgba(255,255,255,0.09)] p-3 focus:border-white focus:outline-none leading-relaxed resize-none shadow-inner"
                  />
                </div>

                {extractedData.aim && (
                  <div className="p-2.5 bg-[#111111] rounded-lg border border-[rgba(255,255,255,0.06)] text-xs text-[#A1A1A1] space-y-0.5">
                    <span className="text-white font-medium text-[11px]">Detected Aim:</span>
                    <p className="text-[11px] leading-relaxed">{extractedData.aim}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(255,255,255,0.08)]">
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

