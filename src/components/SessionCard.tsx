import { motion } from 'framer-motion'
import { cn, formatDate, truncate } from '@/lib/utils'
import type { HistoryItem } from '@/types'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Loader2, Sparkles } from 'lucide-react'
import { MODE_CONFIG } from '@/data/mock'
import { MODE_ICONS } from '@/data/constants'

interface SessionCardProps {
  item: HistoryItem
  onClick?: () => void
  isActive?: boolean
}

export function SessionCard({ item, onClick, isActive }: SessionCardProps) {
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
    <motion.button
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={cn(
        'group w-full rounded-lg border border-transparent px-3 py-2.5 text-left transition-all duration-200',
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
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text truncate">
            {item.title}
          </p>
          <p className="mt-0.5 text-xs text-text-dim">
            {truncate(item.preview, 60)}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
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
    </motion.button>
  )
}
