import { ArrowLeft, Play, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MODE_ICONS, SESSION_STATUS_BADGE } from '@/data/constants'
import { MODE_CONFIG } from '@/data/mock'
import type { Session } from '@/types'

interface SessionHeaderProps {
  session: Session
  isProcessing?: boolean
  isSending?: boolean
  showTimeline?: boolean
  hasTimeline?: boolean
  completedStages?: number
  totalStages?: number
  onBack: () => void
  onStartAnalysis?: () => void
  onAbort?: () => void
  onToggleTimeline?: () => void
}

export function SessionHeader({
  session,
  isProcessing,
  isSending,
  showTimeline,
  hasTimeline,
  completedStages = 0,
  totalStages = 0,
  onBack,
  onStartAnalysis,
  onAbort,
  onToggleTimeline,
}: SessionHeaderProps) {
  const ModeIcon = MODE_ICONS[session.mode]
  const modeConfig = MODE_CONFIG[session.mode]
  const statusBadge = SESSION_STATUS_BADGE[session.status]

  return (
    <div className="flex h-16 items-center justify-between border-b border-border px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-text-dim hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <ModeIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text truncate max-w-md">
              {session.title}
            </h1>
            <div className="flex items-center gap-2">
              {modeConfig && (
                <span className="text-[10px] text-text-dim">{modeConfig.label}</span>
              )}
              {hasTimeline && (
                <span className="text-[10px] text-text-dim">
                  {completedStages}/{totalStages} stages
                </span>
              )}
              {statusBadge && (
                <Badge variant={statusBadge.variant} className="text-[10px]">
                  {statusBadge.label}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {hasTimeline && onToggleTimeline && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleTimeline}
            className="text-text-dim"
          >
            {showTimeline ? (
              <ChevronUp className="h-4 w-4 mr-1" />
            ) : (
              <ChevronDown className="h-4 w-4 mr-1" />
            )}
            Timeline
          </Button>
        )}
        {session.status === 'idle' && hasTimeline && onStartAnalysis && (
          <Button size="sm" onClick={onStartAnalysis} className="gap-2">
            <Play className="h-4 w-4" />
            Start Analysis
          </Button>
        )}
        {(isProcessing || isSending) && onAbort && (
          <Button size="sm" variant="destructive" onClick={onAbort} className="gap-2">
            <XCircle className="h-4 w-4" />
            Stop
          </Button>
        )}
      </div>
    </div>
  )
}
