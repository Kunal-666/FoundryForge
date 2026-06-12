import { motion } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'
import type { ArchitectureData } from '@/lib/architecture'

interface RiskCardProps {
  risks: ArchitectureData['risks']
}

export function RiskCard({ risks }: RiskCardProps) {
  if (!risks.length) return null

  return (
    <motion.div
      id="risks"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-surface p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/15">
          <ShieldAlert className="h-4 w-4 text-red-400" />
        </div>
        <span className="text-sm font-semibold text-red-300/90">Potential Risks</span>
      </div>
      <ul className="space-y-1.5">
        {risks.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-400/40" />
            {r}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
