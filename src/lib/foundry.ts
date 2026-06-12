import { useConnectionStore } from '@/stores/connectionStore'
import { MODE_INSTRUCTIONS, STAGE_LABELS, type ModeKey, type StageKey } from '@/lib/prompts'

// ─── Config ───────────────────────────────────────────────────────────────────

const FOUNDRY_ENDPOINT = import.meta.env.VITE_FOUNDRY_ENDPOINT as string | undefined
const isConfigured = !!FOUNDRY_ENDPOINT

const agentPath = (() => {
  try { return FOUNDRY_ENDPOINT ? new URL(FOUNDRY_ENDPOINT).pathname : '' } catch { return '' }
})()

const INFERENCE_URL = `/api/ai${agentPath}?api-version=v1`

// ─── Limits ───────────────────────────────────────────────────────────────────

const MAX_CONTEXT_DEFAULT = 1_200
const MAX_CONTEXT_CODEGEN = 20_000
const MAX_RESPONSE = 1_200
const MAX_LINES = 10
const DEDUP_KEY_LENGTH = 40
const CLIENT_TIMEOUT_MS = 300_000 // 5 min

const RETRY_CODES = new Set([408, 502, 503, 504])

// ─── Types ────────────────────────────────────────────────────────────────────

interface FoundryResponse {
  output?: Array<{
    type?: string
    content?: Array<{ type?: string; text?: string }>
  }>
}

export class FoundryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FoundryError'
  }
}

// ─── Store accessor ───────────────────────────────────────────────────────────

function getStore() {
  return useConnectionStore.getState()
}

// ─── Prompt helpers ───────────────────────────────────────────────────────────

function getModeInstruction(mode: ModeKey): string {
  return MODE_INSTRUCTIONS[mode] ?? MODE_INSTRUCTIONS.general
}

/** Trims context to the tail, preserving the most recent content. */
function trimContext(text: string, mode: ModeKey): string {
  const max = mode === 'codegen' ? MAX_CONTEXT_CODEGEN : MAX_CONTEXT_DEFAULT
  return text.length > max ? text.slice(-max) : text
}

/** Joins non-empty prompt parts with double newlines. */
function buildPrompt(...parts: Array<string | undefined | false>): string {
  return (parts.filter(Boolean) as string[]).join('\n\n')
}

// ─── Output normalization ─────────────────────────────────────────────────────

/** Fuzzy dedup key: first N normalized characters. */
function dedupKey(line: string): string {
  return line.trim().toLowerCase().replace(/\W/g, '').slice(0, DEDUP_KEY_LENGTH)
}

/** Removes duplicate lines using a fuzzy key. Preserves blank lines. */
function dedupLines(text: string): string {
  const seen = new Set<string>()
  return text.split('\n').filter(line => {
    const t = line.trim()
    if (!t) return true
    const key = dedupKey(t)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  }).join('\n')
}

export function normalizeOutput(text: string, mode: ModeKey = 'general'): string {
  // Strip citation markers and normalize line endings
  let t = text.replace(/\r\n/g, '\n').replace(/【[^】]*】/g, '')

  if (mode === 'codegen') {
    // Codegen: structural fixes only — never dedup or cap lines in generated code
    t = t
      .replace(/([^\n])## /g, '$1\n## ')
      .replace(/([^\n])- /g, '$1\n- ')
      .replace(/([^\n])(\d+[\.\)]) /g, '$1\n$2 ')
      .replace(/^#{3,}/gm, '##')
      .replace(/\*\*\*\*/g, '**')
    return t.replace(/\n{3,}/g, '\n\n').trim()
  }

  // 1. Collapse consecutive identical lines (agent's most common failure mode)
  const collapsed: string[] = []
  let prev = ''
  for (const line of t.split('\n')) {
    const cur = line.trim()
    if (cur === '' || cur !== prev) collapsed.push(line)
    prev = cur
  }
  t = collapsed.join('\n')

  // 2. Pre-structural fuzzy dedup
  t = dedupLines(t)

  // 3. Insert structural newlines via capture groups (no lookbehinds)
  t = t
    .replace(/([^\n])## /g, '$1\n## ')
    .replace(/([^\n])(\*\*[A-Z][a-zA-Z\s/]+\*\*)/g, '$1\n$2')
    .replace(/([^\n])- /g, '$1\n- ')
    .replace(/([^\n])(\d+[\.\)]) /g, '$1\n$2 ')

  // 4. Post-structural fuzzy dedup
  t = dedupLines(t)

  // 5. Clean malformed markdown
  t = t.replace(/^#{3,}/gm, '##').replace(/\*\*\*\*/g, '**')

  // 6. Cap non-empty line count, then cap total length
  let kept = 0
  t = t.split('\n').filter(l => l.trim() ? ++kept <= MAX_LINES : true).join('\n')
  return t.substring(0, MAX_RESPONSE).replace(/\n{3,}/g, '\n\n').trim()
}

// ─── Response extraction ──────────────────────────────────────────────────────

function extractText(data: FoundryResponse): string | undefined {
  return data.output
    ?.find(o => o.type === 'message')
    ?.content?.find(c => c.type === 'output_text')
    ?.text
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

async function fetchAgent(input: string, signal?: AbortSignal): Promise<Response> {
  const timeout = AbortSignal.timeout(CLIENT_TIMEOUT_MS)
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout
  return fetch(INFERENCE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
    signal: combined,
  })
}

async function callAgent(input: string, mode: ModeKey, signal?: AbortSignal): Promise<string> {
  if (!isConfigured) {
    const message = 'Foundry AI is not configured. Set VITE_FOUNDRY_ENDPOINT and VITE_FOUNDRY_API_KEY.'
    getStore().setError(message)
    throw new FoundryError(message)
  }

  getStore().setConnecting()

  let res: Response
  try {
    res = await fetchAgent(input, signal)
    if (RETRY_CODES.has(res.status)) {
      res = await fetchAgent(input, signal)
    }
  } catch (err) {
    const message = err instanceof DOMException && err.name === 'AbortError'
      ? 'Request was cancelled'
      : 'Network error — is the dev server running with `npm run dev`?'
    getStore().setError(message)
    throw new FoundryError(message)
  }

  if (!res.ok) {
    const message = `Foundry API error: ${res.status} ${res.statusText}`
    getStore().setError(message)
    throw new FoundryError(message)
  }

  const data: FoundryResponse = await res.json()
  const text = extractText(data)

  if (!text) {
    const message = 'Foundry agent returned an empty response'
    getStore().setError(message)
    throw new FoundryError(message)
  }

  getStore().setConnected()

  // Codegen skips brute-force exact dedup — code files have legitimately repeated lines
  if (mode !== 'codegen') {
    const exact = new Set<string>()
    const deduped = text.split('\n').filter(l => {
      const t = l.trim()
      if (!t) return true
      if (exact.has(t)) return false
      exact.add(t)
      return true
    }).join('\n')
    return normalizeOutput(deduped, mode)
  }

  return normalizeOutput(text, mode)
}

// ─── Stage instruction builder ────────────────────────────────────────────────

function buildStageInstruction(stageId: StageKey, mode: ModeKey): string {
  if (mode !== 'architecture') return getModeInstruction(mode)

  const stageLabel = STAGE_LABELS[stageId] ?? 'Focus only on this specific stage.'
  const stageHints: Partial<Record<StageKey, string>> = {
    requirements: 'Use labels like Roles, Features, Integrations, Non-Functional, Missing, and Assumption.',
    clarification: 'Use labels like Missing, Conflict, Assumption, Scope, and Risk.',
    architecture: 'Use labels like Frontend, Backend, Database, Authentication, Storage, and Deployment.',
    database: 'Use labels like Database, Entities, Relationships, Indexes, and Tables.',
    structure: 'Use labels like Layout, Modules, Conventions, Boundaries, and Tooling.',
    security: 'Use labels like AuthN, AuthZ, Validation, Rate Limiting, HTTPS, and Secrets.',
    roadmap: 'Use labels like Foundation, Authentication, Core Features, Hardening, and Deployment.',
    generation: 'Use labels like Compatible, Limited, Unsupported, Best AI Tool, and Workflow.',
  }

  return [
    `You are analyzing the "${stageId}" stage. ${stageLabel}`,
    'Guidelines:',
    '- Start with a single short summary sentence before the bullets.',
    `- Produce exactly 5 bullet points relevant to "${stageId}".`,
    '- Keep each bullet under 20 words.',
    '- Use previous stages only for context. Do not summarize or repeat them.',
    '- Focus on the current stage; avoid cross-stage overviews.',
    stageHints[stageId] ? `- ${stageHints[stageId]}` : '',
  ].join('\n')
}

/** Extracts stage IDs from a previous-context string for use as a completed-stages label. */
function extractCompletedStages(previousContext: string): string {
  const ids = previousContext
    .split('\n')
    .filter(l => l.startsWith('---'))
    .map(l => l.replace(/---\s*|\s*---/g, '').trim())
    .filter(Boolean)

  return ids.length ? `Previously completed stages: ${ids.join(', ')}.` : ''
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Re-exported for display components that need to normalize stored/loaded data. */
export { normalizeOutput as normalizeStoredOutput }

export async function sendFollowUp(
  idea: string,
  timelineContext: string,
  question: string,
  mode: ModeKey = 'architecture',
  signal?: AbortSignal,
): Promise<string> {
  const input = buildPrompt(
    getModeInstruction(mode),
    `Original software idea: ${idea}`,
    `Architecture analysis completed so far:\n${trimContext(timelineContext, mode)}`,
    `Follow-up question: ${question}`,
  )
  return callAgent(input, mode, signal)
}

export async function sendChatMessage(
  message: string,
  history: string,
  mode: ModeKey = 'general',
  signal?: AbortSignal,
): Promise<string> {
  const input = buildPrompt(
    getModeInstruction(mode),
    history && `Conversation so far:\n${trimContext(history, mode)}`,
    `User: ${message}`,
  )
  return callAgent(input, mode, signal)
}

export interface StageConfig {
  scale?: string | null
  scope?: string | null
  frontend?: string[]
  backend?: string[]
  database?: string[]
  auth?: string[]
  payment?: string | null
  storage?: string | null
  deployment?: string | null
  audience?: string | null
  expectedUsers?: string | null
  timelinePriority?: string | null
  budget?: string | null
  goal?: string | null
}

function buildConfigBlock(config?: StageConfig): string {
  if (!config) return ''

  const lines: string[] = [
    '## Confirmed Project Configuration',
    '',
    'The following values are CONFIRMED and MUST be treated as authoritative.',
    'Do NOT override or contradict these values in your analysis.',
    '',
  ]

  const map: [keyof StageConfig, string][] = [
    ['scale', 'Scale'],
    ['scope', 'Scope'],
    ['frontend', 'Frontend'],
    ['backend', 'Backend'],
    ['database', 'Database'],
    ['auth', 'Authentication'],
    ['payment', 'Payment'],
    ['storage', 'Storage'],
    ['deployment', 'Deployment'],
    ['audience', 'Target Audience'],
    ['expectedUsers', 'Expected Users'],
    ['timelinePriority', 'Timeline Priority'],
    ['budget', 'Budget'],
    ['goal', 'Goal'],
  ]

  for (const [key, label] of map) {
    const val = config[key]
    if (val == null) continue
    const display = Array.isArray(val) ? val.join(', ') : String(val)
    if (display) lines.push(`- **${label}**: ${display}`)
  }

  lines.push('')

  // Scope-specific constraints
  if (config.scope === 'frontend') {
    lines.push('**IMPORTANT SCOPE CONSTRAINT**: This is a Frontend Only project.')
    lines.push('The following areas are OUT OF SCOPE and MUST NOT be analyzed:')
    lines.push('- Backend / Server-side APIs')
    lines.push('- Database / Data persistence')
    lines.push('- Authentication / User login')
    lines.push('- Payment processing')
    lines.push('- File storage')
    lines.push('- Deployment / DevOps')
    lines.push('If the requirements analysis mentions these, skip them and consider static/frontend-only alternatives only when optional.')
  }

  if (config.scope === 'backend') {
    lines.push('**IMPORTANT SCOPE CONSTRAINT**: This is a Backend Only project.')
    lines.push('The following areas are OUT OF SCOPE and MUST NOT be analyzed:')
    lines.push('- Frontend UI / Client-side rendering')
    lines.push('- CSS / Styling')
    lines.push('- Client-side routing')
    lines.push('Focus only on API design, database schema, authentication, and server infrastructure.')
  }

  lines.push('')
  lines.push('**Precedence**: Confirmed Configuration > User Prompt > AI Inference')
  lines.push('If the user prompt contradicts a confirmed value, ask for clarification.')
  lines.push('')

  return lines.join('\n')
}

export async function analyzeStage(
  stageId: StageKey,
  idea: string,
  previousContext: string,
  mode: ModeKey = 'general',
  signal?: AbortSignal,
  config?: StageConfig,
): Promise<string> {
  const input = buildPrompt(
    `Mode: ${mode}.`,
    buildStageInstruction(stageId, mode),
    extractCompletedStages(previousContext),
    buildConfigBlock(config),
    `## Software Idea\n${idea}`,
  )
  return callAgent(input, mode, signal)
}
