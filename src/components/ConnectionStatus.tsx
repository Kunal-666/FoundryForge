import { motion, AnimatePresence } from 'framer-motion'
import { useConnectionStore, type ConnectionStatus } from '@/stores/connectionStore'

const statusConfig: Record<ConnectionStatus, { label: string; dotClass: string }> = {
  idle: { label: 'Agent idle', dotClass: 'bg-text-dim' },
  connecting: { label: 'Connecting…', dotClass: 'bg-warning animate-pulse' },
  connected: { label: 'Agent online', dotClass: 'bg-success' },
  error: { label: 'Agent error', dotClass: 'bg-error' },
}

export function ConnectionStatus() {
  const { status, errorMessage } = useConnectionStore()
  const config = statusConfig[status]

  return (
    <AnimatePresence>
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="group relative flex items-center gap-1.5"
      >
        <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
        <span className="hidden sm:inline text-xs text-text-muted">{config.label}</span>
        {status === 'error' && errorMessage && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
            {errorMessage}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
