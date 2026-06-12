import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, ShieldCheck } from 'lucide-react'
import type { ArchitectureData } from '@/lib/architecture'

interface SecurityRecommendationsCardProps {
  securityRecommendations: ArchitectureData['securityRecommendations']
}

export function SecurityRecommendationsCard({ securityRecommendations }: SecurityRecommendationsCardProps) {
  const [copied, setCopied] = useState(false)

  if (!securityRecommendations.length) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(securityRecommendations.join('\n'))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.section
      id="security"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl border border-border/60 bg-surface/50 p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Security Recommendations</h2>
          <p className="text-xs text-text-dim">Only the controls that matter for this scope</p>
        </div>
        <button
          onClick={handleCopy}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-surface/40 px-3 py-2 text-xs font-medium text-text-dim transition-colors hover:bg-surface-hover hover:text-text"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? 'Copied' : 'Copy Security'}
        </button>
      </div>

      <ul className="space-y-2">
        {securityRecommendations.slice(0, 5).map((item) => (
          <li key={item} className="flex items-start gap-2 rounded-xl border border-border/50 bg-surface/30 px-4 py-3 text-sm text-text-muted">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.section>
  )
}
