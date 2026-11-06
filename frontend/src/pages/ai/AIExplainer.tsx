import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import {
  Sparkles,
  HelpCircle,
  Brain,
  MessageSquare,
  Copy,
  Terminal,
  Layers,
  FileCode,
  ShieldAlert,
  Lightbulb,
  Cpu,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectOption } from '@/components/ui/Select'
import { useThemeStore } from '@/store/themeStore'
import { experimentsApi } from '@/lib/api'
import { explainCodeWithAi } from '@/lib/aiService'
import type { Experiment, AIExplanation } from '@/types'
import toast from 'react-hot-toast'

export const AIExplainer: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { theme } = useThemeStore()

  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [selectedExpId, setSelectedExpId] = useState<string>(searchParams.get('id') || '')
  const [language, setLanguage] = useState('c')
  const [code, setCode] = useState<string>(
    `#include <stdio.h>\n\n// Bubble Sort with early exit flag\nvoid bubbleSort(int arr[], int n) {\n    int i, j, temp, swapped;\n    for (i = 0; i < n - 1; i++) {\n        swapped = 0;\n        for (j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                temp = arr[j];\n                arr[j] = arr[j + 1];\n                arr[j + 1] = temp;\n                swapped = 1;\n            }\n        }\n        if (swapped == 0) break;\n    }\n}\n\nint main() {\n    int arr[] = {64, 34, 25, 12, 22, 11, 90};\n    int n = sizeof(arr)/sizeof(arr[0]);\n    bubbleSort(arr, n);\n    printf("Sorted array: ");\n    for (int i=0; i < n; i++) printf("%d ", arr[i]);\n    return 0;\n}`
  )

  const [mode, setMode] = useState<'beginner' | 'detailed' | 'exam'>('exam')
  const [explanation, setExplanation] = useState<AIExplanation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'line' | 'logic' | 'vars' | 'algo' | 'exam' | 'complexity'>('overview')

  useEffect(() => {
    experimentsApi.list().then((res: any) => {
      const list = Array.isArray(res) ? res : res?.data || []
      setExperiments(list)
      if (selectedExpId) {
        const found = list.find((e: Experiment) => e.id === selectedExpId)
        if (found) {
          setCode(found.source_code || '')
          setLanguage(found.language || 'c')
        }
      }
    }).catch(() => {})
  }, [selectedExpId])

  const handleSelectExperiment = (id: string) => {
    setSelectedExpId(id)
    const found = experiments.find((exp) => exp.id === id)
    if (found) {
      setCode(found.source_code || '')
      setLanguage(found.language || 'c')
    }
  }

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error('Please provide code to analyze')
      return
    }

    setIsLoading(true)
    try {
      const data: any = await explainCodeWithAi({
        experiment_id: selectedExpId || undefined,
        code,
        language,
        mode,
      })

      setExplanation({
        id: `exp-ai-${Date.now()}`,
        experiment_id: selectedExpId || '1',
        mode,
        program_overview: data.program_overview,
        simple_explanation: data.simple_explanation || data.program_overview,
        line_by_line: data.line_by_line || '',
        logic_breakdown: data.logic_breakdown,
        execution_flow: data.execution_flow || data.logic_breakdown,
        variables_and_functions: data.variables_and_functions || '',
        algorithm_explanation: data.algorithm_explanation || data.logic_breakdown,
        io_explanation: data.io_explanation || '',
        time_complexity: data.time_complexity,
        space_complexity: data.space_complexity,
        common_mistakes: data.common_mistakes || '',
        exam_points: data.exam_points,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      toast.success('Deep academic analysis complete!')
    } catch (err: any) {
      toast.error('Could not complete analysis: ' + (err.message || 'Error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopySection = (text?: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success('Section copied to clipboard')
  }

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-['Manrope'] text-white">
          AI Code Explainer
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Generate comprehensive algorithm breakdowns, complexity analysis, and exam viva pointers
        </p>
      </div>

      {/* Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Input Workspace (6 cols) */}
        <div className="lg:col-span-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl flex flex-col overflow-hidden">
          {/* Header Controls */}
          <div className="p-4 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <Select
                  title="Choose Experiment"
                  placeholder="Paste custom code or choose experiment…"
                  value={selectedExpId}
                  onChange={handleSelectExperiment}
                  options={[
                    { value: '', label: 'Paste custom code below...' },
                    ...experiments.map((e) => ({
                      value: e.id,
                      label: `${e.experiment_number ? `${e.experiment_number}: ` : ''}${e.title} (${e.language})`,
                    })),
                  ]}
                />
              </div>

              <Select
                title="Code Language"
                value={language}
                onChange={setLanguage}
                className="w-full sm:w-36"
              >
                <SelectOption value="python">Python</SelectOption>
                <SelectOption value="c">C</SelectOption>
                <SelectOption value="cpp">C++</SelectOption>
                <SelectOption value="java">Java</SelectOption>
                <SelectOption value="javascript">JavaScript</SelectOption>
                <SelectOption value="typescript">TypeScript</SelectOption>
              </Select>
            </div>

            {/* Mode selection buttons */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--text-muted)] font-mono">MODE:</span>
              <div className="flex items-center gap-1 bg-[var(--bg-metric)] p-1 rounded-lg border border-[var(--border-subtle)] flex-1">
                {[
                  { id: 'beginner', label: 'Beginner' },
                  { id: 'detailed', label: 'Detailed' },
                  { id: 'exam', label: 'Practical Exam' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id as any)}
                    className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
                      mode === m.id
                        ? 'bg-white text-black font-semibold'
                        : 'text-[var(--text-muted)] hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-[480px]">
            <Editor
              height="480px"
              language={language === 'c' || language === 'cpp' ? 'cpp' : language}
              theme={theme === 'light' ? 'light' : 'vs-dark'}
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 4,
                lineNumbers: 'on',
              }}
            />
          </div>

          {/* Bottom Action */}
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <Button
              variant="primary"
              size="md"
              onClick={handleAnalyze}
              isLoading={isLoading}
              className="w-full"
              icon={<Sparkles className="w-4 h-4 text-black" />}
            >
              Explain with AI →
            </Button>
          </div>
        </div>

        {/* Right Output Workspace (6 cols) */}
        <div className="lg:col-span-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'line', label: 'Line by Line' },
              { id: 'logic', label: 'Logic & Flow' },
              { id: 'vars', label: 'Variables' },
              { id: 'algo', label: 'Algorithm' },
              { id: 'exam', label: 'Exam Ready' },
              { id: 'complexity', label: 'Complexity' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-3 text-xs whitespace-nowrap font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-white text-white bg-[var(--bg-metric)] font-semibold'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Body */}
          <div className="p-5 flex-1 overflow-y-auto max-h-[520px]">
            {isLoading ? (
              <div className="py-24 text-center space-y-3">
                <div className="animate-spin w-7 h-7 border-2 border-white border-t-transparent rounded-full mx-auto" />
                <h4 className="text-sm font-semibold text-white">Analyzing program structure...</h4>
                <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                  Generating deep logic graphs, time complexity, and practical exam hints with CodeVault AI.
                </p>
              </div>
            ) : explanation ? (
              <div className="space-y-4">
                {/* TAB: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white font-['Manrope']">Program Overview</span>
                        <button onClick={() => handleCopySection(explanation.program_overview)} className="text-[var(--text-dim)] hover:text-white">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {explanation.program_overview}
                      </p>
                    </div>

                    <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                      <span className="text-xs font-semibold text-white font-['Manrope']">Simple Explanation</span>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {explanation.simple_explanation}
                      </p>
                    </div>

                    <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                      <span className="text-xs font-semibold text-white font-['Manrope']">Sample Input & Output</span>
                      <pre className="text-xs text-[var(--text-main)] font-mono bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
                        {explanation.io_explanation || 'Input: Array sequence\nOutput: Ordered array'}
                      </pre>
                    </div>
                  </div>
                )}

                {/* TAB: LINE BY LINE */}
                {activeTab === 'line' && (
                  <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white font-['Manrope']">Line-by-Line Breakdown</span>
                      <button onClick={() => handleCopySection(explanation.line_by_line)} className="text-[var(--text-dim)] hover:text-white">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs text-[var(--text-main)] font-mono whitespace-pre-line leading-relaxed space-y-1">
                      {explanation.line_by_line}
                    </div>
                  </div>
                )}

                {/* TAB: LOGIC & FLOW */}
                {activeTab === 'logic' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                      <span className="text-xs font-semibold text-white font-['Manrope']">Logic Breakdown</span>
                      <div className="text-xs text-[var(--text-muted)] whitespace-pre-line leading-relaxed">
                        {explanation.logic_breakdown}
                      </div>
                    </div>

                    <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                      <span className="text-xs font-semibold text-white font-['Manrope']">Execution Flow</span>
                      <div className="text-xs font-mono text-[var(--text-main)] bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)] leading-relaxed">
                        {explanation.execution_flow}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: VARIABLES */}
                {activeTab === 'vars' && (
                  <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                    <span className="text-xs font-semibold text-white font-['Manrope']">Variables & Functions</span>
                    <div className="text-xs text-[var(--text-muted)] whitespace-pre-line leading-relaxed font-mono">
                      {explanation.variables_and_functions}
                    </div>
                  </div>
                )}

                {/* TAB: ALGORITHM */}
                {activeTab === 'algo' && (
                  <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                    <span className="text-xs font-semibold text-white font-['Manrope']">Algorithm Explanation</span>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {explanation.algorithm_explanation}
                    </p>
                  </div>
                )}

                {/* TAB: EXAM READY */}
                {activeTab === 'exam' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[var(--bg-metric)] border border-[rgba(255,255,255,0.15)] rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-white text-xs font-bold font-['Manrope']">
                        <Lightbulb className="w-4 h-4 text-white" />
                        <span>Important Practical Exam Points</span>
                      </div>
                      <div className="text-xs text-[var(--text-main)] whitespace-pre-line leading-relaxed">
                        {explanation.exam_points}
                      </div>
                    </div>

                    <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-white text-xs font-bold font-['Manrope']">
                        <ShieldAlert className="w-4 h-4 text-white" />
                        <span>Common Mistakes</span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] whitespace-pre-line leading-relaxed">
                        {explanation.common_mistakes}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: COMPLEXITY */}
                {activeTab === 'complexity' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                      <span className="text-[10px] text-[var(--text-dim)] uppercase font-mono block">Time Complexity</span>
                      <span className="text-base font-bold text-white font-mono block">
                        {explanation.time_complexity}
                      </span>
                      <p className="text-[11px] text-[var(--text-muted)] pt-1">
                        Worst-case nested loop iterations.
                      </p>
                    </div>

                    <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                      <span className="text-[10px] text-[var(--text-dim)] uppercase font-mono block">Space Complexity</span>
                      <span className="text-base font-bold text-white font-mono block">
                        {explanation.space_complexity}
                      </span>
                      <p className="text-[11px] text-[var(--text-muted)] pt-1">
                        Auxiliary stack & heap memory overhead.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24 space-y-3">
                <Sparkles className="w-8 h-8 text-[var(--text-dim)] mx-auto" />
                <h4 className="text-sm font-semibold text-white">Ready to Explain</h4>
                <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                  Click 'Explain with AI' to generate a full 12-point breakdown of this code for your practical exams.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Shortcuts */}
          <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-between text-xs">
            <button
              onClick={() => navigate('/ai/ask')}
              className="text-[var(--text-muted)] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask follow-up</span>
            </button>
            <button
              onClick={() => navigate('/ai/viva-practice')}
              className="text-[var(--text-muted)] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Practice Viva</span>
            </button>
            <button
              onClick={() => navigate('/ai/revision-studio')}
              className="text-[var(--text-muted)] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Revision Studio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

