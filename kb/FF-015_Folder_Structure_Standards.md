# Folder Structure Standards

This document defines the canonical folder structure conventions for FoundryForge projects. Consistent directory organization reduces cognitive overhead during onboarding, enforces separation of concerns, and makes code generation from specifications predictable. Every project scaffolded through FoundryForge must follow these standards unless a deviation is explicitly documented in the project's Architecture section.

## Core Principles

A folder structure is a communication tool. It tells every engineer reading the repository where to find things and where to put new things. The primary design goal is that any file's purpose should be inferable from its path alone. Secondary goals include keeping deep nesting below four levels and colocating related concerns.

A well-structured project lets you delete a feature without hunting for orphaned files across ten directories. It also prevents the common antipattern of a single "misc" or "utils" folder that becomes a dumping ground for unrelated code.

## React and Next.js Projects

React projects and Next.js projects share most of their folder anatomy but diverge in how routing is handled. Both use the same top-level convention for source code under `src/`.

### Top-Level Layout

```
project-root/
├── public/             # Static assets served directly (favicon, robots.txt, images)
├── src/                # All application source code
├── tests/              # Test files mirroring src/ structure
├── cypress/ or e2e/    # End-to-end test suites
├── .env.local          # Environment variables (gitignored)
├── .env.example        # Documented environment variable template
├── next.config.js      # Framework configuration
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
└── README.md           # Project overview and setup instructions
```

### `src/` Directory Anatomy

The `src/` directory contains every piece of application logic. The following directories must be present in every React or Next.js project:

#### `pages/` (Next.js App Router: `app/`)

This directory maps directly to routes. In Page Router projects, each `.tsx` file becomes a route segment. In App Router projects, the `app/` directory uses folders with `page.tsx`, `layout.tsx`, `loading.tsx`, and `error.tsx` files to define routes declaratively.

```
src/pages/                    # Page Router
├── index.tsx                 # /
├── about.tsx                 # /about
├── dashboard/
│   ├── index.tsx             # /dashboard
│   └── settings.tsx          # /dashboard/settings
└── api/
    ├── auth/
    │   └── [...nextauth].ts # /api/auth/*
    └── webhooks/
        └── stripe.ts         # /api/webhooks/stripe

# OR

src/app/                      # App Router
├── layout.tsx                # Root layout
├── page.tsx                  # /
├── about/
│   └── page.tsx              # /about
├── dashboard/
│   ├── layout.tsx            # Dashboard layout (nested)
│   ├── page.tsx              # /dashboard
│   └── settings/
│       └── page.tsx          # /dashboard/settings
└── api/
    └── webhooks/
        └── stripe/
            └── route.ts      # /api/webhooks/stripe
```

Pages must remain thin. A page file should compose components and fetch data but contain no business logic. Business logic belongs in hooks or services.

#### `components/`

Reusable UI components live here. Subdirectories group components by domain or function.

```
src/components/
├── ui/                  # Primitive UI components (Button, Input, Modal, Card, Badge)
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Modal.tsx
├── layout/              # Layout components (Header, Footer, Sidebar)
│   ├── Header.tsx
│   └── Sidebar.tsx
├── forms/               # Form-specific components (SignInForm, CheckoutForm)
│   └── SignInForm.tsx
├── dashboard/           # Dashboard-specific components (StatsCard, ChartWidget)
│   └── StatsCard.tsx
└── shared/              # Cross-domain presentational components (EmptyState, ErrorBoundary)
    ├── EmptyState.tsx
    └── ErrorBoundary.tsx
```

Each component directory may include a co-located test file (`Button.test.tsx`) and a story file (`Button.stories.tsx`) if Storybook is used. Never put data-fetching logic inside a component file — that belongs in hooks.

#### `hooks/`

Custom React hooks encapsulate reusable stateful logic. Each hook file must be prefixed with `use` and export a single named function.

```
src/hooks/
├── useAuth.ts              # Authentication state and methods
├── useDebounce.ts          # Debounced value hook
├── useLocalStorage.ts      # Local storage sync hook
├── useMediaQuery.ts        # Responsive breakpoint detection
└── useIntersectionObserver.ts  # Scroll-based visibility detection
```

Hooks that fetch data should delegate to service functions rather than calling fetch directly. This keeps hooks testable without mocking network requests in every test file.

```
// Good: hook delegates to a service
export function useUser(userId: string) {
  const { data, error, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId),
  });
  return { user: data, error, isLoading };
}
```

#### `services/`

Service modules abstract external API calls, browser APIs, and third-party integrations. Each service file exports plain functions, not React hooks. This separation ensures services can be used from hooks, middleware, server-side code, and tests without React dependency.

```
src/services/
├── api/
│   ├── client.ts            # Axios or fetch instance with interceptors
│   └── endpoints.ts         # URL constants for all API routes
├── auth.service.ts          # Sign in, sign up, sign out, refresh token
├── user.service.ts          # CRUD operations for user resources
├── payment.service.ts       # Stripe or payment provider integration
├── analytics.service.ts     # Tracking events to segment or GA
├── storage.service.ts       # Upload and retrieve files from cloud storage
└── notification.service.ts  # Push notification and email triggers
```

A service function should return typed data and throw on errors. It must not contain UI logic or component references.

#### `contexts/`

React Context providers for shared state that must be accessible across the component tree. Each context file exports a Provider component and a consumer hook.

```
src/contexts/
├── AuthContext.tsx
├── ThemeContext.tsx
├── NotificationContext.tsx
└── SettingsContext.tsx
```

Do not create a context for every piece of shared state. Context is appropriate for truly global concerns: authentication, theme, locale, notification toasts. Data that could be fetched with React Query belongs there instead.

#### `utils/`

Pure utility functions with zero side effects and zero framework dependencies. Functions in utils must be deterministic — same input always produces the same output.

```
src/utils/
├── formatDate.ts       # Date formatting helpers
├── formatCurrency.ts   # Currency display helpers
├── validators.ts       # Validation functions (email, phone, zip)
├── cn.ts               # Class name merge utility (clsx + tailwind-merge)
└── constants.ts        # Application-wide constants (pagination sizes, routes)
```

If a utility function imports from React, it belongs in hooks, not utils.

#### `types/`

TypeScript type definitions, interfaces, and enums shared across the project.

```
src/types/
├── api.ts              # API response and request types
├── user.ts             # User model interfaces
├── payment.ts          # Payment and subscription types
└── common.ts           # Shared generic types (PaginatedResponse, ApiError)
```

Types may also be co-located with their component or service when they are not shared. The types directory is for types used in multiple places.

#### `lib/`

Configuration and initialization for third-party libraries. Each library gets its own file that exports a configured instance.

```
src/lib/
├── stripe.ts           # Stripe SDK initialization
├── sentry.ts           # Sentry error tracking config
├── prisma.ts           # Prisma client singleton
└── firebase.ts         # Firebase app initialization
```

The distinction between lib and services is that lib files set up library configuration, while services use those configured libraries to implement business operations.

#### `assets/`

Static assets that are imported by JavaScript, such as SVG icons, images under 10KB (inlined), and font files.

```
src/assets/
├── icons/
│   ├── logo.svg
│   └── spinner.svg
├── images/
│   └── empty-state.svg
└── fonts/
    └── inter-variable.woff2
```

Large images should remain in `public/` and be served directly rather than imported.

## Firebase Projects

Firebase projects introduce unique directory requirements for Cloud Functions, Firestore security rules, and Firebase configuration.

```
project-root/
├── firebase.json               # Firebase project configuration
├── .firebaserc                 # Project aliases (default, staging, prod)
├── firestore.indexes.json      # Composite index definitions
├── firestore.rules             # Firestore security rules
├── storage.rules               # Storage security rules
├── functions/                  # Cloud Functions directory
│   ├── src/
│   │   ├── index.ts            # Function exports entry point
│   │   ├── triggers/           # Firestore, Auth, PubSub triggers
│   │   │   ├── onUserCreate.ts
│   │   │   └── onPaymentCreate.ts
│   │   ├── callable/           # Callable functions (onCall)
│   │   │   └── createCheckoutSession.ts
│   │   ├── scheduled/          # Cron functions (onSchedule)
│   │   │   └── cleanupExpiredSessions.ts
│   │   ├── services/           # Business logic (same pattern as frontend)
│   │   ├── utils/
│   │   └── types/
│   ├── package.json
│   └── tsconfig.json
├── src/                        # Frontend (follows React/Next.js convention)
└── public/                     # Firebase Hosting static files
```

Firebase Cloud Functions must separate triggers from business logic. Trigger files should be thin — they parse the event payload, log context, and delegate to a service file. This lets you unit-test business logic without triggering a real Firestore event.

## Node.js Backend Projects

Standalone Node.js backends (Express, Fastify, Hono) follow a layered architecture.

```
project-root/
├── src/
│   ├── index.ts                # Server entry point (start, middleware registration)
│   ├── app.ts                  # Express/Fastify app factory (testable without listening)
│   ├── routes/
│   │   ├── index.ts            # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── payment.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   └── payment.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── payment.service.ts
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   └── payment.repository.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── validate.ts
│   ├── validators/
│   │   ├── auth.validation.ts
│   │   └── user.validation.ts
│   ├── utils/
│   ├── types/
│   └── config/
│       ├── index.ts            # Central config export
│       ├── database.ts         # Database connection config
│       └── env.ts              # Environment variable parsing
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── prisma/                     # Prisma schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── docker-compose.yml          # Local dev dependencies (DB, Redis)
└── Dockerfile
```

Controllers handle HTTP concerns: parsing request parameters, setting status codes, and sending responses. They validate input using the validators layer, then delegate to services. Services implement business rules and orchestrate multiple repository calls. Repositories handle database queries only.

This four-layer separation (route → controller → service → repository) ensures that swapping Express for Fastify only requires changes in routes and controllers, not in business logic or data access.

## Do's and Don'ts

**Do** keep folder names lowercase with hyphens for multi-word names (`user-profile/`). TypeScript files use PascalCase for components (`UserProfile.tsx`) and camelCase for utilities (`formatCurrency.ts`).

**Don't** create a `components/common/` or `components/shared/` folder. Use domain folders within components instead. A "common" folder inevitably becomes a dumping ground for unrelated components with no cohesion.

**Do** colocate tests with source files when the test framework supports it. A `Button.test.tsx` next to `Button.tsx` is discoverable. A test in a distant `__tests__` folder is not.

**Don't** exceed four levels of nesting under `src/`. If you reach five levels, you have grouped incorrectly. Flatten the hierarchy or extract a subfeature into its own module.

**Do** use barrel files (`index.ts`) to export multiple related modules from a single entry point. Barrel files reduce import verbosity: `import { Button, Input } from '@/components/ui'` instead of separate imports for each.

**Don't** import from a parent barrel file inside the same folder group. This creates circular dependencies. Components within `ui/` should import each other directly by file path.

**Do** treat the folder structure as a living document. When a new category of component emerges, create a new folder rather than stuffing it into an existing one with a different naming convention.

**Don't** put configuration files in `src/`. Configuration for build tools, linters, and deployment belongs in the project root with descriptive filenames.
