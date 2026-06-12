import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ListTodo, Search } from 'lucide-react'
import { StageCard } from './StageCard'
import type { TimelineStage } from '@/types'

interface ProgressTrackerProps {
  stages: TimelineStage[]
  searchQuery: string
  expandedAll: boolean | null
}

export function ProgressTracker({ stages, searchQuery, expandedAll }: ProgressTrackerProps) {
  const completed = stages.filter(s => s.status === 'completed').length
  const total = stages.length
  const progress = total > 0 ? (completed / total) * 100 : 0
  
  const filteredStages = useMemo(() => {
    if (!searchQuery) return stages
    const q = searchQuery.toLowerCase()
    return stages.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.details?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    )
  }, [stages, searchQuery])

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-text">Architecture Progress</span>
          </div>
          <span className="text-xs text-text-dim">{completed}/{total} stages</span>
        </div>
        
        <div className="mb-4 h-2 rounded-full bg-surface-hover overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-success' : 'bg-primary'}`}
          />
        </div>
      </div>

      <div className="space-y-2">
        {filteredStages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="mb-2 h-6 w-6 text-text-dim" />
            <p className="text-sm text-text-muted">No stages match "{searchQuery}"</p>
          </div>
        ) : (
          filteredStages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            isActive={stage.status === 'loading'}
            searchQuery={searchQuery}
            isExpandedAll={expandedAll}
          />
        ))
      )}
      </div>
    </div>
  )
}
