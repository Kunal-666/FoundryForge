import type { WizardAnswers } from '@/data/wizardQuestions'

export type SessionMode = 'general' | 'architecture' | 'codegen'

export interface TimelineStage {
  id: string
  name: string
  icon: string
  status: 'pending' | 'loading' | 'completed' | 'failed'
  description?: string
  details?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  attachments?: Array<{
    name: string
    content: string
    language: string
  }>
}

export interface Session {
  id: string
  title: string
  prompt: string
  mode: SessionMode
  createdAt: Date
  updatedAt: Date
  status: 'idle' | 'thinking' | 'completed' | 'failed'
  timeline: TimelineStage[]
  messages: Message[]
  userId?: string
  wizardAnswers?: WizardAnswers | null
}

export interface HistoryItem {
  id: string
  title: string
  preview: string
  mode: SessionMode
  createdAt: Date
  updatedAt: Date
  status: Session['status']
}

export interface Template {
  id: string
  title: string
  description: string
  prompt: string
  category: string
  icon: string
  mode?: SessionMode
}

export interface Feature {
  id: string
  title: string
  description: string
  icon: string
}

export interface Settings {
  theme: 'dark' | 'light'
  fontSize: 'sm' | 'md' | 'lg'
  autoSave: boolean
  animationSpeed: 'slow' | 'normal' | 'fast'
}
