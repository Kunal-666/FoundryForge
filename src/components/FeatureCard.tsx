import { motion } from 'framer-motion'
import type { Feature } from '@/types'
import * as LucideIcons from 'lucide-react'

interface FeatureCardProps {
  feature: Feature
  index: number
}

const iconMap: Record<string, React.ElementType> = {
  Brain: LucideIcons.Brain,
  Building2: LucideIcons.Building2,
  Shield: LucideIcons.Shield,
  FileCode: LucideIcons.FileCode,
  Map: LucideIcons.Map,
  Zap: LucideIcons.Zap,
}

export function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = iconMap[feature.icon] || LucideIcons.Box

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative rounded-2xl border border-border bg-surface p-6 transition-colors group-hover:border-primary/20">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mb-2 text-base font-semibold text-text">
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed text-text-muted">
          {feature.description}
        </p>
      </div>
    </motion.div>
  )
}
