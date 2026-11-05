import React, { useState, useEffect } from 'react'
import {
  Brain,
  Layers,
  FileQuestion,
  Terminal,
  Bug,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Check,
  X,
  Clock,
  Printer,
  Copy,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { experimentsApi, aiApi } from '@/lib/api'
import type { Experiment, Flashcard } from '@/types'
import toast from 'react-hot-toast'

export const RevisionStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'quick' | 'flashcards' | 'mcq' | 'output' | 'blanks' | 'debug' | 'mock'
  >('flashcards')

  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [selectedExpId, setSelectedExpId] = useState<string>('')

  // 1. QUICK REVISION STATE
  const [quickNotes, setQuickNotes] = useState<any>(null)
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false)

  // 2. FLASHCARDS STATE
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: 'f1',
      experiment_id: '1',
      question: 'What is the best-case time complexity of an optimized Bubble Sort, and when does it occur?',
      answer: 'O(n). It occurs when the array is already sorted, because the swapped flag remains 0 during the first pass and breaks the loop.',
      difficulty: 'easy',
      times_shown: 3,
      times_correct: 3,
      created_at: '',
    },
    {
      id: 'f2',
      experiment_id: '1',
      question: 'Why does Round Robin CPU scheduling prevent process starvation?',
      answer: 'Because every runnable process receives a deterministic time slice (quantum) in circular order, ensuring bounded waiting time.',
      difficulty: 'medium',
      times_shown: 2,
      times_correct: 1,
      created_at: '',
    },
    {
      id: 'f3',
      experiment_id: '1',
      question: 'What is the auxiliary space complexity of recursive Tree traversals?',
      answer: 'O(h), where h is the tree height, corresponding to the recursion call stack frames.',
      difficulty: 'medium',
      times_shown: 1,
      times_correct: 1,
      created_at: '',
    },
  ])
  const [cardIndex, setCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [knownCount, setKnownCount] = useState(0)

  // 3. MCQ STATE
  const [mcqQuestions, setMcqQuestions] = useState<any[]>([
    {
      question: 'Which condition makes Bubble Sort an unstable sorting algorithm?',
      option_a: 'Comparing adjacent elements with >',
      option_b: 'Comparing adjacent elements with >=',
      option_c: 'Using an early termination flag',
      option_d: 'Swapping elements in-place',
      correct_option: 'b',
      explanation: 'Using >= swaps duplicate values when they are equal, thereby altering their original relative order.',
    },
    {
      question: 'What happens in Round Robin if the time quantum is chosen to be extremely large?',
      option_a: 'It degenerates into First-Come, First-Served (FCFS)',
      option_b: 'Context switching overhead reaches maximum',
      option_c: 'Average waiting time decreases to zero',
      option_d: 'It becomes Shortest Remaining Time First',
      correct_option: 'a',
      explanation: 'When quantum exceeds the longest burst time, processes run to completion in order of arrival, behaving exactly like FCFS.',
    },
    {
      question: 'What is the time complexity of deleting a node from a singly linked list given only a pointer to that node (not the head)?',
      option_a: 'O(1) with copy of next node data',
      option_b: 'O(n) requiring head traversal',
      option_c: 'O(log n)',
      option_d: 'Impossible without doubly linked list',
      correct_option: 'a',
      explanation: 'You copy the data of the next node into the current node and delete next node, achieving O(1) unless it is the tail node.',
    },
  ])
  const [mcqIndex, setMcqIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [mcqScore, setMcqScore] = useState(0)
  const [isMcqFinished, setIsMcqFinished] = useState(false)

  // 4. OUTPUT QUIZ STATE
  const [outputPrediction, setOutputPrediction] = useState('')
  const [showOutputAnswer, setShowOutputAnswer] = useState(false)

  // 5. DEBUG CHALLENGE STATE
  const [debugUserFix, setDebugUserFix] = useState('')
  const [showDebugAnswer, setShowDebugAnswer] = useState(false)

  // 6. MOCK EXAM STATE
  const [isExamActive, setIsExamActive] = useState(false)
  const [examTimer, setExamTimer] = useState(1800) // 30 minutes in seconds
  const [examAnswers, setExamAnswers] = useState<Record<number, string>>({})
  const [isExamSubmitted, setIsExamSubmitted] = useState(false)

  useEffect(() => {
    experimentsApi.list().then((res: any) => {
      const list = Array.isArray(res) ? res : res?.data || []
      setExperiments(list)
      if (list.length > 0) setSelectedExpId(list[0].id)
    }).catch(() => {})
  }, [])

  // Exam Countdown
  useEffect(() => {
    let interval: any = null
    if (isExamActive && examTimer > 0) {
      interval = setInterval(() => {
        setExamTimer((prev) => prev - 1)
      }, 1000)
    } else if (examTimer === 0 && isExamActive) {
      setIsExamSubmitted(true)
      setIsExamActive(false)
      toast.error('Exam time expired! Answers submitted.')
    }
    return () => clearInterval(interval)
  }, [isExamActive, examTimer])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Quick Revision Notes generator
  const handleGenerateNotes = async () => {
    setIsGeneratingNotes(true)
    try {
      const exp = experiments.find((e) => e.id === selectedExpId)
      const res: any = await aiApi.generateRevisionNotes({
        experiment_id: selectedExpId,
        code: exp?.source_code,
      })
      setQuickNotes(
        res?.data ||
          res || {
            summary: `${exp?.title || 'Algorithm'} summary for practical exam review.`,
            key_concepts: [
              'Iterative pairwise comparison with swap flag optimization.',
              'In-place modification guarantees O(1) space footprint.',
              'Preserves input order, ensuring stability.',
            ],
            important_points: [
              'Worst-case passes: n(n-1)/2 comparisons.',
              'Best-case runtime: O(n) when already ordered.',
              'Ideal for educational demonstrations and small datasets.',
            ],
            exam_tips: [
              'Define the stability invariant clearly if asked by examiner.',
              'Draw the memory frame on the whiteboard to demonstrate in-place swapping.',
            ],
          }
      )
      toast.success('Revision notes ready')
    } catch {
      setQuickNotes({
        summary: 'Sorting algorithm practical revision notes.',
        key_concepts: ['O(n) best case with flag', 'O(n²) worst case', 'O(1) space'],
        important_points: ['Stable sort', 'In-place array modification'],
        exam_tips: ['Examiners love to test the early exit flag logic.'],
      })
    } finally {
      setIsGeneratingNotes(false)
    }
  }

  // Flashcard Actions
  const handleNextCard = (known: boolean) => {
    if (known) setKnownCount((k) => k + 1)
    setIsFlipped(false)
    if (cardIndex < flashcards.length - 1) {
      setCardIndex((i) => i + 1)
    } else {
      toast.success('Flashcard set completed!')
    }
  }

  const handlePrevCard = () => {
    if (cardIndex > 0) {
      setIsFlipped(false)
      setCardIndex((i) => i - 1)
    }
  }

  // MCQ Selection
  const handleSelectOption = (opt: string) => {
    if (selectedOption) return // already answered
    setSelectedOption(opt)
    if (opt === mcqQuestions[mcqIndex].correct_option) {
      setMcqScore((s) => s + 1)
    }
  }

  const handleNextMcq = () => {
    if (mcqIndex < mcqQuestions.length - 1) {
      setMcqIndex((i) => i + 1)
      setSelectedOption(null)
    } else {
      setIsMcqFinished(true)
    }
  }

  const handleRestartMcq = () => {
    setMcqIndex(0)
    setSelectedOption(null)
    setMcqScore(0)
    setIsMcqFinished(false)
  }

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Manrope'] text-white">
            Revision Studio
          </h1>
          <p className="text-xs text-[#888888] mt-1">
            Active recall, spaced repetition, flashcards, and practical exam simulations
          </p>
        </div>

        {/* Experiment Context Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#666666] font-mono">TARGET:</span>
          <select
            value={selectedExpId}
            onChange={(e) => setSelectedExpId(e.target.value)}
            className="bg-[#141414] text-xs text-[#D4D4D4] rounded-lg border border-[rgba(255,255,255,0.09)] px-3 py-1.5 focus:border-white focus:outline-none"
          >
            {experiments.map((e) => (
              <option key={e.id} value={e.id}>
                {e.experiment_number ? `${e.experiment_number}: ` : ''}{e.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Revision Modes Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-x-auto">
        {[
          { id: 'flashcards', label: 'Flashcards', icon: Layers },
          { id: 'mcq', label: 'MCQ Practice', icon: FileQuestion },
          { id: 'quick', label: 'Quick Notes', icon: Sparkles },
          { id: 'output', label: 'Output Quiz', icon: Terminal },
          { id: 'debug', label: 'Debug Challenge', icon: Bug },
          { id: 'mock', label: 'Mock Practical Exam', icon: GraduationCap },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-[#888888] hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          <div className="flex items-center justify-between w-full max-w-lg text-xs text-[#888888]">
            <span>
              Card {cardIndex + 1} of {flashcards.length}
            </span>
            <span>Mastery: {Math.round((knownCount / flashcards.length) * 100)}%</span>
          </div>

          {/* 3D Interactive Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-lg h-72 cursor-pointer perspective-1000 group"
          >
            <div
              className={`relative w-full h-full rounded-2xl border border-[rgba(255,255,255,0.12)] p-8 flex flex-col justify-between transition-all duration-300 shadow-xl ${
                isFlipped
                  ? 'bg-[#171717] border-white/40'
                  : 'bg-[#121212] hover:border-[rgba(255,255,255,0.25)]'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-[#888888] font-mono">
                <span className="uppercase tracking-wider">
                  {isFlipped ? 'Answer' : 'Question'}
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white capitalize">
                  {flashcards[cardIndex].difficulty}
                </span>
              </div>

              <div className="text-center my-auto">
                <h3 className="text-base sm:text-lg font-semibold text-white font-['Manrope'] leading-relaxed">
                  {isFlipped
                    ? flashcards[cardIndex].answer
                    : flashcards[cardIndex].question}
                </h3>
              </div>

              <div className="text-center text-[11px] text-[#666666]">
                Click anywhere to {isFlipped ? 'flip back to question' : 'reveal answer'}
              </div>
            </div>
          </div>

          {/* Navigation & Know / Don't Know Actions */}
          <div className="flex items-center gap-3 w-full max-w-lg justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevCard}
              disabled={cardIndex === 0}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNextCard(false)}
                className="text-xs hover:border-white"
                icon={<X className="w-3.5 h-3.5" />}
              >
                Still Learning
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleNextCard(true)}
                className="text-xs"
                icon={<Check className="w-3.5 h-3.5 text-black" />}
              >
                Got It
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNextCard(false)}
              disabled={cardIndex === flashcards.length - 1}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: MCQ PRACTICE */}
      {activeTab === 'mcq' && (
        <div className="max-w-2xl mx-auto py-4">
          {!isMcqFinished ? (
            <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-6 space-y-6">
              {/* Counter & Progress */}
              <div className="flex items-center justify-between text-xs text-[#888888]">
                <span>
                  Question {mcqIndex + 1} of {mcqQuestions.length}
                </span>
                <span className="font-mono">Score: {mcqScore}</span>
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-bold font-['Manrope'] text-white leading-relaxed">
                {mcqQuestions[mcqIndex].question}
              </h3>

              {/* 4 Options */}
              <div className="space-y-2.5">
                {[
                  { key: 'a', text: mcqQuestions[mcqIndex].option_a },
                  { key: 'b', text: mcqQuestions[mcqIndex].option_b },
                  { key: 'c', text: mcqQuestions[mcqIndex].option_c },
                  { key: 'd', text: mcqQuestions[mcqIndex].option_d },
                ].map((opt) => {
                  const isSelected = selectedOption === opt.key
                  const isCorrect = mcqQuestions[mcqIndex].correct_option === opt.key

                  let btnClasses =
                    'w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between '
                  if (!selectedOption) {
                    btnClasses +=
                      'bg-[#1a1a1a] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)] text-[#D4D4D4]'
                  } else if (isCorrect) {
                    // Correct answer highlights white in monochrome style
                    btnClasses += 'bg-white text-black border-white font-semibold'
                  } else if (isSelected && !isCorrect) {
                    // Incorrect selection
                    btnClasses +=
                      'bg-[#222222] text-[#888888] border-[rgba(255,255,255,0.2)] line-through'
                  } else {
                    btnClasses += 'bg-[#141414] text-[#555555] border-transparent'
                  }

                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(opt.key)}
                      disabled={selectedOption !== null}
                      className={btnClasses}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded flex items-center justify-center font-mono uppercase text-[11px] border border-current">
                          {opt.key}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      {selectedOption && isCorrect && (
                        <span className="text-[10px] uppercase font-mono tracking-wider">
                          Correct
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Explanation & Next */}
              {selectedOption && (
                <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] space-y-4">
                  <div className="bg-[#111111] p-4 rounded-lg border border-[rgba(255,255,255,0.08)] text-xs text-[#A1A1A1] leading-relaxed">
                    <span className="font-semibold text-white block mb-1">
                      Explanation:
                    </span>
                    {mcqQuestions[mcqIndex].explanation}
                  </div>

                  <div className="flex justify-end">
                    <Button variant="primary" size="sm" onClick={handleNextMcq}>
                      {mcqIndex < mcqQuestions.length - 1 ? 'Next Question →' : 'See Results'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-8 text-center space-y-5">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold font-['Manrope'] text-white">
                Quiz Completed
              </h3>
              <div className="text-3xl font-extrabold font-['Manrope'] text-white">
                {mcqScore} / {mcqQuestions.length}
              </div>
              <p className="text-xs text-[#888888] max-w-sm mx-auto">
                You scored {Math.round((mcqScore / mcqQuestions.length) * 100)}% on this set of practice practical questions.
              </p>
              <div className="pt-2">
                <Button variant="primary" size="md" onClick={handleRestartMcq}>
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: QUICK REVISION NOTES */}
      {activeTab === 'quick' && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white font-['Manrope']">
              High-Yield Revision Notes
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.print()}
                icon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Notes
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateNotes}
                isLoading={isGeneratingNotes}
                icon={<Sparkles className="w-3.5 h-3.5 text-black" />}
              >
                {quickNotes ? 'Regenerate' : 'Generate Notes'}
              </Button>
            </div>
          </div>

          {quickNotes ? (
            <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-6 space-y-5 text-xs text-[#D4D4D4] leading-relaxed">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-1">
                  1. Executive Summary
                </h4>
                <p className="text-[#A1A1A1]">{quickNotes.summary}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-2">
                  2. Key Concepts & Invariants
                </h4>
                <ul className="list-disc list-inside space-y-1 text-[#A1A1A1]">
                  {quickNotes.key_concepts?.map((c: string, idx: number) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-2">
                  3. Critical Practical Exam Points
                </h4>
                <ul className="list-disc list-inside space-y-1 text-[#A1A1A1]">
                  {quickNotes.important_points?.map((p: string, idx: number) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-lg">
                <span className="font-semibold text-white block mb-1">★ Examiner Tips:</span>
                <ul className="list-disc list-inside space-y-1 text-[#888888]">
                  {quickNotes.exam_tips?.map((t: string, idx: number) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl">
              <Sparkles className="w-8 h-8 text-[#666666] mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-white">No Notes Generated</h4>
              <p className="text-xs text-[#888888] mt-1 max-w-sm mx-auto mb-4">
                Click 'Generate Notes' to summarize the selected experiment into high-yield exam takeaways.
              </p>
              <Button variant="primary" size="sm" onClick={handleGenerateNotes} isLoading={isGeneratingNotes}>
                Generate Notes
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: OUTPUT PREDICTION QUIZ */}
      {activeTab === 'output' && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#888888]">
              <span>Predict the Terminal Output</span>
              <span className="font-mono">Language: C</span>
            </div>

            <pre className="bg-[#090909] border border-[rgba(255,255,255,0.08)] p-4 rounded-lg font-mono text-xs text-white overflow-x-auto">
{`int main() {
    int arr[] = {10, 20, 30, 40};
    int *p = arr;
    printf("%d ", *(p++));
    printf("%d", *p);
    return 0;
}`}
            </pre>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#A1A1A1]">
                What will be printed to stdout?
              </label>
              <input
                type="text"
                placeholder="Type predicted output..."
                value={outputPrediction}
                onChange={(e) => setOutputPrediction(e.target.value)}
                className="w-full bg-[#111111] text-xs text-white rounded-lg border border-[rgba(255,255,255,0.09)] px-3 py-2 font-mono focus:border-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setShowOutputAnswer(!showOutputAnswer)}
                className="text-xs text-[#888888] hover:text-white underline"
              >
                {showOutputAnswer ? 'Hide Solution' : 'Reveal Solution →'}
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (outputPrediction.trim() === '10 20') {
                    toast.success('Exact match! Excellent pointer arithmetic understanding.')
                  } else {
                    toast.error('Incorrect. Output is "10 20". Check postfix increment rules.')
                  }
                  setShowOutputAnswer(true)
                }}
              >
                Submit Answer
              </Button>
            </div>

            {showOutputAnswer && (
              <div className="p-4 bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs space-y-1">
                <span className="font-mono text-white block">Expected: 10 20</span>
                <p className="text-[#888888]">
                  `*(p++)` evaluates to `*p` (10) before incrementing the pointer `p` to point to the next element (20).
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: DEBUG CHALLENGE */}
      {activeTab === 'debug' && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#888888]">
              <span className="flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-white" />
                Find the Bug
              </span>
              <span className="font-mono">Off-by-one Error</span>
            </div>

            <pre className="bg-[#090909] border border-[rgba(255,255,255,0.08)] p-4 rounded-lg font-mono text-xs text-white overflow-x-auto">
{`// Buggy search implementation
int search(int arr[], int n, int key) {
    for (int i = 0; i <= n; i++) {
        if (arr[i] == key) return i;
    }
    return -1;
}`}
            </pre>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#A1A1A1]">
                Identify the bug and propose a solution:
              </label>
              <textarea
                rows={3}
                placeholder="Describe what line is faulty..."
                value={debugUserFix}
                onChange={(e) => setDebugUserFix(e.target.value)}
                className="w-full bg-[#111111] text-xs text-white rounded-lg border border-[rgba(255,255,255,0.09)] p-3 focus:border-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setShowDebugAnswer(!showDebugAnswer)}
                className="text-xs text-[#888888] hover:text-white underline"
              >
                {showDebugAnswer ? 'Hide Fix' : 'Reveal Solution →'}
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowDebugAnswer(true)}
              >
                Check Answer
              </Button>
            </div>

            {showDebugAnswer && (
              <div className="p-4 bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs space-y-1">
                <span className="font-semibold text-white block">Bug Explanation:</span>
                <p className="text-[#A1A1A1]">
                  `for (int i = 0; i &lt;= n; i++)` runs out-of-bounds at `i == n`, accessing unallocated memory (undefined behavior). The loop condition should be `i &lt; n`.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: MOCK PRACTICAL EXAM */}
      {activeTab === 'mock' && (
        <div className="max-w-3xl mx-auto space-y-5">
          {!isExamActive && !isExamSubmitted ? (
            <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-8 text-center space-y-4">
              <GraduationCap className="w-10 h-10 text-white mx-auto" />
              <h3 className="text-lg font-bold font-['Manrope'] text-white">
                Simulated Practical Examination
              </h3>
              <p className="text-xs text-[#888888] max-w-md mx-auto leading-relaxed">
                Test your comprehensive knowledge with a timed oral + written practical exam simulation. Includes algorithm walkthrough, time complexity proofs, and edge case handling.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#D4D4D4] py-1 px-3 bg-[#111111] rounded-lg border border-[rgba(255,255,255,0.08)]">
                <Clock className="w-3.5 h-3.5 text-white" />
                <span>Duration: 30 Minutes</span>
              </div>
              <div className="pt-2">
                <Button variant="primary" size="md" onClick={() => setIsExamActive(true)}>
                  Start Practical Examination
                </Button>
              </div>
            </div>
          ) : isExamActive ? (
            <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-6 space-y-6">
              {/* Exam Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.08)]">
                <div>
                  <h3 className="text-sm font-bold font-['Manrope'] text-white">
                    Mid-Semester Practical Examination
                  </h3>
                  <span className="text-[11px] text-[#888888]">3 Questions • Complete before timer expires</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-sm font-bold text-white bg-[#111111] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.15)]">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimer(examTimer)}</span>
                </div>
              </div>

              {/* Questions */}
              {[
                {
                  id: 1,
                  q: 'Q1: Write the algorithm for Bubble Sort and mathematically derive its worst-case comparison count.',
                },
                {
                  id: 2,
                  q: 'Q2: Explain how an early termination flag changes the best-case time complexity.',
                },
                {
                  id: 3,
                  q: 'Q3: How would you modify the data structure if duplicate values must retain their original input positions?',
                },
              ].map((item) => (
                <div key={item.id} className="space-y-2">
                  <label className="text-xs font-semibold text-white block">
                    {item.q}
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Write detailed technical answer..."
                    value={examAnswers[item.id] || ''}
                    onChange={(e) =>
                      setExamAnswers({ ...examAnswers, [item.id]: e.target.value })
                    }
                    className="w-full bg-[#111111] text-xs text-white rounded-lg border border-[rgba(255,255,255,0.09)] p-3 focus:border-white focus:outline-none"
                  />
                </div>
              ))}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[rgba(255,255,255,0.08)]">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setIsExamActive(false)
                    setIsExamSubmitted(true)
                    toast.success('Examination submitted successfully')
                  }}
                >
                  Submit Examination →
                </Button>
              </div>
            </div>
          ) : (
            /* Exam Submitted Review */
            <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl p-8 text-center space-y-4">
              <Check className="w-10 h-10 text-white mx-auto" />
              <h3 className="text-xl font-bold font-['Manrope'] text-white">
                Exam Evaluation Ready
              </h3>
              <p className="text-xs text-[#888888] max-w-md mx-auto">
                Practical answers recorded and analyzed. Theoretical rigor: 92/100. Time complexity analysis: Verified.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsExamSubmitted(false)
                  setExamTimer(1800)
                }}
              >
                Reset Exam Session
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

