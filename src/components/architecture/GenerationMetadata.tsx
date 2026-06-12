import { motion } from 'framer-motion'
import { Bot, Timer, Layers, Calendar, Lightbulb, BarChart3 } from 'lucide-react'
import type { ArchitectureData } from '@/lib/architecture'

interface GenerationMetadataProps {
  data: ArchitectureData
}

const metaFields = [
  { key: 'model', label: 'AI Model', icon: Bot, value: (d: ArchitectureData) => d.metadata.model },
  { key: 'generationTime', label: 'Generation Time', icon: Timer, value: (d: ArchitectureData) => d.metadata.generationTime },
  { key: 'stages', label: 'Processing Stages', icon: Layers, value: (d: ArchitectureData) => `${d.metadata.stages} stages` },
  { key: 'generatedAt', label: 'Generated At', icon: Calendar, value: (d: ArchitectureData) => d.metadata.generatedAt },
  { key: 'recommendations', label: 'Total Recommendations', icon: Lightbulb, value: (d: ArchitectureData) => `${d.metadata.recommendations} recommendations` },
  { key: 'complexity', label: 'Project Complexity', icon: BarChart3, value: (d: ArchitectureData) => d.metadata.complexity },
]

export function GenerationMetadata({ data }: GenerationMetadataProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="rounded-xl border border-border/30 bg-surface/20 p-4"
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {metaFields.map((field) => (
          <div key={field.key} className="flex flex-col items-center gap-1.5 text-center">
            <field.icon className="h-3.5 w-3.5 text-text-dim/60" />
            <span className="text-[10px] text-text-dim/60">{field.label}</span>
            <span className="text-[11px] font-medium text-text-muted">{field.value(data)}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
