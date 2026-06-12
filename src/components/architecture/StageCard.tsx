import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, CheckCircle2, Loader2, XCircle, Copy } from 'lucide-react'
import { cn, dedupLines } from '@/lib/utils'
import type { TimelineStage } from '@/types'

interface StageCardProps {
  stage: TimelineStage
  isActive: boolean
  searchQuery: string
  isExpandedAll?: boolean | null
}

function highlightText(text: string, query: string): (string | { text: string; highlighted: boolean })[] {
  if (!query) return [{ text, highlighted: false }]
  
  const parts: (string | { text: string; highlighted: boolean })[] = []
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  let lastIndex = 0
  let match
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), highlighted: false })
    }
    parts.push({ text: match[0], highlighted: true })
    lastIndex = regex.lastIndex
  }
  
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlighted: false })
  }
  
  return parts.length > 0 ? parts : [{ text, highlighted: false }]
}

function RenderContent({ text, searchQuery, summaryOnly }: { text: string; searchQuery: string; summaryOnly?: boolean }) {
  const lines = text.split('\n')
  
  const sections: { type: 'heading' | 'bullet' | 'callout' | 'text'; content: string }[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      sections.push({ type: 'heading', content: trimmed.replace(/\*\*/g, '') })
    } else if (/^\d+[\.\)]/.test(trimmed) || /^[-*•] /.test(trimmed)) {
      sections.push({ type: 'bullet', content: trimmed.replace(/^[\d\-\*•\.\)\s]+/, '').trim() })
    } else if (/^(important|note|tip|warning|recommend|best practice|consider)/i.test(trimmed)) {
      sections.push({ type: 'callout', content: trimmed })
    } else {
      sections.push({ type: 'text', content: trimmed })
    }
  }

  const displaySections = summaryOnly ? sections.filter(s => s.type === 'bullet').slice(0, 3) : sections

  return (
    <div className="space-y-2">
      {displaySections.map((section, i) => {
        const sectionParts = highlightText(section.content, searchQuery)
        const rendered = (
          <span>
            {sectionParts.map((part, j) =>
              typeof part === 'string' ? (
                <span key={j}>{part}</span>
              ) : part.highlighted ? (
                <span key={j} className="rounded bg-yellow-400/20 text-yellow-300 px-0.5">{part.text}</span>
              ) : (
                <span key={j}>{part.text}</span>
              )
            )}
          </span>
        )

        switch (section.type) {
          case 'heading':
            return <h4 key={i} className="text-sm font-semibold text-text pt-2 first:pt-0">{rendered}</h4>
          case 'bullet':
            return <div key={i} className="flex items-start gap-2 text-sm text-text-muted"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-text-dim" />{rendered}</div>
          case 'callout':
            return (
              <div key={i} className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-300/90">
                {rendered}
              </div>
            )
          default:
            return <p key={i} className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">{rendered}</p>
        }
      })}
    </div>
  )
}

const statusIcons = {
  pending: ({ className }: { className?: string }) => <div className={cn('h-5 w-5 rounded-full border-2 border-text-dim/30', className)} />,
  loading: ({ className }: { className?: string }) => <Loader2 className={cn('h-5 w-5 animate-spin text-primary', className)} />,
  completed: ({ className }: { className?: string }) => <CheckCircle2 className={cn('h-5 w-5 text-success', className)} />,
  failed: ({ className }: { className?: string }) => <XCircle className={cn('h-5 w-5 text-error', className)} />,
}

export function StageCard({ stage, isActive, searchQuery, isExpandedAll = null }: StageCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const StatusIcon = statusIcons[stage.status]

  const cleanedDetails = useMemo(() => dedupLines(stage.details ?? ''), [stage.details])
  const hasDetails = !!cleanedDetails
  const isOpen = isExpandedAll === null ? expanded : isExpandedAll

  useEffect(() => {
    if (isExpandedAll === null) {
      setExpanded(false)
      return
    }
    setExpanded(isExpandedAll)
  }, [isExpandedAll])

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!cleanedDetails) return
    navigator.clipboard.writeText(cleanedDetails)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <motion.div
      layout
      className={cn(
        'rounded-xl border transition-all',
        stage.status === 'completed' ? 'border-success/20 bg-success/5' :
        stage.status === 'failed' ? 'border-error/20 bg-error/5' :
        isActive ? 'border-primary/30 bg-primary/5 shadow-lg shadow-primary/5' :
        'border-border bg-surface/50',
      )}
    >
      <div
        onClick={() => hasDetails && setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hasDetails && setExpanded(!expanded); } }}
      >
        <span className="text-lg">{stage.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text truncate">{stage.name}</span>
            {stage.status === 'completed' && (
              <span className="text-[10px] text-success/80 shrink-0">Complete</span>
            )}
          </div>
          {stage.description && (
            <p className="text-xs text-text-dim truncate mt-0.5">{stage.description}</p>
          )}
        </div>
        <StatusIcon className="shrink-0" />
        <div className="flex items-center gap-1">
          {hasDetails && (
            <span
              onClick={handleCopy}
              className="shrink-0 rounded-lg p-1.5 text-text-dim hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
              title={`Copy ${stage.name}`}
            >
              <Copy className={cn('h-3.5 w-3.5', copied && 'text-success')} />
            </span>
          )}
          <span
            onClick={(e) => { e.stopPropagation(); hasDetails && setExpanded(!expanded); }}
            className="shrink-0 rounded-lg p-1 text-text-dim hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && stage.details && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50 px-4 py-3">
              {cleanedDetails ? <RenderContent text={cleanedDetails} searchQuery={searchQuery} /> : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
