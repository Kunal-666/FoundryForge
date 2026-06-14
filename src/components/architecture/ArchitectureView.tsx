import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Expand, Minimize2, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeroRequestCard } from './HeroRequestCard'
import { ProgressTracker } from './ProgressTracker'
import { ProjectOverviewCard } from './ProjectOverviewCard'
import { ArchitectureDiagram } from './ArchitectureDiagram'
import { ProductionArchitectureCard } from './ProductionArchitectureCard'
import { ClarificationCard } from './ClarificationCard'
import { AIRecommendationCard } from './AIRecommendationCard'
import { GeneratorCompatibilityCard } from './GeneratorCompatibilityCard'
import { DatabaseSummaryCard } from './DatabaseSummaryCard'
import { RoadmapCard } from './RoadmapCard'
import { SecurityRecommendationsCard } from './SecurityRecommendationsCard'
import { MetricCards } from './MetricCards'
import { QuickActions } from './QuickActions'
import { GenerationMetadata } from './GenerationMetadata'
import { AssumptionsCard } from './AssumptionsCard'
import { RiskCard } from './RiskCard'
import { parseArchitectureData, type WizardTechConfig } from '@/lib/architecture'
import { useWizardStore } from '@/stores/wizardStore'
import { cn } from '@/lib/utils'
import type { Session } from '@/types'

interface ArchitectureViewProps {
  session: Session
  sessionId?: string
  onFollowUp: () => void
  onRegenerate?: () => void
}

const confidenceConfig = {
  high: { label: 'High Confidence', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
  medium: { label: 'Medium Confidence', color: 'text-amber-300 bg-amber-500/10 border-amber-500/20' },
  low: { label: 'Needs Clarification', color: 'text-rose-300 bg-rose-500/10 border-rose-500/20' },
}

const sectionNav = [
  { id: 'overview', label: 'Overview' },
  { id: 'diagram', label: 'Diagram' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'clarification', label: 'Clarification' },
  { id: 'ai-tool', label: 'AI Tool' },
  { id: 'compatibility', label: 'Compatibility' },
  { id: 'database', label: 'Database' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'security', label: 'Security' },
]

export function ArchitectureView({ session, sessionId, onFollowUp, onRegenerate }: ArchitectureViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedAll, setExpandedAll] = useState<boolean | null>(null)

  const rawAnswersFromStore = useWizardStore(
    (state) => sessionId ? state.bySession[sessionId] : undefined
  )
  const rawAnswers = session.wizardAnswers || rawAnswersFromStore

  const wizardConfig = useMemo(() => {
    if (!rawAnswers) return undefined
    return {
      scope: rawAnswers.scope ?? undefined,
      frontend: rawAnswers.frontend ?? undefined,
      backend: rawAnswers.backend ?? undefined,
      database: rawAnswers.database ?? undefined,
      auth: rawAnswers.auth ?? undefined,
      payment: rawAnswers.payment,
      storage: rawAnswers.storage,
      deployment: rawAnswers.deployment,
    } satisfies WizardTechConfig
  }, [rawAnswers])

  const data = parseArchitectureData(session, wizardConfig)
  const conf = confidenceConfig[data.confidence]

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div id="architecture-dashboard" className="mx-auto max-w-6xl space-y-6 px-4 py-6 pb-24">
      <HeroRequestCard prompt={session.prompt} timestamp={session.createdAt} wizardAnswers={rawAnswers} />

      <section className="rounded-2xl border border-border bg-surface/50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search stages"
              aria-label="Search architecture stages"
              className="w-full rounded-xl border border-border bg-surface-hover py-2.5 pl-10 pr-3 text-sm text-text placeholder:text-text-dim outline-none transition-colors focus:border-primary/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExpandedAll(true)}
              className="gap-2"
            >
              <Expand className="h-4 w-4" />
              Expand All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExpandedAll(false)}
              className="gap-2"
            >
              <Minimize2 className="h-4 w-4" />
              Collapse All
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setExpandedAll(null)}
              className="text-text-dim"
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {sectionNav.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className="shrink-0 rounded-full border border-border/50 bg-surface/60 px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
            >
              {section.label}
            </button>
          ))}
        </div>
      </section>

      {session.status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-end gap-2"
        >
          <span className="text-[10px] text-text-dim">Analysis Confidence:</span>
          <div className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-0.5', conf.color)}>
            <Sparkles className="h-3 w-3" />
            <span className="text-[10px] font-medium">{conf.label}</span>
          </div>
        </motion.div>
      )}

      <ProgressTracker stages={session.timeline} searchQuery={searchQuery} expandedAll={expandedAll} />

      {session.status === 'completed' && (
        <>
          <ProjectOverviewCard data={data} wizardAnswers={rawAnswers} />
          <ArchitectureDiagram data={data} />
          <ClarificationCard missingInformation={data.missingInformation} conflicts={data.conflicts} />

          <div className="grid gap-4 lg:grid-cols-2">
            <AssumptionsCard assumptions={data.assumptions} />
            <RiskCard risks={data.risks} />
          </div>

          <ProductionArchitectureCard data={data} />
          <AIRecommendationCard data={data} />
          <GeneratorCompatibilityCard data={data} />
          {data.database !== 'Not Required' && <DatabaseSummaryCard data={data} />}
          <RoadmapCard roadmap={data.roadmap} />
          <SecurityRecommendationsCard securityRecommendations={data.securityRecommendations} />
          <MetricCards data={data} />
          <QuickActions data={data} onFollowUp={onFollowUp} onRegenerate={onRegenerate} />
          <GenerationMetadata data={data} />
        </>
      )}

    </div>
  )
}
