import { motion } from 'framer-motion'
import { Sparkles, Edit2, Clock, Settings2, AlertTriangle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FIELD_DISPLAY, getFieldLabel } from '@/data/wizardDisplay'
import type { WizardAnswers } from '@/data/wizardQuestions'

interface HeroRequestCardProps {
  prompt: string
  timestamp: Date
  wizardAnswers?: WizardAnswers | null
  onEdit?: () => void
}

export function HeroRequestCard({ prompt, timestamp, wizardAnswers, onEdit }: HeroRequestCardProps) {
  const visibleFields = wizardAnswers
    ? FIELD_DISPLAY.filter(f => !f.showWhen || f.showWhen(wizardAnswers))
    : []
  const hasConfig = visibleFields.some(f => {
    const val = wizardAnswers?.[f.key]
    return val != null && (Array.isArray(val) ? val.length > 0 : true)
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-surface p-6"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.08),transparent_70%)]" />
      
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 shadow-lg shadow-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text">Project Request</h2>
              <p className="text-xs text-text-dim">Generated from user prompt</p>
            </div>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
        </div>
        
        <div className="rounded-xl bg-surface/50 border border-border/50 p-4">
          <p className="text-sm leading-relaxed text-text">&ldquo;{prompt}&rdquo;</p>
        </div>

        {hasConfig && (
          <div className="mt-4 rounded-xl border border-border/50 bg-surface/30 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Settings2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">Project Configuration</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {visibleFields.map((field) => {
                const raw = wizardAnswers?.[field.key]
                const isEmpty = raw == null || (Array.isArray(raw) && raw.length === 0)
                const label = field.format ? field.format(raw) : getFieldLabel(field.key, raw)
                return (
                  <span
                    key={field.key}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium',
                      isEmpty
                        ? 'border-amber-500/20 bg-amber-500/5 text-amber-300/70'
                        : 'border-success/20 bg-success/5 text-success',
                    )}
                  >
                    {isEmpty ? <AlertTriangle className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                    {field.icon} {field.label}: {isEmpty ? 'AI Assumption' : label}
                  </span>
                )
              })}
            </div>
          </div>
        )}
        
        <div className="mt-3 flex items-center gap-2 text-[10px] text-text-dim">
          <Clock className="h-3 w-3" />
          <span>{timestamp.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  )
}
