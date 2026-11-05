import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthPage } from '@/pages/auth/AuthPage'
import { ProfileSetup } from '@/pages/auth/ProfileSetup'
import { SubjectsHome } from '@/pages/subjects/SubjectsHome'
import { SubjectDetail } from '@/pages/subjects/SubjectDetail'
import { ExperimentWorkspace } from '@/pages/experiments/ExperimentWorkspace'
import { IntroSplash } from '@/components/common/IntroSplash'
import { useAuthStore } from '@/store/authStore'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore()
  if (!user) {
    return <Navigate to="/auth" replace />
  }
  if (!user.is_profile_completed) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

export const App: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <BrowserRouter>
      {/* Starting Crazy Animated Intro Sequence */}
      <IntroSplash />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#171717',
            color: '#F5F5F5',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />

      <Routes>
        {/* Auth Route */}
        <Route
          path="/auth"
          element={
            user ? (
              <Navigate to={user.is_profile_completed ? '/subjects' : '/onboarding'} replace />
            ) : (
              <AuthPage />
            )
          }
        />

        {/* Profile Onboarding */}
        <Route
          path="/onboarding"
          element={!user ? <Navigate to="/auth" replace /> : <ProfileSetup />}
        />

        {/* Main Application: Subjects & Experiments */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/subjects" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subjects"
          element={
            <ProtectedRoute>
              <SubjectsHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subjects/:subjectId"
          element={
            <ProtectedRoute>
              <SubjectDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/experiments/:id"
          element={
            <ProtectedRoute>
              <ExperimentWorkspace />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
