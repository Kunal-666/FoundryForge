import { motion } from 'framer-motion'
import { AlertTriangle, CircleHelp } from 'lucide-react'
import type { ArchitectureData } from '@/lib/architecture'

interface ClarificationCardProps {
  missingInformation: ArchitectureData['missingInformation']
  conflicts: ArchitectureData['conflicts']
}

export function ClarificationCard({ missingInformation, conflicts }: ClarificationCardProps) {
  if (!missingInformation.length && !conflicts.length) return null

  return (
    <motion.section
      id="clarification"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-surface p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
          <CircleHelp className="h-4 w-4 text-amber-300" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Clarification Needed</h2>
          <p className="text-xs text-text-dim">Missing details and conflicting constraints</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {missingInformation.length > 0 && (
          <div className="rounded-xl border border-border/50 bg-surface/30 p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">
              Missing Information
            </p>
            <ul className="space-y-2">
              {missingInformation.slice(0, 5).map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {conflicts.length > 0 && (
          <div className="rounded-xl border border-border/50 bg-surface/30 p-4">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-300" />
              Conflicting Requirements
            </p>
            <ul className="space-y-2">
              {conflicts.slice(0, 5).map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.section>
  )
}
