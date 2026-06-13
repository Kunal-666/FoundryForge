import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useSettingsStore } from '@/stores/settingsStore'

const Landing = lazy(() => import('@/pages/Landing').then(m => ({ default: m.Landing })))
const AuthPage = lazy(() => import('@/pages/Auth').then(m => ({ default: m.Auth })))
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Conversation = lazy(() => import('@/pages/Conversation').then(m => ({ default: m.Conversation })))
const Documentation = lazy(() => import('@/pages/Documentation').then(m => ({ default: m.Documentation })))
const McpDocs = lazy(() => import('@/pages/McpDocs').then(m => ({ default: m.McpDocs })))
const Privacy = lazy(() => import('@/pages/Privacy').then(m => ({ default: m.Privacy })))
const Terms = lazy(() => import('@/pages/Terms').then(m => ({ default: m.Terms })))

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
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
          }>
            <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/mcp" element={<McpDocs />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/session/:id" element={<Conversation />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}
