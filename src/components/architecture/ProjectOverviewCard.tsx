import { useState, type ElementType } from 'react'
import { motion } from 'framer-motion'
import { Copy, Sparkles, CheckCircle2, Users, Puzzle, Plug, Clock3, Cpu, Layers, ArrowRight, Settings2, AlertTriangle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FIELD_DISPLAY, getFieldLabel } from '@/data/wizardDisplay'
import type { ArchitectureData } from '@/lib/architecture'
import type { WizardAnswers } from '@/data/wizardQuestions'

interface ProjectOverviewCardProps {
  data: ArchitectureData
  wizardAnswers?: Partial<WizardAnswers> | null
}

const scaleConfig: Record<ArchitectureData['projectScale'], { label: string; className: string }> = {
  Small: { label: 'Small', className: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
  Medium: { label: 'Medium', className: 'text-amber-300 bg-amber-500/10 border-amber-500/20' },
  Large: { label: 'Large', className: 'text-rose-300 bg-rose-500/10 border-rose-500/20' },
}

function ChipRow({
  icon: Icon,
  label,
  items,
}: {
  icon: ElementType
  label: string
  items: string[]
}) {
  if (!items.length) return null

  return (
    <div className="space-y-2 rounded-xl border border-border/50 bg-surface/30 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.slice(0, 6).map((item) => (
          <span
            key={item}
            className="inline-flex items-center rounded-full border border-border/50 bg-surface/70 px-2.5 py-1 text-[11px] font-medium text-text-muted"
          >
            {item}
          </span>
        ))}
        {items.length > 6 && (
          <span className="inline-flex items-center rounded-full border border-border/30 px-2.5 py-1 text-[11px] text-text-dim">
            +{items.length - 6} more
          </span>
        )}
      </div>
    </div>
  )
}

export function ProjectOverviewCard({ data, wizardAnswers }: ProjectOverviewCardProps) {
  const scale = scaleConfig[data.projectScale]
  const [copied, setCopied] = useState(false)

  const visibleFields = wizardAnswers
    ? FIELD_DISPLAY.filter(f => !f.showWhen || f.showWhen(wizardAnswers as WizardAnswers))
    : []

  const handleCopyRequirements = async () => {
    await navigator.clipboard.writeText([
      `Project: ${data.projectName}`,
      `Summary: ${data.summary}`,
      `Roles: ${data.roles.join(', ') || 'None'}`,
      `Features: ${data.features.join(', ') || 'None'}`,
      `Integrations: ${data.integrations.join(', ') || 'None'}`,
    ].join('\n'))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.section
      id="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border/60 bg-gradient-to-br from-success/[0.03] via-surface to-surface overflow-hidden"
    >
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-success">
                <CheckCircle2 className="h-3 w-3" />
                Overview
              </span>
              <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]', scale.className)}>
                {scale.label}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-surface/60 px-2.5 py-1 text-[10px] font-medium text-text-dim">
                <Clock3 className="h-3 w-3" />
                {data.metrics.estimatedDevTime}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl" title={data.projectName}>
                {data.projectName}
              </h1>
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="max-w-3xl text-sm leading-relaxed text-text-muted sm:text-base">
                  {data.summary}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-border/50 bg-surface/40 px-3 py-2">
            <Layers className="h-4 w-4 text-primary" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-dim">Pattern</p>
              <p className="text-sm font-semibold text-text">{data.pattern}</p>
            </div>
          </div>

          <button
            onClick={handleCopyRequirements}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-border/50 bg-surface/40 px-3 py-2 text-xs font-medium text-text-dim transition-colors hover:bg-surface-hover hover:text-text"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? 'Copied' : 'Copy Requirements'}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <ChipRow icon={Users} label="Roles" items={data.roles} />
          <ChipRow icon={Puzzle} label="Features" items={data.features} />
          <ChipRow icon={Plug} label="Integrations" items={data.integrations} />
        </div>

        <div className="rounded-xl border border-border/50 bg-surface/20 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">Architecture Pattern</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <p className="max-w-2xl text-sm leading-relaxed text-text">
              {data.pattern}. Feature boundaries keep responsibilities clear and the implementation practical.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-text-dim">
              <ArrowRight className="h-3.5 w-3.5" />
              Compact, reviewable, implementation-ready
            </div>
          </div>
        </div>

        {visibleFields.length > 0 && (
          <div className="rounded-xl border border-border/50 bg-surface/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">Confirmed Configuration</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {visibleFields.map((field) => {
                const raw = wizardAnswers?.[field.key]
                const isEmpty = raw == null || (Array.isArray(raw) && raw.length === 0)
                const label = field.format ? field.format(raw) : getFieldLabel(field.key, raw)
                return (
                  <span
                    key={field.key}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium',
                      isEmpty
                        ? 'border-amber-500/20 bg-amber-500/5 text-amber-300/70'
                        : 'border-success/20 bg-success/5 text-success',
                    )}
                  >
                    {isEmpty ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    {field.icon} {field.label}: {isEmpty ? 'AI Assumption' : label}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: 'Files', value: `${data.metrics.estimatedFiles}+` },
            { label: 'Components', value: `${data.metrics.estimatedComponents}+` },
            { label: 'APIs', value: `${data.metrics.estimatedApis}+` },
            { label: 'Tables', value: `${data.metrics.estimatedDbTables}+` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-surface/30 px-4 py-3"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">{stat.label}</span>
              <span className="text-lg font-bold text-text">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
