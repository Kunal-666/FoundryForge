import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth'

export function Auth() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => { document.title = mode === 'login' ? 'Sign In - FoundryForge' : 'Sign Up - FoundryForge' }, [mode])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed'
      if (msg.includes('auth/invalid-credential')) setError('Invalid email or password')
      else if (msg.includes('auth/email-already-in-use')) setError('Email already in use')
      else if (msg.includes('auth/weak-password')) setError('Password must be at least 6 characters')
      else if (msg.includes('auth/user-not-found')) setError('No account found with this email')
      else setError(msg.replace('Firebase: ', '').replace(/\(.*\)\.?/, '').trim())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="mb-6 inline-flex items-center gap-2"
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">
              Foundry<span className="text-primary">Forge</span>
            </span>
          </button>
          <h1 className="mb-2 text-2xl font-bold text-text">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-sm text-text-muted">
            {mode === 'login'
              ? 'Sign in to continue building'
              : 'Start architecting your software ideas'}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8 shadow-2xl shadow-black/20">
          <div className="mb-6 flex rounded-xl bg-surface-hover p-1">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-background text-text shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError('') }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-background text-text shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-dim">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-dim">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-error/10 px-3 py-2 text-xs text-error"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-text-dim">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setError('') }}
                className="text-primary hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError('') }}
                className="text-primary hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  )
}
