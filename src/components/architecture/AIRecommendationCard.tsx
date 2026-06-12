import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Bot, Crown } from 'lucide-react'
import type { ArchitectureData } from '@/lib/architecture'

interface AIRecommendationCardProps {
  data: ArchitectureData
}

export function AIRecommendationCard({ data }: AIRecommendationCardProps) {
  const best = data.aiRecommendations.find((item) => item.recommended) ?? data.aiRecommendations[0]
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      data.aiRecommendations
        .map((item) => `${item.tool}: ${item.bestUseCase} | ${item.why}`)
        .join('\n'),
    )
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.section
      id="ai-tool"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-2xl border border-border/60 bg-surface/50 p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">AI Implementation Recommendation</h2>
          <p className="text-xs text-text-dim">Best tool for turning this blueprint into code</p>
        </div>
        <button
          onClick={handleCopy}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-surface/40 px-3 py-2 text-xs font-medium text-text-dim transition-colors hover:bg-surface-hover hover:text-text"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? 'Copied' : 'Copy AI Recommendation'}
        </button>
      </div>

      <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            <Crown className="h-3 w-3" />
            Best Choice
          </span>
          <span className="text-sm font-semibold text-text">{best.tool}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{best.why}</p>
      </div>

      <div className="space-y-3">
        {data.aiRecommendations.map((tool) => (
          <div
            key={tool.tool}
            className="rounded-xl border border-border/50 bg-surface/30 p-4"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-text">{tool.tool}</span>
              <span className={tool.recommended ? 'text-xs font-semibold text-primary' : 'text-xs text-text-dim'}>
                {tool.recommended ? 'Recommended' : 'Alternative'}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-text-muted">{tool.bestUseCase}</p>

            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">Strengths</p>
                <div className="flex flex-wrap gap-1.5">
                  {tool.strengths.slice(0, 3).map((item) => (
                    <span key={item} className="rounded-full border border-border/50 bg-surface/70 px-2.5 py-1 text-[11px] text-text-muted">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">Limitations</p>
                <div className="flex flex-wrap gap-1.5">
                  {tool.limitations.slice(0, 3).map((item) => (
                    <span key={item} className="rounded-full border border-border/50 bg-surface/70 px-2.5 py-1 text-[11px] text-text-muted">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
