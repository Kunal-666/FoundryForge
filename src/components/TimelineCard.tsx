import { motion, AnimatePresence } from 'framer-motion'
import { cn, dedupLines } from '@/lib/utils'
import type { TimelineStage } from '@/types'
import { CheckCircle2, XCircle, Loader2, Clock, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface TimelineCardProps {
  stage: TimelineStage
  isActive?: boolean
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-text-dim', bg: 'bg-surface-hover' },
  loading: { icon: Loader2, color: 'text-primary', bg: 'bg-primary/5' },
  completed: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/5' },
  failed: { icon: XCircle, color: 'text-error', bg: 'bg-error/5' },
}

export function TimelineCard({ stage, isActive }: TimelineCardProps) {
  const [expanded, setExpanded] = useState(false)
  const config = statusConfig[stage.status]
  const Icon = config.icon
  const hasDetails = !!stage.details

  const displayDetails = dedupLines(stage.details ?? '')

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group relative rounded-xl border transition-all duration-300',
        isActive
          ? 'border-primary/30 bg-primary/5 shadow-lg shadow-primary/5'
          : 'border-border bg-surface hover:border-border-hover',
        stage.status === 'completed' && 'border-success/20',
        stage.status === 'failed' && 'border-error/20',
        hasDetails && 'cursor-pointer',
      )}
      role={hasDetails ? 'button' : undefined}
      tabIndex={hasDetails ? 0 : undefined}
      aria-expanded={hasDetails ? expanded : undefined}
      onClick={() => {
        if (hasDetails) setExpanded(!expanded)
      }}
      onKeyDown={(e) => {
        if (!hasDetails) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setExpanded(!expanded)
        }
      }}
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg transition-colors',
            config.bg,
          )}
        >
          {stage.status === 'loading' ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Icon className={cn('h-4 w-4', config.color)} />
            </motion.div>
          ) : (
            <Icon className={cn('h-4 w-4', config.color)} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text">
              {stage.icon} {stage.name}
            </span>
            <AnimatePresence>
              {stage.status === 'loading' && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Processing
                </motion.span>
              )}
            </AnimatePresence>
            {hasDetails && (
              <span className="ml-auto text-text-dim">
                {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </span>
            )}
          </div>

          <AnimatePresence>
            {stage.description && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-1 text-xs text-text-dim leading-relaxed"
              >
                {stage.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {expanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 py-3">
              <div className="prose prose-invert prose-xs max-w-none text-xs text-text-dim whitespace-pre-wrap leading-relaxed">
                {displayDetails}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
