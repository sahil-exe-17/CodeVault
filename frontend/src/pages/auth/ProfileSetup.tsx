import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useAuthStore } from '@/store/authStore'
import { INDIAN_COLLEGES, ENGINEERING_COURSES, ACADEMIC_SEMESTERS } from '@/data/indianAcademicData'
import { CollegeLogo } from '@/components/common/CollegeLogo'
import toast from 'react-hot-toast'

export const ProfileSetup: React.FC = () => {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()
  const [isSaving, setIsSaving] = useState(false)

  const [displayName, setDisplayName] = useState(user?.display_name || '')

  // College Selection State
  const initialCollegeInList = useMemo(() => {
    if (!user?.college) return ''
    const match = INDIAN_COLLEGES.find((c) => c.value === user.college || c.label === user.college)
    return match ? match.value : '__custom__'
  }, [user?.college])

  const [collegeSelect, setCollegeSelect] = useState<string>(initialCollegeInList)
  const [customCollege, setCustomCollege] = useState<string>(
    initialCollegeInList === '__custom__' ? user?.college || '' : ''
  )

  // Course / Department Selection State
  const initialCourseInList = useMemo(() => {
    if (!user?.department) return ''
    const match = ENGINEERING_COURSES.find((c) => c.value === user.department || c.label === user.department)
    return match ? match.value : '__custom__'
  }, [user?.department])

  const [departmentSelect, setDepartmentSelect] = useState<string>(initialCourseInList)
  const [customDepartment, setCustomDepartment] = useState<string>(
    initialCourseInList === '__custom__' ? user?.department || '' : ''
  )

  // Semester Selection State
  const [semesterSelect, setSemesterSelect] = useState<string>(user?.semester || 'Semester 4 (Year 2)')
  const [rollNumber, setRollNumber] = useState(user?.roll_number || '')
  const [codingGoals, setCodingGoals] = useState(user?.coding_goals || '')

  // Options for Dropdowns - clean, minimalist, professional (zero bright badges or emojis)
  const collegeOptions = useMemo(() => [
    ...INDIAN_COLLEGES.map((c) => ({
      value: c.value,
      label: c.label,
      category: c.category,
      shortName: c.shortName,
      description: `${c.city ? c.city + ' • ' : ''}${c.state || ''}`,
      icon: <CollegeLogo name={c.value} domain={c.domain} className="w-5 h-5" />,
    })),
    {
      value: '__custom__',
      label: 'Other / Custom College (Type Manually)',
      category: 'Other',
      description: 'Specify your institute name manually',
    },
  ], [])

  const courseOptions = useMemo(() => [
    ...ENGINEERING_COURSES.map((c) => ({
      value: c.value,
      label: c.label,
    })),
    {
      value: '__custom__',
      label: 'Other / Custom Branch (Type Manually)',
      description: 'Enter your branch or specialization manually',
    },
  ], [])

  const semesterOptions = useMemo(() => ACADEMIC_SEMESTERS.map((s) => ({
    value: s.value,
    label: s.label,
  })), [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving) return
    setIsSaving(true)

    const finalCollege = collegeSelect === '__custom__' ? customCollege.trim() : collegeSelect.trim()
    const finalDepartment = departmentSelect === '__custom__' ? customDepartment.trim() : departmentSelect.trim()

    try {
      const updatedUser = await updateProfile({
        display_name: displayName.trim() || user?.display_name || user?.email?.split('@')[0] || 'Student',
        college: finalCollege,
        department: finalDepartment,
        semester: semesterSelect.trim(),
        roll_number: rollNumber.trim(),
        coding_goals: codingGoals.trim(),
        is_profile_completed: true,
      })
      useAuthStore.getState().setUser(updatedUser)
      toast.success('Academic profile saved successfully!')
      navigate('/subjects', { replace: true })
    } catch (err) {
      console.error('Save profile fallback:', err)
      const fallbackUser: any = {
        ...(user || {}),
        display_name: displayName.trim() || user?.display_name || 'Student',
        college: finalCollege,
        department: finalDepartment,
        semester: semesterSelect.trim(),
        roll_number: rollNumber.trim(),
        coding_goals: codingGoals.trim(),
        is_profile_completed: true,
      }
      localStorage.setItem('codevault_user', JSON.stringify(fallbackUser))
      useAuthStore.getState().setUser(fallbackUser)
      toast.success('Academic profile saved successfully!')
      navigate('/subjects', { replace: true })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSkip = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const updatedUser = await updateProfile({
        is_profile_completed: true,
      })
      useAuthStore.getState().setUser(updatedUser)
      navigate('/subjects', { replace: true })
    } catch {
      const fallbackUser: any = {
        ...(user || {}),
        is_profile_completed: true,
      }
      localStorage.setItem('codevault_user', JSON.stringify(fallbackUser))
      useAuthStore.getState().setUser(fallbackUser)
      navigate('/subjects', { replace: true })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] flex items-center justify-center p-4 select-none relative overflow-hidden transition-colors duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6 backdrop-blur-xl overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shadow-sm">
              <User className="w-4 h-4 text-white/90" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-['Manrope'] text-[var(--text-main)] tracking-tight">
                Academic Profile & Workspace Setup
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Select your engineering college, department, and semester to format all your practicals.
              </p>
            </div>
          </div>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* Full Name */}
          <Input
            label="Full Name (Student / Scholar)"
            placeholder="e.g. Sahil Lale"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          {/* College / University Selection (Across India) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-muted)] font-['Manrope']">
              College / University (Colleges Across India)
            </label>
            <Select
              value={collegeSelect}
              onChange={(val) => setCollegeSelect(val)}
              options={collegeOptions}
              title="Select Your College / University"
              placeholder="Search or select your college in India…"
              searchable={true}
            />
            {collegeSelect === '__custom__' && (
              <div className="pt-2 animate-in fade-in duration-200">
                <Input
                  label="Enter Your College / Institute Name"
                  placeholder="e.g. Government College of Engineering, Pune"
                  value={customCollege}
                  onChange={(e) => setCustomCollege(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Department / Course Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-muted)] font-['Manrope']">
              Department / Engineering Course
            </label>
            <Select
              value={departmentSelect}
              onChange={(val) => setDepartmentSelect(val)}
              options={courseOptions}
              title="Select Your Branch / Program"
              placeholder="Search or select your course / branch…"
              searchable={true}
            />
            {departmentSelect === '__custom__' && (
              <div className="pt-2 animate-in fade-in duration-200">
                <Input
                  label="Enter Your Branch / Department Name"
                  placeholder="e.g. Computer Science & Engineering (Cyber Security)"
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Semester & Student Roll Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] font-['Manrope']">
                Current Semester / Year
              </label>
              <Select
                value={semesterSelect}
                onChange={(val) => setSemesterSelect(val)}
                options={semesterOptions}
                title="Select Academic Semester"
                placeholder="Choose semester…"
              />
            </div>

            <div>
              <Input
                label="Student Roll No. / PRN (Optional)"
                placeholder="e.g. 1032210450 / CS-2024"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Primary Learning Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-muted)] font-['Manrope']">
              Primary Learning Goal / Target (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Master semester lab practicals, automate viva prep & exam records"
              value={codingGoals}
              onChange={(e) => setCodingGoals(e.target.value)}
              className="w-full bg-[var(--bg-metric)] text-[var(--text-main)] placeholder-[var(--text-dim)] text-xs rounded-xl border border-[var(--border-subtle)] px-3.5 py-2.5 focus:border-[var(--border-hover)] focus:outline-none transition-colors"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            >
              Skip for now
            </button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              disabled={isSaving}
              className="px-6 py-2.5 font-semibold text-xs rounded-xl shadow-sm"
            >
              <span>Save & Enter Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
