import React, { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts'
import { DonutChart } from '@/components/charts/DonutChart'
import { analyticsApi } from '@/lib/api'
import { Zap, BookOpen, CheckCircle2, Trophy, AlertTriangle } from 'lucide-react'

export const ProgressAnalytics: React.FC = () => {
  const [overview, setOverview] = useState({
    total_experiments: 6,
    total_subjects: 3,
    revision_completion_percent: 50,
    avg_quiz_score: 78,
  })

  const [bySubject, setBySubject] = useState<any[]>([
    { subject_name: 'Data Structures', total_experiments: 12, revised_experiments: 8, progress_percent: 66 },
    { subject_name: 'Operating Systems', total_experiments: 8, revised_experiments: 5, progress_percent: 62 },
    { subject_name: 'Python Programming', total_experiments: 6, revised_experiments: 4, progress_percent: 66 },
  ])

  const [byLanguage, setByLanguage] = useState<any[]>([
    { language: 'python', count: 12 },
    { language: 'c', count: 8 },
    { language: 'cpp', count: 5 },
    { language: 'java', count: 4 },
  ])

  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([
    { day_name: 'Mon', added: 2, revised: 3, total: 5 },
    { day_name: 'Tue', added: 1, revised: 4, total: 5 },
    { day_name: 'Wed', added: 3, revised: 2, total: 5 },
    { day_name: 'Thu', added: 0, revised: 6, total: 6 },
    { day_name: 'Fri', added: 4, revised: 3, total: 7 },
    { day_name: 'Sat', added: 2, revised: 5, total: 7 },
    { day_name: 'Sun', added: 1, revised: 7, total: 8 },
  ])

  const [quizHistory, setQuizHistory] = useState<any[]>([
    { completed_at: 'Oct 20', score_percent: 60, quiz_title: 'Arrays & Sorting' },
    { completed_at: 'Oct 23', score_percent: 75, quiz_title: 'Linked Lists' },
    { completed_at: 'Oct 26', score_percent: 85, quiz_title: 'Round Robin CPU' },
    { completed_at: 'Oct 29', score_percent: 90, quiz_title: 'Tree Traversals' },
  ])

  const [weakTopics, setWeakTopics] = useState<any[]>([
    {
      topic: 'Dining Philosophers Deadlock Prevention',
      subject: 'Operating Systems',
      revision_count: 0,
      suggestion: 'Practice semaphore synchronization conditions before viva.',
    },
    {
      topic: 'Binary Search Tree Rotations (AVL)',
      subject: 'Data Structures',
      revision_count: 1,
      suggestion: 'Review LL, RR, LR, RL balancing cases.',
    },
    {
      topic: 'Asyncio Event Loop Exception Handling',
      subject: 'Python Programming',
      revision_count: 1,
      suggestion: 'Test coroutine cancellation edge cases.',
    },
  ])

  useEffect(() => {
    analyticsApi.getOverview().then((res: any) => {
      if (res && res.total_experiments !== undefined) setOverview(res)
    }).catch(() => {})

    analyticsApi.getBySubject().then((res: any) => {
      if (Array.isArray(res) && res.length > 0) setBySubject(res)
    }).catch(() => {})

    analyticsApi.getByLanguage().then((res: any) => {
      if (Array.isArray(res) && res.length > 0) setByLanguage(res)
    }).catch(() => {})

    analyticsApi.getWeeklyActivity().then((res: any) => {
      if (Array.isArray(res) && res.length > 0) setWeeklyActivity(res)
    }).catch(() => {})

    analyticsApi.getQuizPerformance().then((res: any) => {
      if (Array.isArray(res) && res.length > 0) setQuizHistory(res)
    }).catch(() => {})

    analyticsApi.getWeakTopics().then((res: any) => {
      if (Array.isArray(res) && res.length > 0) setWeakTopics(res)
    }).catch(() => {})
  }, [])

  return (
    <div className="space-y-8 select-none pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-['Manrope'] text-white">
          Progress Analytics
        </h1>
        <p className="text-xs text-[#888888] mt-1">
          Detailed metrics tracking your experiment documentation, revision velocity, and practical quiz scores
        </p>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#888888] mb-2 text-xs">
            <span>Total Experiments</span>
            <BookOpen className="w-4 h-4 text-[#666666]" />
          </div>
          <div className="text-3xl font-extrabold font-['Manrope'] text-white">
            {overview.total_experiments}
          </div>
          <span className="text-[11px] text-[#888888] mt-1 block">Documented practicals</span>
        </div>

        <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#888888] mb-2 text-xs">
            <span>Revision Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#666666]" />
          </div>
          <div className="text-3xl font-extrabold font-['Manrope'] text-white">
            {overview.revision_completion_percent}%
          </div>
          <span className="text-[11px] text-[#888888] mt-1 block">Reviewed & verified</span>
        </div>

        <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#888888] mb-2 text-xs">
            <span>Avg Quiz Score</span>
            <Trophy className="w-4 h-4 text-[#666666]" />
          </div>
          <div className="text-3xl font-extrabold font-['Manrope'] text-white">
            {overview.avg_quiz_score}%
          </div>
          <span className="text-[11px] text-[#888888] mt-1 block">MCQ & viva retention</span>
        </div>

        <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#888888] mb-2 text-xs">
            <span>Active Streak</span>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="text-3xl font-extrabold font-['Manrope'] text-white">
            5 Days
          </div>
          <span className="text-[11px] text-[#888888] mt-1 block">Consistent daily pace</span>
        </div>
      </div>

      {/* Charts Row: Weekly Activity (Area Chart) & Programming Languages (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Activity Area Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold font-['Manrope'] text-white">
                Revision & Coding Activity
              </h3>
              <p className="text-xs text-[#888888]">Daily practical events over the last 7 days</p>
            </div>
            <span className="text-[10px] text-[#666666] font-mono">Area Curve</span>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="monochromeArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day_name" stroke="#666666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666666" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload
                      return (
                        <div className="bg-[#171717] border border-[rgba(255,255,255,0.15)] p-2 rounded text-xs shadow-xl">
                          <span className="font-semibold text-white">{d.day_name}</span>
                          <span className="text-[#888888] block text-[10px]">
                            Added: {d.added} • Revised: {d.revised}
                          </span>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area type="monotone" dataKey="total" stroke="#FFFFFF" strokeWidth={2} fillOpacity={1} fill="url(#monochromeArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Languages Distribution Donut (5 cols) */}
        <div className="lg:col-span-5 bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold font-['Manrope'] text-white mb-1">
              Programming Languages
            </h3>
            <p className="text-xs text-[#888888] mb-2">Experiments by technical stack</p>
            <DonutChart data={byLanguage} />
          </div>
        </div>
      </div>

      {/* Charts Row: Quiz Performance Over Time & Subject Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quiz Performance Line Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold font-['Manrope'] text-white">
                Quiz & Viva Performance Over Time
              </h3>
              <p className="text-xs text-[#888888]">Scoring percentage progression across attempts</p>
            </div>
            <span className="text-[10px] text-[#666666] font-mono">0-100% Scale</span>
          </div>

          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quizHistory}>
                <XAxis dataKey="completed_at" stroke="#666666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#666666" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload
                      return (
                        <div className="bg-[#171717] border border-[rgba(255,255,255,0.15)] p-2 rounded text-xs shadow-xl">
                          <span className="font-semibold text-white">{d.quiz_title}</span>
                          <span className="text-white block text-sm font-bold font-mono">
                            {d.score_percent}%
                          </span>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line type="monotone" dataKey="score_percent" stroke="#FFFFFF" strokeWidth={2.5} dot={{ r: 4, fill: '#FFFFFF' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Revision Progress Bars (5 cols) */}
        <div className="lg:col-span-5 bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold font-['Manrope'] text-white">
              Revision Progress by Subject
            </h3>
            <p className="text-xs text-[#888888]">Completion across curriculum</p>
          </div>

          <div className="space-y-4 pt-1">
            {bySubject.map((s, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium">{s.subject_name}</span>
                  <span className="text-[#888888] font-mono">{s.progress_percent || 60}%</span>
                </div>
                <div className="w-full h-2 bg-[#222222] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${s.progress_percent || 60}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weak Topics Table */}
      <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-white" />
            <h3 className="text-sm font-semibold font-['Manrope'] text-white">
              Areas Needing Attention
            </h3>
          </div>
          <span className="text-xs text-[#888888]">Recommended for your next revision block</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111111] text-[#888888] font-mono text-[10px] uppercase border-b border-[rgba(255,255,255,0.06)]">
              <tr>
                <th className="py-2.5 px-3">Topic / Algorithm</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Revision Passes</th>
                <th className="py-2.5 px-3">Suggested Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-[#D4D4D4]">
              {weakTopics.map((topic, i) => (
                <tr key={i} className="hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="py-3 px-3 font-semibold text-white">{topic.topic}</td>
                  <td className="py-3 px-3 text-[#A1A1A1]">{topic.subject}</td>
                  <td className="py-3 px-3 font-mono text-[#888888]">{topic.revision_count}</td>
                  <td className="py-3 px-3 text-[#888888]">{topic.suggestion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

