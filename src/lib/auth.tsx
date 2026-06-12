import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth, isConfigured } from '@/lib/firebase'

interface AuthUser {
  email: string | null
  displayName: string | null
  uid: string
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isMock: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

const MOCK_USER: AuthUser = {
  email: 'demo@foundryforge.dev',
  displayName: 'Demo User',
  uid: 'mock-user-001',
}

function toAuthUser(u: User): AuthUser {
  return {
    email: u.email,
    displayName: u.displayName,
    uid: u.uid,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isConfigured || !auth) {
      setUser(MOCK_USER)
      setIsLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? toAuthUser(firebaseUser) : null)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured')
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured')
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    if (!auth) {
      setUser(null)
      return
    }
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isMock: !isConfigured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
