import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  ArrowRight,
  Brain,
  Building2,
  Shield,
  Zap,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeatureCard } from '@/components/FeatureCard'
import { Navbar } from '@/components/Navbar'
import { FEATURES } from '@/data/mock'

const workflowSteps = [
  { icon: Brain, title: 'Requirement Analysis', description: 'Deep understanding of your software idea', color: 'from-violet-500 to-purple-500' },
  { icon: Building2, title: 'Architecture Design', description: 'Scalable system architecture planning', color: 'from-blue-500 to-cyan-500' },
  { icon: Shield, title: 'Security Review', description: 'Built-in security at every layer', color: 'from-emerald-500 to-green-500' },
  { icon: Zap, title: 'Code Generation', description: 'Production-ready starter applications', color: 'from-amber-500 to-orange-500' },
]

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">AI-Powered Software Architecture</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-5xl font-bold leading-tight tracking-tight text-text sm:text-6xl lg:text-7xl"
          >
            Think Before
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-300 to-primary bg-clip-text text-transparent">
              You Build
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-10 max-w-2xl text-lg text-text-muted"
          >
            FoundryForge is an AI Software Architect that analyzes your ideas before generating code.
            Multi-step reasoning, intelligent design, and production-ready starter applications.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <Link to="/dashboard">
              <Button size="lg" className="gap-2 shadow-xl shadow-primary/25">
                Start Building <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-text">
              Why FoundryForge?
            </h2>
            <p className="mx-auto max-w-2xl text-text-muted">
              Stop writing code you'll rewrite. Start with a solid architectural foundation.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.id} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-text">
              Your AI Architecture Pipeline
            </h2>
            <p className="mx-auto max-w-2xl text-text-muted">
              From idea to architecture in minutes. Every step is transparent, reviewable, and customizable.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden lg:block" />
            <div className="grid gap-8 lg:grid-cols-4">
              {workflowSteps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative pl-0 lg:pl-16"
                >
                  <div className="absolute left-0 top-1 hidden h-4 w-4 rounded-full border-2 border-primary bg-background lg:block" />
                  <div className={`rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/20`}>
                    <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-lg`}>
                      <step.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-text">
                      {step.title}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface to-surface/50 p-12"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
            <div className="relative">
              <h2 className="mb-4 text-3xl font-bold text-text">
                Ready to build something great?
              </h2>
              <p className="mb-8 text-text-muted">
                Start with a solid architecture. Your future self will thank you.
              </p>
              <Link to="/dashboard">
                <Button size="lg" className="gap-2 shadow-xl shadow-primary/25">
                  Get Started Free <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold">
                Foundry<span className="text-primary">Forge</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-text-muted hover:text-text transition-colors">
                Documentation
              </a>
              <a href="#" className="text-sm text-text-muted hover:text-text transition-colors">
                API
              </a>
              <a href="#" className="text-sm text-text-muted hover:text-text transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-text-muted hover:text-text transition-colors">
                Terms
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-xs text-text-dim hover:text-text transition-colors">
                Docs
              </a>
              <a href="#" className="text-xs text-text-dim hover:text-text transition-colors">
                GitHub
              </a>
              <a href="#" className="text-xs text-text-dim hover:text-text transition-colors">
                Twitter
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-text-dim">
            &copy; {new Date().getFullYear()} FoundryForge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
