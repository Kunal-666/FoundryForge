import { create } from 'zustand'
import { defaultAnswers, type WizardAnswers } from '@/data/wizardQuestions'

const STORAGE_KEY = 'foundryforge_wizard'

export interface WizardState {
  /** Answers keyed by sessionId so each session has its own config */
  bySession: Record<string, WizardAnswers>
  /** Whether wizard has been completed for a given session */
  completed: Record<string, boolean>
}

interface WizardStore extends WizardState {
  getAnswers: (sessionId: string) => WizardAnswers
  setAnswers: (sessionId: string, answers: Partial<WizardAnswers>) => void
  markCompleted: (sessionId: string) => void
  reset: (sessionId: string) => void
  buildContext: (sessionId: string) => string
}

function loadFromStorage(): WizardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { bySession: {}, completed: {} }
    return JSON.parse(raw)
  } catch {
    return { bySession: {}, completed: {} }
  }
}

function persist(state: WizardState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

export const useWizardStore = create<WizardStore>((set, get) => {
  const initial = loadFromStorage()

  return {
    ...initial,

    getAnswers: (sessionId) => {
      return get().bySession[sessionId] ?? { ...defaultAnswers }
    },

    setAnswers: (sessionId, answers) => set((s) => {
      const current = s.bySession[sessionId] ?? { ...defaultAnswers }
      const next = {
        bySession: { ...s.bySession, [sessionId]: { ...current, ...answers } },
        completed: s.completed,
      }
      persist(next)
      return next
    }),

    markCompleted: (sessionId) => set((s) => {
      const next = {
        bySession: s.bySession,
        completed: { ...s.completed, [sessionId]: true },
      }
      persist(next)
      return next
    }),

    reset: (sessionId) => set((s) => {
      const { [sessionId]: _, ...rest } = s.bySession
      const { [sessionId]: __, ...restCompleted } = s.completed
      const next = { bySession: rest, completed: restCompleted }
      persist(next)
      return next
    }),

    buildContext: (sessionId) => {
      const answers = get().bySession[sessionId] ?? defaultAnswers
      const lines: string[] = []

      if (answers.scale) lines.push(`Scale: ${answers.scale}`)
      if (answers.scope) lines.push(`Scope: ${answers.scope}`)
      if (answers.audience) lines.push(`Target Audience: ${answers.audience}`)
      if (answers.expectedUsers) lines.push(`Expected Users: ${answers.expectedUsers}`)
      if (answers.timelinePriority) lines.push(`Timeline Priority: ${answers.timelinePriority}`)
      if (answers.budget) lines.push(`Budget: ${answers.budget}`)
      if (answers.goal) lines.push(`Goal: ${answers.goal}`)
      if (answers.payment && answers.payment !== 'none') lines.push(`Payment: ${answers.payment}`)
      if (answers.storage && answers.storage !== 'none') lines.push(`Storage: ${answers.storage}`)
      if (answers.deployment) lines.push(`Deployment: ${answers.deployment}`)
      if (answers.frontend.length) lines.push(`Frontend: ${answers.frontend.join(', ')}`)
      if (answers.backend.length) lines.push(`Backend: ${answers.backend.join(', ')}`)
      if (answers.database.length) lines.push(`Database: ${answers.database.join(', ')}`)
      if (answers.auth.length && !answers.auth.includes('none')) {
        lines.push(`Authentication: ${answers.auth.join(', ')}`)
      }

      if (!lines.length) return ''
      return `\n## User Configuration\n${lines.map(l => `- ${l}`).join('\n')}\n`
    },
  }
})
