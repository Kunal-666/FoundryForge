export interface WizardOption {
  value: string
  label: string
  icon?: string
}

export interface WizardQuestion {
  id: string
  title: string
  description: string
  key: keyof WizardAnswers
  options: WizardOption[]
  multiple?: boolean
  skipLabel?: string
  /** If set, this question only shows when the condition is met */
  condition?: (answers: WizardAnswers) => boolean
}

export interface WizardAnswers {
  scale: string | null
  scope: string | null
  frontend: string[]
  backend: string[]
  database: string[]
  auth: string[]
  payment: string | null
  storage: string | null
  deployment: string | null
  audience: string | null
  expectedUsers: string | null
  timelinePriority: string | null
  budget: string | null
  goal: string | null
}

export const defaultAnswers: WizardAnswers = {
  scale: null,
  scope: null,
  frontend: [],
  backend: [],
  database: [],
  auth: [],
  payment: null,
  storage: null,
  deployment: null,
  audience: null,
  expectedUsers: null,
  timelinePriority: null,
  budget: null,
  goal: null,
}

export const WIZARD_QUESTIONS: WizardQuestion[] = [
  {
    id: 'scale',
    title: 'Project Scale',
    description: 'What scale are you planning?',
    key: 'scale',
    options: [
      { value: 'small', label: 'Small', icon: '🌱' },
      { value: 'medium', label: 'Medium', icon: '🌿' },
      { value: 'large', label: 'Large', icon: '🌳' },
      { value: 'enterprise', label: 'Enterprise', icon: '🏢' },
    ],
    skipLabel: 'Not Sure',
  },
  {
    id: 'scope',
    title: 'Project Scope',
    description: 'What do you want to build?',
    key: 'scope',
    options: [
      { value: 'frontend', label: 'Frontend Only', icon: '🎨' },
      { value: 'backend', label: 'Backend Only', icon: '⚙️' },
      { value: 'fullstack', label: 'Frontend + Backend', icon: '🔗' },
      { value: 'fullstack-devops', label: 'Full Stack + DevOps', icon: '🚀' },
    ],
    skipLabel: 'Not Sure',
  },
  {
    id: 'frontend',
    title: 'Frontend Framework',
    description: 'Select your preferred frontend framework',
    key: 'frontend',
    multiple: true,
    condition: (a) => a.scope !== 'backend',
    options: [
      { value: 'react', label: 'React' },
      { value: 'nextjs', label: 'Next.js' },
      { value: 'vue', label: 'Vue' },
      { value: 'angular', label: 'Angular' },
      { value: 'svelte', label: 'Svelte' },
    ],
    skipLabel: 'No Preference',
  },
  {
    id: 'backend',
    title: 'Backend Framework',
    description: 'Select your preferred backend framework',
    key: 'backend',
    multiple: true,
    condition: (a) => a.scope !== 'frontend',
    options: [
      { value: 'express', label: 'Express' },
      { value: 'nestjs', label: 'NestJS' },
      { value: 'laravel', label: 'Laravel' },
      { value: 'django', label: 'Django' },
      { value: 'spring-boot', label: 'Spring Boot' },
      { value: 'fastapi', label: 'FastAPI' },
    ],
    skipLabel: 'No Preference',
  },
  {
    id: 'database',
    title: 'Database',
    description: 'Select your preferred database',
    key: 'database',
    multiple: true,
    condition: (a) => a.scope !== 'frontend',
    options: [
      { value: 'postgresql', label: 'PostgreSQL' },
      { value: 'mysql', label: 'MySQL' },
      { value: 'mongodb', label: 'MongoDB' },
      { value: 'firebase', label: 'Firebase' },
      { value: 'supabase', label: 'Supabase' },
    ],
    skipLabel: 'No Preference',
  },
  {
    id: 'auth',
    title: 'Authentication',
    description: 'How should users authenticate?',
    key: 'auth',
    multiple: true,
    condition: (a) => a.scope !== 'frontend',
    options: [
      { value: 'jwt', label: 'JWT' },
      { value: 'firebase-auth', label: 'Firebase Auth' },
      { value: 'clerk', label: 'Clerk' },
      { value: 'authjs', label: 'Auth.js' },
      { value: 'oauth', label: 'OAuth' },
      { value: 'none', label: 'No Authentication' },
    ],
    skipLabel: 'Decide Automatically',
  },
  {
    id: 'payment',
    title: 'Payment Integration',
    description: 'Will the project process payments?',
    key: 'payment',
    condition: (a) => a.scope !== 'frontend',
    options: [
      { value: 'none', label: 'No Payments' },
      { value: 'stripe', label: 'Stripe' },
      { value: 'razorpay', label: 'Razorpay' },
      { value: 'paypal', label: 'PayPal' },
      { value: 'cashfree', label: 'Cashfree' },
      { value: 'other', label: 'Other' },
    ],
    skipLabel: 'Decide Automatically',
  },
  {
    id: 'storage',
    title: 'File Storage',
    description: 'Where should files be stored?',
    key: 'storage',
    condition: (a) => a.scope !== 'frontend',
    options: [
      { value: 'none', label: 'None' },
      { value: 'aws-s3', label: 'AWS S3' },
      { value: 'cloudinary', label: 'Cloudinary' },
      { value: 'firebase-storage', label: 'Firebase Storage' },
      { value: 'local', label: 'Local Storage' },
    ],
    skipLabel: 'Decide Automatically',
  },
  {
    id: 'deployment',
    title: 'Deployment Target',
    description: 'Where do you want to deploy?',
    key: 'deployment',
    options: [
      { value: 'vercel', label: 'Vercel' },
      { value: 'netlify', label: 'Netlify' },
      { value: 'railway', label: 'Railway' },
      { value: 'render', label: 'Render' },
      { value: 'aws', label: 'AWS' },
      { value: 'azure', label: 'Azure' },
      { value: 'digitalocean', label: 'DigitalOcean' },
      { value: 'docker', label: 'Docker' },
    ],
    skipLabel: 'Not Sure',
  },
  {
    id: 'audience',
    title: 'Target Audience',
    description: 'Who is the project for?',
    key: 'audience',
    options: [
      { value: 'public', label: 'Public', icon: '🌐' },
      { value: 'internal', label: 'Internal Company', icon: '🏢' },
      { value: 'enterprise', label: 'Enterprise', icon: '🏛️' },
      { value: 'government', label: 'Government', icon: '⚖️' },
      { value: 'educational', label: 'Educational', icon: '📚' },
      { value: 'ngo', label: 'NGO', icon: '🤝' },
      { value: 'startup', label: 'Startup', icon: '🚀' },
      { value: 'other', label: 'Other', icon: '📋' },
    ],
    skipLabel: 'Not Sure',
  },
  {
    id: 'expectedUsers',
    title: 'Expected Users',
    description: 'How many users do you expect?',
    key: 'expectedUsers',
    options: [
      { value: 'under-100', label: 'Under 100' },
      { value: '100-1k', label: '100 – 1,000' },
      { value: '1k-10k', label: '1k – 10k' },
      { value: '10k-100k', label: '10k – 100k' },
      { value: '100k+', label: '100k+' },
    ],
    skipLabel: 'Unknown',
  },
  {
    id: 'timelinePriority',
    title: 'Timeline Priority',
    description: 'What is your timeline priority?',
    key: 'timelinePriority',
    options: [
      { value: 'fast-mvp', label: 'Fast MVP', icon: '⚡' },
      { value: 'balanced', label: 'Balanced', icon: '⚖️' },
      { value: 'production', label: 'Production Ready', icon: '✅' },
      { value: 'enterprise', label: 'Enterprise Quality', icon: '🏆' },
      { value: 'research', label: 'Research Project', icon: '🔬' },
    ],
    skipLabel: 'Not Sure',
  },
  {
    id: 'budget',
    title: 'Budget',
    description: 'What is your budget range?',
    key: 'budget',
    options: [
      { value: 'free', label: 'Free Tier Only' },
      { value: 'low', label: 'Low Cost' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'enterprise', label: 'Enterprise Budget' },
    ],
    skipLabel: 'Unknown',
  },
  {
    id: 'goal',
    title: 'AI Generation Goal',
    description: 'What do you want after planning?',
    key: 'goal',
    options: [
      { value: 'generate-code', label: 'Generate Code', icon: '💻' },
      { value: 'export-srs', label: 'Export SRS', icon: '📄' },
      { value: 'blueprint', label: 'Create Blueprint', icon: '📋' },
      { value: 'share-team', label: 'Share with Team', icon: '👥' },
      { value: 'claude-code', label: 'Use in Claude Code', icon: '🤖' },
      { value: 'codex-cli', label: 'Use in Codex CLI', icon: '⌨️' },
      { value: 'cursor', label: 'Use in Cursor', icon: '🖥️' },
      { value: 'docs-only', label: 'Documentation Only', icon: '📝' },
    ],
    skipLabel: 'Not Sure',
  },
]
