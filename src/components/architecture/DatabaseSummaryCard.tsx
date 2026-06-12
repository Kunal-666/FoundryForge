import { motion } from 'framer-motion'
import { Database } from 'lucide-react'
import type { ArchitectureData } from '@/lib/architecture'

interface DatabaseSummaryCardProps {
  data: ArchitectureData
}

export function DatabaseSummaryCard({ data }: DatabaseSummaryCardProps) {
  return (
    <motion.section
      id="database"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="rounded-2xl border border-border/60 bg-surface/50 p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
          <Database className="h-4 w-4 text-orange-300" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Database Summary</h2>
          <p className="text-xs text-text-dim">Database type, entities, relationships, and scale</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr,1.1fr,1fr]">
        <div className="rounded-xl border border-border/50 bg-surface/30 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">Database Type</p>
          <p className="mt-1 text-sm font-semibold text-text">{data.databaseSummary.type}</p>
          <p className="mt-2 text-xs text-text-muted">{data.databaseSummary.estimatedTables} estimated tables</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-surface/30 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">Main Entities</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.databaseSummary.entities.slice(0, 5).map((entity) => (
              <span key={entity} className="rounded-full border border-border/50 bg-surface/70 px-2.5 py-1 text-[11px] text-text-muted">
                {entity}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-surface/30 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">Relationships</p>
          <ul className="mt-2 space-y-2">
            {data.databaseSummary.relationships.slice(0, 4).map((relationship) => (
              <li key={relationship} className="text-xs leading-relaxed text-text-muted">
                {relationship}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.section>
  )
}
