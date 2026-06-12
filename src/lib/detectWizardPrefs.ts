import type { WizardAnswers } from '@/data/wizardQuestions'

const FRAMEWORK_MAP: Record<string, { key: keyof WizardAnswers; value: string }[]> = {
  react: [{ key: 'frontend', value: 'react' }],
  nextjs: [{ key: 'frontend', value: 'nextjs' }],
  'next.js': [{ key: 'frontend', value: 'nextjs' }],
  vue: [{ key: 'frontend', value: 'vue' }],
  angular: [{ key: 'frontend', value: 'angular' }],
  svelte: [{ key: 'frontend', value: 'svelte' }],
  express: [{ key: 'backend', value: 'express' }],
  django: [{ key: 'backend', value: 'django' }],
  laravel: [{ key: 'backend', value: 'laravel' }],
  'spring': [{ key: 'backend', value: 'spring-boot' }],
  'spring boot': [{ key: 'backend', value: 'spring-boot' }],
  fastapi: [{ key: 'backend', value: 'fastapi' }],
  'node.js': [{ key: 'backend', value: 'express' }],
  postgres: [{ key: 'database', value: 'postgresql' }],
  postgresql: [{ key: 'database', value: 'postgresql' }],
  mysql: [{ key: 'database', value: 'mysql' }],
  mongodb: [{ key: 'database', value: 'mongodb' }],
  firebase: [{ key: 'database', value: 'firebase' }],
  supabase: [{ key: 'database', value: 'supabase' }],
  tailwind: [{ key: 'frontend', value: 'react' }],
}

const AUDIENCE_KEYWORDS: Record<string, string> = {
  ngo: 'ngo',
  nonprofit: 'ngo',
  'non-profit': 'ngo',
  charity: 'ngo',
  school: 'educational',
  university: 'educational',
  education: 'educational',
  government: 'government',
  'govt': 'government',
  enterprise: 'enterprise',
  startup: 'startup',
  internal: 'internal',
  company: 'internal',
  public: 'public',
}

const SCALE_KEYWORDS: Record<string, string> = {
  simple: 'small',
  basic: 'small',
  small: 'small',
  medium: 'medium',
  moderate: 'medium',
  large: 'large',
  complex: 'large',
  enterprise: 'enterprise',
  massive: 'enterprise',
}

const SCOPE_KEYWORDS: Record<string, string> = {
  frontend: 'frontend',
  'front-end': 'frontend',
  'ui only': 'frontend',
  backend: 'backend',
  'back-end': 'backend',
  api: 'backend',
  fullstack: 'fullstack',
  'full stack': 'fullstack',
  'full-stack': 'fullstack',
}

export function detectWizardPrefs(prompt: string): Partial<WizardAnswers> {
  const lower = prompt.toLowerCase()
  const detected: Partial<WizardAnswers> = {}
  const frontend: string[] = []
  const backend: string[] = []
  const database: string[] = []

  // Detect frameworks
  for (const [keyword, mappings] of Object.entries(FRAMEWORK_MAP)) {
    if (lower.includes(keyword)) {
      for (const m of mappings) {
        if (m.key === 'frontend' && !frontend.includes(m.value)) frontend.push(m.value)
        if (m.key === 'backend' && !backend.includes(m.value)) backend.push(m.value)
        if (m.key === 'database' && !database.includes(m.value)) database.push(m.value)
      }
    }
  }

  if (frontend.length) detected.frontend = frontend
  if (backend.length) detected.backend = backend
  if (database.length) detected.database = database

  // Detect audience
  for (const [keyword, value] of Object.entries(AUDIENCE_KEYWORDS)) {
    if (lower.includes(keyword)) {
      detected.audience = value
      break
    }
  }

  // Detect scale
  for (const [keyword, value] of Object.entries(SCALE_KEYWORDS)) {
    if (lower.includes(keyword)) {
      detected.scale = value
      break
    }
  }

  // Detect scope
  for (const [keyword, value] of Object.entries(SCOPE_KEYWORDS)) {
    if (lower.includes(keyword)) {
      detected.scope = value
      break
    }
  }

  // Detect payment
  if (lower.includes('payment') || lower.includes('stripe') || lower.includes('paypal') || lower.includes('checkout') || lower.includes('donation') || lower.includes('donate')) {
    if (lower.includes('stripe')) detected.payment = 'stripe'
    else if (lower.includes('paypal')) detected.payment = 'paypal'
    else detected.payment = 'decide'
  }

  // Detect auth
  if (lower.includes('login') || lower.includes('signup') || lower.includes('auth') || lower.includes('authentication')) {
    const auth: string[] = []
    if (lower.includes('jwt')) auth.push('jwt')
    if (lower.includes('oauth') || lower.includes('google') || lower.includes('github')) auth.push('oauth')
    if (lower.includes('firebase')) auth.push('firebase-auth')
    if (auth.length) detected.auth = auth
    else detected.auth = ['decide']
  }

  return detected
}
