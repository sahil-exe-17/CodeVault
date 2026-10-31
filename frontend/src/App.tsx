import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from '@/components/layout/Layout'
import { AuthPage } from '@/pages/auth/AuthPage'
import { Dashboard } from '@/pages/Dashboard'
import { AllExperiments } from '@/pages/experiments/AllExperiments'
import { ExperimentDetail } from '@/pages/experiments/ExperimentDetail'
import { Subjects } from '@/pages/subjects/Subjects'
import { Bookmarks } from '@/pages/Bookmarks'
import { AIExplainer } from '@/pages/ai/AIExplainer'
import { AskCodeVault } from '@/pages/ai/AskCodeVault'
import { RevisionStudio } from '@/pages/ai/RevisionStudio'
import { VivaPractice } from '@/pages/ai/VivaPractice'
import { RevisionPlanner } from '@/pages/RevisionPlanner'
import { ProgressAnalytics } from '@/pages/ProgressAnalytics'
import { Settings } from '@/pages/Settings'
import { useAuthStore } from '@/store/authStore'

export const App: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <BrowserRouter>
      {/* Monochrome notification toaster */}
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
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected Application Routes */}
        <Route
          path="/"
          element={<Navigate to={user ? '/dashboard' : '/dashboard'} replace />}
        />

        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/experiments"
          element={
            <Layout>
              <AllExperiments />
            </Layout>
          }
        />

        <Route
          path="/experiments/new"
          element={
            <Layout>
              <ExperimentDetail mode="create" />
            </Layout>
          }
        />

        <Route
          path="/experiments/:id"
          element={
            <Layout>
              <ExperimentDetail mode="edit" />
            </Layout>
          }
        />

        <Route
          path="/subjects"
          element={
            <Layout>
              <Subjects />
            </Layout>
          }
        />

        <Route
          path="/bookmarks"
          element={
            <Layout>
              <Bookmarks />
            </Layout>
          }
        />

        {/* AI Workspace */}
        <Route
          path="/ai/explain"
          element={
            <Layout>
              <AIExplainer />
            </Layout>
          }
        />

        <Route
          path="/ai/ask"
          element={
            <Layout>
              <AskCodeVault />
            </Layout>
          }
        />

        <Route
          path="/ai/revision-studio"
          element={
            <Layout>
              <RevisionStudio />
            </Layout>
          }
        />

        <Route
          path="/ai/viva-practice"
          element={
            <Layout>
              <VivaPractice />
            </Layout>
          }
        />

        {/* Productivity & Settings */}
        <Route
          path="/revision-planner"
          element={
            <Layout>
              <RevisionPlanner />
            </Layout>
          }
        />

        <Route
          path="/analytics"
          element={
            <Layout>
              <ProgressAnalytics />
            </Layout>
          }
        />

        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
