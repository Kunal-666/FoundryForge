import { create } from 'zustand'
import type { Session, Message, TimelineStage, SessionMode } from '@/types'
import { getTimelineStages } from '@/data/mock'
import { generateId } from '@/lib/utils'
import { db, isConfigured } from '@/lib/firebase'
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore'

function isAutoSaveEnabled(): boolean {
  try {
    const raw = localStorage.getItem('foundryforge_settings')
    if (!raw) return true
    const parsed = JSON.parse(raw)
    return parsed.autoSave !== false
  } catch {
    return true
  }
}

const STORAGE_KEY = 'foundryforge_sessions'

function loadFromStorage(): Record<string, Session> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, Record<string, unknown>>
    const sessions: Record<string, Session> = {}
    for (const [key, val] of Object.entries(parsed)) {
      sessions[key] = {
        ...val as unknown as Session,
        createdAt: new Date((val as Record<string, unknown>).createdAt as string),
        updatedAt: new Date((val as Record<string, unknown>).updatedAt as string),
        messages: (val.messages as Array<Record<string, unknown>> || []).map(m => ({
          ...m as unknown as Message,
          timestamp: new Date(m.timestamp as string),
        })),
      }
    }
    return sessions
  } catch {
    return {}
  }
}

function saveToStorage(sessions: Record<string, Session>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch {}
}

interface SessionState {
  currentSessionId: string | null
  sessions: Record<string, Session>
  setCurrentSession: (id: string | null) => void
  createSession: (prompt: string, mode?: SessionMode, userId?: string) => string
  updateSessionStatus: (id: string, status: Session['status']) => void
  updateTimelineStage: (id: string, stageId: string, updates: Partial<TimelineStage>) => void
  addMessage: (id: string, message: Message) => void
  removeMessagesAfter: (id: string, afterIdx: number) => void
  getCurrentSession: () => Session | null
  loadSessions: (sessions: Session[]) => void
  loadFromFirestore: (userId: string) => Promise<void>
  refreshFromStorage: () => void
}

function stripUndefined(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(stripUndefined)
  }
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = stripUndefined(value)
      }
    }
    return result
  }
  return obj
}

function syncToFirestore(session: Session) {
  if (!isConfigured || !db) return
  if (!isAutoSaveEnabled()) return
  try {
    setDoc(doc(db, 'sessions', session.id), stripUndefined(session) as Record<string, unknown>, { merge: true }).catch(() => {})
  } catch {}
}

function persist(sessions: Record<string, Session>, session: Session) {
  syncToFirestore(session)
  saveToStorage(sessions)
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSessionId: null,
  sessions: loadFromStorage(),

  setCurrentSession: (id) => set({ currentSessionId: id }),

  createSession: (prompt, mode = 'general', userId) => {
    const id = generateId()
    const session: Session = {
      id,
      title: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt,
      prompt,
      mode,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'idle',
      timeline: getTimelineStages(mode),
      messages: [
        {
          id: generateId(),
          role: 'user',
          content: prompt,
          timestamp: new Date(),
        },
      ],
      userId,
    }
    set((state) => {
      const sessions = { ...state.sessions, [id]: session }
      persist(sessions, session)
      return { sessions, currentSessionId: id }
    })
    return id
  },

  updateSessionStatus: (id, status) =>
    set((state) => {
      const session = state.sessions[id]
      if (!session) return state
      const updated = { ...session, status, updatedAt: new Date() }
      const sessions = { ...state.sessions, [id]: updated }
      persist(sessions, updated)
      return { sessions }
    }),

  updateTimelineStage: (id, stageId, updates) =>
    set((state) => {
      const session = state.sessions[id]
      if (!session) return state
      const updated = {
        ...session,
        timeline: session.timeline.map((s) =>
          s.id === stageId ? { ...s, ...updates } : s,
        ),
        updatedAt: new Date(),
      }
      const sessions = { ...state.sessions, [id]: updated }
      persist(sessions, updated)
      return { sessions }
    }),

  addMessage: (id, message) =>
    set((state) => {
      const session = state.sessions[id]
      if (!session) return state
      const updated = {
        ...session,
        messages: [...session.messages, message],
        updatedAt: new Date(),
      }
      const sessions = { ...state.sessions, [id]: updated }
      persist(sessions, updated)
      return { sessions }
    }),

  removeMessagesAfter: (id, afterIdx) =>
    set((state) => {
      const session = state.sessions[id]
      if (!session) return state
      const updated = {
        ...session,
        messages: session.messages.slice(0, afterIdx + 1),
        updatedAt: new Date(),
      }
      const sessions = { ...state.sessions, [id]: updated }
      persist(sessions, updated)
      return { sessions }
    }),

  getCurrentSession: () => {
    const { currentSessionId, sessions } = get()
    if (!currentSessionId) return null
    return sessions[currentSessionId] || null
  },

  loadSessions: (sessions) =>
    set((state) => ({
      sessions: sessions.reduce(
        (acc, s) => ({ ...acc, [s.id]: s }),
        state.sessions,
      ),
    })),

  loadFromFirestore: async (userId: string) => {
    if (!isConfigured || !db) {
      set({ sessions: loadFromStorage() })
      return
    }
    try {
      const q = query(collection(db, 'sessions'), where('userId', '==', userId))
      const snapshot = await getDocs(q)
      const sessions: Record<string, Session> = {}
      snapshot.forEach(d => {
        const data = d.data()
        sessions[d.id] = {
          ...data,
          id: d.id,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          messages: (data.messages || []).map((m: any) => ({
            ...m,
            timestamp: m.timestamp?.toDate?.() || new Date(m.timestamp),
          })),
        } as Session
      })
      if (Object.keys(sessions).length > 0) {
        set({ sessions })
      } else {
        set({ sessions: loadFromStorage() })
      }
    } catch {
      set({ sessions: loadFromStorage() })
    }
  },

  refreshFromStorage: () => {
    set({ sessions: loadFromStorage() })
  },
}))
