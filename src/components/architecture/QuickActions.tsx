import { motion } from 'framer-motion'
import { FileText, MessageCircle, RefreshCw, FileJson, ScrollText, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ArchitectureData } from '@/lib/architecture'
import { buildSrsPdf } from '@/lib/srsPdf'

interface QuickActionsProps {
  data: ArchitectureData
  onFollowUp: () => void
  onRegenerate?: () => void
}

interface ActionItem {
  icon: React.ElementType
  label: string
  onClick: () => void
  highlighted?: boolean
}

function toMarkdown(data: ArchitectureData): string {
  return [
    `# ${data.projectName}`,
    '',
    `**Summary:** ${data.summary}`,
    '',
    '## Architecture',
    `- Pattern: ${data.pattern}`,
    `- Frontend: ${data.frontendStack}`,
    `- Backend: ${data.backendStack}`,
    `- Database: ${data.database}`,
    `- Authentication: ${data.authentication}`,
    `- Storage: ${data.storage}`,
    `- Deployment: ${data.deployment}`,
    `- Security: ${data.securityLevel}`,
    '',
    '## Metrics',
    `- Files: ${data.metrics.estimatedFiles}+`,
    `- Components: ${data.metrics.estimatedComponents}+`,
    `- APIs: ${data.metrics.estimatedApis}+`,
    `- Database Tables: ${data.metrics.estimatedDbTables}+`,
    `- Services: ${data.metrics.estimatedServices}+`,
    `- Timeline: ${data.metrics.estimatedDevTime}`,
    '',
    '## Roles',
    data.roles.map(r => `- ${r}`).join('\n'),
    '',
    '## Features',
    data.features.map(f => `- ${f}`).join('\n'),
    '',
    '## Integrations',
    data.integrations.map(i => `- ${i}`).join('\n'),
    '',
    '## Missing Information',
    data.missingInformation.map(i => `- ${i}`).join('\n'),
    '',
    '## Conflicts',
    data.conflicts.map(i => `- ${i}`).join('\n'),
    '',
    '## AI Recommendation',
    data.aiRecommendations.map(tool => `- ${tool.tool}: ${tool.bestUseCase}`).join('\n'),
    '',
    '## Tech Stack',
    ...Object.entries(data.stack).flatMap(([cat, items]) => [
      `- **${cat}:** ${items.join(', ')}`,
    ]),
    '',
    '## Risks',
    data.risks.map(r => `- ${r}`).join('\n'),
    '',
    '## Assumptions',
    data.assumptions.map(a => `- ${a}`).join('\n'),
    '',
    '## Roadmap',
    data.roadmap.map(phase => `- ${phase.phase}: ${phase.milestones.join(', ')}`).join('\n'),
    '',
    '## Security Recommendations',
    data.securityRecommendations.map(item => `- ${item}`).join('\n'),
    '',
    '## Generator Compatibility',
    data.generatorCompatibility.map(item => `- ${item.label}: ${item.status} - ${item.reason}`).join('\n'),
    '',
    '## Database Summary',
    `- Type: ${data.databaseSummary.type}`,
    `- Entities: ${data.databaseSummary.entities.join(', ')}`,
    `- Relationships: ${data.databaseSummary.relationships.join(', ')}`,
    `- Tables: ${data.databaseSummary.estimatedTables}`,
  ].join('\n')
}

function toJSON(data: ArchitectureData): string {
  return JSON.stringify({
    projectName: data.projectName,
    summary: data.summary,
    pattern: data.pattern,
    techStack: data.stack,
    roles: data.roles,
    features: data.features,
    integrations: data.integrations,
    security: data.security,
    metrics: data.metrics,
    risks: data.risks,
    assumptions: data.assumptions,
    missingInformation: data.missingInformation,
    conflicts: data.conflicts,
    aiRecommendations: data.aiRecommendations,
    architectureRecommendations: data.architectureRecommendations,
    generatorCompatibility: data.generatorCompatibility,
    executionStrategy: data.executionStrategy,
    roadmap: data.roadmap,
    securityRecommendations: data.securityRecommendations,
    databaseSummary: data.databaseSummary,
    confidence: data.confidence,
    complexity: data.metadata.complexity,
  }, null, 2)
}

function generateImplementationPrompt(data: ArchitectureData): string {
  return `Generate a complete implementation for the following architecture:

Project: ${data.projectName}
Architecture Pattern: ${data.pattern}
Frontend: ${data.frontendStack}
Backend: ${data.backendStack}
Database: ${data.database}
Deployment: ${data.deployment}
Security: ${data.securityLevel}

Summary: ${data.summary}

Tech Stack:
${Object.entries(data.stack).map(([cat, items]) => `  ${cat}: ${items.join(', ')}`).join('\n')}

Roles: ${data.roles.join(', ')}
Features: ${data.features.join(', ')}
Integrations: ${data.integrations.join(', ')}

Estimates:
  Files: ${data.metrics.estimatedFiles}+
  Components: ${data.metrics.estimatedComponents}+
  APIs: ${data.metrics.estimatedApis}+
  Tables: ${data.metrics.estimatedDbTables}+
  Services: ${data.metrics.estimatedServices}+
  Timeline: ${data.metrics.estimatedDevTime}

Generate complete, production-ready code for all layers.`
}

export function QuickActions({ data, onFollowUp, onRegenerate }: QuickActionsProps) {
  const exportPdf = () => {
    const pdfBytes = buildSrsPdf(data)
    const pdfBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.projectName.replace(/\s+/g, '-').toLowerCase()}-srs.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportMarkdown = () => {
    const blob = new Blob([toMarkdown(data)], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.projectName.replace(/\s+/g, '-').toLowerCase()}-architecture.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportJson = () => {
    const blob = new Blob([toJSON(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.projectName.replace(/\s+/g, '-').toLowerCase()}-architecture.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const actions: ActionItem[] = [
    { icon: FileText, label: 'Export SRS PDF', onClick: exportPdf },
    { icon: ScrollText, label: 'Export Markdown', onClick: exportMarkdown },
    { icon: FileJson, label: 'Export JSON', onClick: exportJson },
    { icon: Terminal, label: 'Copy Prompt', onClick: () => navigator.clipboard.writeText(generateImplementationPrompt(data)) },
    { icon: MessageCircle, label: 'Ask Follow-up', onClick: onFollowUp },
    { icon: RefreshCw, label: 'Regenerate Analysis', onClick: onRegenerate || (() => {}) },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="mb-3 text-sm font-semibold text-text">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.03 }}
            onClick={action.onClick}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all',
              action.highlighted
                ? 'border-primary/30 bg-primary/10 hover:bg-primary/15 hover:border-primary/50 shadow-lg shadow-primary/10'
                : 'border-border bg-surface/50 hover:bg-surface-hover hover:border-border-hover',
            )}
          >
            <div className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg',
              action.highlighted ? 'bg-primary/20' : 'bg-primary/10',
            )}>
              <action.icon className={cn('h-4 w-4', action.highlighted ? 'text-primary' : 'text-text-dim')} />
            </div>
            <span className={cn(
              'text-[10px] text-center leading-tight',
              action.highlighted ? 'text-primary font-medium' : 'text-text-muted',
            )}>
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
