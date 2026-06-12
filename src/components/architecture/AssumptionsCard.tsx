import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import type { ArchitectureData } from '@/lib/architecture'

interface AssumptionsCardProps {
  assumptions: ArchitectureData['assumptions']
}

export function AssumptionsCard({ assumptions }: AssumptionsCardProps) {
  if (!assumptions.length) return null

  return (
    <motion.div
      id="assumptions"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-surface p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-500/15">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
        </div>
        <span className="text-sm font-semibold text-yellow-300/90">Assumptions</span>
      </div>
      <ul className="space-y-1.5">
        {assumptions.map((a, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-yellow-400/40" />
            {a}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
