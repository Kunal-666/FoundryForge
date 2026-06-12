import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useSettingsStore } from '@/stores/settingsStore'

const Landing = lazy(() => import('@/pages/Landing').then(m => ({ default: m.Landing })))
const AuthPage = lazy(() => import('@/pages/Auth').then(m => ({ default: m.Auth })))
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Conversation = lazy(() => import('@/pages/Conversation').then(m => ({ default: m.Conversation })))

function SettingsApplier() {
  const { theme, fontSize, animationSpeed } = useSettingsStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.style.fontSize =
      fontSize === 'sm' ? '13px' :
      fontSize === 'lg' ? '16px' :
      ''
  }, [fontSize])

  useEffect(() => {
    document.documentElement.setAttribute('data-animation', animationSpeed)
  }, [animationSpeed])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsApplier />
        <Suspense fallback={
          <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/session/:id"
              element={
                <ProtectedRoute>
                  <Conversation />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
