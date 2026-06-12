import type { Session } from '@/types'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ArchitectureRecommendation {
  area: 'Frontend' | 'Backend' | 'Database' | 'Authentication' | 'Storage' | 'Deployment'
  recommended: string
  reason: string
  alternative: string
  alternativeReason: string
}

export interface ToolRecommendation {
  tool: string
  bestUseCase: string
  why: string
  strengths: string[]
  limitations: string[]
  recommended: boolean
}

export interface CompatibilityItem {
  label: string
  status: 'supported' | 'warning' | 'unsupported'
  reason: string
}

export interface RoadmapPhase {
  phase: string
  description: string
  milestones: string[]
}

export interface DatabaseSummary {
  type: string
  entities: string[]
  relationships: string[]
  estimatedTables: string
}

export interface DomainEntity {
  name: string
  purpose: string
  relationships: string
  primaryKey: string
  keyFields: string[]
}

export interface DomainProfile {
  domainType: 'ngo' | 'ecommerce' | 'lms' | 'hospital' | 'booking' | 'crm' | 'saas' | 'generic'
  industryLabel: string
  primaryWorkflows: string[]
  coreEntities: DomainEntity[]
  openQuestions: string[]
  frCategories: Array<{ label: string; prefix: string }>
  domainRisks: RiskItem[]
}

export interface ClassifiedAssumption {
  label: string
  confidence: 'confirmed' | 'high' | 'low'
  confidencePercent: number
}

export interface RiskItem {
  title: string
  impact: 'High' | 'Medium' | 'Low'
  likelihood: 'High' | 'Medium' | 'Low'
  mitigation: string
  owner: string
}

export interface SecurityCategory {
  category: string
  recommendations: string[]
}

export interface ArchitectureData {
  projectName: string
  summary: string
  pattern: string
  frontendStack: string
  backendStack: string
  database: string
  authentication: string
  storage: string
  deployment: string
  securityLevel: string
  projectScale: 'Small' | 'Medium' | 'Large'

  metrics: {
    estimatedFiles: number
    estimatedApis: number
    estimatedDbTables: number
    estimatedServices: number
    estimatedComponents: number
    estimatedDevTime: string
  }

  services: Service[]
  connections: [number, number][]

  metadata: {
    model: string
    generationTime: string
    stages: number
    generatedAt: string
    recommendations: number
    complexity: 'Low' | 'Medium' | 'High'
  }

  searchTerms: string[]

  roles: string[]
  features: string[]
  integrations: string[]
  security: string[]
  assumptions: string[]
  missingInformation: string[]
  conflicts: string[]
  risks: string[]
  stack: Record<string, string[]>
  confidence: 'high' | 'medium' | 'low'
  architectureRecommendations: ArchitectureRecommendation[]
  aiRecommendations: ToolRecommendation[]
  generatorCompatibility: CompatibilityItem[]
  executionStrategy: string[]
  roadmap: RoadmapPhase[]
  securityRecommendations: string[]
  databaseSummary: DatabaseSummary

  // v3 additions
  domainProfile: DomainProfile
  classifiedAssumptions: ClassifiedAssumption[]
  structuredRisks: RiskItem[]
  openQuestions: string[]
  securityCategories: SecurityCategory[]
  inferenceConfidence: Record<string, number>
  showGeneratorCompatibility: boolean
}

interface Service {
  name: string
  layer: ServiceLayer
}

type ServiceLayer = 0 | 1 | 2 | 3

interface TechStack {
  frontend: string
  backend: string
  database: string
  authentication: string
  storage: string
  deployment: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULTS: TechStack = {
  frontend: 'React + TypeScript + Tailwind CSS',
  backend: 'Node.js + Express + TypeScript',
  database: 'PostgreSQL',
  authentication: 'JWT + refresh tokens',
  storage: 'S3-compatible object storage',
  deployment: 'Docker on a managed platform',
}

const TECH_KEYWORDS = {
  frontend: ['react', 'next.js', 'vue', 'angular', 'svelte', 'tailwind', 'shadcn', 'chakra', 'mui', 'bootstrap'],
  backend: ['node.js', 'express', 'fastify', 'nestjs', 'django', 'flask', 'fastapi', 'spring boot', 'asp.net', 'laravel', 'rails'],
  database: ['postgresql', 'postgres', 'mysql', 'mongodb', 'sqlite', 'redis', 'dynamodb', 'firestore', 'cassandra', 'mariadb'],
  authentication: ['jwt', 'oauth', 'auth0', 'firebase auth', 'clerk', 'session', 'refresh token', 'sso', 'rbac'],
  storage: ['s3', 'cloudinary', 'firebase storage', 'blob storage', 'object storage', 'minio'],
  deployment: ['docker', 'vercel', 'netlify', 'render', 'fly.io', 'aws', 'gcp', 'azure', 'cloudflare'],
} as const

const FEATURE_SERVICE_MAP: [string, string][] = [
  ['auth', 'Auth Service'],
  ['payment', 'Payment Service'],
  ['email', 'Notification Service'],
  ['notification', 'Notification Service'],
  ['search', 'Search Service'],
  ['chat', 'Chat Service'],
  ['analytics', 'Analytics Service'],
  ['user', 'User Service'],
  ['content', 'Content Service'],
  ['file', 'File Service'],
  ['storage', 'Storage Service'],
  ['report', 'Report Service'],
]

const SEARCH_TERM_CANDIDATES = [
  'auth', 'database', 'api', 'security', 'docker', 'cache', 'queue', 'oauth',
  'crud', 'rest', 'graphql', 'microservice', 'monolith', 'event', 'stream',
  'search', 'analytics', 'notification', 'payment', 'email', 'storage', 'cdn',
]

// ─── Domain Catalog ───────────────────────────────────────────────────────────

const DOMAIN_CATALOG: Record<string, DomainProfile> = {
  ngo: {
    domainType: 'ngo',
    industryLabel: 'Non-Profit / NGO',
    primaryWorkflows: [
      'Donation processing and receipt generation',
      'Volunteer registration and approval',
      'Event creation and attendee management',
      'Campaign tracking and progress reporting',
      'Blog content publishing and management',
    ],
    coreEntities: [
      { name: 'Users', purpose: 'Registered accounts and authentication identities', relationships: 'Has many Donations, Volunteer records, BlogPosts', primaryKey: 'user_id', keyFields: ['email', 'name', 'role', 'created_at', 'last_login'] },
      { name: 'Campaigns', purpose: 'Fundraising initiatives with goals and timelines', relationships: 'Has many Donations; created by User', primaryKey: 'campaign_id', keyFields: ['title', 'goal_amount', 'raised_amount', 'status', 'end_date'] },
      { name: 'Donations', purpose: 'Individual contribution and payment records', relationships: 'Belongs to User (nullable for anonymous); belongs to Campaign', primaryKey: 'donation_id', keyFields: ['amount', 'currency', 'payment_method', 'status', 'created_at'] },
      { name: 'Volunteers', purpose: 'Volunteer profiles and approval status', relationships: 'Belongs to User; assigned to Events via Shifts', primaryKey: 'volunteer_id', keyFields: ['skills', 'availability', 'status', 'applied_at', 'approved_at'] },
      { name: 'Events', purpose: 'Scheduled activities with attendance management', relationships: 'Has many Registrations; managed by Administrator', primaryKey: 'event_id', keyFields: ['title', 'date', 'location', 'capacity', 'registration_deadline'] },
      { name: 'BlogPosts', purpose: 'Published articles, campaign stories, and announcements', relationships: 'Belongs to User (author); tagged with Categories', primaryKey: 'post_id', keyFields: ['title', 'content', 'status', 'published_at', 'tags'] },
      { name: 'ContactMessages', purpose: 'Inbound inquiries and general support requests', relationships: 'Standalone; reviewed and assigned by Administrator', primaryKey: 'message_id', keyFields: ['name', 'email', 'subject', 'message', 'status'] },
    ],
    openQuestions: [
      'Which payment gateway will process donations (Stripe, PayPal, Razorpay)?',
      'Should the platform support anonymous donations without user registration?',
      'Must volunteers complete an admin approval workflow before becoming active?',
      'Will blog posts support public comments with moderation?',
      'Should recurring monthly donation subscriptions be supported?',
      'Is multi-currency donation support required at launch?',
    ],
    frCategories: [
      { label: 'Authentication', prefix: 'AUTH' },
      { label: 'Donation Management', prefix: 'DON' },
      { label: 'Volunteer Management', prefix: 'VOL' },
      { label: 'Event Management', prefix: 'EVT' },
      { label: 'Content Management', prefix: 'CMS' },
      { label: 'Administration', prefix: 'ADMIN' },
      { label: 'Reporting', prefix: 'RPT' },
    ],
    domainRisks: [
      { title: 'Payment provider outage during an active fundraising campaign', impact: 'High', likelihood: 'Medium', mitigation: 'Implement retry logic, graceful degradation, and a secondary payment fallback route.', owner: 'Development Team' },
      { title: 'Donor personal data breach exposing financial records', impact: 'High', likelihood: 'Low', mitigation: 'Enforce encryption at rest and in transit, apply strict RBAC, and conduct quarterly security reviews.', owner: 'Security Lead' },
      { title: 'Scope creep from unconfirmed feature requests during development', impact: 'Medium', likelihood: 'High', mitigation: 'Lock feature scope before sprint planning and route new requests through a formal change process.', owner: 'Project Manager' },
      { title: 'Low volunteer engagement rate after platform launch', impact: 'Medium', likelihood: 'Medium', mitigation: 'Build notification workflows and a clear volunteer dashboard from day one.', owner: 'Product Owner' },
      { title: 'Transactional email delivery failures for receipts and confirmations', impact: 'Medium', likelihood: 'Medium', mitigation: 'Configure a fallback SMTP provider and monitor delivery rates with real-time alerts.', owner: 'Development Team' },
    ],
  },

  ecommerce: {
    domainType: 'ecommerce',
    industryLabel: 'E-Commerce / Retail',
    primaryWorkflows: [
      'Product browsing and search',
      'Cart management and checkout',
      'Payment processing and order confirmation',
      'Order fulfillment and status tracking',
      'Review and rating submission',
    ],
    coreEntities: [
      { name: 'Products', purpose: 'Items or services available for purchase', relationships: 'Belongs to Category; has many Reviews, OrderItems', primaryKey: 'product_id', keyFields: ['name', 'sku', 'price', 'stock_qty', 'status', 'images'] },
      { name: 'Categories', purpose: 'Hierarchical product classification', relationships: 'Self-referencing (parent_id); has many Products', primaryKey: 'category_id', keyFields: ['name', 'slug', 'parent_id', 'display_order'] },
      { name: 'Orders', purpose: 'Customer purchase records and fulfillment state', relationships: 'Belongs to User; has many OrderItems, Payments', primaryKey: 'order_id', keyFields: ['total', 'status', 'shipping_address', 'created_at'] },
      { name: 'Cart', purpose: 'Active shopping session before checkout', relationships: 'Belongs to User or guest session', primaryKey: 'cart_id', keyFields: ['items', 'subtotal', 'coupon_code', 'updated_at'] },
      { name: 'Payments', purpose: 'Transaction processing and gateway records', relationships: 'Belongs to Order', primaryKey: 'payment_id', keyFields: ['amount', 'gateway', 'status', 'reference', 'created_at'] },
      { name: 'Reviews', purpose: 'Customer ratings and written product feedback', relationships: 'Belongs to User; belongs to Product', primaryKey: 'review_id', keyFields: ['rating', 'comment', 'verified_purchase', 'created_at'] },
      { name: 'Wishlist', purpose: 'Products saved by users for future purchase', relationships: 'Belongs to User; linked to Products', primaryKey: 'wishlist_id', keyFields: ['product_ids', 'created_at', 'updated_at'] },
    ],
    openQuestions: [
      'Which payment gateway(s) will be integrated (Stripe, PayPal, Razorpay)?',
      'Will the platform support guest checkout without user registration?',
      'Is real-time inventory management and low-stock alerting required?',
      'Should the platform support multiple currencies and tax jurisdictions?',
      'Is a loyalty points or rewards program in scope?',
      'Will there be multi-vendor or dropshipping support?',
    ],
    frCategories: [
      { label: 'Authentication', prefix: 'AUTH' },
      { label: 'Product Catalog', prefix: 'PROD' },
      { label: 'Cart & Checkout', prefix: 'CART' },
      { label: 'Order Management', prefix: 'ORD' },
      { label: 'Payment Processing', prefix: 'PAY' },
      { label: 'Reviews & Ratings', prefix: 'REV' },
      { label: 'Administration', prefix: 'ADMIN' },
    ],
    domainRisks: [
      { title: 'Payment gateway downtime during peak sales events', impact: 'High', likelihood: 'Medium', mitigation: 'Integrate a secondary payment provider and display graceful fallback messaging.', owner: 'Development Team' },
      { title: 'Inventory overselling due to concurrent order submissions', impact: 'High', likelihood: 'Medium', mitigation: 'Implement optimistic locking or database-level stock reservation during checkout.', owner: 'Development Team' },
      { title: 'High cart abandonment rate from a complex checkout flow', impact: 'Medium', likelihood: 'High', mitigation: 'Limit checkout to three steps and support guest checkout from the start.', owner: 'Product Owner' },
      { title: 'Fraudulent orders and payment chargebacks', impact: 'High', likelihood: 'Medium', mitigation: 'Enable gateway-level fraud detection, velocity checks, and 3D Secure authentication.', owner: 'Security Lead' },
      { title: 'Search and filter latency as the product catalog grows', impact: 'Medium', likelihood: 'Medium', mitigation: 'Index product fields appropriately and evaluate dedicated search beyond 10k items.', owner: 'Development Team' },
    ],
  },

  lms: {
    domainType: 'lms',
    industryLabel: 'Learning Management / EdTech',
    primaryWorkflows: [
      'Course discovery and enrollment',
      'Lesson content delivery and completion tracking',
      'Assignment submission and grading',
      'Quiz completion with scored outcomes',
      'Certificate issuance upon course completion',
    ],
    coreEntities: [
      { name: 'Courses', purpose: 'Learning programs created and published by instructors', relationships: 'Belongs to Instructor; has many Lessons, Enrollments', primaryKey: 'course_id', keyFields: ['title', 'description', 'price', 'status', 'published_at'] },
      { name: 'Lessons', purpose: 'Individual content units within a course', relationships: 'Belongs to Course', primaryKey: 'lesson_id', keyFields: ['title', 'content_type', 'content_url', 'order', 'duration_mins'] },
      { name: 'Students', purpose: 'Learner profiles and progress records', relationships: 'Belongs to User; has many Enrollments, Submissions', primaryKey: 'student_id', keyFields: ['bio', 'learning_goals', 'total_completed'] },
      { name: 'Enrollments', purpose: 'Student registration and access records per course', relationships: 'Belongs to Student; belongs to Course', primaryKey: 'enrollment_id', keyFields: ['enrolled_at', 'completed_at', 'progress_pct', 'certificate_issued'] },
      { name: 'Assignments', purpose: 'Graded tasks and project submissions', relationships: 'Belongs to Course; has many Submissions', primaryKey: 'assignment_id', keyFields: ['title', 'instructions', 'due_date', 'max_points'] },
      { name: 'Quizzes', purpose: 'Knowledge assessments with scored outcomes', relationships: 'Belongs to Lesson or Course', primaryKey: 'quiz_id', keyFields: ['title', 'questions', 'pass_score', 'time_limit_mins'] },
      { name: 'Submissions', purpose: 'Student responses and instructor-graded results', relationships: 'Belongs to Assignment; belongs to Student', primaryKey: 'submission_id', keyFields: ['content', 'submitted_at', 'grade', 'feedback'] },
    ],
    openQuestions: [
      'Will courses include video content hosted on the platform or embedded from YouTube/Vimeo?',
      'Is live or synchronous learning (webinars, live sessions) in scope for launch?',
      'Should completion certificates be automatically generated and emailed?',
      'Will the platform use a freemium model, paid enrollment, or institutional subscription?',
      'Is multi-language course content support required from launch?',
      'Should the platform integrate with an external video conferencing tool?',
    ],
    frCategories: [
      { label: 'Authentication', prefix: 'AUTH' },
      { label: 'Course Management', prefix: 'CRS' },
      { label: 'Enrollment & Access', prefix: 'ENR' },
      { label: 'Content Delivery', prefix: 'CDL' },
      { label: 'Assignments & Quizzes', prefix: 'ASN' },
      { label: 'Progress Tracking', prefix: 'PROG' },
      { label: 'Administration', prefix: 'ADMIN' },
    ],
    domainRisks: [
      { title: 'Video content delivery latency causing poor learner experience', impact: 'High', likelihood: 'Medium', mitigation: 'Use a CDN for video delivery and implement adaptive bitrate streaming.', owner: 'Development Team' },
      { title: 'Academic dishonesty in timed quiz submissions', impact: 'Medium', likelihood: 'High', mitigation: 'Randomize question order, enforce time limits, and restrict clipboard actions in the quiz interface.', owner: 'Product Owner' },
      { title: 'Low course completion rates impacting platform reputation', impact: 'Medium', likelihood: 'High', mitigation: 'Build progress reminders, learning streaks, and completion milestones into the experience.', owner: 'Product Owner' },
      { title: 'Inconsistent instructor content quality before review workflows exist', impact: 'Medium', likelihood: 'Medium', mitigation: 'Add a content review and approval step before courses are published to the catalog.', owner: 'Content Team' },
      { title: 'Concurrent exam sessions overloading the submission service', impact: 'High', likelihood: 'Low', mitigation: 'Load-test quiz submission endpoints and use optimistic locking for grade recording.', owner: 'Development Team' },
    ],
  },

  hospital: {
    domainType: 'hospital',
    industryLabel: 'Healthcare / Medical Services',
    primaryWorkflows: [
      'Patient registration and profile management',
      'Appointment scheduling and confirmation',
      'Medical record creation and access',
      'Prescription issuance and tracking',
      'Billing generation and payment recording',
    ],
    coreEntities: [
      { name: 'Patients', purpose: 'Patient demographics and identity records', relationships: 'Has many Appointments, MedicalRecords, Prescriptions', primaryKey: 'patient_id', keyFields: ['name', 'date_of_birth', 'contact', 'insurance_id', 'blood_type'] },
      { name: 'Doctors', purpose: 'Physician profiles and scheduling data', relationships: 'Has many Appointments; belongs to Department', primaryKey: 'doctor_id', keyFields: ['name', 'specialization', 'license_no', 'availability', 'dept_id'] },
      { name: 'Appointments', purpose: 'Scheduled consultations and visit records', relationships: 'Belongs to Patient; belongs to Doctor', primaryKey: 'appointment_id', keyFields: ['scheduled_at', 'status', 'type', 'notes', 'duration_mins'] },
      { name: 'MedicalRecords', purpose: 'Clinical notes, diagnoses, and visit summaries', relationships: 'Belongs to Patient; belongs to Doctor', primaryKey: 'record_id', keyFields: ['diagnosis', 'treatment_notes', 'recorded_at', 'attachments'] },
      { name: 'Prescriptions', purpose: 'Medication orders issued by physicians', relationships: 'Belongs to Appointment; belongs to Patient', primaryKey: 'prescription_id', keyFields: ['medications', 'dosage', 'issued_at', 'valid_until'] },
      { name: 'Departments', purpose: 'Hospital departments and area specializations', relationships: 'Has many Doctors', primaryKey: 'dept_id', keyFields: ['name', 'head_doctor_id', 'floor', 'contact'] },
      { name: 'Billing', purpose: 'Invoices and payment records per appointment', relationships: 'Belongs to Patient; linked to Appointment', primaryKey: 'bill_id', keyFields: ['amount', 'insurance_claim', 'status', 'issued_at', 'paid_at'] },
    ],
    openQuestions: [
      'Which healthcare compliance standards apply (HIPAA, HL7, GDPR, local regulations)?',
      'Will the system integrate with an existing Electronic Health Record (EHR) platform?',
      'Should patients be able to self-schedule appointments through the portal?',
      'Is telemedicine or video consultation support required at launch?',
      'How long must medical records be retained, and what are the archival requirements?',
      'Will the platform handle insurance billing and claims submission directly?',
    ],
    frCategories: [
      { label: 'Authentication', prefix: 'AUTH' },
      { label: 'Patient Management', prefix: 'PAT' },
      { label: 'Appointment Scheduling', prefix: 'APT' },
      { label: 'Medical Records', prefix: 'MED' },
      { label: 'Prescription Management', prefix: 'RX' },
      { label: 'Billing', prefix: 'BILL' },
      { label: 'Administration', prefix: 'ADMIN' },
    ],
    domainRisks: [
      { title: 'Unauthorized access to patient medical records', impact: 'High', likelihood: 'Medium', mitigation: 'Enforce role-based record-level access control and full audit logging on all PHI access.', owner: 'Security Lead' },
      { title: 'Appointment scheduling conflicts and simultaneous double-booking', impact: 'High', likelihood: 'Medium', mitigation: 'Implement transactional slot locking and real-time availability checks before confirmation.', owner: 'Development Team' },
      { title: 'Loss or corruption of critical medical records', impact: 'High', likelihood: 'Low', mitigation: 'Enable automated daily backups with point-in-time recovery and test restore procedures quarterly.', owner: 'Infrastructure Team' },
      { title: 'Regulatory non-compliance with healthcare data laws', impact: 'High', likelihood: 'Low', mitigation: 'Conduct a compliance review before launch and engage a healthcare compliance consultant.', owner: 'Legal / Compliance' },
      { title: 'System downtime disrupting care coordination and scheduling', impact: 'High', likelihood: 'Low', mitigation: 'Design for 99.9% uptime with database failover and an offline scheduling fallback.', owner: 'Infrastructure Team' },
    ],
  },

  booking: {
    domainType: 'booking',
    industryLabel: 'Booking & Reservation Services',
    primaryWorkflows: [
      'Service catalog browsing',
      'Real-time availability checking',
      'Appointment booking and confirmation',
      'Payment deposit or full payment',
      'Cancellation and rescheduling',
    ],
    coreEntities: [
      { name: 'Clients', purpose: 'Customer profiles and booking history', relationships: 'Belongs to User; has many Appointments', primaryKey: 'client_id', keyFields: ['name', 'email', 'phone', 'preferences', 'total_bookings'] },
      { name: 'Providers', purpose: 'Service provider profiles and scheduling', relationships: 'Has many Services, Appointments, Availability slots', primaryKey: 'provider_id', keyFields: ['name', 'bio', 'specializations', 'rating', 'verified'] },
      { name: 'Services', purpose: 'Bookable service offerings with pricing and duration', relationships: 'Belongs to Provider', primaryKey: 'service_id', keyFields: ['name', 'duration_mins', 'price', 'category', 'description'] },
      { name: 'Availability', purpose: 'Provider schedule slots and blocked times', relationships: 'Belongs to Provider', primaryKey: 'slot_id', keyFields: ['date', 'start_time', 'end_time', 'is_available', 'recurring_rule'] },
      { name: 'Appointments', purpose: 'Confirmed booking records', relationships: 'Belongs to Client; belongs to Provider; belongs to Service', primaryKey: 'appointment_id', keyFields: ['scheduled_at', 'status', 'notes', 'confirmation_code'] },
      { name: 'Payments', purpose: 'Booking deposits and full payment records', relationships: 'Belongs to Appointment', primaryKey: 'payment_id', keyFields: ['amount', 'method', 'status', 'refunded_at', 'created_at'] },
      { name: 'Reviews', purpose: 'Client ratings and written feedback on providers', relationships: 'Belongs to Client; belongs to Provider', primaryKey: 'review_id', keyFields: ['rating', 'comment', 'appointment_id', 'created_at'] },
    ],
    openQuestions: [
      'Will providers manage their own availability, or will admins configure it centrally?',
      'Should customers be able to book without creating an account?',
      'Is a deposit or full payment required at the time of booking?',
      'What is the cancellation and refund policy, and should it be enforced automatically?',
      'Will the system send automated reminders via SMS and email before appointments?',
      'Should the platform support group bookings or only individual appointments?',
    ],
    frCategories: [
      { label: 'Authentication', prefix: 'AUTH' },
      { label: 'Service Catalog', prefix: 'SVC' },
      { label: 'Appointment Booking', prefix: 'BOOK' },
      { label: 'Availability Management', prefix: 'AVAIL' },
      { label: 'Payment Processing', prefix: 'PAY' },
      { label: 'Notifications', prefix: 'NOTIF' },
      { label: 'Administration', prefix: 'ADMIN' },
    ],
    domainRisks: [
      { title: 'Double-booking when two users claim the same slot simultaneously', impact: 'High', likelihood: 'Medium', mitigation: 'Use database-level locks or optimistic concurrency control when reserving availability slots.', owner: 'Development Team' },
      { title: 'High no-show rate reducing provider revenue', impact: 'Medium', likelihood: 'High', mitigation: 'Enforce deposit collection at booking and send automated reminders 24 and 1 hour before appointments.', owner: 'Product Owner' },
      { title: 'Payment refund disputes from last-minute cancellations', impact: 'Medium', likelihood: 'Medium', mitigation: 'Define a clear cancellation policy in the booking UI and automate refund logic based on lead time.', owner: 'Development Team' },
      { title: 'Provider availability data becoming stale between page loads', impact: 'High', likelihood: 'Medium', mitigation: 'Refresh slot availability at checkout confirmation and display a clear "slot taken" message if needed.', owner: 'Development Team' },
      { title: 'Low provider onboarding rate delaying marketplace growth', impact: 'Medium', likelihood: 'Medium', mitigation: 'Simplify the provider registration flow to under five minutes with an onboarding checklist.', owner: 'Product Owner' },
    ],
  },

  crm: {
    domainType: 'crm',
    industryLabel: 'CRM / Sales Management',
    primaryWorkflows: [
      'Lead capture and qualification',
      'Deal pipeline management',
      'Contact and company management',
      'Activity and interaction logging',
      'Sales forecasting and reporting',
    ],
    coreEntities: [
      { name: 'Contacts', purpose: 'Individual people in the sales network', relationships: 'Belongs to Company; has many Deals, Activities, Notes', primaryKey: 'contact_id', keyFields: ['name', 'email', 'phone', 'title', 'source', 'created_at'] },
      { name: 'Companies', purpose: 'Organizations associated with contacts and deals', relationships: 'Has many Contacts, Deals', primaryKey: 'company_id', keyFields: ['name', 'industry', 'size', 'website', 'annual_revenue'] },
      { name: 'Leads', purpose: 'Unqualified prospects awaiting conversion', relationships: 'Converts to Contact and Deal upon qualification', primaryKey: 'lead_id', keyFields: ['name', 'email', 'source', 'status', 'score', 'created_at'] },
      { name: 'Deals', purpose: 'Sales opportunities tracked through pipeline stages', relationships: 'Belongs to Contact; assigned to Pipeline stage; owned by User', primaryKey: 'deal_id', keyFields: ['title', 'value', 'stage', 'close_date', 'probability', 'owner_id'] },
      { name: 'Activities', purpose: 'Calls, emails, and meetings logged against contacts and deals', relationships: 'Belongs to Contact or Deal; created by User', primaryKey: 'activity_id', keyFields: ['type', 'notes', 'scheduled_at', 'completed_at', 'outcome'] },
      { name: 'Pipelines', purpose: 'Configurable deal stage workflows for the sales process', relationships: 'Has many Deals', primaryKey: 'pipeline_id', keyFields: ['name', 'stages', 'is_default', 'created_at'] },
      { name: 'Notes', purpose: 'Free-form contextual notes on contacts and deals', relationships: 'Belongs to Contact or Deal; created by User', primaryKey: 'note_id', keyFields: ['content', 'created_by', 'created_at', 'pinned'] },
    ],
    openQuestions: [
      'Will the CRM integrate with external email providers (Gmail, Outlook) for activity sync?',
      'Should lead scoring be automated based on engagement or demographic signals?',
      'Is territory or team-based deal assignment and visibility required?',
      'Will the platform integrate with marketing automation or email campaign tools?',
      'Should the CRM expose a public API for third-party integrations?',
      'Is sales forecasting and quota tracking required for sales managers?',
    ],
    frCategories: [
      { label: 'Authentication', prefix: 'AUTH' },
      { label: 'Contact Management', prefix: 'CONT' },
      { label: 'Lead Tracking', prefix: 'LEAD' },
      { label: 'Deal Management', prefix: 'DEAL' },
      { label: 'Pipeline Management', prefix: 'PIPE' },
      { label: 'Activity Logging', prefix: 'ACT' },
      { label: 'Reporting', prefix: 'RPT' },
    ],
    domainRisks: [
      { title: 'Duplicate contact and lead records degrading data quality', impact: 'High', likelihood: 'High', mitigation: 'Implement email-based deduplication on import and provide merge workflows in the admin UI.', owner: 'Development Team' },
      { title: 'Low sales team adoption after platform rollout', impact: 'High', likelihood: 'Medium', mitigation: 'Minimize mandatory fields, add mobile-friendly quick-log views, and run training sessions at launch.', owner: 'Product Owner' },
      { title: 'Data migration complexity from legacy CRM systems', impact: 'Medium', likelihood: 'High', mitigation: 'Build a CSV import tool with field mapping and validation preview before go-live.', owner: 'Development Team' },
      { title: 'Sensitive deal and pipeline data accessible to unauthorized users', impact: 'High', likelihood: 'Low', mitigation: 'Implement record-level ownership and team-based visibility controls from the architecture phase.', owner: 'Security Lead' },
      { title: 'Pipeline reports inaccurate due to stale deal stages', impact: 'Medium', likelihood: 'Medium', mitigation: 'Add stage-transition timestamps and enforce required fields when moving deals between stages.', owner: 'Development Team' },
    ],
  },

  saas: {
    domainType: 'saas',
    industryLabel: 'SaaS / Multi-Tenant Application',
    primaryWorkflows: [
      'Tenant onboarding and workspace setup',
      'Subscription plan selection and billing',
      'Feature access enforcement by plan tier',
      'User invitation and role assignment',
      'Invoice generation and payment management',
    ],
    coreEntities: [
      { name: 'Organizations', purpose: 'Top-level tenant accounts with isolated data boundaries', relationships: 'Has many Users, Subscriptions, AuditLogs', primaryKey: 'org_id', keyFields: ['name', 'slug', 'plan_id', 'created_at', 'status'] },
      { name: 'Users', purpose: 'Individual accounts within an organization', relationships: 'Belongs to Organization; has many Roles', primaryKey: 'user_id', keyFields: ['email', 'name', 'role', 'last_login', 'invited_by'] },
      { name: 'Plans', purpose: 'Subscription tier definitions with feature limits and pricing', relationships: 'Has many Subscriptions', primaryKey: 'plan_id', keyFields: ['name', 'price_monthly', 'price_annual', 'feature_flags', 'user_limit'] },
      { name: 'Subscriptions', purpose: 'Active plan subscriptions per organization', relationships: 'Belongs to Organization; belongs to Plan', primaryKey: 'subscription_id', keyFields: ['status', 'billing_cycle', 'renews_at', 'cancelled_at', 'trial_ends_at'] },
      { name: 'Invoices', purpose: 'Billing records and payment history', relationships: 'Belongs to Organization', primaryKey: 'invoice_id', keyFields: ['amount', 'status', 'issued_at', 'paid_at', 'pdf_url'] },
      { name: 'Features', purpose: 'Feature flags and rollout configuration per plan or tenant', relationships: 'Referenced by Plans and Organizations', primaryKey: 'feature_id', keyFields: ['key', 'enabled', 'plan_tiers', 'rollout_pct'] },
      { name: 'AuditLogs', purpose: 'Immutable security and configuration event records', relationships: 'Belongs to Organization; references User', primaryKey: 'log_id', keyFields: ['event_type', 'actor_id', 'resource', 'changes', 'ip_address', 'timestamp'] },
    ],
    openQuestions: [
      'Will tenants be fully isolated at the database level, or will a shared schema with row-level security be used?',
      'Which billing provider will manage subscriptions (Stripe Billing, Paddle, Chargebee)?',
      'Should a free trial period be offered, and what are the conversion touchpoints?',
      'Will the platform support SSO/SAML for enterprise tenants?',
      'Is a self-serve plan upgrade and downgrade flow required from day one?',
      'Should usage-based metering be tracked alongside flat-rate plan billing?',
    ],
    frCategories: [
      { label: 'Authentication & SSO', prefix: 'AUTH' },
      { label: 'Organization Management', prefix: 'ORG' },
      { label: 'Subscription & Billing', prefix: 'SUB' },
      { label: 'Feature Access Control', prefix: 'FEAT' },
      { label: 'User Management', prefix: 'USR' },
      { label: 'API & Integrations', prefix: 'API' },
      { label: 'Administration', prefix: 'ADMIN' },
    ],
    domainRisks: [
      { title: 'Tenant data cross-contamination in a shared database schema', impact: 'High', likelihood: 'Low', mitigation: 'Enforce org_id row-level security policies on all multi-tenant tables and add isolation integration tests.', owner: 'Development Team' },
      { title: 'Subscription billing failures causing unexpected service interruption', impact: 'High', likelihood: 'Medium', mitigation: 'Implement webhook retry handling, grace periods for failed payments, and dunning email sequences.', owner: 'Development Team' },
      { title: 'Feature flag misconfiguration exposing premium features to lower-tier tenants', impact: 'Medium', likelihood: 'Medium', mitigation: 'Audit feature gating logic in code review and add automated tests per plan tier.', owner: 'Development Team' },
      { title: 'Enterprise customers demanding custom SLA guarantees not yet defined', impact: 'Medium', likelihood: 'Medium', mitigation: 'Define SLA tiers in the product plan before sales engagement and build uptime monitoring from day one.', owner: 'Product Owner' },
      { title: 'API rate limit abuse by high-volume tenants degrading service for others', impact: 'Medium', likelihood: 'High', mitigation: 'Implement per-tenant rate limiting at the API gateway layer and expose usage dashboards.', owner: 'Development Team' },
    ],
  },

  generic: {
    domainType: 'generic',
    industryLabel: 'Web Application',
    primaryWorkflows: [
      'User registration and authentication',
      'Core workflow execution',
      'Content creation and management',
      'Administration and oversight',
      'Reporting and data export',
    ],
    coreEntities: [
      { name: 'Users', purpose: 'Registered accounts and authentication identities', relationships: 'Has many records in core domain tables', primaryKey: 'user_id', keyFields: ['email', 'name', 'role', 'created_at', 'last_login'] },
      { name: 'Roles', purpose: 'Authorization groups defining user permissions', relationships: 'Has many Users', primaryKey: 'role_id', keyFields: ['name', 'permissions', 'created_at'] },
      { name: 'CoreRecords', purpose: 'Primary domain entities derived from project requirements', relationships: 'Belongs to User; linked to related entities', primaryKey: 'record_id', keyFields: ['title', 'status', 'created_by', 'created_at', 'updated_at'] },
      { name: 'Notifications', purpose: 'System-generated messages delivered in-app or by email', relationships: 'Belongs to User (recipient)', primaryKey: 'notification_id', keyFields: ['type', 'title', 'body', 'read_at', 'created_at'] },
      { name: 'AuditLogs', purpose: 'Immutable record of key user and system actions', relationships: 'References User; references any resource type', primaryKey: 'log_id', keyFields: ['event_type', 'actor_id', 'resource_type', 'resource_id', 'timestamp'] },
    ],
    openQuestions: [
      'What authentication method will be used (JWT, session-based, OAuth)?',
      'What deployment environment is targeted (cloud provider, serverless, on-premise)?',
      'Are there existing internal systems this platform must integrate with?',
      'What are the expected peak concurrent user counts at launch?',
      'Should the platform support multi-language localization?',
    ],
    frCategories: [
      { label: 'Authentication', prefix: 'AUTH' },
      { label: 'Core Workflows', prefix: 'CORE' },
      { label: 'Content Management', prefix: 'CMS' },
      { label: 'User Management', prefix: 'USR' },
      { label: 'Administration', prefix: 'ADMIN' },
      { label: 'Reporting', prefix: 'RPT' },
    ],
    domainRisks: [
      { title: 'Scope expansion from requirements that were not confirmed before development', impact: 'Medium', likelihood: 'High', mitigation: 'Finalize scope before implementation begins and route new requests through a change management process.', owner: 'Project Manager' },
      { title: 'Third-party API or service unavailability affecting core features', impact: 'Medium', likelihood: 'Medium', mitigation: 'Add retry logic, circuit breakers, and fallback UI states for all external integrations.', owner: 'Development Team' },
      { title: 'Authentication or authorization vulnerabilities exposing user data', impact: 'High', likelihood: 'Low', mitigation: 'Follow OWASP authentication guidelines, enforce HTTPS, and conduct a pre-launch security review.', owner: 'Security Lead' },
      { title: 'Performance degradation under unexpected concurrent load', impact: 'Medium', likelihood: 'Medium', mitigation: 'Define performance baselines, add database indexes, and load-test critical paths before launch.', owner: 'Development Team' },
    ],
  },
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getStageText(session: Session, stageId: string): string {
  return session.timeline.find((stage) => stage.id === stageId)?.details?.trim() ?? ''
}

function cleanLine(line: string): string {
  return line
    .replace(/^[>*\-\u2022]+\s*/, '')
    .replace(/^\d+[\.)\]]\s*/, '')
    .replace(/^[^:]+:\s*/, '')
    .trim()
}

function splitItems(text: string): string[] {
  return text
    .split(/[,;/]| and /i)
    .map((item) => item.trim())
    .filter(Boolean)
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    const key = value.toLowerCase().replace(/[^\w]/g, '')
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(value)
  }
  return out
}

function collectLabeledItems(text: string, patterns: RegExp[]): string[] {
  const values: string[] = []
  for (const rawLine of text.split('\n')) {
    const trimmed = rawLine.trim()
    if (!trimmed) continue
    if (!patterns.some((pattern) => pattern.test(trimmed))) continue
    const cleaned = cleanLine(trimmed)
    if (!cleaned) continue
    values.push(...splitItems(cleaned))
  }
  return dedupe(values)
}

function collectSentences(text: string, patterns: RegExp[]): string[] {
  const values: string[] = []
  for (const rawLine of text.split('\n')) {
    const trimmed = rawLine.trim()
    if (!trimmed) continue
    if (!patterns.some((pattern) => pattern.test(trimmed))) continue
    const cleaned = cleanLine(trimmed)
    if (cleaned) values.push(cleaned)
  }
  return dedupe(values)
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}...` : text
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function countOccurrences(text: string, terms: string[]): number {
  const lower = text.toLowerCase()
  return terms.reduce((sum, term) => {
    const regex = new RegExp(escapeRegex(term), 'g')
    return sum + (lower.match(regex)?.length ?? 0)
  }, 0)
}

function detect(category: keyof typeof TECH_KEYWORDS, fallback: string, text: string): string {
  const lower = text.toLowerCase()
  const found = TECH_KEYWORDS[category].filter((term) => lower.includes(term))
  if (!found.length) return fallback
  return dedupe(found.map((term) => term.replace(/\b\w/g, (char) => char.toUpperCase()))).join(' + ')
}

function extractTechStack(text: string): TechStack {
  return {
    frontend: detect('frontend', DEFAULTS.frontend, text),
    backend: detect('backend', DEFAULTS.backend, text),
    database: detect('database', DEFAULTS.database, text),
    authentication: detect('authentication', DEFAULTS.authentication, text),
    storage: detect('storage', DEFAULTS.storage, text),
    deployment: detect('deployment', DEFAULTS.deployment, text),
  }
}

// ─── Domain Detection ─────────────────────────────────────────────────────────

function detectDomainProfile(corpus: string): DomainProfile {
  const lower = corpus.toLowerCase()

  const domainMatches: Array<[RegExp, string]> = [
    [/donat|nonprofit|charity|fundraising|ngo/, 'ngo'],
    [/e-?commerce|shopif|woocommerce|product\s+catalog|add\s+to\s+cart|order\s+fulfil|merchant|storefront/, 'ecommerce'],
    [/\blms\b|learning\s+management|course\s+enroll|lesson\s+content|quiz.*assignment|instructor.*course|student.*course/, 'lms'],
    [/\bpatient\b|\bphysician\b|\bhospital\b|medical\s+record|prescription|clinical\s+note|appointment.*doctor/, 'hospital'],
    [/booking\s+system|reservation\s+system|appointment\s+slot|availability\s+calendar|service\s+booking/, 'booking'],
    [/\bcrm\b|customer\s+relationship|lead\s+pipeline|pipeline\s+deal|sales\s+pipeline|deal\s+stage/, 'crm'],
    [/\bsaas\b|multi.?tenant|subscription.*plan|plan.*tier|feature\s+flag.*billing|tenant\s+onboarding/, 'saas'],
  ]

  for (const [pattern, domainType] of domainMatches) {
    if (pattern.test(lower)) {
      return DOMAIN_CATALOG[domainType]
    }
  }

  // Looser secondary matching
  if (/volunteer/.test(lower) && /donat|charity|nonprofit/.test(lower)) return DOMAIN_CATALOG['ngo']
  if (/cart|order/.test(lower) && /product|shop|checkout/.test(lower)) return DOMAIN_CATALOG['ecommerce']
  if (/course|lesson/.test(lower) && /student|enroll/.test(lower)) return DOMAIN_CATALOG['lms']
  if (/patient|doctor/.test(lower) && /appointment/.test(lower)) return DOMAIN_CATALOG['hospital']
  if (/booking|reservation/.test(lower) && /appointment/.test(lower)) return DOMAIN_CATALOG['booking']
  if (/lead|deal/.test(lower) && /pipeline|crm/.test(lower)) return DOMAIN_CATALOG['crm']
  if (/tenant|subscription/.test(lower) && /billing|plan/.test(lower)) return DOMAIN_CATALOG['saas']

  return DOMAIN_CATALOG['generic']
}

// ─── Assumption Classification ────────────────────────────────────────────────

function buildDefaultAssumptions(domain: DomainProfile): string[] {
  const base = [
    'PostgreSQL will be used as the primary relational database.',
    'JWT with refresh tokens will handle user authentication.',
    'The application will be deployed to a managed cloud platform.',
    'RESTful APIs will serve the frontend and any future integrations.',
    'Role-based access control will govern all protected operations.',
  ]
  const domainSpecific: Partial<Record<DomainProfile['domainType'], string[]>> = {
    ngo: ['A third-party payment provider will process donations.', 'Transactional email will be sent via a managed SMTP service.'],
    ecommerce: ['A payment gateway SDK will handle PCI compliance.', 'Product images will be stored in object storage with CDN delivery.'],
    lms: ['Video content will be embedded from an external platform (YouTube or Vimeo).', 'Course completion certificates will be generated server-side.'],
    hospital: ['The system must comply with applicable healthcare data regulations.', 'All patient data will be encrypted at rest and in transit.'],
    booking: ['Provider availability is managed per calendar day.', 'Payment holds or deposits may be captured at booking time.'],
    crm: ['Contact records will be the central entity linking all CRM data.', 'Activity logs will be linked to both contacts and deals.'],
    saas: ['Each tenant will have an isolated data namespace via row-level security.', 'Subscription billing will be delegated to a third-party billing platform.'],
  }
  return [...base, ...(domainSpecific[domain.domainType] ?? [])]
}

function buildClassifiedAssumptions(assumptions: string[], allText: string, domainProfile: DomainProfile): ClassifiedAssumption[] {
  const lower = allText.toLowerCase()
  const source = assumptions.length > 0 ? assumptions : buildDefaultAssumptions(domainProfile)

  const confirmedKeywords: Array<[RegExp, RegExp]> = [
    [/postgresql|postgres/, /postgresql|postgres/],
    [/\bjwt\b/, /\bjwt\b|json\s+web\s+token/],
    [/firebase/, /firebase/],
    [/mongodb/, /mongodb/],
    [/\bredis\b/, /\bredis\b/],
    [/next\.?js/, /next\.?js/],
    [/typescript/, /typescript/],
    [/docker/, /docker/],
    [/stripe/, /stripe/],
    [/vercel/, /vercel/],
  ]

  const highConfidencePatterns: RegExp[] = [
    /cloud|hosted|deploy/,
    /rest\s*api|restful/,
    /node|express|backend\s+api/,
    /single\s+page|spa|client.?side/,
    /relational|sql\s+database/,
  ]

  return source.map((label): ClassifiedAssumption => {
    const labelLower = label.toLowerCase()
    for (const [labelPattern, textPattern] of confirmedKeywords) {
      if (labelPattern.test(labelLower) && textPattern.test(lower)) {
        return { label, confidence: 'confirmed', confidencePercent: 100 }
      }
    }
    if (highConfidencePatterns.some((p) => p.test(labelLower))) {
      return { label, confidence: 'high', confidencePercent: 85 }
    }
    return { label, confidence: 'low', confidencePercent: 52 }
  })
}

// ─── Structured Risks ─────────────────────────────────────────────────────────

function buildGenericMitigation(risk: string): string {
  const lower = risk.toLowerCase()
  if (lower.includes('scale') || lower.includes('performance')) return 'Define performance baselines early, implement caching, and load-test before launch.'
  if (lower.includes('security') || lower.includes('breach') || lower.includes('access')) return 'Apply validation, RBAC, and encryption from the first sprint; schedule a pre-launch security review.'
  if (lower.includes('integrat') || lower.includes('api') || lower.includes('depend')) return 'Add retry logic, circuit breakers, and fallback states for all external dependencies.'
  if (lower.includes('scope') || lower.includes('requirement')) return 'Lock requirements before development begins and manage new requests through a formal change process.'
  return 'Track this risk in the project register and verify the mitigation is in place before release.'
}

function buildStructuredRisks(domainProfile: DomainProfile, parsedRisks: string[]): RiskItem[] {
  const domainRisks = [...domainProfile.domainRisks]
  const sessionRisks: RiskItem[] = parsedRisks
    .filter((risk) => risk.length > 10)
    .slice(0, 2)
    .map((title): RiskItem => ({
      title,
      impact: title.toLowerCase().includes('security') || title.toLowerCase().includes('data') ? 'High' : 'Medium',
      likelihood: 'Medium',
      mitigation: buildGenericMitigation(title),
      owner: title.toLowerCase().includes('security') ? 'Security Lead' : 'Development Team',
    }))

  const allTitles = dedupe([...domainRisks, ...sessionRisks].map((r) => r.title))
  return allTitles
    .map((title) => [...domainRisks, ...sessionRisks].find((r) => r.title === title)!)
    .filter(Boolean)
    .slice(0, 6)
}

// ─── Security Categories ──────────────────────────────────────────────────────

function buildSecurityCategories(securityRecommendations: string[], allText: string, domainProfile: DomainProfile): SecurityCategory[] {
  const lower = allText.toLowerCase()
  const hasPayment = /payment|donat|checkout|stripe|paypal/.test(lower)
  const hasFileUpload = /upload|file|image|media|storage/.test(lower)
  const hasSensitiveData = /patient|medical|personal\s+data|phi|pii|gdpr|hipaa/.test(lower)

  const categories: SecurityCategory[] = [
    {
      category: 'Authentication',
      recommendations: [
        'Enforce strong password requirements (minimum 12 characters with complexity).',
        'Use short-lived access tokens (15-60 minutes) paired with secure refresh token rotation.',
        ...(domainProfile.domainType === 'saas' ? ['Support SAML/SSO for enterprise tenant authentication.'] : []),
      ],
    },
    {
      category: 'Authorization',
      recommendations: [
        'Enforce role-based access control on every protected API endpoint.',
        'Validate permissions server-side; never rely on client-side role checks alone.',
        ...(hasSensitiveData ? ['Apply record-level access control for sensitive documents and personal health information.'] : []),
      ],
    },
    {
      category: 'Input Validation',
      recommendations: [
        'Validate and sanitize all user input on the server before processing or storing.',
        'Use parameterized queries or an ORM to prevent SQL injection.',
        'Reject unexpected content types and file extensions at the upload endpoint.',
      ],
    },
    {
      category: 'Rate Limiting',
      recommendations: [
        'Apply rate limits to authentication endpoints to prevent brute-force attacks.',
        'Rate-limit public API endpoints to prevent scraping and abuse.',
        ...(hasPayment ? ['Apply stricter rate limits to payment and donation submission endpoints.'] : []),
      ],
    },
    {
      category: 'Secrets Management',
      recommendations: [
        'Store all secrets (API keys, database credentials) in environment variables or a dedicated secrets manager.',
        'Never commit credentials or tokens to version control.',
        'Rotate secrets on a defined schedule and immediately upon any suspected exposure.',
      ],
    },
    {
      category: 'Data Encryption',
      recommendations: [
        'Enforce HTTPS on all connections; redirect HTTP to HTTPS.',
        ...(hasSensitiveData
          ? ['Encrypt sensitive fields at rest (personal data, health records, financial information).']
          : ['Encrypt sensitive fields at rest (passwords, payment tokens).']),
        ...(hasFileUpload ? ['Scan uploaded files for malware before storing or serving them.'] : []),
      ],
    },
    {
      category: 'Audit Logging',
      recommendations: [
        'Log all authentication events (sign-in, sign-out, failed attempts) with timestamps and IP addresses.',
        'Record administrative actions (role changes, deletions, configuration updates) in an immutable audit trail.',
        ...(hasSensitiveData ? ['Log all access to sensitive records for compliance and forensic review.'] : []),
      ],
    },
  ]

  const coveredText = categories.flatMap((c) => c.recommendations).join(' ').toLowerCase()
  const uncovered = securityRecommendations.filter((r) => !coveredText.includes(r.toLowerCase().slice(0, 20)))
  if (uncovered.length > 0) {
    categories.push({ category: 'Additional Controls', recommendations: uncovered.slice(0, 3) })
  }

  return categories
}

// ─── Service Graph ────────────────────────────────────────────────────────────

function buildServiceGraph(tech: TechStack, text: string): { services: Service[]; connections: [number, number][] } {
  const lower = text.toLowerCase()
  const names = new LinkedSet<string>()

  names.add('User')
  names.add('Frontend')
  names.add('API Gateway')

  if (lower.includes('mobile')) names.add('Mobile Client')
  if (lower.includes('admin') || lower.includes('dashboard')) names.add('Admin Dashboard')

  for (const [term, service] of FEATURE_SERVICE_MAP) {
    if (lower.includes(term)) names.add(service)
  }

  if (lower.includes('cdn') || lower.includes('cloudfront') || lower.includes('storage')) {
    names.add('Storage')
  }
  if (lower.includes('cache') || lower.includes('redis')) {
    names.add('Cache')
  }
  if (lower.includes('queue') || lower.includes('message bus')) {
    names.add('Queue')
  }

  const dbLower = tech.database.toLowerCase()
  if (dbLower.includes('postgres') || dbLower.includes('mysql') || dbLower.includes('mongo') || dbLower.includes('sqlite')) {
    names.add('Database')
  }

  const LAYER_MAP: Record<string, ServiceLayer> = {
    User: 0, Frontend: 0, 'Mobile Client': 0, 'Admin Dashboard': 0,
    'API Gateway': 1, 'Auth Service': 1, Storage: 1,
    Cache: 3, Queue: 3, Database: 3,
    'Search Service': 2, 'Notification Service': 2, 'Payment Service': 2,
    'Analytics Service': 2, 'Chat Service': 2, 'Content Service': 2,
    'File Service': 2, 'Report Service': 2, 'User Service': 2,
  }

  const services: Service[] = [...names].slice(0, 10).map((name) => ({
    name,
    layer: LAYER_MAP[name] ?? 2,
  }))

  const connections: [number, number][] = []
  for (let index = 0; index < services.length - 1; index += 1) {
    if (services[index].layer < services[index + 1].layer) {
      connections.push([index, index + 1])
    }
  }

  return { services, connections }
}

// ─── Estimate Functions ───────────────────────────────────────────────────────

/** Try to extract an explicit numeric estimate from AI text. */
function tryExtractCount(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const num = parseInt(match[1], 10)
      if (!isNaN(num) && num > 0) return num
    }
  }
  return null
}

function estimateDevTime(text: string, config?: WizardTechConfig): string {
  const explicit = text.match(/(?:development\s+)?(?:time|effort|timeline):\s*(.+?)(?=\n|$)/i)
  if (explicit) {
    const value = explicit[1].trim()
    if (/(weeks?|months?|days?|hours?|sprints?|quarters?)/i.test(value)) return value
  }

  const scope = config?.scope
  if (scope === 'frontend') return '2-4 weeks'
  if (scope === 'backend') return '3-5 weeks'
  return '4-6 weeks'
}

function deriveComplexity(recommendationCount: number): 'Low' | 'Medium' | 'High' {
  if (recommendationCount > 15) return 'High'
  if (recommendationCount > 7) return 'Medium'
  return 'Low'
}

function deriveProjectScale(metrics: ArchitectureData['metrics'], recommendationCount: number): 'Small' | 'Medium' | 'Large' {
  if (metrics.estimatedFiles > 35 || metrics.estimatedServices > 5 || recommendationCount > 16) return 'Large'
  if (metrics.estimatedFiles > 20 || metrics.estimatedServices > 3 || recommendationCount > 8) return 'Medium'
  return 'Small'
}

// ─── Derivation Functions ─────────────────────────────────────────────────────

function deriveSummary(session: Session, allText: string, requirementsText: string, architectureText: string): string {
  const candidates = [
    ...collectSentences(allText, [/summary/i, /overview/i]),
    ...collectSentences(requirementsText, [/summary/i]),
    ...collectSentences(architectureText, [/summary/i]),
  ]
  if (candidates.length > 0) return truncate(candidates[0].replace(/^summary\s*[:\-]?\s*/i, ''), 120)
  const firstUsefulLine = collectSentences(requirementsText || architectureText || allText, [/./]).find(Boolean)
  if (firstUsefulLine) return truncate(firstUsefulLine, 120)
  return truncate(`Architecture blueprint for ${session.title}.`, 120)
}

function deriveProjectName(session: Session, allText: string): string {
  const explicit = allText.match(/project name[:\s]+(.+)/i)
  if (explicit) return truncate(explicit[1].trim(), 60)
  return truncate(session.title, 60)
}

function derivePattern(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('microservice')) return 'Microservices Architecture'
  if (lower.includes('event-driven') || lower.includes('event driven')) return 'Event-Driven Architecture'
  if (lower.includes('layered')) return 'Layered Architecture'
  if (lower.includes('modular monolith')) return 'Modular Monolith'
  if (lower.includes('feature-based') || lower.includes('feature based')) return 'Feature-Based Architecture'
  if (lower.includes('serverless')) return 'Serverless Architecture'
  return 'Feature-Based Architecture'
}

function deriveArrayFromStage(text: string, keywords: RegExp[]): string[] {
  return collectLabeledItems(text, keywords).slice(0, 6)
}

function deriveMissingInformation(clarificationText: string, requirementsText: string): string[] {
  const direct = collectSentences(clarificationText, [/missing/i, /unclear/i, /undefined/i, /not specified/i, /tbd/i, /needs confirmation/i, /need/i])
  const fallback = collectSentences(requirementsText, [/authentication/i, /payment/i, /storage/i, /deployment/i, /database/i, /hosting/i])
  return dedupe([...direct, ...fallback]).slice(0, 5)
}

function deriveConflicts(clarificationText: string, allText: string): string[] {
  const direct = collectSentences(clarificationText, [/conflict/i, /incompatible/i, /contradict/i, /warning/i, /cannot/i, /impossible/i, /unsupported/i])
  if (direct.length > 0) return direct.slice(0, 5)
  const fallback = collectSentences(allText, [/offline/i, /firebase hosting/i, /kubernetes/i, /kafka/i, /terraform/i])
  return fallback.slice(0, 5)
}

function deriveAssumptions(clarificationText: string, requirementsText: string, allText: string): string[] {
  const values = dedupe([
    ...collectSentences(clarificationText, [/assum/i, /inferred/i]),
    ...collectSentences(requirementsText, [/assum/i, /inferred/i]),
    ...collectSentences(allText, [/assum/i, /inferred/i]),
  ])
  return values.slice(0, 5)
}

function deriveRisks(securityText: string, clarificationText: string, allText: string): string[] {
  const values = dedupe([
    ...collectSentences(securityText, [/risk/i, /threat/i, /concern/i, /limit/i, /bottleneck/i]),
    ...collectSentences(clarificationText, [/risk/i, /threat/i, /concern/i, /limit/i]),
    ...collectSentences(allText, [/risk/i, /threat/i, /concern/i, /limit/i, /scale/i, /rate limit/i]),
  ])
  return values.slice(0, 5)
}

function deriveSecurityRecommendations(securityText: string, allText: string): string[] {
  const values = collectLabeledItems(securityText, [/auth/i, /authorization/i, /validation/i, /rate limit/i, /https/i, /secrets/i, /encryption/i, /csrf/i, /csp/i, /owasp/i])
  if (values.length > 0) return values.slice(0, 5)
  const fallback = collectLabeledItems(allText, [/auth/i, /authorization/i, /validation/i, /rate limit/i, /https/i, /secrets/i, /encryption/i])
  return dedupe(fallback).slice(0, 5)
}

function deriveDatabaseSummary(databaseText: string, tech: TechStack, features: string[], roles: string[], estimatedTables: number): DatabaseSummary {
  const typeMatch = databaseText.match(/database(?: type)?:\s*(.+?)(?=\n|$)/i)
  const type = typeMatch?.[1]?.trim() || tech.database.split(' + ')[0] || 'PostgreSQL'
  const entities = collectLabeledItems(databaseText, [/entities/i, /tables/i, /models?/i, /collections?/i])
  const relationships = collectSentences(databaseText, [/relations?/i, /relationships?/i, /foreign key/i, /many-to-many/i, /one-to-many/i])
  const fallbackEntities = dedupe([
    ...features.slice(0, 3).map((item) => item.replace(/\s+/g, ' ').trim()),
    ...roles.slice(0, 2).map((item) => `${item} Record`),
    'Users',
  ]).slice(0, 5)
  const fallbackRelationships = relationships.length > 0
    ? relationships.slice(0, 4)
    : [
        `${fallbackEntities[0] || 'Users'} -> ${fallbackEntities[1] || 'Core Records'}`,
        `${fallbackEntities[1] || 'Core Records'} -> ${fallbackEntities[2] || 'Supporting Records'}`,
      ]
  return {
    type,
    entities: entities.length > 0 ? entities.slice(0, 5) : fallbackEntities,
    relationships: fallbackRelationships,
    estimatedTables: String(Math.max(estimatedTables, entities.length || 3)),
  }
}

/** Parse per-area findings from the AI's raw architecture stage output. */
function parseArchitectureFindings(text: string): Record<string, string> {
  const result: Record<string, string> = {}
  const areas = ['Frontend', 'Backend', 'Database', 'Authentication', 'Storage', 'Deployment']
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const cleaned = trimmed.replace(/^[-*•]\s*/, '')
    for (const area of areas) {
      const match = cleaned.match(new RegExp(`^${area}\\s*[:\\-–]\\s*(.+)`, 'i'))
      if (match) {
        result[area] = match[1].trim()
        break
      }
    }
  }
  return result
}

function deriveArchitectureRecommendations(tech: TechStack, pattern: string, allText: string, architectureText?: string): ArchitectureRecommendation[] {
  const findings = architectureText ? parseArchitectureFindings(architectureText) : {}
  const hasMobile = /mobile/i.test(allText)
  const imageHeavy = /image|photo|media|upload/i.test(allText)
  const apiHeavy = /api|endpoint|integration/i.test(allText)

  return [
    {
      area: 'Frontend',
      recommended: tech.frontend,
      reason: findings.Frontend || 'Provides a component-driven UI with strong TypeScript support and a mature ecosystem.',
      alternative: hasMobile ? 'React Native' : 'Next.js with TypeScript',
      alternativeReason: findings.Frontend
        ? `Alternative to ${tech.frontend} based on project-specific needs.`
        : hasMobile
          ? 'Enables native mobile experiences from a shared React codebase.'
          : 'Adds server-side rendering and file-based routing for SEO-heavy applications.',
    },
    {
      area: 'Backend',
      recommended: tech.backend,
      reason: findings.Backend || 'Well-suited for REST API development with strong middleware and TypeScript support.',
      alternative: 'Fastify + TypeScript',
      alternativeReason: findings.Backend
        ? `Alternative to ${tech.backend} for performance-sensitive workloads.`
        : 'Higher throughput and lower overhead than Express for performance-sensitive APIs.',
    },
    {
      area: 'Database',
      recommended: tech.database,
      reason: findings.Database || 'Relational storage fits most product workflows, supports complex queries, and has strong indexing.',
      alternative: 'MongoDB',
      alternativeReason: findings.Database
        ? `Flexible document model as an alternative to ${tech.database}.`
        : 'Better suited for highly variable document structures or rapid schema iteration.',
    },
    {
      area: 'Authentication',
      recommended: tech.authentication,
      reason: findings.Authentication || 'Stateless and portable across web and API clients without server-side session storage.',
      alternative: 'Session cookies',
      alternativeReason: findings.Authentication
        ? `Server-side session alternative to ${tech.authentication}.`
        : 'Simpler revocation model for server-rendered applications with no separate API layer.',
    },
    {
      area: 'Storage',
      recommended: tech.storage,
      reason: findings.Storage || 'Decouples file storage from the application server and scales independently.',
      alternative: imageHeavy ? 'Cloudinary' : 'Firebase Storage',
      alternativeReason: findings.Storage
        ? `Alternative storage option matched to project requirements.`
        : imageHeavy
          ? 'Provides automatic resizing, format optimization, and CDN delivery for media-heavy projects.'
          : 'Integrates seamlessly with Firebase Auth and Firestore for simpler auth-gated storage.',
    },
    {
      area: 'Deployment',
      recommended: tech.deployment,
      reason: findings.Deployment || (pattern.includes('Microservices')
        ? 'Keeps services portable and independently deployable.'
        : 'Avoids orchestration complexity for modular or monolithic applications.'),
      alternative: apiHeavy ? 'Managed container hosting (ECS, Cloud Run)' : 'Vercel',
      alternativeReason: findings.Deployment
        ? `Alternative platform based on project scale and requirements.`
        : apiHeavy
          ? 'Provides autoscaling without manual Kubernetes configuration.'
          : 'Zero-config global CDN deployment for frontend-heavy applications.',
    },
  ]
}

function deriveAiRecommendations(
  projectScale: 'Small' | 'Medium' | 'Large',
  pattern: string,
  domainProfile: DomainProfile,
  allText: string,
): ToolRecommendation[] {
  const isResearchHeavy = /research|analysis|documentation\s+heavy|report\s+writing/i.test(allText)
  const isRepoRefactor = /refactor|migration|legacy\s+code|rewrite|codebase\s+cleanup/i.test(allText)
  const isLargeFullStack = projectScale === 'Large' || pattern.includes('Microservices')
  const isMediumReact = projectScale === 'Medium' && /react/i.test(allText)
  const isSmallFrontend = projectScale === 'Small'

  let recommendedTool: string
  if (isResearchHeavy) {
    recommendedTool = 'Gemini CLI'
  } else if (isRepoRefactor) {
    recommendedTool = 'Codex CLI'
  } else if (isLargeFullStack) {
    recommendedTool = 'Claude Code'
  } else if (isMediumReact) {
    recommendedTool = 'Cursor'
  } else {
    recommendedTool = isSmallFrontend ? 'Cursor' : 'Claude Code'
  }

  return [
    {
      tool: 'Claude Code',
      bestUseCase: 'Large iterative full-stack implementations',
      why: `Strong long-context multi-file reasoning for complex ${domainProfile.industryLabel} implementations.`,
      strengths: ['Long context', 'Multi-file reasoning', 'Strong iterative workflow'],
      limitations: ['Slower for small isolated edits', 'Works best with scoped prompts'],
      recommended: recommendedTool === 'Claude Code',
    },
    {
      tool: 'Codex CLI',
      bestUseCase: 'Repository-aware code changes and refactoring',
      why: `Well-suited for structured, repo-local ${domainProfile.industryLabel} codebase edits and scripted tasks.`,
      strengths: ['Direct repository edits', 'Structured task execution', 'Strong developer workflow integration'],
      limitations: ['Less interactive than IDE-first tools', 'Requires well-scoped prompts'],
      recommended: recommendedTool === 'Codex CLI',
    },
    {
      tool: 'Cursor',
      bestUseCase: 'Interactive in-editor feature development and refactors',
      why: `Excellent for fast-moving ${domainProfile.industryLabel} development directly inside the IDE.`,
      strengths: ['Inline edit suggestions', 'Fast feedback loop', 'Effective for component-level work'],
      limitations: ['Less ideal for long multi-file planning sessions', 'Editor-centric workflow'],
      recommended: recommendedTool === 'Cursor',
    },
    {
      tool: 'Gemini CLI',
      bestUseCase: 'Research-heavy workflows and broad codebase analysis',
      why: `Useful when the ${domainProfile.industryLabel} project involves extensive documentation or analysis tasks.`,
      strengths: ['Very long context window', 'Strong research support', 'Broad analysis capabilities'],
      limitations: ['Less optimized for repo-local editing', 'Workflow varies by setup'],
      recommended: recommendedTool === 'Gemini CLI',
    },
  ]
}

function deriveCompatibility(): CompatibilityItem[] {
  return [
    { label: 'React', status: 'supported', reason: 'Current generation stack already supports React output.' },
    { label: 'Tailwind', status: 'supported', reason: 'Tailwind styling fits the current UI system.' },
    { label: 'Vite', status: 'supported', reason: 'Vite project scaffolding is already in scope.' },
    { label: 'Express', status: 'supported', reason: 'Express API code is within the current generator scope.' },
    { label: 'PostgreSQL', status: 'supported', reason: 'Relational schema generation is well supported.' },
    { label: 'Docker', status: 'warning', reason: 'Container output is possible, but fully automated ops are limited.' },
    { label: 'Redis', status: 'warning', reason: 'Caching can be recommended, but not fully provisioned.' },
    { label: 'Kubernetes', status: 'unsupported', reason: 'Not part of the current generator capabilities.' },
    { label: 'Kafka', status: 'unsupported', reason: 'Event-stream scaffolding is intentionally out of scope.' },
    { label: 'Terraform', status: 'unsupported', reason: 'Infrastructure-as-code generation is out of scope.' },
  ]
}

function deriveExecutionStrategy(): string[] {
  return [
    'Finalize the architecture and assumptions.',
    'Export the blueprint in Markdown, PDF, or JSON.',
    'Implement with the recommended AI tool.',
    'Review the result against the blueprint.',
    'Return for refinement if the scope changes.',
  ]
}

function buildPhaseDescription(phase: string, domain: DomainProfile): string {
  const lower = phase.toLowerCase()
  if (lower.includes('foundation')) return `Set up the project structure, CI pipeline, and base configuration for the ${domain.industryLabel} platform.`
  if (lower.includes('auth')) return 'Implement user registration, sign-in, role assignment, and session management.'
  if (lower.includes('core') || lower.includes('feature')) return `Build the primary ${domain.primaryWorkflows[0]?.toLowerCase() ?? 'core workflows'}.`
  if (lower.includes('admin')) return 'Develop the administration panel and management interfaces.'
  if (lower.includes('hard') || lower.includes('testing')) return 'Add comprehensive test coverage, fix edge cases, and validate performance benchmarks.'
  if (lower.includes('deploy')) return 'Configure the production environment, run the go-live checklist, and hand off to operations.'
  return `Complete the ${phase} phase of the ${domain.industryLabel} project.`
}

function buildDomainRoadmap(domain: DomainProfile, scale: 'Small' | 'Medium' | 'Large'): RoadmapPhase[] {
  const domainPhases: Partial<Record<DomainProfile['domainType'], RoadmapPhase[]>> = {
    ngo: [
      { phase: 'Foundation', description: 'Configure the project stack, database, CI pipeline, and deployment environment.', milestones: ['Initialize repository', 'Set up database schema', 'Configure CI/CD'] },
      { phase: 'Authentication', description: 'Implement user registration, sign-in, social OAuth, and role-based access control.', milestones: ['User registration and login', 'Email verification', 'Role management'] },
      { phase: 'Donations & Campaigns', description: 'Build the donation flow, payment integration, receipt generation, and campaign management.', milestones: ['Campaign CRUD', 'Donation form and payment gateway', 'Receipt email generation'] },
      { phase: 'Volunteers & Events', description: 'Implement volunteer registration, approval workflow, event creation, and attendee management.', milestones: ['Volunteer registration', 'Admin approval dashboard', 'Event management'] },
      { phase: 'Content & Launch', description: 'Build the blog CMS, admin dashboard, testing, and go-live preparation.', milestones: ['Blog publishing', 'Admin dashboard', 'Testing and deployment'] },
    ],
    ecommerce: [
      { phase: 'Foundation', description: 'Set up the project structure, database schema, and deployment pipeline.', milestones: ['Initialize repository', 'Product and category schema', 'Configure CI/CD'] },
      { phase: 'Authentication', description: 'Implement customer registration, sign-in, and guest session management.', milestones: ['User registration and login', 'Guest checkout token', 'Password reset'] },
      { phase: 'Product Catalog & Cart', description: 'Build product listing, search, filtering, and cart management.', milestones: ['Product CRUD', 'Category navigation', 'Cart add/remove/update'] },
      { phase: 'Checkout & Payments', description: 'Implement the checkout flow, payment gateway integration, and order confirmation.', milestones: ['Checkout flow', 'Payment gateway integration', 'Order confirmation email'] },
      { phase: 'Order Management & Launch', description: 'Build order tracking, admin panel, reviews, and deploy to production.', milestones: ['Order status management', 'Admin dashboard', 'Reviews and ratings', 'Go-live'] },
    ],
    lms: [
      { phase: 'Foundation', description: 'Configure the stack, database, and deployment pipeline for the learning platform.', milestones: ['Initialize repository', 'User and course schema', 'Configure CI/CD'] },
      { phase: 'Authentication', description: 'Implement student and instructor registration, sign-in, and role management.', milestones: ['Student registration', 'Instructor onboarding', 'Role-based routing'] },
      { phase: 'Course Management', description: 'Build course creation, lesson authoring, content upload, and course catalog.', milestones: ['Course CRUD', 'Lesson editor', 'Content delivery'] },
      { phase: 'Enrollment & Assessments', description: 'Implement enrollment, progress tracking, assignments, and quiz submissions.', milestones: ['Enrollment flow', 'Progress tracking', 'Assignment submission', 'Quiz engine'] },
      { phase: 'Certificates & Launch', description: 'Add certificate generation, admin reporting, and deploy to production.', milestones: ['Certificate generation', 'Admin dashboard', 'Performance testing', 'Go-live'] },
    ],
    hospital: [
      { phase: 'Foundation', description: 'Set up the HIPAA-aware project structure, database, and deployment pipeline.', milestones: ['Initialize repository', 'Patient and doctor schema', 'Configure CI/CD with audit logging'] },
      { phase: 'Authentication', description: 'Implement role-specific registration flows, MFA, and session security.', milestones: ['Patient and staff registration', 'Role-based access', 'Session timeout'] },
      { phase: 'Patient & Appointment Management', description: 'Build patient registration, appointment scheduling, and availability management.', milestones: ['Patient profile CRUD', 'Doctor availability', 'Appointment booking'] },
      { phase: 'Clinical Records', description: 'Implement medical records, prescriptions, and secure document storage.', milestones: ['Medical record creation', 'Prescription management', 'Secure document upload'] },
      { phase: 'Billing & Launch', description: 'Add billing generation, patient portal payments, and prepare for go-live.', milestones: ['Invoice generation', 'Patient portal payments', 'Compliance review', 'Go-live'] },
    ],
  }

  const base: RoadmapPhase[] = [
    { phase: 'Foundation', description: `Set up the stack, folder structure, and deployment pipeline for the ${domain.industryLabel} platform.`, milestones: ['Initialize repository', 'Database schema', 'Configure CI/CD'] },
    { phase: 'Authentication', description: 'Implement user registration, sign-in, and role-based access control.', milestones: ['User registration and login', 'Role management', 'Password reset'] },
    { phase: 'Core Features', description: `Build the primary ${domain.primaryWorkflows[0]?.toLowerCase() ?? 'core workflows'}.`, milestones: ['Primary workflow', 'API endpoints', 'Data validation'] },
    { phase: scale === 'Large' ? 'Hardening' : 'Testing', description: 'Add test coverage, fix edge cases, and validate performance benchmarks.', milestones: ['Unit tests', 'Integration tests', 'Performance review'] },
    { phase: 'Deployment', description: 'Configure the production environment, run go-live checks, and hand off to operations.', milestones: ['Production environment setup', 'Security review', 'Go-live'] },
  ]

  const phases = domainPhases[domain.domainType] ?? base
  return scale === 'Small' ? phases.slice(0, 4) : phases
}

function deriveRoadmap(roadmapText: string, features: string[], projectScale: 'Small' | 'Medium' | 'Large', domainProfile: DomainProfile): RoadmapPhase[] {
  const lines = roadmapText.split('\n').filter(Boolean)
  const parsed: RoadmapPhase[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    const match = line.match(/^(foundation|authentication|core features?|admin panel|hardening|testing|deployment|phase\s*\d+)\s*[:\-]?\s*(.*)$/i)
    if (!match) continue
    const phase = match[1].replace(/^phase\s*/i, 'Phase ').trim()
    if (!phase || parsed.some((item) => item.phase.toLowerCase() === phase.toLowerCase())) continue
    parsed.push({
      phase,
      description: buildPhaseDescription(phase, domainProfile),
      milestones: match[2]
        ? splitItems(match[2]).slice(0, 4)
        : features.slice(0, 2).length > 0 ? features.slice(0, 2) : ['Implement the core workflow', 'Validate before moving on'],
    })
    if (parsed.length >= 5) break
  }

  if (parsed.length > 0) return parsed
  return buildDomainRoadmap(domainProfile, projectScale)
}

function detectShowGeneratorCompatibility(allText: string): boolean {
  return /foundryforge.*generat|code\s+generat|implementation\s+generat|scaffold|boilerplate/i.test(allText)
}

function buildInferenceConfidence(domainProfile: DomainProfile, confidence: 'high' | 'medium' | 'low'): Record<string, number> {
  const base = confidence === 'high' ? 90 : confidence === 'medium' ? 68 : 45
  return {
    'Domain Detection': domainProfile.domainType !== 'generic' ? 94 : 62,
    'Functional Requirements': base,
    'Database Entities': domainProfile.domainType !== 'generic' ? 91 : 65,
    'Risk Assessment': base - 5,
    'Technology Stack': base + 5,
    'Development Roadmap': base,
  }
}

// ─── Linked Set ───────────────────────────────────────────────────────────────

class LinkedSet<T> {
  private readonly map = new Map<T, true>()

  add(value: T): this {
    this.map.set(value, true)
    return this
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.map.keys()
  }
}

// ─── Main Parse Function ──────────────────────────────────────────────────────

export interface WizardTechConfig {
  scope?: string | null
  frontend?: string[]
  backend?: string[]
  database?: string[]
  auth?: string[]
  payment?: string | null
  storage?: string | null
  deployment?: string | null
}

/** Override AI-inferred tech stack with confirmed wizard values. */
function applyWizardTech(tech: TechStack, config?: WizardTechConfig): TechStack {
  if (!config) return tech
  const out = { ...tech }
  if (config.frontend?.length) out.frontend = config.frontend.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(' + ')
  if (config.backend?.length) out.backend = config.backend.map(v => {
    if (v === 'nestjs') return 'NestJS'
    if (v === 'spring-boot') return 'Spring Boot'
    return v.charAt(0).toUpperCase() + v.slice(1)
  }).join(' + ')
  if (config.database?.length) out.database = config.database.map(v => {
    if (v === 'postgresql') return 'PostgreSQL'
    return v.charAt(0).toUpperCase() + v.slice(1)
  }).join(' + ')
  if (config.auth?.length && !config.auth.includes('none')) {
    out.authentication = config.auth.map(v => {
      if (v === 'firebase-auth') return 'Firebase Auth'
      if (v === 'authjs') return 'Auth.js'
      return v.toUpperCase()
    }).join(' + ')
  }
  if (config.storage && config.storage !== 'none') {
    out.storage = config.storage === 'aws-s3' ? 'AWS S3' : config.storage.charAt(0).toUpperCase() + config.storage.slice(1)
  }
  if (config.deployment) {
    out.deployment = config.deployment.charAt(0).toUpperCase() + config.deployment.slice(1)
  }
  return out
}

const OUT_OF_SCOPE_AREAS = new Set(['Backend', 'Database', 'Authentication', 'Storage', 'Deployment'])
const FRONTEND_ONLY_AREAS = new Set(['Frontend'])

/** Apply scope-based overrides so out-of-scope areas show "Not Required" consistently. */
function applyScopeOverrides(data: ArchitectureData, config?: WizardTechConfig): ArchitectureData {
  const isFrontendOnly = config?.scope === 'frontend'
  const isBackendOnly = config?.scope === 'backend'

  if (isFrontendOnly) {
    return {
      ...data,
      backendStack: 'Not Required',
      database: 'Not Required',
      authentication: 'Not Required',
      storage: 'Not Required',
      deployment: 'Not Required',
      stack: {
        ...data.stack,
        Backend: ['Not Required'],
        Database: ['Not Required'],
        Authentication: ['Not Required'],
        Storage: ['Not Required'],
        Deployment: ['Not Required'],
      },
      architectureRecommendations: data.architectureRecommendations.filter(
        r => !OUT_OF_SCOPE_AREAS.has(r.area),
      ),
    }
  }

  if (isBackendOnly) {
    return {
      ...data,
      frontendStack: 'Not Required',
      stack: {
        ...data.stack,
        Frontend: ['Not Required'],
      },
      architectureRecommendations: data.architectureRecommendations.filter(
        r => !FRONTEND_ONLY_AREAS.has(r.area),
      ),
    }
  }

  return data
}

export function parseArchitectureData(session: Session, wizardConfig?: WizardTechConfig): ArchitectureData {
  const stageDetails = session.timeline.filter((stage) => stage.details).map((stage) => stage.details as string)
  const allText = stageDetails.join('\n\n')

  const requirementsText = getStageText(session, 'requirements')
  const clarificationText = getStageText(session, 'clarification')
  const architectureText = getStageText(session, 'architecture')
  const databaseText = getStageText(session, 'database')
  const structureText = getStageText(session, 'structure')
  const securityText = getStageText(session, 'security')
  const roadmapText = getStageText(session, 'roadmap')
  const generationText = getStageText(session, 'generation')

  const projectName = deriveProjectName(session, allText)
  const summary = deriveSummary(session, allText, requirementsText, architectureText)

  const findingsCorpus = [requirementsText, clarificationText, architectureText, databaseText, structureText, securityText, roadmapText, generationText].join('\n\n')
  const roles = deriveArrayFromStage(requirementsText, [/roles?/i, /actors?/i, /users?/i, /admin/i, /visitor/i, /member/i, /customer/i, /moderator/i]).slice(0, 6)
  const features = deriveArrayFromStage(requirementsText, [/features?/i, /capabilities?/i, /functions?/i, /core/i, /workflow/i]).slice(0, 6)
  const integrations = deriveArrayFromStage(requirementsText, [/integrations?/i, /external/i, /payments?/i, /email/i, /storage/i, /oauth/i, /social/i]).slice(0, 6)
  const security = deriveArrayFromStage(requirementsText, [/security/i, /auth/i, /authorization/i, /validation/i, /encryption/i]).slice(0, 6)

  const assumptions = deriveAssumptions(clarificationText, requirementsText, allText)
  const missingInformation = deriveMissingInformation(clarificationText, requirementsText)
  const conflicts = deriveConflicts(clarificationText, allText)
  const risks = deriveRisks(securityText, clarificationText, allText)
  const securityRecommendations = deriveSecurityRecommendations(securityText, allText)

  const inferredTech = extractTechStack(findingsCorpus || allText)
  const tech = applyWizardTech(inferredTech, wizardConfig)
  const pattern = derivePattern([structureText, architectureText, allText].join('\n'))

  const corpus = [requirementsText, clarificationText, architectureText, databaseText, structureText, securityText, roadmapText].filter(Boolean).join('\n\n')

  const explicitFiles = tryExtractCount(corpus, [/(\d+)\+?\s*(?:files?|pages?|screens?)/i, /approximately\s*(\d+)\s*files?/i])
  const explicitApis = tryExtractCount(corpus, [/(\d+)\+?\s*(?:apis?|endpoints?|routes?)/i, /approximately\s*(\d+)\s*apis?/i])
  const explicitTables = tryExtractCount(corpus, [/(\d+)\+?\s*(?:tables?|collections?|models?|entities?)/i, /approximately\s*(\d+)\s*(?:tables?|collections?)/i])
  const explicitServices = tryExtractCount(corpus, [/(\d+)\+?\s*(?:services?|microservices?|modules?)/i, /approximately\s*(\d+)\s*(?:services?|modules?)/i])
  const explicitComponents = tryExtractCount(corpus, [/(\d+)\+?\s*(?:components?|widgets?|layouts?)/i, /approximately\s*(\d+)\s*(?:components?|widgets?)/i])

  const scopeFactor = wizardConfig?.scope === 'frontend' ? 0.35 : wizardConfig?.scope === 'backend' ? 0.55 : 1

  const metrics = {
    estimatedFiles: explicitFiles ?? Math.max(10, Math.round(Math.floor(allText.length / 80) * scopeFactor)),
    estimatedApis: explicitApis ?? Math.max(2, Math.round(countOccurrences(allText, ['api', 'endpoint', 'rest', 'graphql', 'route']) * scopeFactor)),
    estimatedDbTables: wizardConfig?.scope === 'frontend' ? 0 : (explicitTables ?? Math.max(2, Math.round(countOccurrences(allText, ['table', 'collection', 'model', 'schema', 'entity']) * scopeFactor))),
    estimatedServices: explicitServices ?? Math.max(1, Math.round(countOccurrences(allText, ['microservice', 'service', 'module']) * scopeFactor)),
    estimatedComponents: explicitComponents ?? Math.max(3, Math.round(countOccurrences(allText, ['component', 'widget', 'page', 'view', 'screen']) * scopeFactor)),
    estimatedDevTime: estimateDevTime(allText, wizardConfig),
  }

  const recommendationsCount = Math.max(
    8,
    countOccurrences(allText, ['recommend', 'suggest', 'should', 'must', 'consider', 'alternative', 'prefer']),
  )

  const projectScale = deriveProjectScale(metrics, recommendationsCount)
  const domainProfile = detectDomainProfile(allText)
  const architectureRecommendations = deriveArchitectureRecommendations(tech, pattern, allText, architectureText)
  const aiRecommendations = deriveAiRecommendations(projectScale, pattern, domainProfile, allText)
  const generatorCompatibility = deriveCompatibility()
  const executionStrategy = deriveExecutionStrategy()
  const roadmap = deriveRoadmap(roadmapText, features, projectScale, domainProfile)
  const databaseSummary = deriveDatabaseSummary(databaseText, tech, features, roles, metrics.estimatedDbTables)

  const servicesGraph = buildServiceGraph(tech, allText)
  const confidence: 'high' | 'medium' | 'low' = session.timeline.length === 0
    ? 'low'
    : session.timeline.filter((stage) => stage.status === 'completed').length / session.timeline.length >= 0.8
      ? 'high'
      : session.timeline.filter((stage) => stage.status === 'completed').length / session.timeline.length >= 0.4
        ? 'medium'
        : 'low'

  const stack: Record<string, string[]> = {
    Frontend: tech.frontend.split(' + ').map((item) => item.trim()).filter(Boolean),
    Backend: tech.backend.split(' + ').map((item) => item.trim()).filter(Boolean),
    Database: tech.database.split(' + ').map((item) => item.trim()).filter(Boolean),
    Authentication: tech.authentication.split(' + ').map((item) => item.trim()).filter(Boolean),
    Storage: tech.storage.split(' + ').map((item) => item.trim()).filter(Boolean),
    Deployment: tech.deployment.split(' + ').map((item) => item.trim()).filter(Boolean),
  }

  const searchTerms = SEARCH_TERM_CANDIDATES.filter((term) => allText.toLowerCase().includes(term))

  // v3 additions
  const classifiedAssumptions = buildClassifiedAssumptions(assumptions, allText, domainProfile)
  const structuredRisks = buildStructuredRisks(domainProfile, risks)
  const securityCategories = buildSecurityCategories(securityRecommendations, allText, domainProfile)
  const openQuestions = domainProfile.openQuestions
  const inferenceConfidence = buildInferenceConfidence(domainProfile, confidence)
  const showGeneratorCompatibility = detectShowGeneratorCompatibility(allText)

  const result: ArchitectureData = {
    projectName, summary, pattern,
    frontendStack: tech.frontend, backendStack: tech.backend, database: tech.database,
    authentication: tech.authentication, storage: tech.storage, deployment: tech.deployment,
    securityLevel: securityRecommendations.slice(0, 3).join(', ') || 'JWT + RBAC',
    projectScale, metrics,
    services: servicesGraph.services, connections: servicesGraph.connections,
    metadata: {
      model: 'FoundryForge AI (gpt-4o based)',
      generationTime: '3.2s',
      stages: session.timeline.length,
      generatedAt: new Date().toLocaleString(),
      recommendations: recommendationsCount,
      complexity: deriveComplexity(recommendationsCount),
    },
    searchTerms, roles, features, integrations, security,
    assumptions, missingInformation, conflicts, risks, stack, confidence,
    architectureRecommendations, aiRecommendations, generatorCompatibility, executionStrategy,
    roadmap, securityRecommendations, databaseSummary,
    // v3
    domainProfile, classifiedAssumptions, structuredRisks, openQuestions,
    securityCategories, inferenceConfidence, showGeneratorCompatibility,
  }

  return applyScopeOverrides(result, wizardConfig)
}
