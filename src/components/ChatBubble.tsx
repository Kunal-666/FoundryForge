import { motion } from 'framer-motion'
import { cn, downloadFile } from '@/lib/utils'
import type { Message } from '@/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sparkles, User, File, Download, RefreshCw } from 'lucide-react'

const ERROR_MESSAGE = 'Sorry, I encountered an error. Please try again.'

interface ChatBubbleProps {
  message: Message
  isLast?: boolean
  onRetry?: () => void
}

export function ChatBubble({ message, isLast, onRetry }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3 px-4 py-3',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      <Avatar className={cn('h-8 w-8 shrink-0', isUser && 'bg-primary/20')}>
        <AvatarFallback>
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary" />
          )}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'flex flex-col gap-1 max-w-[80%]',
          isUser ? 'items-end' : 'items-start',
        )}
      >
        <span className="text-xs font-medium text-text-dim">
          {isUser ? 'You' : 'FoundryForge'}
        </span>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed flex flex-col gap-2 whitespace-pre-wrap',
            isUser
              ? 'bg-primary text-white rounded-tr-md'
              : 'bg-surface-hover text-text border border-border rounded-tl-md',
          )}
        >
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {message.attachments.map((att, i) => (
                <button
                  key={i}
                  onClick={() => downloadFile(att.name, att.content)}
                  className="inline-flex items-center gap-1 rounded-lg bg-black/20 px-2 py-1 text-[10px] hover:bg-black/30 transition-colors"
                >
                  <File className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[140px]">{att.name}</span>
                  <Download className="h-3 w-3 shrink-0 opacity-60" />
                </button>
              ))}
            </div>
          )}
          {message.content}
          {!isUser && message.content === ERROR_MESSAGE && onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-text-dim hover:text-primary transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
        {isLast && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="h-1 w-1 rounded-full bg-text-dim"
          />
        )}
      </div>
    </motion.div>
  )
}
