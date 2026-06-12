import { type ElementType } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, Globe, ShieldCheck, Database, HardDrive, Server, Layers3, RefreshCw, Plug } from 'lucide-react'
import type { ArchitectureData } from '@/lib/architecture'

interface ArchitectureDiagramProps {
  data: ArchitectureData
}

function Node({
  icon: Icon,
  label,
  detail,
}: {
  icon: ElementType
  label: string
  detail: string
}) {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl border border-border/50 bg-surface/40 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text">{label}</p>
        <p className="text-xs leading-relaxed text-text-dim">{detail}</p>
      </div>
    </div>
  )
}

export function ArchitectureDiagram({ data }: ArchitectureDiagramProps) {
  const hasCache = data.services.some((service) => /cache|redis/i.test(service.name)) || /redis/i.test(data.database)
  const hasExternalApis = data.integrations.length > 0 || data.services.some((service) => /payment|notification|search|analytics|chat/i.test(service.name))
  const hasStorage = Boolean(data.storage) && data.storage !== 'Not Required'
  const hasBackend = data.backendStack !== 'Not Required'
  const hasDatabase = data.database !== 'Not Required'
  const hasAuth = Boolean(data.authentication) && data.authentication !== 'Not Required'

  const userDetail = data.roles.length > 0
    ? `Roles: ${data.roles.slice(0, 4).join(', ')}`
    : 'End users accessing the application.'

  const cacheDetail = hasCache
    ? data.pattern.includes('Microservices')
      ? 'Distributed caching for inter-service data acceleration.'
      : 'In-memory cache for frequent reads and session data.'
    : ''

  const backendDetail = data.pattern
    ? `${data.backendStack} — ${data.pattern}`
    : data.backendStack

  const databaseDetail = data.database !== 'Not Required' && data.database
    ? `${data.database}${data.metrics.estimatedDbTables > 0 ? ` (~${data.metrics.estimatedDbTables} tables)` : ''}`
    : data.database

  return (
    <motion.section
      id="diagram"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border bg-surface/50 p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Layers3 className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Architecture Diagram</h2>
          <p className="text-xs text-text-dim">{data.pattern} &middot; {data.projectScale} scale &middot; {data.metrics.estimatedApis} APIs</p>
        </div>
      </div>

      <div className="mx-auto flex max-w-2xl flex-col items-stretch gap-2">
        <Node icon={Globe} label="User" detail={userDetail} />
        <div className="flex justify-center py-1">
          <ArrowDown className="h-4 w-4 text-text-dim/60" />
        </div>
        <Node icon={Layers3} label="Frontend" detail={data.frontendStack} />

        {hasAuth && (
          <>
            <div className="flex justify-center py-1">
              <ArrowDown className="h-4 w-4 text-text-dim/60" />
            </div>
            <Node icon={ShieldCheck} label="Authentication" detail={data.authentication} />
          </>
        )}

        {hasBackend && (
          <>
            <div className="flex justify-center py-1">
              <ArrowDown className="h-4 w-4 text-text-dim/60" />
            </div>
            <Node icon={Server} label="Backend" detail={backendDetail} />
          </>
        )}

        {hasCache && (
          <>
            <div className="flex justify-center py-1">
              <ArrowDown className="h-4 w-4 text-text-dim/60" />
            </div>
            <Node icon={RefreshCw} label="Cache" detail={cacheDetail} />
          </>
        )}

        {hasDatabase && (
          <>
            <div className="flex justify-center py-1">
              <ArrowDown className="h-4 w-4 text-text-dim/60" />
            </div>
            <Node icon={Database} label="Database" detail={databaseDetail} />
          </>
        )}

        {hasStorage && (
          <>
            <div className="flex justify-center py-1">
              <ArrowDown className="h-4 w-4 text-text-dim/60" />
            </div>
            <Node icon={HardDrive} label="Storage" detail={data.storage} />
          </>
        )}

        {hasExternalApis && (
          <>
            <div className="flex justify-center py-1">
              <ArrowDown className="h-4 w-4 text-text-dim/60" />
            </div>
            <Node
              icon={Plug}
              label="External APIs"
              detail={data.integrations.slice(0, 4).join(', ') || 'Third-party services and external endpoints.'}
            />
          </>
        )}
      </div>
    </motion.section>
  )
}
