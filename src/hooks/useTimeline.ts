import { useState, useCallback, useRef } from 'react'
import { useSessionStore } from '@/stores/sessionStore'
import { useWizardStore } from '@/stores/wizardStore'
import { analyzeStage, type StageConfig } from '@/lib/foundry'

export function useTimeline(sessionId: string | undefined) {
  const [isProcessing, setIsProcessing] = useState(false)
  const abortRef = useRef(false)
  const { sessions, updateTimelineStage, updateSessionStatus } = useSessionStore()

  const startProcessing = useCallback(async () => {
    if (!sessionId) return
    const session = sessions[sessionId]
    if (!session) return

    abortRef.current = false
    setIsProcessing(true)
    updateSessionStatus(sessionId, 'thinking')

    const wizardCtx = useWizardStore.getState().buildContext(sessionId)
    let previousContext = wizardCtx

    // Build structured config from wizard answers
    const wizardState = useWizardStore.getState()
    const raw = wizardState.bySession[sessionId]
    const stageConfig: StageConfig | undefined = raw ? {
      scale: raw.scale,
      scope: raw.scope,
      frontend: raw.frontend.length > 0 ? raw.frontend : undefined,
      backend: raw.backend.length > 0 ? raw.backend : undefined,
      database: raw.database.length > 0 ? raw.database : undefined,
      auth: raw.auth.length > 0 ? raw.auth : undefined,
      payment: raw.payment,
      storage: raw.storage,
      deployment: raw.deployment,
      audience: raw.audience,
      expectedUsers: raw.expectedUsers,
      timelinePriority: raw.timelinePriority,
      budget: raw.budget,
      goal: raw.goal,
    } : undefined

    for (const stage of session.timeline) {
      if (abortRef.current) break

      updateTimelineStage(sessionId, stage.id, { status: 'loading' })

      try {
        const details = await analyzeStage(
          stage.id as import('@/lib/prompts').StageKey,
          session.prompt,
          previousContext,
          session.mode as import('@/lib/prompts').ModeKey,
          undefined,
          stageConfig,
        )

        if (abortRef.current) break

        updateTimelineStage(sessionId, stage.id, {
          status: 'completed',
          description: getStageDescription(stage.id),
          details,
        })
        previousContext += `\n\n--- ${stage.name} ---\n${details}`
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') break
        updateTimelineStage(sessionId, stage.id, {
          status: 'failed',
          description: 'An error occurred during processing. Please try again.',
        })
        updateSessionStatus(sessionId, 'failed')
        setIsProcessing(false)
        return
      }
    }

    if (!abortRef.current) {
      updateSessionStatus(sessionId, 'completed')
    }
    setIsProcessing(false)
  }, [sessionId, sessions, updateTimelineStage, updateSessionStatus])

  const abort = useCallback(() => {
    abortRef.current = true
    setIsProcessing(false)
  }, [])

  return { isProcessing, startProcessing, abort }
}

function getStageDescription(stageId: string): string {
  const descriptions: Record<string, string> = {
    requirements: 'Extracted and analyzed core requirements from your description',
    clarification: 'Identified ambiguities and resolved key design decisions',
    architecture: 'Designed system architecture with recommended patterns and technologies',
    database: 'Created optimized database schema with relationships and indexes',
    structure: 'Organized project structure following industry best practices',
    security: 'Performed security audit and implemented protective measures',
    roadmap: 'Generated phased development roadmap with milestones',
    generation: 'Bootstrapped starter code with your preferred tech stack',
  }
  return descriptions[stageId] || 'Processing completed successfully'
}
