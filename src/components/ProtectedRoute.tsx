import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isMock } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!user && !isMock) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}
