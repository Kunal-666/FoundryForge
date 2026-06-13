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

    const raw = session.wizardAnswers || useWizardStore.getState().bySession[sessionId]
    let previousContext = ''
    if (raw) {
      const lines: string[] = []
      if (raw.scale) lines.push(`Scale: ${raw.scale}`)
      if (raw.scope) lines.push(`Scope: ${raw.scope}`)
      if (raw.audience) lines.push(`Target Audience: ${raw.audience}`)
      if (raw.expectedUsers) lines.push(`Expected Users: ${raw.expectedUsers}`)
      if (raw.timelinePriority) lines.push(`Timeline Priority: ${raw.timelinePriority}`)
      if (raw.budget) lines.push(`Budget: ${raw.budget}`)
      if (raw.goal) lines.push(`Goal: ${raw.goal}`)
      if (raw.payment && raw.payment !== 'none') lines.push(`Payment: ${raw.payment}`)
      if (raw.storage && raw.storage !== 'none') lines.push(`Storage: ${raw.storage}`)
      if (raw.deployment) lines.push(`Deployment: ${raw.deployment}`)
      if (raw.frontend.length) lines.push(`Frontend: ${raw.frontend.join(', ')}`)
      if (raw.backend.length) lines.push(`Backend: ${raw.backend.join(', ')}`)
      if (raw.database.length) lines.push(`Database: ${raw.database.join(', ')}`)
      if (raw.auth.length && !raw.auth.includes('none')) {
        lines.push(`Authentication: ${raw.auth.join(', ')}`)
      }
      if (lines.length) {
        previousContext = `\n## User Configuration\n${lines.map(l => `- ${l}`).join('\n')}\n`
      }
    }

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

      // Introduce a throttle delay to prevent slamming the Azure model gateway
      await new Promise(resolve => setTimeout(resolve, 800))

      if (abortRef.current) break

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
