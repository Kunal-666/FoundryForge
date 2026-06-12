import { motion } from 'framer-motion'
import { File, Server, Database, Box, LayoutDashboard, Clock, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ArchitectureData } from '@/lib/architecture'

interface MetricCardsProps {
  data: ArchitectureData
}

const metrics = [
  { key: 'estimatedFiles', label: 'Files', icon: File, color: 'from-blue-500/15' },
  { key: 'estimatedComponents', label: 'Components', icon: LayoutDashboard, color: 'from-cyan-500/15' },
  { key: 'estimatedApis', label: 'APIs', icon: Server, color: 'from-purple-500/15' },
  { key: 'estimatedDbTables', label: 'Tables', icon: Database, color: 'from-orange-500/15' },
  { key: 'estimatedServices', label: 'Services', icon: Box, color: 'from-green-500/15' },
  { key: 'estimatedDevTime', label: 'Timeline', icon: Clock, color: 'from-pink-500/15', isString: true },
]

export function MetricCards({ data }: MetricCardsProps) {
  const complexityColors: Record<string, string> = {
    Low: 'text-green-400 bg-green-500/10',
    Medium: 'text-yellow-400 bg-yellow-500/10',
    High: 'text-red-400 bg-red-500/10',
  }
  const cc = complexityColors[data.metadata.complexity] || 'text-text-dim bg-surface-hover'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Project Estimates</h3>
        <div className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium', cc)}>
          <BarChart3 className="h-3 w-3" />
          {data.metadata.complexity} Complexity
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {metrics.map((metric, i) => {
          const value = data.metrics[metric.key as keyof typeof data.metrics]
          const displayValue = metric.isString ? value : `${value}+`
          const Icon = metric.icon

          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className={cn(
                'rounded-xl border border-border/50 bg-gradient-to-br p-4 text-center transition-colors hover:border-border-hover flex flex-col items-center justify-center',
                metric.color,
              )}
            >
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-lg font-bold text-text">{displayValue}</p>
              <p className="text-[10px] text-text-dim">{metric.label}</p>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
