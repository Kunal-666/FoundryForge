import type { Template, Feature, SessionMode, TimelineStage } from '@/types'
import { STAGE_LABELS } from '@/lib/prompts'

export const MODE_CONFIG: Record<SessionMode, {
  label: string
  description: string
  icon: string
  badge: string
}> = {
  general: {
    label: 'General',
    description: 'Full analysis from requirements to starter code',
    icon: 'Sparkles',
    badge: 'Full Pipeline',
  },
  architecture: {
    label: 'Architecture Planning',
    description: 'System design, patterns, database, and security review',
    icon: 'Building2',
    badge: 'Design Focus',
  },
  codegen: {
    label: 'Code Generation',
    description: 'Quick architecture + generate production-ready starter code',
    icon: 'Code2',
    badge: 'Code Focus',
  },
}

export function getTimelineStages(mode: SessionMode): TimelineStage[] {
  const stages: Record<SessionMode, TimelineStage[]> = {
    general: [],
    architecture: [
      { id: 'requirements', name: 'Requirements Analysis', icon: '🧠', status: 'pending', description: STAGE_LABELS.requirements },
      { id: 'clarification', name: 'Clarification & Scope', icon: '🔍', status: 'pending', description: STAGE_LABELS.clarification },
      { id: 'architecture', name: 'Architecture Design', icon: '🏗', status: 'pending', description: STAGE_LABELS.architecture },
      { id: 'database', name: 'Database Schema', icon: '🗄', status: 'pending', description: STAGE_LABELS.database },
      { id: 'structure', name: 'Project Structure', icon: '📦', status: 'pending', description: STAGE_LABELS.structure },
      { id: 'security', name: 'Security & Compliance', icon: '🔐', status: 'pending', description: STAGE_LABELS.security },
      { id: 'roadmap', name: 'Development Roadmap', icon: '📅', status: 'pending', description: STAGE_LABELS.roadmap },
      { id: 'generation', name: 'Code Generation', icon: '⚡', status: 'pending', description: STAGE_LABELS.generation },
    ],
    codegen: [],
  }
  return stages[mode].map(s => ({ ...s }))
}

export const DEFAULT_TIMELINE_STAGES = getTimelineStages('general')

export const TEMPLATES: Template[] = [
  {
    id: '1',
    title: 'Full-Stack Web App',
    description: 'React + Node.js + Database with authentication and CRUD operations',
    prompt: 'Build a full-stack web application with React frontend, Node.js backend, and a database. Include user authentication, CRUD operations, and responsive design.',
    category: 'web',
    icon: 'Globe',
    mode: 'general',
  },
  {
    id: '2',
    title: 'REST API Service',
    description: 'Express.js RESTful API with TypeScript, Prisma ORM, and Swagger docs',
    prompt: 'Create a RESTful API service using Express.js with TypeScript. Use Prisma for database access and include Swagger documentation.',
    category: 'api',
    icon: 'Api',
    mode: 'architecture',
  },
  {
    id: '3',
    title: 'Mobile App Backend',
    description: 'Scalable mobile backend with push notifications, file uploads, and real-time features',
    prompt: 'Design a scalable backend for a mobile application with push notifications, file uploads, and real-time messaging capabilities.',
    category: 'mobile',
    icon: 'Smartphone',
    mode: 'architecture',
  },
  {
    id: '4',
    title: 'Microservices Architecture',
    description: 'Event-driven microservices with message queues, Docker, and Kubernetes',
    prompt: 'Architect an event-driven microservices system with message queuing, containerization with Docker, and Kubernetes orchestration.',
    category: 'architecture',
    icon: 'Layers',
    mode: 'architecture',
  },
  {
    id: '5',
    title: 'AI/ML Pipeline',
    description: 'End-to-end ML pipeline with data processing, model training, and inference API',
    prompt: 'Build an end-to-end machine learning pipeline with data preprocessing, model training, evaluation, and a deployment API.',
    category: 'ai',
    icon: 'Brain',
    mode: 'general',
  },
  {
    id: '6',
    title: 'SaaS Starter Kit',
    description: 'Multi-tenant SaaS application with billing, teams, and role-based access',
    prompt: 'Create a multi-tenant SaaS application starter with subscription billing, team management, and role-based access control.',
    category: 'saas',
    icon: 'Building',
    mode: 'codegen',
  },
]

export const FEATURES: Feature[] = [
  {
    id: '1',
    title: 'Think Before You Build',
    description: 'Analyze requirements deeply before writing a single line of code. Understand the problem fully before solving it.',
    icon: 'Brain',
  },
  {
    id: '2',
    title: 'Intelligent Architecture',
    description: 'Get production-ready architecture designs with patterns that scale. Microservices, monoliths, or serverless — we design it all.',
    icon: 'Building2',
  },
  {
    id: '3',
    title: 'Security First',
    description: 'Built-in security review at every stage. OWASP compliance, data encryption, auth patterns — all considered automatically.',
    icon: 'Shield',
  },
  {
    id: '4',
    title: 'Ready-Made Blueprints',
    description: 'Generate complete project structures, database schemas, and API contracts. Start coding with a solid foundation.',
    icon: 'FileCode',
  },
  {
    id: '5',
    title: 'Clear Roadmaps',
    description: 'Get a phased development roadmap with milestones, dependencies, and effort estimates for predictable delivery.',
    icon: 'Map',
  },
  {
    id: '6',
    title: 'AI-Powered Generation',
    description: 'Transform designs into working starter code. React, Node.js, Python — generate boilerplate in your preferred stack.',
    icon: 'Zap',
  },
]

export const EXAMPLE_PROMPTS = [
  'Build a real-time collaborative code editor with WebSocket support',
  'Create a subscription-based SaaS platform with Stripe billing',
  'Design a social media analytics dashboard with data visualization',
  'Build an e-commerce marketplace with AI-powered recommendations',
]
