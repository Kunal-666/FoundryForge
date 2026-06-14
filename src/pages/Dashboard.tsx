import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  History,
  LayoutTemplate,
  Settings,
  Search,
  ChevronRight,
  Terminal,
  Globe,
  Check,
  Moon,
  Sun,
  Type,
  Zap,
  RotateCcw,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PromptInput } from '@/components/PromptInput'
import { ConversationView } from '@/components/ConversationView'
import { SessionCard } from '@/components/SessionCard'
import { Sidebar } from '@/components/Sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useSessionStore } from '@/stores/sessionStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useAuth } from '@/lib/auth'
import { isConfigured } from '@/lib/firebase'
import { cn } from '@/lib/utils'
import { TEMPLATES, EXAMPLE_PROMPTS, MODE_CONFIG } from '@/data/mock'
import { MODE_ICONS, TEMPLATE_ICONS } from '@/data/constants'
import type { SessionMode } from '@/types'

const tabs = [
  { id: 'new', label: 'New Session', icon: Sparkles },
  { id: 'history', label: 'History', icon: History },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'settings', label: 'Settings', icon: Settings },
]

/* ─── Settings Panel ─────────────────────────────────────────────────── */

function SettingsPanel() {
  const { theme, fontSize, autoSave, animationSpeed, setTheme, setFontSize, setAutoSave, setAnimationSpeed, reset } = useSettingsStore()

  const fontSizes = [
    { value: 'sm' as const, label: 'Sm' },
    { value: 'md' as const, label: 'Md' },
    { value: 'lg' as const, label: 'Lg' },
  ]

  const speeds = [
    { value: 'slow' as const, label: 'Slow' },
    { value: 'normal' as const, label: 'Normal' },
    { value: 'fast' as const, label: 'Fast' },
  ]

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text">Settings</h2>
          <p className="text-sm text-text-muted">Configure your preferences</p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-text">Appearance</h3>
          <div className="space-y-5">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text">Theme</p>
                <p className="text-xs text-text-dim">Dark mode is the default</p>
              </div>
              <div className="flex gap-1 rounded-lg border border-border bg-surface p-0.5">
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                    theme === 'dark' ? 'bg-primary/20 text-primary shadow-sm' : 'text-text-dim hover:text-text'
                  )}
                >
                  <Moon className="h-3.5 w-3.5" />
                  Dark
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                    theme === 'light' ? 'bg-primary/20 text-primary shadow-sm' : 'text-text-dim hover:text-text'
                  )}
                >
                  <Sun className="h-3.5 w-3.5" />
                  Light
                </button>
              </div>
            </div>

            <Separator />

            {/* Font Size */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text">Font Size</p>
                <p className="text-xs text-text-dim">Adjust UI text scaling</p>
              </div>
              <div className="flex gap-1 rounded-lg border border-border bg-surface p-0.5">
                {fontSizes.map(fs => (
                  <button
                    key={fs.value}
                    onClick={() => setFontSize(fs.value)}
                    className={cn(
                      'flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                      fontSize === fs.value ? 'bg-primary/20 text-primary shadow-sm' : 'text-text-dim hover:text-text'
                    )}
                  >
                    <Type className="h-3 w-3" />
                    {fs.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Editor */}
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-text">Editor</h3>
          <div className="space-y-5">
            {/* Auto-save */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text">Auto-save sessions</p>
                <p className="text-xs text-text-dim">Automatically save your progress</p>
              </div>
              <button
                onClick={() => setAutoSave(!autoSave)}
                role="switch"
                aria-checked={autoSave}
                className={cn(
                  'relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border transition-colors',
                  autoSave ? 'border-success/40 bg-success/20' : 'border-border bg-surface-hover'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                    autoSave ? 'translate-x-4' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>

            <Separator />

            {/* Animation Speed */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text">Animation Speed</p>
                <p className="text-xs text-text-dim">Controls UI animation pace</p>
              </div>
              <div className="flex gap-1 rounded-lg border border-border bg-surface p-0.5">
                {speeds.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setAnimationSpeed(s.value)}
                    className={cn(
                      'flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                      animationSpeed === s.value ? 'bg-primary/20 text-primary shadow-sm' : 'text-text-dim hover:text-text'
                    )}
                  >
                    <Zap className="h-3 w-3" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Account */}
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-text">Account</h3>
          <p className="mb-4 text-sm text-text-muted">Sign in to sync your sessions across devices</p>
          <Button variant="outline">Connect Firebase</Button>
        </Card>
      </div>
    </motion.div>
  )
}

export function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'new'
  const activeSessionId = searchParams.get('session')
  const { createSession, setCurrentSession } = useSessionStore()
  const { items: historyItems, isLoading: historyLoading, clearHistory, loadFromFirestore, refreshFromStorage, removeFromHistory } = useHistoryStore()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<SessionMode>('general')
  useEffect(() => { document.title = 'Dashboard - FoundryForge' }, [])

  useEffect(() => {
    if (isConfigured && user?.uid) {
      loadFromFirestore(user.uid)
      useSessionStore.getState().loadFromFirestore(user.uid)
    } else {
      refreshFromStorage()
      useSessionStore.getState().refreshFromStorage()
    }
  }, [user?.uid])

  const setActiveTab = (tab: string) => {
    setSearchParams(tab === 'new' ? {} : { tab })
  }

  const openSession = (id: string) => {
    setCurrentSession(id)
    setSearchParams({ session: id })
  }

  const closeSession = () => {
    setCurrentSession(null)
    setSearchParams({})
  }

  const handleSubmitPrompt = (prompt: string) => {
    const id = createSession(prompt, selectedMode, user?.uid)
    refreshFromStorage()
    openSession(id)
  }

  const handleTemplateClick = (template: typeof TEMPLATES[0]) => {
    const id = createSession(template.prompt, template.mode || 'general', user?.uid)
    refreshFromStorage()
    openSession(id)
  }

  const filteredHistory = historyItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Show conversation view when a session is active
  if (activeSessionId) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border px-4 py-2 lg:hidden">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
          <ConversationView sessionId={activeSessionId} onBack={closeSession} />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="flex h-16 items-center gap-1 border-b border-border overflow-x-auto px-4 lg:px-6 ">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:text-text hover:bg-surface-hover',
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
          <div className="ml-auto flex items-center lg:hidden">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'new' && (
              <motion.div
                key="new"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12"
              >
                <div className="mb-6 sm:mb-8 text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="mb-4 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                    </div>
                    <h1 className="mb-2 text-xl sm:text-2xl font-bold text-text">
                      What are you building?
                    </h1>
                    <p className="text-sm sm:text-base text-text-muted">
                      Describe your software idea and let FoundryForge architect it for you.
                    </p>
                  </motion.div>
                </div>

                <div className="mb-6">
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                    {(Object.entries(MODE_CONFIG) as [SessionMode, typeof MODE_CONFIG['general']][]).map(([mode, config]) => {
                      const isActive = selectedMode === mode
                      const Icon = MODE_ICONS[mode]
                      return (
                        <button
                          key={mode}
                          onClick={() => setSelectedMode(mode)}
                          className={cn(
                            'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all sm:gap-2.5 sm:px-4 sm:py-3',
                            isActive
                              ? 'border-primary/40 bg-primary/10 text-primary shadow-sm'
                              : 'border-border bg-surface text-text-muted hover:text-text hover:border-border-hover',
                          )}
                        >
                          <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-text-dim')} />
                          <span className="hidden sm:inline">{config.label}</span>
                          {isActive && <Check className="h-3.5 w-3.5 text-primary hidden sm:inline" />}
                          <Badge variant={isActive ? 'default' : 'secondary'} className="text-[10px]">
                            {config.badge}
                          </Badge>
                        </button>
                      )
                    })}
                  </div>

                  <PromptInput
                    onSubmit={handleSubmitPrompt}
                    className="mb-8"
                  />
                </div>

                <div>
                  <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-dim">
                    Try an example
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {EXAMPLE_PROMPTS.map((prompt, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        onClick={() => handleSubmitPrompt(prompt)}
                        className="group rounded-xl border border-border bg-surface p-4 text-left transition-all hover:border-primary/30 hover:bg-surface-hover"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Terminal className="h-3.5 w-3.5" />
                          </div>
                          <p className="text-sm text-text-muted group-hover:text-text transition-colors">
                            {prompt}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-text">History</h2>
                    <p className="text-sm text-text-muted">Your previous sessions</p>
                  </div>
                  {historyItems.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearHistory} className="text-text-dim">
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
                  <Input
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {historyLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="animate-pulse rounded-xl border border-border/50 bg-surface/30 p-5">
                        <div className="mb-2 h-4 w-3/5 rounded bg-surface-hover" />
                        <div className="h-3 w-4/5 rounded bg-surface-hover/60" />
                      </div>
                    ))}
                  </div>
                ) : filteredHistory.length > 0 ? (
                  <div className="space-y-1">
                    {filteredHistory.map((item) => (
                      <SessionCard
                        key={item.id}
                        item={item}
                        onClick={() => openSession(item.id)}
                        onDelete={() => removeFromHistory(item.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <History className="mb-4 h-12 w-12 text-text-dim" />
                    <h3 className="mb-1 text-lg font-medium text-text">No sessions yet</h3>
                    <p className="text-sm text-text-muted">
                      {searchQuery ? 'No results found' : 'Start by describing your software idea'}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'templates' && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-text">Templates</h2>
                  <p className="text-sm text-text-muted">Start with a pre-defined project template</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {TEMPLATES.map((template, i) => {
                    const Icon = TEMPLATE_ICONS[template.icon] || Globe
                    return (
                      <motion.button
                        key={template.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleTemplateClick(template)}
                        className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 text-left transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                      >
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="mb-1 text-sm font-semibold text-text">{template.title}</h3>
                        <p className="mb-3 text-xs text-text-muted leading-relaxed">{template.description}</p>
                        <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Use template <ChevronRight className="h-3 w-3" />
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <SettingsPanel />
            )}
          </AnimatePresence>
        </ScrollArea>
      </main>
    </div>
  )
}