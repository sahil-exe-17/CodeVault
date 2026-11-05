import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Sparkles, Check, ArrowRight, Lightbulb, Clock, Database, Tag, Target, Code2 } from 'lucide-react'

export interface CodeRecommendationData {
  suggested_title: string
  aim?: string
  detected_language: string
  topic?: string
  time_complexity?: string
  space_complexity?: string
  recommendations: string[]
  sample_input?: string
  expected_output?: string
  is_fallback?: boolean
}

interface AIRecommendationsModalProps {
  isOpen: boolean
  onClose: () => void
  data: CodeRecommendationData | null
  isLoading?: boolean
  onApplyTitle?: (title: string) => void
  onApplyAll?: (data: CodeRecommendationData) => void
  onApplyAim?: (aim: string) => void
  onApplyComplexity?: (time: string, space: string) => void
  onApplyLanguage?: (lang: string) => void
}

export const AIRecommendationsModal: React.FC<AIRecommendationsModalProps> = ({
  isOpen,
  onClose,
  data,
  isLoading = false,
  onApplyTitle,
  onApplyAll,
  onApplyAim,
  onApplyComplexity,
  onApplyLanguage,
}) => {
  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Code Recommendations & Auto-Naming"
      description="Deep algorithmic analysis, suggested program name, and engineering recommendations for your active code."
      maxWidth="2xl"
    >
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-white/10 blur-xl animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white font-['Manrope']">
              Analyzing code logic & algorithm...
            </p>
            <p className="text-xs text-[#888888]">
              Identifying algorithm patterns, determining time/space complexities, and generating recommendations.
            </p>
          </div>
        </div>
      ) : !data ? (
        <div className="py-8 text-center text-xs text-[#888888]">
          No recommendations available for this code snippet.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top Recommendation: Suggested Name / Title */}
          <div className="p-4 rounded-xl bg-[#111116] border border-white/10 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#888888] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                Recommended Name for this Code
              </span>
              <Badge variant="mono" size="sm" className="uppercase">
                {data.detected_language}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-bold text-white font-['Manrope'] tracking-tight">
                  {data.suggested_title}
                </h3>
                {data.topic && (
                  <p className="text-xs text-[#999999] flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#666666]" />
                    <span>Topic: {data.topic}</span>
                  </p>
                )}
              </div>

              {onApplyTitle && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onApplyTitle(data.suggested_title)
                    if (onApplyLanguage && data.detected_language) {
                      onApplyLanguage(data.detected_language)
                    }
                  }}
                  className="h-8 text-xs shrink-0"
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Apply Name to Experiment
                </Button>
              )}
            </div>
          </div>

          {/* Quick Metadata: Complexity & Aim */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Time & Space Complexity */}
            <div className="p-3.5 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.08)] space-y-2">
              <span className="text-[11px] font-medium text-[#888888] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white" />
                Complexity Profile
              </span>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-[#A1A1A1]">
                  <span>Time:</span>
                  <span className="font-mono text-white font-semibold">{data.time_complexity || 'O(n)'}</span>
                </div>
                <div className="flex items-center justify-between text-[#A1A1A1]">
                  <span>Space:</span>
                  <span className="font-mono text-white font-semibold">{data.space_complexity || 'O(1)'}</span>
                </div>
              </div>
              {onApplyComplexity && (
                <button
                  type="button"
                  onClick={() => onApplyComplexity(data.time_complexity || 'O(n)', data.space_complexity || 'O(1)')}
                  className="text-[11px] text-[#A1A1A1] hover:text-white underline underline-offset-2 transition-colors cursor-pointer pt-1"
                >
                  Update Experiment Complexity
                </button>
              )}
            </div>

            {/* Academic Aim */}
            <div className="p-3.5 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.08)] space-y-2">
              <span className="text-[11px] font-medium text-[#888888] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-white" />
                Laboratory Aim
              </span>
              <p className="text-xs text-[#CCCCCC] leading-relaxed line-clamp-3">
                {data.aim || `Implementation and analysis of ${data.suggested_title}.`}
              </p>
              {onApplyAim && data.aim && (
                <button
                  type="button"
                  onClick={() => onApplyAim(data.aim!)}
                  className="text-[11px] text-[#A1A1A1] hover:text-white underline underline-offset-2 transition-colors cursor-pointer pt-1"
                >
                  Apply to Aim Tab
                </button>
              )}
            </div>
          </div>

          {/* Actionable Engineering Recommendations */}
          <div className="p-4 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.08)] space-y-2.5">
            <span className="text-[11px] font-medium text-[#888888] flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-white" />
              Code Recommendations & Improvements
            </span>
            <ul className="space-y-2">
              {(data.recommendations || []).map((rec, index) => (
                <li key={index} className="text-xs text-[#D4D4D4] flex items-start gap-2 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white shrink-0 mt-0.5 font-mono">
                    {index + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sample I/O */}
          {(data.sample_input || data.expected_output) && (
            <div className="p-3.5 rounded-xl bg-[#090909] border border-[rgba(255,255,255,0.06)] space-y-2">
              <span className="text-[11px] font-mono text-[#888888] uppercase tracking-wider">
                Recommended Test Verification
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {data.sample_input && (
                  <div className="p-2 rounded bg-[#141414] border border-white/5 space-y-1">
                    <span className="text-[10px] text-[#777777] uppercase">Sample Input:</span>
                    <pre className="text-white whitespace-pre-wrap">{data.sample_input}</pre>
                  </div>
                )}
                {data.expected_output && (
                  <div className="p-2 rounded bg-[#141414] border border-white/5 space-y-1">
                    <span className="text-[10px] text-[#777777] uppercase">Expected Output:</span>
                    <pre className="text-white whitespace-pre-wrap">{data.expected_output}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.08)]">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Dismiss
            </Button>
            {onApplyAll && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onApplyAll(data)
                  onClose()
                }}
                className="h-8 text-xs font-semibold px-4"
              >
                <span>Apply All Recommendations</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

