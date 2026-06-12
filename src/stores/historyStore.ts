import { create } from 'zustand'
import type { HistoryItem } from '@/types'
import { db, isConfigured } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

const STORAGE_KEY = 'foundryforge_sessions'

function loadFromLocalStorage(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const sessions = JSON.parse(raw) as Record<string, Record<string, unknown>>
    return Object.values(sessions)
      .map((s) => ({
        id: s.id as string,
        title: (s.title as string) || 'Untitled',
        preview: (s.prompt as string) || '',
        createdAt: new Date(s.createdAt as string),
        updatedAt: new Date(s.updatedAt as string),
        status: (s.status as HistoryItem['status']) || 'idle',
        mode: (s.mode as HistoryItem['mode']) || 'general',
      }))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  } catch {
    return []
  }
}

interface HistoryState {
  items: HistoryItem[]
  isLoading: boolean
  addToHistory: (item: HistoryItem) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
  loadFromFirestore: (userId: string) => Promise<void>
  refreshFromStorage: () => void
}

export const useHistoryStore = create<HistoryState>((set) => ({
  items: loadFromLocalStorage(),
  isLoading: false,

  addToHistory: (item) =>
    set((state) => ({
      items: [item, ...state.items],
    })),

  removeFromHistory: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  clearHistory: () => {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    set({ items: [] })
  },

  loadFromFirestore: async (userId: string) => {
    if (!isConfigured || !db) {
      set({ items: loadFromLocalStorage(), isLoading: false })
      return
    }
    set({ isLoading: true })
    try {
      const q = query(
        collection(db, 'sessions'),
        where('userId', '==', userId)
      )
      const snapshot = await getDocs(q)
      const items: HistoryItem[] = snapshot.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          title: data.title || 'Untitled',
          preview: data.prompt || '',
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          status: data.status || 'idle',
          mode: data.mode || 'general',
        } as HistoryItem
      })
      if (items.length > 0) {
        set({ items, isLoading: false })
      } else {
        const local = loadFromLocalStorage()
        set({ items: local, isLoading: false })
      }
    } catch {
      const local = loadFromLocalStorage()
      set({ items: local, isLoading: false })
    }
  },
  refreshFromStorage: () => {
    set({ items: loadFromLocalStorage() })
  },
}))
