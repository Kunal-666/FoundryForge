import { motion } from 'framer-motion'
import { cn, formatDate, truncate } from '@/lib/utils'
import type { HistoryItem } from '@/types'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Loader2, Sparkles, Trash2 } from 'lucide-react'
import { MODE_CONFIG } from '@/data/mock'
import { MODE_ICONS } from '@/data/constants'

interface SessionCardProps {
  item: HistoryItem
  onClick?: () => void
  isActive?: boolean
  onDelete?: (e: React.MouseEvent) => void
}

export function SessionCard({ item, onClick, isActive, onDelete }: SessionCardProps) {
  const statusMap = {
    idle: { label: 'Idle', variant: 'secondary' as const },
    thinking: { label: 'Thinking', variant: 'warning' as const },
    completed: { label: 'Completed', variant: 'success' as const },
    failed: { label: 'Failed', variant: 'error' as const },
  }

  const status = statusMap[item.status]
  const modeConfig = MODE_CONFIG[item.mode]
  const ModeIcon = MODE_ICONS[item.mode] || Sparkles

  return (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      className={cn(
        'group relative w-full cursor-pointer rounded-lg border border-transparent px-3 py-2.5 text-left transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-primary/30',
        isActive
          ? 'bg-primary/10 border-primary/20'
          : 'hover:bg-surface-hover hover:border-border',
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-hover">
          {item.status === 'thinking' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-warning" />
          ) : (
            <MessageSquare className="h-3.5 w-3.5 text-text-dim" />
          )}
        </div>
        <div className="min-w-0 flex-1 pr-8">
          <p className="text-sm font-medium text-text truncate" title={item.title}>
            {item.title}
          </p>
          <p className="mt-0.5 text-xs text-text-dim truncate" title={item.preview}>
            {truncate(item.preview, 60)}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-text-dim">
              {formatDate(item.createdAt)}
            </span>
            <Badge variant={status.variant} className="text-[10px] px-1.5 py-0">
              {status.label}
            </Badge>
            {modeConfig && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                <ModeIcon className="h-2.5 w-2.5" />
                {modeConfig.label}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(e)
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-error hover:bg-surface-hover p-1.5 rounded-md transition-all duration-150 text-text-dim"
          title="Delete session"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  )
}

