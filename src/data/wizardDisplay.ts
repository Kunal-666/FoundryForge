import type { WizardAnswers } from './wizardQuestions'

export interface FieldDisplay {
  key: keyof WizardAnswers
  label: string
  icon: string
  showWhen?: (a: WizardAnswers) => boolean
  format?: (val: unknown) => string
}

const OPTION_LABELS: Record<string, Record<string, string>> = {
  frontend: { react: 'React', nextjs: 'Next.js', vue: 'Vue', angular: 'Angular', svelte: 'Svelte' },
  backend: { express: 'Express', nestjs: 'NestJS', laravel: 'Laravel', django: 'Django', 'spring-boot': 'Spring Boot', fastapi: 'FastAPI' },
  database: { postgresql: 'PostgreSQL', mysql: 'MySQL', mongodb: 'MongoDB', firebase: 'Firebase', supabase: 'Supabase' },
  auth: { jwt: 'JWT', 'firebase-auth': 'Firebase Auth', clerk: 'Clerk', authjs: 'Auth.js', oauth: 'OAuth', none: 'No Auth' },
  payment: { none: 'No Payments', stripe: 'Stripe', razorpay: 'Razorpay', paypal: 'PayPal', cashfree: 'Cashfree', other: 'Other' },
  storage: { none: 'None', 'aws-s3': 'AWS S3', cloudinary: 'Cloudinary', 'firebase-storage': 'Firebase Storage', local: 'Local Storage' },
  deployment: { vercel: 'Vercel', netlify: 'Netlify', railway: 'Railway', render: 'Render', aws: 'AWS', azure: 'Azure', digitalocean: 'DigitalOcean', docker: 'Docker' },
  audience: { public: 'Public', internal: 'Internal Company', enterprise: 'Enterprise', government: 'Government', educational: 'Educational', ngo: 'NGO', startup: 'Startup', other: 'Other' },
  expectedUsers: { 'under-100': 'Under 100', '100-1k': '100 – 1,000', '1k-10k': '1k – 10k', '10k-100k': '10k – 100k', '100k+': '100k+' },
  timelinePriority: { 'fast-mvp': 'Fast MVP', balanced: 'Balanced', production: 'Production Ready', enterprise: 'Enterprise Quality', research: 'Research Project' },
  budget: { free: 'Free Tier Only', low: 'Low Cost', moderate: 'Moderate', enterprise: 'Enterprise Budget' },
  goal: { 'generate-code': 'Generate Code', 'export-srs': 'Export SRS', blueprint: 'Create Blueprint', 'share-team': 'Share with Team', 'claude-code': 'Use in Claude Code', 'codex-cli': 'Use in Codex CLI', cursor: 'Use in Cursor', 'docs-only': 'Documentation Only' },
}

export const FIELD_DISPLAY: FieldDisplay[] = [
  { key: 'scale', label: 'Scale', icon: '📏', format: (v) => typeof v === 'string' ? `${v.charAt(0).toUpperCase()}${v.slice(1)}` : '' },
  { key: 'scope', label: 'Scope', icon: '🎯', format: (v) => {
    if (v === 'fullstack-devops') return 'Full Stack + DevOps'
    if (v === 'fullstack') return 'Frontend + Backend'
    if (v === 'frontend') return 'Frontend Only'
    if (v === 'backend') return 'Backend Only'
    return typeof v === 'string' ? v : ''
  }},
  { key: 'frontend', label: 'Frontend', icon: '⚛️', showWhen: (a) => a.scope !== 'backend' },
  { key: 'backend', label: 'Backend', icon: '🚀', showWhen: (a) => a.scope !== 'frontend' },
  { key: 'database', label: 'Database', icon: '🗄️', showWhen: (a) => a.scope !== 'frontend' },
  { key: 'auth', label: 'Authentication', icon: '🔐', showWhen: (a) => a.scope !== 'frontend' },
  { key: 'payment', label: 'Payment', icon: '💳', showWhen: (a) => a.scope !== 'frontend' },
  { key: 'storage', label: 'Storage', icon: '☁️', showWhen: (a) => a.scope !== 'frontend' },
  { key: 'deployment', label: 'Deployment', icon: '▲', showWhen: (a) => a.scope !== 'frontend' },
  { key: 'audience', label: 'Target Audience', icon: '👥' },
  { key: 'expectedUsers', label: 'Expected Users', icon: '📊' },
  { key: 'timelinePriority', label: 'Timeline Priority', icon: '⚡' },
  { key: 'budget', label: 'Budget', icon: '💰' },
  { key: 'goal', label: 'Goal', icon: '🎯' },
]

/** Returns the human-readable label for a wizard answer value. */
export function getFieldLabel(key: keyof WizardAnswers, value: unknown): string {
  if (value == null) return ''
  const labels = OPTION_LABELS[key]
  if (!labels) return String(value)
  if (Array.isArray(value)) {
    return value.map(v => labels[v] ?? v).join(', ')
  }
  return labels[String(value)] ?? String(value)
}
