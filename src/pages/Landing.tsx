import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import demoVideo from '@/assets/FoundryForge - AI Software Architect - Google Chrome 2026-06-14 01-28-10.mp4'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { motion } from 'framer-motion'
import {
  Sparkles,
  ArrowRight,
  Brain,
  MessageSquare,
  Building2,
  Database,
  FolderTree,
  Shield,
  Map,
  Zap,
  ChevronRight,
  Play,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeatureCard } from '@/components/FeatureCard'
import { Navbar } from '@/components/Navbar'
import { FEATURES } from '@/data/mock'

const workflowSteps = [
  { icon: Brain, title: 'Requirements Analysis', description: 'Extract roles, core features, and non-functional needs', color: 'from-violet-500 to-purple-500' },
  { icon: MessageSquare, title: 'Clarification & Scope', description: 'Identify missing information, assumptions, and boundaries', color: 'from-fuchsia-500 to-pink-500' },
  { icon: Building2, title: 'Architecture Design', description: 'Scalable system architecture and stack recommendations', color: 'from-blue-500 to-cyan-500' },
  { icon: Database, title: 'Database Summary', description: 'Define the database type, main entities, and relationships', color: 'from-sky-500 to-indigo-500' },
  { icon: FolderTree, title: 'Project Structure', description: 'Feature-based folder layout and module boundaries', color: 'from-teal-500 to-emerald-500' },
  { icon: Shield, title: 'Security & Compliance', description: 'Built-in security, authentication, and validation', color: 'from-emerald-500 to-green-500' },
  { icon: Map, title: 'Development Roadmap', description: 'Implementation phases, milestones, and dependencies', color: 'from-orange-500 to-red-500' },
  { icon: Zap, title: 'Code Generation', description: 'AI Tool recommendations and production-ready starters', color: 'from-amber-500 to-orange-500' },
]

export function Landing() {
  const [showDemo, setShowDemo] = useState(false)
  useEffect(() => { document.title = 'FoundryForge - AI Software Architect' }, [])
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
            <Button variant="outline" size="lg" className="gap-2" onClick={() => setShowDemo(true)}>
              <Play className="h-4 w-4 fill-current" />
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
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center sm:mb-16"
          >
            <h2 className="mb-4 text-2xl font-bold text-text sm:text-3xl">
              Your AI Architecture Pipeline
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-text-muted sm:text-base">
              From idea to architecture in minutes. Every step is transparent, reviewable, and customizable.
            </p>
          </motion.div>

          <div className="relative px-4 sm:px-12">
            <Swiper
              modules={[Navigation, Pagination, A11y, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              // navigation
              loop={true}
              pagination={{ clickable: true }}
              autoplay={{ delay: 1500, disableOnInteraction: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              className="!pb-14"
            >
              {workflowSteps.map((step, i) => (
                <SwiperSlide key={step.title} className="h-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group relative h-full"
                  >
                    {/* Card */}
                    <div className="relative h-full">
                      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="relative h-full rounded-2xl border border-border bg-surface p-5 transition-all duration-300 sm:p-6 group-hover:border-primary/20 group-hover:shadow-lg group-hover:shadow-primary/5">
                        <div className="mb-3 flex items-start justify-between sm:mb-4">
                          <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-lg shadow-black/20`}>
                            <step.icon className="h-5 w-5 text-white" />
                          </div>
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                            {i + 1}
                          </span>
                        </div>
                        <h3 className="mb-1.5 text-sm font-semibold text-text sm:text-base">
                          {step.title}
                        </h3>
                        <p className="text-xs leading-relaxed text-text-muted sm:text-sm">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
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
              <Link to="/docs" className="text-sm text-text-muted hover:text-text transition-colors">
                Documentation
              </Link>
              <Link to="/mcp" className="text-sm text-text-muted hover:text-text transition-colors">
                MCP Server
              </Link>
              <Link to="/privacy" className="text-sm text-text-muted hover:text-text transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-sm text-text-muted hover:text-text transition-colors">
                Terms
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/docs" className="text-xs text-text-dim hover:text-text transition-colors">
                Docs
              </Link>
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

      {/* Demo Video Modal */}
      {showDemo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowDemo(false)}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDemo(false)}
              className="absolute top-3 right-3 z-10 flex items-center justify-center h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              aria-label="Close demo"
            >
              <X className="h-4 w-4" />
            </button>
            <video
              src={demoVideo}
              controls
              autoPlay
              className="w-full aspect-video bg-black"
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
