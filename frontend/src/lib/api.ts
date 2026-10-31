import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
})

// Attach Supabase auth token or local demo token
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    } else {
      // Fallback demo token for local testing without full Supabase auth setup
      const localToken = localStorage.getItem('codevault_demo_token') || 'demo-token'
      config.headers.Authorization = `Bearer ${localToken}`
    }
  } catch {
    const localToken = localStorage.getItem('codevault_demo_token') || 'demo-token'
    config.headers.Authorization = `Bearer ${localToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default api

// Typed API services
export const subjectsApi = {
  list: () => api.get('/api/subjects'),
  create: (data: any) => api.post('/api/subjects', data),
  get: (id: string) => api.get(`/api/subjects/${id}`),
  update: (id: string, data: any) => api.put(`/api/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/api/subjects/${id}`),
}

export const experimentsApi = {
  list: (params?: any) => api.get('/api/experiments', { params }),
  create: (data: any) => api.post('/api/experiments', data),
  get: (id: string) => api.get(`/api/experiments/${id}`),
  update: (id: string, data: any) => api.put(`/api/experiments/${id}`, data),
  delete: (id: string) => api.delete(`/api/experiments/${id}`),
  duplicate: (id: string) => api.post(`/api/experiments/${id}/duplicate`),
  toggleBookmark: (id: string) => api.post(`/api/experiments/${id}/bookmark`),
  markRevised: (id: string) => api.post(`/api/experiments/${id}/mark-revised`),
  importFile: (formData: FormData) =>
    api.post('/api/experiments/import-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getRelated: (id: string) => api.get(`/api/experiments/${id}/related`),
}

export const aiApi = {
  explain: (data: { experiment_id?: string; code?: string; language?: string; mode: string; force_regenerate?: boolean }) =>
    api.post('/api/ai/explain', data),
  getExplanation: (experimentId: string) => api.get(`/api/ai/explanation/${experimentId}`),
  generateVivaQuestions: (data: any) => api.post('/api/ai/viva-questions', data),
  generateMCQs: (data: any) => api.post('/api/ai/mcqs', data),
  generateFlashcards: (data: any) => api.post('/api/ai/flashcards', data),
  generateRevisionNotes: (data: any) => api.post('/api/ai/revision-notes', data),
  generateOutputQuiz: (data: any) => api.post('/api/ai/output-quiz', data),
  generateFillBlanks: (data: any) => api.post('/api/ai/fill-blanks', data),
  generateDebugChallenge: (data: any) => api.post('/api/ai/debug-challenge', data),
  evaluateAnswer: (data: any) => api.post('/api/ai/evaluate-answer', data),
}

export const conversationsApi = {
  list: () => api.get('/api/conversations'),
  create: (data: any) => api.post('/api/conversations', data),
  getMessages: (id: string) => api.get(`/api/conversations/${id}/messages`),
  sendMessage: (id: string, data: any) => api.post(`/api/conversations/${id}/messages`, data),
  delete: (id: string) => api.delete(`/api/conversations/${id}`),
}

export const flashcardsApi = {
  list: (params?: any) => api.get('/api/flashcards', { params }),
  create: (data: any) => api.post('/api/flashcards', data),
  update: (id: string, data: any) => api.put(`/api/flashcards/${id}`, data),
  delete: (id: string) => api.delete(`/api/flashcards/${id}`),
}

export const quizzesApi = {
  generate: (data: any) => api.post('/api/quizzes/generate', data),
  list: (params?: any) => api.get('/api/quizzes', { params }),
  get: (id: string) => api.get(`/api/quizzes/${id}`),
  submitAttempt: (id: string, data: any) => api.post(`/api/quizzes/${id}/attempt`, data),
  getAttempts: (id: string) => api.get(`/api/quizzes/${id}/attempts`),
}

export const revisionApi = {
  getSessions: () => api.get('/api/revision/sessions'),
  createSession: (data: any) => api.post('/api/revision/sessions', data),
  completeSession: (id: string) => api.put(`/api/revision/sessions/${id}/complete`),
  getPlanner: () => api.get('/api/revision/planner'),
  getExamSchedules: () => api.get('/api/exam-schedules'),
  createExamSchedule: (data: any) => api.post('/api/exam-schedules', data),
  deleteExamSchedule: (id: string) => api.delete(`/api/exam-schedules/${id}`),
}

export const analyticsApi = {
  getOverview: () => api.get('/api/analytics/overview'),
  getBySubject: () => api.get('/api/analytics/by-subject'),
  getByLanguage: () => api.get('/api/analytics/by-language'),
  getWeeklyActivity: () => api.get('/api/analytics/weekly-activity'),
  getQuizPerformance: () => api.get('/api/analytics/quiz-performance'),
  getWeakTopics: () => api.get('/api/analytics/weak-topics'),
  getRevisionStreak: () => api.get('/api/analytics/revision-streak'),
}

export const githubApi = {
  getFiles: (repoUrl: string, token?: string) =>
    api.get('/api/github/files', { params: { repo_url: repoUrl, token } }),
  getFileContent: (repoUrl: string, filePath: string, token?: string) =>
    api.get('/api/github/file-content', { params: { repo_url: repoUrl, file_path: filePath, token } }),
}
