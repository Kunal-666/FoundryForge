import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, CheckCircle2, XCircle, Bot, Play, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatBubble } from '@/components/ChatBubble'
import { SessionHeader } from '@/components/SessionHeader'
import { TimelineCard } from '@/components/TimelineCard'
import { PromptInput } from '@/components/PromptInput'
import { ThinkingAnimation } from '@/components/ThinkingAnimation'
import { FileTree } from '@/components/FileTree'
import { ProjectWizard } from '@/components/ProjectWizard'
import { useSessionStore } from '@/stores/sessionStore'
import { useWizardStore } from '@/stores/wizardStore'
import { useTimeline } from '@/hooks/useTimeline'
import { sendFollowUp, sendChatMessage } from '@/lib/foundry'
import { db, isConfigured } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { parseFilesFromMarkdown, generateId } from '@/lib/utils'
import { MODE_ICONS } from '@/data/constants'
import type { Session } from '@/types'

export function Conversation() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessions, setCurrentSession, addMessage, removeMessagesAfter, getCurrentSession } = useSessionStore()
  const { isProcessing, startProcessing, abort: abortTimeline } = useTimeline(id)
  const [showTimeline, setShowTimeline] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [sending, setSending] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const userCancelledRef = useRef(false)

  useEffect(() => {
    if (!id) return

    const load = async () => {
      if (sessions[id]) {
        setCurrentSession(id)
        setInitialized(true)
        return
      }

      if (isConfigured && db) {
        try {
          const snap = await getDoc(doc(db, 'sessions', id))
          if (snap.exists()) {
            const data = snap.data() as Session
            data.createdAt = new Date(data.createdAt as unknown as string)
            data.updatedAt = new Date(data.updatedAt as unknown as string)
            useSessionStore.setState((state) => ({
              sessions: { ...state.sessions, [id]: data },
            }))
            setCurrentSession(id)
            setInitialized(true)
            return
          }
        } catch (e) { console.error('[Conversation] Failed to load session', e) }
      }

      setInitialized(true)
    }

    load()
  }, [id])

  useEffect(() => {
    const s = getCurrentSession()
    document.title = s ? `${s.title} - FoundryForge` : 'Session - FoundryForge'
  })

  // Show wizard for architecture sessions in idle state
  useEffect(() => {
    if (!id || !initialized) return
    const s = getCurrentSession()
    if (!s) return
    if (s.mode !== 'architecture') return
    if (s.status !== 'idle') return
    if (s.timeline.length === 0) return
    const wizardState = useWizardStore.getState()
    if (wizardState.completed[id]) return
    setShowWizard(true)
  }, [id, initialized])

  const session = getCurrentSession()
  const isArchitecture = session?.mode === 'architecture'
  const isGeneral = session?.mode === 'general'
  const isCodegen = session?.mode === 'codegen'
  const hasTimeline = isArchitecture && session.timeline.length > 0

  const completedStages = session?.timeline.filter(s => s.status === 'completed').length ?? 0
  const totalStages = session?.timeline.length ?? 0
  const isChatMode = isGeneral || isCodegen
  const lastAssistantMsg = session?.messages.filter(m => m.role === 'assistant').at(-1)
  const files = useMemo(
    () => (lastAssistantMsg ? parseFilesFromMarkdown(lastAssistantMsg.content) : []),
    [lastAssistantMsg?.content],
  )
  const ModeIcon = session ? MODE_ICONS[session.mode] : Sparkles

  const handleWizardComplete = useCallback(() => {
    setShowWizard(false)
    startProcessing()
  }, [startProcessing])

  const handleWizardDismiss = useCallback(() => {
    setShowWizard(false)
    startProcessing()
  }, [startProcessing])

  const handleStop = useCallback(() => {
    userCancelledRef.current = true
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setSending(false)
  }, [])

  const handleRetry = useCallback(() => {
    const s = getCurrentSession()
    if (!s) return
    const msgs = s.messages
    let lastUserIdx = -1
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserIdx = i
        break
      }
    }
    if (lastUserIdx === -1) return
    const content = msgs[lastUserIdx].content
    removeMessagesAfter(id!, lastUserIdx)
    handleSubmit(content)
  }, [id])

  const handleSubmit = async (prompt: string) => {
    if (!id || sending) return

    addMessage(id, {
      id: generateId(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    })

    setSending(true)
    userCancelledRef.current = false

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const freshSession = useSessionStore.getState().sessions[id]
      const history = freshSession
        ? freshSession.messages.slice(1)
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join('\n\n')
        : ''

      let response: string
      if (isChatMode) {
        response = await sendChatMessage(prompt, history, session?.mode, controller.signal)
      } else {
        const timelineContext = (session?.timeline ?? [])
          .filter(s => s.status === 'completed' && s.details)
          .map(s => `${s.name}:\n${s.details}`)
          .join('\n\n')
        response = await sendFollowUp(session!.prompt, timelineContext, prompt, undefined, controller.signal)
      }

      if (userCancelledRef.current) return

      addMessage(id, {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      })
    } catch {
      if (userCancelledRef.current) return
      addMessage(id, {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      })
    } finally {
      setSending(false)
      abortControllerRef.current = null
    }
  }

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
        <AlertCircle className="h-12 w-12 text-text-dim" />
        <h2 className="text-xl font-semibold text-text">Session not found</h2>
        <p className="text-sm text-text-muted">This session doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {showWizard && id && session?.messages[0] && (
        <ProjectWizard
          sessionId={id}
          prompt={session.messages[0].content}
          onComplete={handleWizardComplete}
          onDismiss={handleWizardDismiss}
        />
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <SessionHeader
          session={session}
          isProcessing={isProcessing}
          isSending={sending}
          showTimeline={showTimeline}
          hasTimeline={hasTimeline}
          completedStages={completedStages}
          totalStages={totalStages}
          onBack={() => navigate('/dashboard')}
          onStartAnalysis={startProcessing}
          onAbort={isProcessing ? abortTimeline : handleStop}
          onToggleTimeline={() => setShowTimeline(!showTimeline)}
        />

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col">
            <ScrollArea className="flex-1">
              <div className="mx-auto max-w-3xl py-6">
                {session.messages.map((msg, i) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg}
                    isLast={i === session.messages.length - 1 && !isProcessing && !sending}
                    onRetry={i === session.messages.length - 1 ? handleRetry : undefined}
                  />
                ))}

                {isProcessing && <ThinkingAnimation visible />}
                {sending && <ThinkingAnimation visible />}

                {/* Architecture mode: idle state with Start button */}
                {session.status === 'idle' && session.messages.length === 1 && hasTimeline && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <Bot className="mb-4 h-12 w-12 text-text-dim" />
                    <h3 className="mb-2 text-lg font-semibold text-text">
                      Ready to analyze
                    </h3>
                    <p className="mb-6 max-w-md text-sm text-text-muted">
                      Click "Start Analysis" to begin the multi-step architecture process.
                      Each stage will be processed sequentially.
                    </p>
                    <Button onClick={startProcessing} className="gap-2 shadow-lg shadow-primary/25">
                      <Play className="h-4 w-4" />
                      Start Analysis
                    </Button>
                  </motion.div>
                )}

                {/* Chat mode (general/codegen): auto-send on mount */}
                {session.status === 'idle' && session.messages.length === 1 && isChatMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <ModeIcon className="mb-4 h-12 w-12 text-text-dim" />
                    <h3 className="mb-2 text-lg font-semibold text-text">
                      {isCodegen ? 'Generate Code' : 'Start chatting'}
                    </h3>
                    <p className="mb-6 max-w-md text-sm text-text-muted">
                      Send a message to begin.
                    </p>
                  </motion.div>
                )}

                {/* Architecture mode: completed state */}
                {session.status === 'completed' && hasTimeline && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <CheckCircle2 className="mb-3 h-10 w-10 text-success" />
                    <h3 className="mb-1 text-lg font-semibold text-text">
                      Analysis Complete
                    </h3>
                    <p className="text-sm text-text-muted">
                      All stages completed successfully. Review the timeline for details.
                    </p>
                  </motion.div>
                )}

                {/* Architecture mode: failed state */}
                {session.status === 'failed' && hasTimeline && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <XCircle className="mb-3 h-10 w-10 text-error" />
                    <h3 className="mb-1 text-lg font-semibold text-text">
                      Analysis Failed
                    </h3>
                    <p className="mb-6 text-sm text-text-muted">
                      An error occurred during processing. Please try again.
                    </p>
                    <Button onClick={startProcessing} variant="outline" className="gap-2">
                      <Play className="h-4 w-4" />
                      Retry
                    </Button>
                  </motion.div>
                )}

                {/* Files for codegen mode */}
                {isCodegen && files.length > 0 && (
                  <div className="mx-auto max-w-3xl px-6 pb-4">
                    <FileTree files={files} />
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Always-visible chat input for general/codegen */}
            {isChatMode && (
              <div className="border-t border-border p-4">
                <div className="mx-auto max-w-3xl">
                  <PromptInput
                    onSubmit={handleSubmit}
                    placeholder={isCodegen ? 'Describe the code to generate...' : 'Ask a follow-up question...'}
                    isLoading={sending}
                  />
                </div>
              </div>
            )}

            {/* Chat input for architecture after completion */}
            {isArchitecture && (session.status === 'completed' || session.status === 'failed') && (
              <div className="border-t border-border p-4">
                <div className="mx-auto max-w-3xl">
                  <PromptInput
                    onSubmit={handleSubmit}
                    placeholder="Ask a follow-up question..."
                    isLoading={sending}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Timeline sidebar - architecture only */}
          <AnimatePresence>
            {hasTimeline && showTimeline && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 340, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="border-l border-border bg-surface/30 overflow-hidden"
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h3 className="text-sm font-semibold text-text">
                      Architecture Timeline
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {completedStages}/{totalStages}
                    </Badge>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="flex flex-col gap-2 p-4">
                      <AnimatePresence>
                        {session.timeline.map((stage) => (
                          <TimelineCard
                            key={stage.id}
                            stage={stage}
                            isActive={stage.status === 'loading'}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
