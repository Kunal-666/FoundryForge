import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import type { ArchitectureData } from '@/lib/architecture'

interface StackCardProps {
  stack: ArchitectureData['stack']
}

export function StackCard({ stack }: StackCardProps) {
  const entries = Object.entries(stack)
  if (!entries.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-surface p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-semibold text-blue-300/90">Recommended Stack</span>
      </div>
      <div className="space-y-3">
        {entries.map(([category, items]) => (
          <div key={category}>
            <p className="mb-1.5 text-[10px] uppercase tracking-wider text-text-dim">{category}</p>
            <div className="flex flex-wrap gap-1.5">
              {items.map((item) => (
                <Badge key={item} variant="default" className="text-xs px-2.5 py-1">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
