import { Sparkles, Building2, Code2, Globe, Smartphone, Layers, Brain, Building } from 'lucide-react'
import type { SessionMode } from '@/types'

export const MODE_ICONS: Record<SessionMode, React.ElementType> = {
  general: Sparkles,
  architecture: Building2,
  codegen: Code2,
}

export const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  Globe, Code2, Smartphone, Layers, Brain, Building,
}

export const STATUS_CONFIG = {
  idle: { label: 'Idle', variant: 'secondary' as const },
  thinking: { label: 'Thinking', variant: 'warning' as const },
  completed: { label: 'Completed', variant: 'success' as const },
  failed: { label: 'Failed', variant: 'error' as const },
}

export const SESSION_STATUS_BADGE: Partial<Record<string, { label: string; variant: 'warning' | 'success' | 'error' }>> = {
  thinking: { label: 'In Progress', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  failed: { label: 'Failed', variant: 'error' },
}

export const DEDUP_KEY_LENGTH = 40
export const DETAILS_MAX_LINES = 10
