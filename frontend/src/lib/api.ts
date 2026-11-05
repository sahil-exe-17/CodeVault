import axios from 'axios'

// Smart base URL detection:
// 1. If running locally on localhost/127.0.0.1, use VITE_API_BASE_URL (http://localhost:8000).
// 2. If running remotely or on https://, only use custom URL if it's secure (https://).
// 3. Otherwise use relative '' so web reverse-proxy handles it without Mixed Content errors.
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const custom = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL
    if (custom) {
      if (isLocalhost) return custom
      if (custom.startsWith('https://')) return custom
    }
  }
  return ''
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 25000,
})

// Attach local session bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('codevault_token') || 'local-token'
  config.headers.Authorization = `Bearer ${token}`
  return config
})

// Intercept responses and fallback gracefully
api.interceptors.response.use(
  (response) => {
    // If an API endpoint returns an HTML string (e.g. Vercel SPA rewrite fallback on missing /api route), reject so callers catch and use local cache
    if (typeof response.data === 'string' && (response.data.includes('<!doctype html') || response.data.includes('<html'))) {
      return Promise.reject(new Error('Endpoint returned HTML instead of JSON'))
    }
    return response.data
  },
  async (error) => {
    // If request failed on relative URL due to proxy or network, try direct http://127.0.0.1:8000 once
    if (error.message === 'Network Error' && error.config && !error.config._retried) {
      error.config._retried = true
      try {
        const directUrl = 'http://127.0.0.1:8000' + (error.config.url || '')
        const retryRes = await axios({
          ...error.config,
          url: directUrl,
          baseURL: '',
        })
        return retryRes.data
      } catch (retryErr: any) {
        // Fall through to error handler
      }
    }

    const message = error.response?.data?.detail || error.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default api

// Auth API services
export const authApi = {
  login: (data: { email: string; password?: string }) => api.post('/api/auth/login', data),
  signup: (data: { email: string; password?: string; display_name?: string }) => api.post('/api/auth/signup', data),
  googleAuth: (data: { email: string; name?: string; avatar_url?: string; google_id?: string }) => api.post('/api/auth/google', data),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data: any) => api.put('/api/auth/profile', data),
  verify: () => api.post('/api/auth/verify'),
}

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
  getRelated: (id: string) => api.get(`/api/experiments/${id}/related`),
  importFile: (formData: FormData) =>
    api.post('/api/experiments/import-file', formData),
  uploadNotebookPdf: (id: string, formData: FormData) =>
    api.post(`/api/experiments/${id}/notebook-pdf`, formData),
  removeNotebookPdf: (id: string) => api.delete(`/api/experiments/${id}/notebook-pdf`),
  extractCodeFromPhoto: (formData: FormData) =>
    api.post('/api/experiments/extract-code-photo', formData, {
      timeout: 90000,
    }),
  extractAndUpdateFromPhoto: (id: string, formData: FormData) =>
    api.post(`/api/experiments/${id}/extract-from-photo`, formData, {
      timeout: 90000,
    }),
}

export const aiApi = {
  recommendCode: (data: { code: string; language?: string; experiment_id?: string }) =>
    api.post('/api/ai/recommend-code', data),
  explain: (data: any) => api.post('/api/ai/explain', data),
  explainCode: (data: any) => api.post('/api/ai/explain', data),
  getExplanation: (id: string) => api.get(`/api/ai/explanation/${id}`),
  generateViva: (data: any) => api.post('/api/ai/viva-questions', data),
  generateVivaQuestions: (data: any) => api.post('/api/ai/viva-questions', data),
  generateRevisionNotes: (data: any) => api.post('/api/ai/revision-notes', data),
  evaluateAnswer: (data: any) => api.post('/api/ai/evaluate-answer', data),
  debugCode: (data: any) => api.post('/api/ai/debug', data),
  generateDebugChallenge: (data: any) => api.post('/api/ai/debug-challenge', data),
  summarizeSubject: (subjectId: string) => api.post(`/api/ai/subject/${subjectId}/summary`),
  extractFromPhoto: (formData: FormData) =>
    api.post('/api/experiments/extract-code-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export const conversationsApi = {
  list: (params?: any) => api.get('/api/conversations', { params }),
  create: (data: any) => api.post('/api/conversations', data),
  get: (id: string) => api.get(`/api/conversations/${id}`),
  getMessages: (id: string) => api.get(`/api/conversations/${id}`),
  sendMessage: (id: string, data: any) => api.post(`/api/conversations/${id}/messages`, data),
  delete: (id: string) => api.delete(`/api/conversations/${id}`),
}

export const flashcardsApi = {
  list: (params?: any) => api.get('/api/flashcards', { params }),
  create: (data: any) => api.post('/api/flashcards', data),
  recordReview: (id: string, data: any) => api.post(`/api/flashcards/${id}/review`, data),
  delete: (id: string) => api.delete(`/api/flashcards/${id}`),
}

export const quizzesApi = {
  getQuiz: (params?: any) => api.get('/api/quizzes', { params }),
  submitQuiz: (data: any) => api.post('/api/quizzes/submit', data),
}

export const revisionApi = {
  listSessions: (params?: any) => api.get('/api/revision/sessions', { params }),
  getSessions: (params?: any) => api.get('/api/revision/sessions', { params }),
  createSession: (data: any) => api.post('/api/revision/sessions', data),
  completeSession: (id: string) => api.post(`/api/revision/sessions/${id}/complete`),
  listExams: () => api.get('/api/revision/exams'),
  getExamSchedules: () => api.get('/api/revision/exams'),
  createExam: (data: any) => api.post('/api/revision/exams', data),
  createExamSchedule: (data: any) => api.post('/api/revision/exams', data),
  deleteExam: (id: string) => api.delete(`/api/revision/exams/${id}`),
  deleteExamSchedule: (id: string) => api.delete(`/api/revision/exams/${id}`),
}

export const analyticsApi = {
  getOverview: () => api.get('/api/analytics/overview'),
  getSubjectBreakdown: () => api.get('/api/analytics/subjects'),
  getBySubject: () => api.get('/api/analytics/subjects'),
  getByLanguage: () => api.get('/api/analytics/overview'),
  getActivityLog: () => api.get('/api/analytics/activity'),
  getWeeklyActivity: () => api.get('/api/analytics/activity'),
  getQuizPerformance: () => api.get('/api/analytics/overview'),
  getWeakTopics: () => api.get('/api/analytics/overview'),
}

export const githubApi = {
  connect: (data: any) => api.post('/api/github/connect', data),
  getRepos: () => api.get('/api/github/repos'),
  getFiles: (repo: string, branch?: string) =>
    api.get(`/api/github/files?repo=${encodeURIComponent(repo)}${branch ? `&branch=${encodeURIComponent(branch)}` : ''}`),
  importRepo: (data: any) => api.post('/api/github/import', data),
}
