import { ARCHITECTURE_MODE } from './architectureMode'
import { CODEGEN_MODE } from './codegenMode'
import { GENERAL_MODE } from './general'

// ─── Mode ────────────────────────────────────────────────────────────────────

export const MODE_INSTRUCTIONS = {
  architecture: ARCHITECTURE_MODE,
  codegen: CODEGEN_MODE,
  general: GENERAL_MODE,
} as const

export type ModeKey = keyof typeof MODE_INSTRUCTIONS

// ─── Stages (architecture mode only) ─────────────────────────────────────────

/**
 * Ordered sequence of architecture pipeline stages.
 * Use STAGE_ORDER for rendering steppers, progress bars, or prev/next navigation.
 */
export const STAGE_ORDER = [
  'requirements',
  'clarification',
  'architecture',
  'database',
  'structure',
  'security',
  'roadmap',
  'generation',
] as const

export type StageKey = (typeof STAGE_ORDER)[number]

/**
 * Human-readable label + instruction suffix per stage.
 * Injected into the architecture system prompt to constrain the active step.
 */
export const STAGE_LABELS: Record<StageKey, string> = {
  requirements:
    'Requirements Analysis - extract roles, core features, functional needs, non-functional needs, integrations, constraints, and tech preferences',

  clarification:
    'Clarification & Scope - identify missing information, assumptions, scope boundaries, and conflicting requirements',

  architecture:
    'Architecture Design - recommend frontend, backend, database, authentication, storage, and deployment with practical reasoning',

  database:
    'Database Summary - define the database type, main entities, relationships, indexes, and approximate table count',

  structure:
    'Project Structure - recommend feature-based folder layout, module boundaries, and naming conventions',

  security:
    'Security & Compliance - identify authentication, authorization, validation, rate limiting, HTTPS, and secrets management',

  roadmap:
    'Development Roadmap - provide implementation phases, milestones, dependencies, and delivery order',

  generation:
    'AI Tool Recommendation - summarize generator compatibility, best AI implementation tool, and workflow guidance',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the stage that follows the given key, or undefined at the end. */
export function nextStage(key: StageKey): StageKey | undefined {
  const idx = STAGE_ORDER.indexOf(key)
  return STAGE_ORDER[idx + 1]
}

/** Returns the stage that precedes the given key, or undefined at the start. */
export function prevStage(key: StageKey): StageKey | undefined {
  const idx = STAGE_ORDER.indexOf(key)
  return idx > 0 ? STAGE_ORDER[idx - 1] : undefined
}

/** Returns the 1-based step number for display (e.g. "Step 3 of 8"). */
export function stageStep(key: StageKey): number {
  return STAGE_ORDER.indexOf(key) + 1
}
