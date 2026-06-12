import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Edit3, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FIELD_DISPLAY, getFieldLabel } from '@/data/wizardDisplay'
import type { WizardAnswers } from '@/data/wizardQuestions'

interface ConfigSummaryCardProps {
  answers: WizardAnswers
  onEdit: () => void
  onStart: () => void
}

export function ConfigSummaryCard({ answers, onEdit, onStart }: ConfigSummaryCardProps) {
  const visibleFields = FIELD_DISPLAY.filter(f => !f.showWhen || f.showWhen(answers))
  const hasAnyAnswer = visibleFields.some(f => {
    const val = answers[f.key]
    return val != null && (Array.isArray(val) ? val.length > 0 : true)
  })

  if (!hasAnyAnswer) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto w-full max-w-lg"
    >
      <div className="rounded-2xl border border-border/60 bg-surface shadow-lg overflow-hidden">
        <div className="border-b border-border/50 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-text">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Project Configuration
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Review your selections before analysis begins. Unanswered fields will be inferred by AI.
          </p>
        </div>

        <div className="divide-y divide-border/30 px-5 py-2">
          {visibleFields.map((field) => {
            const raw = answers[field.key]
            const isEmpty = raw == null || (Array.isArray(raw) && raw.length === 0)
            const label = field.format ? field.format(raw) : getFieldLabel(field.key, raw)

            return (
              <div key={field.key} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base shrink-0">{field.icon}</span>
                  <span className="text-xs font-medium text-text-muted">{field.label}</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0 ml-3">
                  {isEmpty ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300 whitespace-nowrap">
                      <AlertTriangle className="h-3 w-3" />
                      AI Assumption
                    </span>
                  ) : (
                    <span className="truncate text-xs font-semibold text-text">{label}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/50 px-5 py-3">
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
            <Edit3 className="h-3.5 w-3.5" />
            Edit Configuration
          </Button>
          <Button size="sm" onClick={onStart} className="gap-1.5">
            <Play className="h-3.5 w-3.5" />
            Start Analysis
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
