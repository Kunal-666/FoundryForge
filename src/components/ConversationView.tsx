import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatBubble } from '@/components/ChatBubble'
import { SessionHeader } from '@/components/SessionHeader'
import { ArchitectureView } from '@/components/architecture/ArchitectureView'
import { ThinkingAnimation } from '@/components/ThinkingAnimation'
import { FileTree } from '@/components/FileTree'
import { PromptInput, type UploadedFile } from '@/components/PromptInput'
import { ProjectWizard } from '@/components/ProjectWizard'
import { useSessionStore } from '@/stores/sessionStore'
import { useWizardStore } from '@/stores/wizardStore'
import { useTimeline } from '@/hooks/useTimeline'
import { sendFollowUp, sendChatMessage } from '@/lib/foundry'
import { parseFilesFromMarkdown, generateId } from '@/lib/utils'
import type { Message } from '@/types'

const autoSentSessions = new Set<string>()

interface ConversationViewProps {
  sessionId: string
  onBack: () => void
}

export function ConversationView({ sessionId, onBack }: ConversationViewProps) {
  const { sessions, setCurrentSession, addMessage, removeMessagesAfter } = useSessionStore()
  const { isProcessing, startProcessing, abort: abortTimeline } = useTimeline(sessionId)
  const [sending, setSending] = useState(false)
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const sendingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const userCancelledRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentSession(sessionId)
  }, [sessionId])

  const session = sessions[sessionId]
  const isArchitecture = session?.mode === 'architecture'
  const isGeneral = session?.mode === 'general'
  const isCodegen = session?.mode === 'codegen'
  const isChatMode = isGeneral || isCodegen
  const hasTimeline = isArchitecture && (session?.timeline.length ?? 0) > 0
  const completedStages = session?.timeline.filter(s => s.status === 'completed').length ?? 0
  const totalStages = session?.timeline.length ?? 0

  const lastAssistantMsg = session?.messages.filter(m => m.role === 'assistant').at(-1)
  const files = useMemo(
    () => (lastAssistantMsg ? parseFilesFromMarkdown(lastAssistantMsg.content) : []),
    [lastAssistantMsg?.content],
  )

  const handleWizardComplete = useCallback(() => {
    setShowWizard(false)
    startProcessing()
  }, [startProcessing])

  const handleWizardDismiss = useCallback(() => {
    setShowWizard(false)
    startProcessing()
  }, [startProcessing])

  if (!session) return null

  const handleStop = useCallback(() => {
    userCancelledRef.current = true
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    sendingRef.current = false
    setSending(false)
  }, [])

  const handleRetry = useCallback(() => {
    const msgs = session.messages
    let lastUserIdx = -1
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserIdx = i
        break
      }
    }
    if (lastUserIdx === -1) return
    const content = msgs[lastUserIdx].content
    removeMessagesAfter(sessionId, lastUserIdx)
    handleSubmit(content, undefined, true)
  }, [session?.messages, sessionId])

  const handleSubmit = async (
    prompt: string,
    files?: UploadedFile[],
    isAuto = false,
  ) => {
    if (!sessionId || sendingRef.current) return

    const currentSession = useSessionStore.getState().sessions[sessionId]
    if (!currentSession) return

    const fileContext = files && files.length > 0
      ? 'Uploaded reference files:\n' + files.map(f =>
          `--- ${f.name} ---\n${f.content}\n---`
        ).join('\n') + '\n\n'
      : ''

    if (!isAuto) {
      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: prompt,
        timestamp: new Date(),
      }
      if (files && files.length > 0) {
        userMsg.attachments = files.map(f => ({ name: f.name, content: f.content, language: f.language }))
      }
      addMessage(sessionId, userMsg)
    }

    sendingRef.current = true
    setSending(true)
    userCancelledRef.current = false

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const freshSession = useSessionStore.getState().sessions[sessionId]
      const history = freshSession
        ? freshSession.messages.slice(1)
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join('\n\n')
        : ''

      const isChat = currentSession.mode === 'general' || currentSession.mode === 'codegen'

      let response: string
      if (isChat) {
        response = await sendChatMessage(fileContext + prompt, history, currentSession.mode, controller.signal)
      } else {
        const timelineContext = (currentSession.timeline ?? [])
          .filter(s => s.status === 'completed' && s.details)
          .map(s => `${s.name}:\n${s.details}`)
          .join('\n\n')
        response = await sendFollowUp(currentSession.prompt, timelineContext, prompt, undefined, controller.signal)
      }

      if (userCancelledRef.current) return

      addMessage(sessionId, {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      })
    } catch (err) {
      if (userCancelledRef.current) return
      console.error('[ConversationView] AI call failed:', err)
      addMessage(sessionId, {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      })
    } finally {
      sendingRef.current = false
      setSending(false)
      abortControllerRef.current = null
    }
  }

  useEffect(() => {
    if (!sessionId) return
    if (autoSentSessions.has(sessionId)) return

    const store = useSessionStore.getState()
    const s = store.sessions[sessionId]
    if (!s) return
    if (s.messages.length !== 1) return
    if (s.messages[0].role !== 'user') return
    if (s.messages.some(m => m.role === 'assistant')) return

    autoSentSessions.add(sessionId)

    if (s.mode === 'architecture') {
      const wizardState = useWizardStore.getState()
      if (!wizardState.completed[sessionId]) {
        setShowWizard(true)
        return
      }
    }

    handleSubmit(s.messages[0].content, undefined, true)
  }, [sessionId])

  useEffect(() => {
    const root = scrollRef.current
    if (!root) return
    const viewport = root.querySelector<HTMLElement>('[data-radix-scroll-area-viewport]')
    if (!viewport) return
    const timer = setTimeout(() => {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(timer)
  }, [session?.messages.length])

  return (
    <>
      {showWizard && (
        <ProjectWizard
          sessionId={sessionId}
          prompt={session.messages[0]?.content ?? ''}
          onComplete={handleWizardComplete}
          onDismiss={handleWizardDismiss}
        />
      )}
      <SessionHeader
        session={session}
        isProcessing={isProcessing}
        isSending={sending}
        hasTimeline={hasTimeline}
        completedStages={completedStages}
        totalStages={totalStages}
        onBack={onBack}
        onStartAnalysis={startProcessing}
        onAbort={isProcessing ? abortTimeline : handleStop}
      />

      {isArchitecture ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <ArchitectureView
              session={session}
              sessionId={sessionId}
              onFollowUp={() => setShowFollowUp(true)}
              onRegenerate={startProcessing}
            />
            {session.messages.length > 2 && (
              <div className="mx-auto max-w-4xl space-y-4 px-4 pb-6">
                <h3 className="text-sm font-semibold text-muted-foreground px-4">Follow-up</h3>
                {session.messages.slice(2).map((msg, i, arr) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg}
                    isLast={i === arr.length - 1 && !sending}
                  />
                ))}
              </div>
            )}
          </div>
          {(session.status === 'completed' || showFollowUp) && (
            <div className="border-t border-border p-4">
              <div className="mx-auto max-w-3xl">
                <PromptInput
                  onSubmit={(prompt) => handleSubmit(prompt)}
                  placeholder="Ask a follow-up question..."
                  isLoading={sending}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col">
            <ScrollArea className="flex-1" ref={scrollRef}>
              <div className="mx-auto max-w-3xl py-6">
                {session.messages.map((msg, i) => {
                  const shouldHide = isCodegen && msg.role === 'assistant' && parseFilesFromMarkdown(msg.content).length > 0
                  if (shouldHide) return null
                  return (
                    <ChatBubble
                      key={msg.id}
                      message={msg}
                      isLast={i === session.messages.length - 1 && !isProcessing && !sending}
                      onRetry={i === session.messages.length - 1 ? handleRetry : undefined}
                    />
                  )
                })}

                {isProcessing && <ThinkingAnimation visible />}
                {sending && <ThinkingAnimation visible />}

                {session.status === 'idle' && session.messages.length === 1 && isChatMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <Sparkles className="mb-4 h-12 w-12 text-text-dim" />
                    <h3 className="mb-2 text-lg font-semibold text-text">
                      {isCodegen ? 'Generate Code' : 'Start chatting'}
                    </h3>
                    <p className="max-w-md text-sm text-text-muted">
                      Send a message to begin.
                    </p>
                  </motion.div>
                )}

                {isCodegen && files.length > 0 && (
                  <div className="mx-auto max-w-3xl px-6 pb-4">
                    <FileTree files={files} />
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-border p-4">
              <div className="mx-auto max-w-3xl">
                <PromptInput
                  onSubmit={handleSubmit}
                  placeholder={
                    isCodegen ? 'Describe the code to generate...' :
                    isGeneral ? 'Ask a follow-up question...' :
                    'Ask a follow-up question...'
                  }
                  isLoading={sending}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
