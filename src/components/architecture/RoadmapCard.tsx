import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Route, CheckCircle2 } from 'lucide-react'
import type { ArchitectureData } from '@/lib/architecture'

interface RoadmapCardProps {
  roadmap: ArchitectureData['roadmap']
}

export function RoadmapCard({ roadmap }: RoadmapCardProps) {
  const [copied, setCopied] = useState(false)

  if (!roadmap.length) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      roadmap
        .map((phase) => `${phase.phase}: ${phase.milestones.join(', ')}`)
        .join('\n'),
    )
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.section
      id="roadmap"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="rounded-2xl border border-border/60 bg-surface/50 p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Route className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Development Roadmap</h2>
          <p className="text-xs text-text-dim">Implementation phases and concise milestones</p>
        </div>
        <button
          onClick={handleCopy}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-surface/40 px-3 py-2 text-xs font-medium text-text-dim transition-colors hover:bg-surface-hover hover:text-text"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? 'Copied' : 'Copy Roadmap'}
        </button>
      </div>

      <div className="space-y-3">
        {roadmap.slice(0, 5).map((phase, index) => (
          <div key={phase.phase} className="rounded-xl border border-border/50 bg-surface/30 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                {index + 1}
              </span>
              <h3 className="text-sm font-semibold text-text">{phase.phase}</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {phase.milestones.slice(0, 4).map((milestone) => (
                <span key={milestone} className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-surface/70 px-2.5 py-1 text-[11px] text-text-muted">
                  <CheckCircle2 className="h-3 w-3 text-primary/80" />
                  {milestone}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
