import React, { useState, useEffect } from 'react'
import { Bookmark as BookmarkIcon, Sparkles } from 'lucide-react'
import { ExperimentCard } from '@/components/experiments/ExperimentCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { experimentsApi } from '@/lib/api'
import type { Experiment } from '@/types'
import { useNavigate } from 'react-router-dom'

export const Bookmarks: React.FC = () => {
  const navigate = useNavigate()
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const defaultBookmarked: Experiment[] = [
    {
      id: 'exp-1',
      user_id: '1',
      subject_id: 'sub-1',
      title: 'Bubble Sort with Early Termination Flag',
      experiment_number: 'EXP-01',
      topic: 'Sorting & Complexity',
      language: 'c',
      aim: 'To implement bubble sort in C and measure comparison passes with an early exit flag.',
      time_complexity: 'O(n²)',
      space_complexity: 'O(1)',
      is_bookmarked: true,
      is_revised: true,
      revision_count: 2,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date().toISOString(),
      subjects: { name: 'Data Structures' },
    },
    {
      id: 'exp-3',
      user_id: '1',
      subject_id: 'sub-2',
      title: 'Round Robin CPU Scheduling Simulator',
      experiment_number: 'EXP-03',
      topic: 'Process Scheduling',
      language: 'python',
      aim: 'Simulate preemptive Round Robin scheduling with configurable time quantum.',
      time_complexity: 'O(n)',
      space_complexity: 'O(n)',
      is_bookmarked: true,
      is_revised: true,
      revision_count: 4,
      created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
      updated_at: new Date().toISOString(),
      subjects: { name: 'Operating Systems' },
    },
  ]

  useEffect(() => {
    setIsLoading(true)
    experimentsApi
      .list({ bookmarked: true })
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data || []
        const bookmarkedOnly = list.filter((e: Experiment) => e.is_bookmarked)
        setExperiments(bookmarkedOnly.length > 0 ? bookmarkedOnly : defaultBookmarked)
      })
      .catch(() => {
        setExperiments(defaultBookmarked)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-bold font-['Manrope'] text-white">
          Bookmarks
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {experiments.length} experiments saved for rapid exam revision
        </p>
      </div>

      {experiments.length === 0 ? (
        <EmptyState
          icon={<BookmarkIcon className="w-8 h-8" />}
          title="No bookmarked experiments"
          description="Click the bookmark icon on any experiment card or detail view to pin it here."
          actionLabel="Browse Experiments"
          onAction={() => navigate('/experiments')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiments.map((exp) => (
            <ExperimentCard
              key={exp.id}
              experiment={exp}
              onUpdate={(updated) => {
                if (!updated.is_bookmarked) {
                  setExperiments(experiments.filter((e) => e.id !== updated.id))
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

