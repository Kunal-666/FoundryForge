import { motion } from 'framer-motion'
import { BadgeCheck, TriangleAlert, Ban } from 'lucide-react'
import type { ArchitectureData } from '@/lib/architecture'

interface GeneratorCompatibilityCardProps {
  data: ArchitectureData
}

const statusConfig = {
  supported: {
    icon: BadgeCheck,
    className: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
    label: 'Supported',
  },
  warning: {
    icon: TriangleAlert,
    className: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
    label: 'Partial',
  },
  unsupported: {
    icon: Ban,
    className: 'text-rose-300 bg-rose-500/10 border-rose-500/20',
    label: 'Unsupported',
  },
} as const

export function GeneratorCompatibilityCard({ data }: GeneratorCompatibilityCardProps) {
  return (
    <motion.section
      id="compatibility"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-border/60 bg-surface/50 p-5 sm:p-6"
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-text">Generator Compatibility</h2>
        <p className="text-xs text-text-dim">What the current generator can and cannot realistically produce</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {data.generatorCompatibility.map((item) => {
          const cfg = statusConfig[item.status]
          const Icon = cfg.icon
          return (
            <div key={item.label} className="rounded-xl border border-border/50 bg-surface/30 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-text">{item.label}</span>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${cfg.className}`}>
                  <Icon className="h-3 w-3" />
                  {cfg.label}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">{item.reason}</p>
            </div>
          )
        })}
      </div>
    </motion.section>
  )
}
