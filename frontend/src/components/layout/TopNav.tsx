import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Plus, Bell, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NewExperimentModal } from '@/components/experiments/NewExperimentModal'

export const TopNav: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Map route to title and breadcrumb
  const getNavInfo = () => {
    const path = location.pathname
    if (path.startsWith('/dashboard')) return { title: 'Dashboard', crumb: 'Workspace' }
    if (path.startsWith('/experiments/new')) return { title: 'New Experiment', crumb: 'Experiments / Create' }
    if (path.startsWith('/experiments/')) return { title: 'Experiment Workspace', crumb: 'Experiments / Editor' }
    if (path.startsWith('/experiments')) return { title: 'All Experiments', crumb: 'Workspace / Library' }
    if (path.startsWith('/subjects')) return { title: 'Subjects', crumb: 'Workspace / Courses' }
    if (path.startsWith('/bookmarks')) return { title: 'Bookmarks', crumb: 'Workspace / Saved' }
    if (path.startsWith('/ai/explain')) return { title: 'AI Code Explainer', crumb: 'AI Studio / Analysis' }
    if (path.startsWith('/ai/ask')) return { title: 'Ask CodeVault', crumb: 'AI Studio / Assistant' }
    if (path.startsWith('/ai/revision-studio')) return { title: 'Revision Studio', crumb: 'AI Studio / Practice' }
    if (path.startsWith('/ai/viva-practice')) return { title: 'Viva Simulator', crumb: 'AI Studio / Oral Exam' }
    if (path.startsWith('/revision-planner')) return { title: 'Revision Planner', crumb: 'Productivity / Schedule' }
    if (path.startsWith('/analytics')) return { title: 'Progress Analytics', crumb: 'Productivity / Metrics' }
    if (path.startsWith('/settings')) return { title: 'Settings', crumb: 'Preferences' }
    return { title: 'CodeVault', crumb: 'Workspace' }
  }

  const { title, crumb } = getNavInfo()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/experiments?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 h-14 bg-[#090909]/85 backdrop-blur-md border-b border-[rgba(255,255,255,0.09)] px-6 flex items-center justify-between select-none">
        {/* Left Title & Breadcrumbs */}
        <div className="flex flex-col">
          <span className="text-[10px] text-[#666666] uppercase tracking-wider font-mono">
            {crumb}
          </span>
          <h2 className="text-base font-bold text-[#F5F5F5] font-['Manrope'] leading-tight">
            {title}
          </h2>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-md mx-6">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiments, topics, or algorithms... (Press Enter)"
              className="w-full bg-[#111111] text-xs text-[#F5F5F5] placeholder-[#555555] rounded-lg pl-9 pr-8 py-1.5 border border-[rgba(255,255,255,0.08)] focus:border-white focus:outline-none transition-colors"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#555555] font-mono border border-[rgba(255,255,255,0.08)] px-1 rounded">
              ⌘K
            </span>
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/ai/explain')}
            className="hidden sm:flex text-xs text-[#A1A1A1] hover:text-white gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>AI Explainer</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsNewModalOpen(true)}
          >
            <span>New Experiment</span>
          </Button>

          <div className="h-4 w-[1px] bg-[rgba(255,255,255,0.09)] mx-1" />

          <button
            className="p-1.5 text-[#666666] hover:text-white rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full" />
          </button>
        </div>
      </header>

      {/* New Experiment Modal */}
      <NewExperimentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />
    </>
  )
}
