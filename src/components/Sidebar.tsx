import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Plus,
  History,
  LayoutTemplate,
  Settings,
  ChevronLeft,
  LogOut,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SessionCard } from '@/components/SessionCard'
import { Separator } from '@/components/ui/separator'
import { useHistoryStore } from '@/stores/historyStore'
import { useAuth } from '@/lib/auth'
import { useState } from 'react'

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ collapsed = false, onToggle, mobileOpen = false, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isMock, signOut } = useAuth()
  const { items, removeFromHistory } = useHistoryStore()
  const [isCollapsed, setIsCollapsed] = useState(collapsed)

  const toggle = () => {
    setIsCollapsed(!isCollapsed)
    onToggle?.()
  }

  const navItems = [
    { icon: Plus, label: 'New Session', href: '/dashboard' },
    { icon: History, label: 'History', href: '/dashboard?tab=history' },
    { icon: LayoutTemplate, label: 'Templates', href: '/dashboard?tab=templates' },
    { icon: Settings, label: 'Settings', href: '/dashboard?tab=settings' },
  ]

  const handleSessionClick = (id: string) => {
    navigate(`/dashboard?session=${id}`)
  }

  const sidebarInner = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-2" onClick={onMobileClose}>
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold tracking-tight">
              Foundry<span className="text-primary">Forge</span>
            </span>
          </Link>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg text-text-dim hover:text-text hover:bg-surface-hover transition-colors',
              isCollapsed && 'mx-auto',
            )}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href &&
            (!item.href.includes('?') || location.search.includes(item.href.split('=')[1] || ''))
          return (
            <Link key={item.href} to={item.href} onClick={onMobileClose}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'w-full justify-start gap-3 text-sm',
                  isActive && 'bg-primary/10 text-primary hover:bg-primary/15',
                  isCollapsed && 'justify-center px-2',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && item.label}
              </Button>
            </Link>
          )
        })}
      </div>

      {!isCollapsed && (
        <>
          <div className="flex-1 overflow-hidden">
            <div className="px-3 py-2">
              <h3 className="px-3 text-xs font-medium uppercase tracking-wider text-text-dim">
                Recent Sessions
              </h3>
            </div>
            <ScrollArea className="h-full px-3">
              <div className="flex flex-col gap-1 pb-4">
                {items.map((item) => (
                  <SessionCard
                    key={item.id}
                    item={item}
                    onClick={() => { handleSessionClick(item.id); onMobileClose?.() }}
                    onDelete={() => removeFromHistory(item.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator className="my-2" />
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {user ? (user.displayName?.charAt(0) || user.email?.charAt(0) || '?') : '?'}
              </AvatarFallback>
            </Avatar>
            {user ? (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {user.displayName || user.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-text-dim truncate">
                    {isMock ? 'Demo Mode' : user.email}
                  </p>
                </div>
                {!isMock && (
                  <button onClick={signOut} aria-label="Sign out" className="text-text-dim hover:text-text transition-colors">
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </>
            ) : (
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text truncate">Guest Mode</p>
                  <p className="text-xs text-text-dim truncate">Sign in to sync</p>
                </div>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 64 : 330 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative hidden h-full flex-col border-r border-border bg-surface/50 lg:flex"
      >
        {sidebarInner}
      </motion.aside>

      {/* Mobile sidebar drawer */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: mobileOpen ? 0 : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed inset-y-0 left-0 z-50 flex h-full w-80 flex-col border-r border-border bg-surface shadow-2xl lg:hidden"
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/" className="flex items-center gap-2" onClick={onMobileClose}>
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold tracking-tight">
              Foundry<span className="text-primary">Forge</span>
            </span>
          </Link>
          <button
            onClick={onMobileClose}
            aria-label="Close sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href &&
              (!item.href.includes('?') || location.search.includes(item.href.split('=')[1] || ''))
            return (
              <Link key={item.href} to={item.href} onClick={onMobileClose}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'w-full justify-start gap-3 text-sm',
                    isActive && 'bg-primary/10 text-primary hover:bg-primary/15',
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="px-3 py-2">
            <h3 className="px-3 text-xs font-medium uppercase tracking-wider text-text-dim">
              Recent Sessions
            </h3>
          </div>
          <ScrollArea className="h-full px-3">
            <div className="flex flex-col gap-1 pb-4">
              {items.map((item) => (
                <SessionCard
                  key={item.id}
                  item={item}
                  onClick={() => { handleSessionClick(item.id); onMobileClose?.() }}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator className="my-2" />
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {user ? (user.displayName?.charAt(0) || user.email?.charAt(0) || '?') : '?'}
            </AvatarFallback>
          </Avatar>
          {user ? (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {user.displayName || user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-text-dim truncate">
                  {isMock ? 'Demo Mode' : user.email}
                </p>
              </div>
              {!isMock && (
                <button onClick={signOut} aria-label="Sign out" className="text-text-dim hover:text-text transition-colors">
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </>
          ) : (
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text truncate">Guest Mode</p>
                <p className="text-xs text-text-dim truncate">Sign in to sync</p>
              </div>
              <Link to="/auth" onClick={onMobileClose}>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  )
}
