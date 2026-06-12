import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Layers3, ArrowRightLeft } from 'lucide-react'
import type { ArchitectureData } from '@/lib/architecture'

interface ProductionArchitectureCardProps {
  data: ArchitectureData
}

export function ProductionArchitectureCard({ data }: ProductionArchitectureCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      data.architectureRecommendations
        .map((item) => `${item.area}: ${item.recommended} | Reason: ${item.reason} | Alternative: ${item.alternative}`)
        .join('\n'),
    )
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.section
      id="architecture"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl border border-border/60 bg-surface/50 p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Layers3 className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Production Architecture</h2>
          <p className="text-xs text-text-dim">Recommended stack with practical tradeoffs</p>
        </div>
        <button
          onClick={handleCopy}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-surface/40 px-3 py-2 text-xs font-medium text-text-dim transition-colors hover:bg-surface-hover hover:text-text"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? 'Copied' : 'Copy Architecture'}
        </button>
      </div>

      <div className="space-y-3">
        {data.architectureRecommendations.map((item) => (
          <div
            key={item.area}
            className="rounded-xl border border-border/50 bg-surface/30 p-4"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-dim">
                {item.area}
              </span>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                Recommended
              </span>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.2fr,1fr,1fr]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">Recommended</p>
                <p className="mt-1 text-sm font-semibold text-text">{item.recommended}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">Reason</p>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">{item.reason}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">Alternative</p>
                <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-border/50 bg-surface/70 px-2.5 py-1 text-sm text-text-muted">
                  <ArrowRightLeft className="h-3.5 w-3.5 text-text-dim" />
                  {item.alternative}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
