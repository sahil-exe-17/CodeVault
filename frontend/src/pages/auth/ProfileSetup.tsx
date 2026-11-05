import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, ArrowRight, Check } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export const ProfileSetup: React.FC = () => {
  const navigate = useNavigate()
  const { user, updateProfile, loading } = useAuthStore()

  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [college, setCollege] = useState(user?.college || '')
  const [department, setDepartment] = useState(user?.department || '')
  const [semester, setSemester] = useState(user?.semester || '')
  const [rollNumber, setRollNumber] = useState(user?.roll_number || '')
  const [codingGoals, setCodingGoals] = useState(user?.coding_goals || '')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile({
        display_name: displayName.trim() || user?.display_name || 'Student',
        college: college.trim(),
        department: department.trim(),
        semester: semester.trim(),
        roll_number: rollNumber.trim(),
        coding_goals: codingGoals.trim(),
        is_profile_completed: true,
      })
      toast.success('Profile created successfully.')
      navigate('/subjects')
    } catch {
      toast.error('Failed to save profile.')
      navigate('/subjects')
    }
  }

  const handleSkip = async () => {
    try {
      await updateProfile({
        is_profile_completed: true,
      })
      navigate('/subjects')
    } catch {
      navigate('/subjects')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-card)] text-[var(--text-main)] flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold font-['Manrope'] text-white">
              Create Student Profile
            </h1>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Set up your academic details to organize your practicals. All questions are optional.
          </p>
        </div>

        {/* Questions Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name (Optional)"
            placeholder="e.g. Alex Rivera"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="College / University (Optional)"
              placeholder="e.g. National Institute of Tech"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            />

            <Input
              label="Department / Branch (Optional)"
              placeholder="e.g. Computer Science & Eng"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Semester / Year (Optional)"
              placeholder="e.g. Semester 4 / Year 2"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            />

            <Input
              label="Roll Number / Student ID (Optional)"
              placeholder="e.g. CS2024-089"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)]">
              Primary Learning Goal (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Prepare for university coding practicals and oral viva"
              value={codingGoals}
              onChange={(e) => setCodingGoals(e.target.value)}
              className="bg-[var(--bg-metric)] text-[var(--text-main)] placeholder-[#666666] text-xs rounded-lg border border-[var(--border-subtle)] px-3 py-2.5 focus:border-white focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
            >
              Skip for now
            </button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={loading}
              className="px-5 font-semibold"
            >
              <span>Save & Continue</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

