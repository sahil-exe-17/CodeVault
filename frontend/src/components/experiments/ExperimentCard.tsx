import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, MoreVertical, Copy, Trash2, ArrowUpRight, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { Experiment } from '@/types'
import { experimentsApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface ExperimentCardProps {
  experiment: Experiment
  onDelete?: (id: string) => void
  onUpdate?: (updated: Experiment) => void
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({
  experiment,
  onDelete,
  onUpdate,
}) => {
  const navigate = useNavigate()
  const [isBookmarked, setIsBookmarked] = useState(experiment.is_bookmarked)
  const [showMenu, setShowMenu] = useState(false)

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const nextState = !isBookmarked
    setIsBookmarked(nextState)
    try {
      await experimentsApi.toggleBookmark(experiment.id)
      toast.success(nextState ? 'Experiment bookmarked' : 'Bookmark removed')
      if (onUpdate) onUpdate({ ...experiment, is_bookmarked: nextState })
    } catch {
      // optimistic state kept for demo
    }
  }

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)
    try {
      await experimentsApi.duplicate(experiment.id)
      toast.success('Experiment duplicated')
      navigate('/experiments')
    } catch {
      toast.error('Failed to duplicate')
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)
    if (onDelete) onDelete(experiment.id)
  }

  const formattedDate = experiment.created_at
    ? new Date(experiment.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : 'Recent'

  const subjectName =
    experiment.subject?.name ||
    experiment.subjects?.name ||
    'General Programming'

  return (
    <div
      onClick={() => navigate(`/experiments/${experiment.id}`)}
      className="group relative bg-[#171717] border border-[rgba(255,255,255,0.09)] hover:border-[rgba(255,255,255,0.22)] rounded-xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {experiment.experiment_number && (
              <Badge variant="mono" size="sm">
                {experiment.experiment_number}
              </Badge>
            )}
            <Badge variant="default" size="sm">
              {experiment.language}
            </Badge>
            {experiment.is_revised && (
              <Badge variant="outline" size="sm" className="text-white border-white/40">
                Revised
              </Badge>
            )}
            {experiment.notebook_pdf_url && (
              <Badge variant="outline" size="sm" className="text-[#D4D4D4] border-white/20">
                 Notebook
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleBookmark}
              className={`p-1 rounded transition-colors ${
                isBookmarked ? 'text-white' : 'text-[#666666] hover:text-[#A1A1A1]'
              }`}
              title="Bookmark experiment"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
            </button>

            {/* More Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className="p-1 text-[#666666] hover:text-white rounded transition-colors"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-6 w-32 bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-lg shadow-xl py-1 z-20"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      navigate(`/experiments/${experiment.id}`)
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#F5F5F5] hover:bg-[rgba(255,255,255,0.06)] flex items-center gap-2"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Open
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      navigate(`/ai/explain?id=${experiment.id}`)
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#F5F5F5] hover:bg-[rgba(255,255,255,0.06)] flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Explain
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#F5F5F5] hover:bg-[rgba(255,255,255,0.06)] flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" /> Duplicate
                  </button>
                  <div className="h-[1px] bg-[rgba(255,255,255,0.08)] my-1" />
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:bg-[rgba(255,255,255,0.06)] flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[#F5F5F5] font-['Manrope'] group-hover:text-white transition-colors mb-1 line-clamp-1">
          {experiment.title}
        </h3>

        {/* Subject & Topic */}
        <div className="flex items-center gap-1.5 text-xs text-[#A1A1A1] mb-2 truncate">
          <span className="text-[#666666] font-medium">{subjectName}</span>
          {experiment.topic && (
            <>
              <span className="text-[#444444]">•</span>
              <span className="truncate">{experiment.topic}</span>
            </>
          )}
        </div>

        {/* Aim snippet */}
        {experiment.aim && (
          <p className="text-xs text-[#777777] line-clamp-2 leading-relaxed mb-4">
            {experiment.aim}
          </p>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[11px] text-[#666666] font-mono">
        <span>{formattedDate}</span>
        <div className="flex items-center gap-2 text-[#888888] group-hover:text-white transition-colors">
          <span>Open Workspace</span>
          <ArrowUpRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  )
}

