export interface User {
  id: string
  email: string
  username?: string
  display_name?: string
  avatar_url?: string
}

export interface Subject {
  id: string
  user_id: string
  name: string
  description?: string
  semester?: string
  color?: string
  experiment_count?: number
  created_at: string
  updated_at: string
}

export interface Experiment {
  id: string
  user_id: string
  subject_id: string
  subject?: Subject
  subjects?: { name: string; color?: string }
  title: string
  experiment_number?: string
  topic?: string
  language: 'python' | 'java' | 'c' | 'cpp' | 'javascript' | 'typescript' | 'other'
  aim?: string
  theory?: string
  algorithm?: string
  source_code?: string
  sample_input?: string
  expected_output?: string
  actual_output?: string
  observations?: string
  personal_notes?: string
  time_complexity?: string
  space_complexity?: string
  is_bookmarked: boolean
  is_revised: boolean
  revision_count: number
  last_opened_at?: string
  created_at: string
  updated_at: string
}

export interface AIExplanation {
  id: string
  experiment_id: string
  user_id?: string
  mode: 'beginner' | 'detailed' | 'exam'
  program_overview?: string
  simple_explanation?: string
  line_by_line?: string
  logic_breakdown?: string
  execution_flow?: string
  variables_and_functions?: string
  algorithm_explanation?: string
  io_explanation?: string
  time_complexity?: string
  space_complexity?: string
  common_mistakes?: string
  exam_points?: string
  raw_response?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  experiment_id?: string
  experiment?: Experiment
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  metadata?: Record<string, any>
}

export interface Flashcard {
  id: string
  experiment_id: string
  user_id?: string
  question: string
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
  times_shown: number
  times_correct: number
  created_at: string
}

export interface Quiz {
  id: string
  experiment_id?: string
  subject_id?: string
  user_id?: string
  quiz_type: 'mcq' | 'output_prediction' | 'fill_blanks' | 'debug_challenge' | 'mock_exam'
  title: string
  questions?: QuizQuestion[]
  quiz_questions?: QuizQuestion[]
  created_at: string
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question_text: string
  option_a?: string
  option_b?: string
  option_c?: string
  option_d?: string
  correct_option?: string
  explanation?: string
  code_snippet?: string
  order_index: number
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  user_id?: string
  score: number
  total_questions: number
  time_taken_seconds: number
  answers?: Record<string, any>
  completed_at: string
}

export interface RevisionSession {
  id: string
  user_id?: string
  experiment_id: string
  experiment?: Experiment
  scheduled_date: string
  completed_at?: string
  is_complete?: boolean
  session_type: 'quick' | 'flashcard' | 'mcq' | 'viva'
  notes?: string
}

export interface ExamSchedule {
  id: string
  user_id?: string
  subject_id?: string
  subject?: Subject
  exam_name?: string
  exam_date: string
  experiment_ids?: string[]
  is_completed?: boolean
  reminder_days?: number
}

export interface AnalyticsOverview {
  total_experiments: number
  total_subjects: number
  revised_count: number
  pending_revision: number
  revision_completion_percent: number
  avg_quiz_score: number
  bookmarked_count: number
  this_week_added: number
}
