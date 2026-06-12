import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, SkipForward, Check, X, 
  Sparkles, Settings2 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ConfigSummaryCard } from '@/components/ConfigSummaryCard'
import { WIZARD_QUESTIONS, type WizardAnswers, defaultAnswers } from '@/data/wizardQuestions'
import { useWizardStore } from '@/stores/wizardStore'
import { detectWizardPrefs } from '@/lib/detectWizardPrefs'

interface ProjectWizardProps {
  sessionId: string
  prompt: string
  onComplete: () => void
  onDismiss: () => void
}

/** Sentinel step index used for the review screen after all questions */
const REVIEW_STEP = -1

export function ProjectWizard({ sessionId, prompt, onComplete, onDismiss }: ProjectWizardProps) {
  const [step, setStep] = useState(0)
  const [answers, setLocalAnswers] = useState<WizardAnswers>(() => {
    const store = useWizardStore.getState()
    const existing = store.bySession[sessionId]
    if (existing) return existing
    const detected = detectWizardPrefs(prompt)
    return { ...defaultAnswers, ...detected }
  })

  const { setAnswers, markCompleted } = useWizardStore()

  /** Whether we are showing the review summary instead of a question */
  const isReview = step === REVIEW_STEP

  /** Questions visible based on current answers */
  const visibleQuestions = useMemo(
    () => WIZARD_QUESTIONS.filter(q => !q.condition || q.condition(answers)),
    [answers],
  )

  /** step is always a valid index into visibleQuestions. Clamp on changes. */
  const safeStep = Math.min(step, Math.max(0, visibleQuestions.length - 1))
  if (!isReview && safeStep !== step) setStep(safeStep)

  const question = isReview ? null : visibleQuestions[safeStep]
  const totalVisible = visibleQuestions.length
  const progress = isReview ? 100 : totalVisible > 0 ? ((safeStep + 1) / totalVisible) * 100 : 0
  const noMoreQuestions = totalVisible === 0

  /** Simple movement within the already-filtered visibleQuestions array. */
  const moveStep = useCallback((from: number, delta: 1 | -1): number => {
    const next = from + delta
    if (next < 0 || next >= visibleQuestions.length) return from
    return next
  }, [visibleQuestions])

  const goToReview = useCallback(() => {
    setAnswers(sessionId, answers)
    setStep(REVIEW_STEP)
  }, [sessionId, answers, setAnswers])

  const handleSelect = (value: string) => {
    if (!question) return
    const key = question.key

    let nextAnswers: WizardAnswers
    if (question.multiple) {
      const arr = (answers[key] as string[]) || []
      const next = arr.includes(value)
        ? arr.filter(v => v !== value)
        : [...arr, value]
      nextAnswers = { ...answers, [key]: next }
    } else {
      nextAnswers = { ...answers, [key]: value === answers[key] ? null : value }
    }
    setLocalAnswers(nextAnswers)

    // If the current question becomes invisible after this selection,
    // auto-advance to the next visible question in the full list.
    const wideIdx = WIZARD_QUESTIONS.indexOf(question)
    if (wideIdx >= 0 && question.condition && !question.condition(nextAnswers)) {
      // Map the WIZARD_QUESTIONS index to a visibleQuestions index
      const followingVisible = WIZARD_QUESTIONS
        .slice(wideIdx + 1)
        .filter(q => !q.condition || q.condition(nextAnswers))
      if (followingVisible.length > 0) {
        // Find this question in the current visibleQuestions to get its index
        const nextWide = WIZARD_QUESTIONS.indexOf(followingVisible[0])
        const visibleIdx = nextWide > wideIdx
          ? WIZARD_QUESTIONS.filter((q, i) => (!q.condition || q.condition(nextAnswers)) && i < nextWide).length
          : safeStep + 1
        setStep(Math.min(visibleIdx, WIZARD_QUESTIONS.filter(q => !q.condition || q.condition(nextAnswers)).length - 1))
      } else {
        goToReview()
      }
    }
  }

  const handleSkip = () => {
    if (noMoreQuestions) {
      goToReview()
      return
    }
    const nextIdx = moveStep(safeStep, 1)
    if (nextIdx !== safeStep) {
      setStep(nextIdx)
    } else {
      goToReview()
    }
  }

  const handleNext = () => {
    if (!question) {
      goToReview()
      return
    }
    setAnswers(sessionId, { [question.key]: answers[question.key] })
    if (noMoreQuestions) {
      goToReview()
      return
    }
    const nextIdx = moveStep(safeStep, 1)
    if (nextIdx !== safeStep) {
      setStep(nextIdx)
    } else {
      goToReview()
    }
  }

  const handlePrev = () => {
    if (isReview) {
      setStep(0)
      return
    }
    if (safeStep <= 0) return
    const prevIdx = moveStep(safeStep, -1)
    if (prevIdx !== safeStep) {
      setStep(prevIdx)
    }
  }

  const finish = () => {
    setAnswers(sessionId, answers)
    markCompleted(sessionId)
    onComplete()
  }

  const isSelected = (value: string): boolean => {
    if (!question) return false
    const val = answers[question.key]
    if (question.multiple) {
      return (val as string[])?.includes(value) ?? false
    }
    return val === value
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-text">
              {isReview ? 'Configuration Review' : 'Project Configuration'}
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="rounded-lg p-1 text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        {!isReview && (
          <div className="h-0.5 bg-border">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-5">
          <AnimatePresence mode="wait">
            {isReview ? (
              <ConfigSummaryCard
                answers={answers}
                onEdit={() => setStep(0)}
                onStart={finish}
              />
            ) : question ? (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-text-dim">
                    Step {safeStep + 1} / {totalVisible}
                  </span>
                </div>
                <h3 className="text-base font-bold text-text mb-1">{question.title}</h3>
                <p className="text-xs text-text-muted mb-4">{question.description}</p>

                <div className={cn(
                  'grid gap-2',
                  question.multiple
                    ? 'grid-cols-2'
                    : 'grid-cols-1',
                )}>
                  {question.options.map((opt) => {
                    const selected = isSelected(opt.value)
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all',
                          selected
                            ? 'border-primary/50 bg-primary/10 text-primary shadow-sm'
                            : 'border-border/60 bg-surface-hover/30 text-text-muted hover:border-border-hover hover:text-text',
                        )}
                      >
                        {opt.icon && <span className="text-base">{opt.icon}</span>}
                        <span className="flex-1 font-medium">{opt.label}</span>
                        {question.multiple && (
                          <div className={cn(
                            'flex h-4 w-4 items-center justify-center rounded border transition-all',
                            selected ? 'border-primary bg-primary text-white' : 'border-border',
                          )}>
                            {selected && <Check className="h-3 w-3" />}
                          </div>
                        )}
                        {!question.multiple && selected && (
                          <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8 text-center"
              >
                <p className="text-sm text-text-muted">No more questions available.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer – only show when not on review screen */}
        {!isReview && (
          <div className="flex items-center justify-between border-t border-border/50 px-5 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={safeStep <= 0}
              className="gap-1.5 text-text-dim"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {question && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="gap-1.5 text-text-dim"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  {question.skipLabel || 'Skip'}
                </Button>
              )}

              <Button
                size="sm"
                onClick={noMoreQuestions ? goToReview : handleNext}
                className="gap-1.5"
              >
                {noMoreQuestions ? (
                  <><Sparkles className="h-3.5 w-3.5" /> Review & Start</>
                ) : (
                  <>Next <ChevronRight className="h-3.5 w-3.5" /></>
                )}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
