import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth'
import { ConnectionStatus } from '@/components/ConnectionStatus'

export function Navbar() {
  const { user, isMock, signOut } = useAuth()

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight text-text">
            Foundry<span className="text-primary">Forge</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="sm" className="shadow-lg shadow-primary/20">
                  Get Started
                </Button>
              </Link>
              <ConnectionStatus />
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-text-muted hidden sm:block">
                  {user.displayName || user.email}
                </span>
                {!isMock && (
                  <button onClick={signOut} aria-label="Sign out" className="text-text-dim hover:text-text transition-colors">
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="sm" className="shadow-lg shadow-primary/20">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
