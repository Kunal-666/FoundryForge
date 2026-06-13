import { Navbar } from '@/components/Navbar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Layers, 
  Cpu, 
  Database, 
  FolderTree, 
  ShieldCheck, 
  Milestone, 
  Code, 
  BookOpen, 
  HelpCircle, 
  Terminal, 
  GitBranch,
  Search,
  CheckCircle2,
  Lock,
  Workflow
} from 'lucide-react'

export function Documentation() {
  const sections = [
    { id: 'about', label: 'About FoundryForge' },
    { id: 'pipeline', label: 'Reasoning Pipeline' },
    { id: 'foundry-iq', label: 'Foundry IQ (Azure RAG)' },
    { id: 'mcp', label: 'MCP Integration' },
    { id: 'tech-stack', label: 'Technology Stack' },
    { id: 'dev-setup', label: 'Local Development' },
  ]

  const pipelineStages = [
    {
      num: '01',
      title: 'Requirements Analysis',
      desc: 'Decodes raw developer prompts into structured functional and non-functional requirements.',
      icon: BookOpen,
      color: 'text-accent-blue bg-accent-blue/10 border-accent-blue/20'
    },
    {
      num: '02',
      title: 'Clarification & Scope',
      desc: 'Detects ambiguous constraints and generates clarifying questions about scalability and integration.',
      icon: HelpCircle,
      color: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20'
    },
    {
      num: '03',
      title: 'Architecture Design',
      desc: 'Proposes standard design patterns, API types, client-side structure, and communication protocols.',
      icon: Layers,
      color: 'text-accent-pink bg-accent-pink/10 border-accent-pink/20'
    },
    {
      num: '04',
      title: 'Database Summary',
      desc: 'Generates database schemas, collections, table attributes, relationships, and sample indexes.',
      icon: Database,
      color: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20'
    },
    {
      num: '05',
      title: 'Project Structure',
      desc: 'Provides a clean, framework-specific folder structure (e.g., React/Next.js/Node) for code layout.',
      icon: FolderTree,
      color: 'text-accent-amber bg-accent-amber/10 border-accent-amber/20'
    },
    {
      num: '06',
      title: 'Security & Compliance',
      desc: 'Injects safety rules, authentication workflows, encryption recommendations, and regulatory checks.',
      icon: ShieldCheck,
      color: 'text-success bg-success/10 border-success/20'
    },
    {
      num: '07',
      title: 'Development Roadmap',
      desc: 'Splits implementation into logical execution phases (Foundation, Core, Polish) with milestone items.',
      icon: Milestone,
      color: 'text-accent-blue bg-accent-blue/10 border-accent-blue/20'
    },
    {
      num: '08',
      title: 'Boilerplate Generation',
      desc: 'Generates initial files, config templates, and skeleton code scripts to kickstart coding.',
      icon: Code,
      color: 'text-primary bg-primary/10 border-primary/20'
    }
  ]

  const stackDetails = [
    {
      category: 'Frontend',
      items: ['React 18 & TypeScript', 'Vite (HMR bundler)', 'Tailwind CSS (V4 styling)', 'Zustand (State Management)', 'Framer Motion & Swiper'],
      icon: LayoutIcon,
      color: 'border-accent-purple/20 bg-accent-purple/5 text-accent-purple'
    },
    {
      category: 'APIs & Serverless',
      items: ['Vercel Serverless Functions', 'Node.js runtime environment', 'Custom JSON-RPC 2.0 router', 'Stateless MCP endpoint'],
      icon: Terminal,
      color: 'border-accent-cyan/20 bg-accent-cyan/5 text-accent-cyan'
    },
    {
      category: 'Database & Auth',
      items: ['Firebase Authentication', 'Cloud Firestore database', 'localStorage guest backup', 'Secure Firestore Rules'],
      icon: Lock,
      color: 'border-accent-amber/20 bg-accent-amber/5 text-accent-amber'
    },
    {
      category: 'Azure AI Engine',
      items: ['Azure AI Foundry Agent', 'Azure AI Search index', 'Grounded RAG architecture', 'Bearer Token Client Handshake'],
      icon: Cpu,
      color: 'border-success/20 bg-success/5 text-success'
    }
  ]

  function LayoutIcon(props: any) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    )
  }

  return (
    <div className="min-h-screen bg-background text-text selection:bg-primary/30 selection:text-white">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-6 py-32">
        {/* Hero Banner */}
        <div className="relative border-b border-border/40 pb-12 mb-16">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_20rem_at_top,rgba(139,92,246,0.08),transparent)]" />
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary text-xs py-1 px-3">
            <Sparkles className="h-3 w-3 mr-1.5 animate-pulse" />
            Hackathon System Documentation
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-text via-text to-primary bg-clip-text text-transparent">
            FoundryForge Engine
          </h1>
          <p className="mt-4 text-lg text-text-muted max-w-3xl leading-relaxed">
            Discover the inner workings of FoundryForge—an AI-powered Software Architect and Design Planner designed to structure ideas, check compliance, and construct blueprints before code is written.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sticky Sidebar Navigation */}
          <aside className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border border-border/60 bg-surface/30 backdrop-blur-md p-6 space-y-4">
              <h3 className="font-semibold text-text text-sm uppercase tracking-wider">On This Page</h3>
              <nav className="flex flex-col gap-2">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="text-sm text-text-muted hover:text-primary transition-colors py-1.5 border-l-2 border-transparent hover:border-primary pl-3 block"
                  >
                    {sec.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content Areas */}
          <div className="lg:col-span-3 space-y-20">
            {/* Section 1: About */}
            <section id="about" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-text">About FoundryForge</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  FoundryForge was built for the **Agents League Hackathon – Creative Apps** track to help software engineers transition from initial ideas to functional architecture plans with maximum speed and rigor. 
                </p>
                <p>
                  Rather than jumping directly to generating lines of code (which often results in disorganized layouts or technical debt), FoundryForge forces structured thinking. It breaks the planning process into eight consecutive logical stages, creating a comprehensive blueprint file in the **OpenCode Specification Format**.
                </p>
                <div className="p-6 rounded-2xl border border-border/50 bg-surface/30 backdrop-blur-md grid gap-4 sm:grid-cols-2 mt-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-text text-sm">Grounded Intelligence</h4>
                      <p className="text-xs text-text-dim mt-1">Grounded directly in verified architecture templates via Azure AI Search integration.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-text text-sm">Local-First Storage</h4>
                      <p className="text-xs text-text-dim mt-1">Full offline functionality saves progress locally without requiring immediate sign-in.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Pipeline */}
            <section id="pipeline" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purple/10 text-accent-purple">
                  <Workflow className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-text">The 8-Stage Reasoning Pipeline</h2>
              </div>
              <p className="text-text-muted leading-relaxed">
                Every project in FoundryForge runs through a structured compilation sequence. Each stage builds on the output of the previous one:
              </p>
              <div className="grid gap-4 sm:grid-cols-2 mt-6">
                {pipelineStages.map((stage) => {
                  const IconComponent = stage.icon
                  return (
                    <Card key={stage.num} className="p-5 border-border/60 bg-surface/30 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 group">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border shrink-0 ${stage.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-primary font-bold">{stage.num}</span>
                            <h3 className="font-semibold text-text text-sm group-hover:text-primary transition-colors">{stage.title}</h3>
                          </div>
                          <p className="text-xs text-text-muted leading-relaxed">{stage.desc}</p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </section>

            {/* Section 3: Foundry IQ */}
            <section id="foundry-iq" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                  <Search className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-text">Foundry IQ (Grounded Architecture Engine)</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  FoundryForge incorporates **Foundry IQ**—a retrieval-augmented generation (RAG) system connected directly to Microsoft Azure. This ensures the design recommendations are anchored to real standards.
                </p>
                <div className="grid gap-6 md:grid-cols-2 mt-4">
                  <div className="border border-border/50 rounded-xl p-5 bg-surface/20">
                    <h4 className="font-semibold text-text text-sm mb-2 flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-primary" /> Azure AI Foundry Agent
                    </h4>
                    <p className="text-xs text-text-dim leading-relaxed">
                      Leverages client credentials authentication (`AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID`) to securely invoke the live Azure AI agent. It handles requests using contextual instructions, returning precise structural formats.
                    </p>
                  </div>
                  <div className="border border-border/50 rounded-xl p-5 bg-surface/20">
                    <h4 className="font-semibold text-text text-sm mb-2 flex items-center gap-2">
                      <Database className="h-4 w-4 text-accent-cyan" /> Grounded Search Index
                    </h4>
                    <p className="text-xs text-text-dim leading-relaxed">
                      Queries the live search index `foundryforgesrch` loaded with 23 specific architectural files including engineering principles, state management standards, React conventions, and security guidelines.
                    </p>
                  </div>
                </div>
                <p className="text-sm bg-surface/40 border border-border/40 rounded-xl p-4 text-text-muted">
                  💡 **Offline Fallback:** If Azure environment variables are not configured in the environment, FoundryForge automatically performs a local keyword relevance search over the standard `kb/` folder assets, ensuring the app remains fully functional in offline mode.
                </p>
              </div>
            </section>

            {/* Section 4: MCP */}
            <section id="mcp" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-cyan/10 text-accent-cyan">
                  <Terminal className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-text">Model Context Protocol (MCP) Server</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  FoundryForge includes a built-in **Model Context Protocol (MCP) server** deployed as a Vercel Serverless Function at `api/mcp.ts`. This allows developers to query the architectural index directly from their IDE chat clients.
                </p>
                <div className="p-6 rounded-2xl border border-border/60 bg-zinc-950 text-zinc-100 space-y-3 font-mono text-xs">
                  <div className="text-zinc-500">// Example Query in VS Code Copilot Chat</div>
                  <div className="text-emerald-400">
                    &gt; "Use the foundryforge-mcp tool to query React coding standards"
                  </div>
                  <div className="border-t border-zinc-800 pt-3 text-zinc-400">
                    FoundryForge MCP processes this request, retrieves data from the search index, and sends back standard specifications for React files (e.g. folder structure, type definitions, component imports) directly into the editor context.
                  </div>
                </div>
                <p>
                  The server is stateless and compatible with Vercel's serverless cold starts. It exposes a single tool `query_foundry_iq` and supports both standard SSE transport and stateless HTTP protocols.
                </p>
              </div>
            </section>

            {/* Section 5: Tech Stack */}
            <section id="tech-stack" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-pink/10 text-accent-pink">
                  <GitBranch className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-text">Technology Stack</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {stackDetails.map((layer) => {
                  const Icon = layer.icon
                  return (
                    <Card key={layer.category} className="p-5 border-border/50 bg-surface/30 backdrop-blur-sm flex gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border shrink-0 ${layer.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-text text-sm">{layer.category}</h3>
                        <ul className="space-y-1">
                          {layer.items.map((item, i) => (
                            <li key={i} className="text-xs text-text-muted flex items-center gap-1.5">
                              <span className="h-1 w-1 rounded-full bg-primary" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </section>

            {/* Section 6: Local Dev */}
            <section id="dev-setup" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-amber/10 text-accent-amber">
                  <Terminal className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-text">Local Development</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  To run FoundryForge locally and access both the frontend application and the Serverless MCP endpoints, follow the setup instructions below.
                </p>
                <div className="space-y-3">
                  <h4 className="font-semibold text-text text-sm">1. Install Dependencies</h4>
                  <pre className="p-4 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl overflow-x-auto text-xs font-mono select-all">
                    npm install
                  </pre>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-text text-sm">2. Launch dev servers</h4>
                  <p className="text-xs text-text-dim">To test frontend only (without backend Serverless APIs):</p>
                  <pre className="p-4 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl overflow-x-auto text-xs font-mono select-all">
                    npm run dev
                  </pre>
                  <p className="text-xs text-text-dim">To test serverless functions (like the MCP server) alongside the frontend, run using Vercel CLI:</p>
                  <pre className="p-4 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl overflow-x-auto text-xs font-mono select-all">
                    npm install -g vercel{"\n"}vercel dev
                  </pre>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
