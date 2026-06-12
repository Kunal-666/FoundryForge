# Technology Stack Detection

The purpose of this document is to define how FoundryForge detects, validates, and reasons about the technology stack used in a project. Accurate stack detection is the foundation upon which all subsequent engineering decisions, code generation, dependency management, and deployment strategies are built. When the system understands the technology stack correctly, it produces relevant, idiomatic, and contextually appropriate output. When it guesses wrong, the result is broken code, incompatible dependencies, and wasted engineering effort.

## How Stack Detection Works

Stack detection operates on two complementary tracks: explicit declaration and implicit inference. Explicit declaration occurs when the user states their technology choices directly — for example, "I am using React with Firebase and Tailwind CSS." Implicit inference occurs when the system examines project files, configuration files, dependency manifests, and directory structures to determine what technologies are in use. The system always trusts explicit declarations over inferred information, but cross-references both sources for consistency.

When a conflict arises between an explicit declaration and inferred evidence, the system flags the discrepancy for clarification rather than silently overriding either source. For example, if a user says "I'm using Vue" but the project contains a `package.json` with `react` and `react-dom` as dependencies, the system asks for clarification rather than assuming one source is correct.

## Technology Categories

The system categorizes technologies into distinct layers to enable structured reasoning about compatibility and best practices.

### Frontend Frameworks and Libraries

Frontend detection covers JavaScript frameworks, CSS frameworks, meta-frameworks, and rendering approaches. The system detects React, Vue, Angular, Svelte, Solid, Qwik, and other component frameworks. It also detects meta-frameworks such as Next.js, Nuxt, SvelteKit, Remix, Astro, and Gatsby. CSS tooling detection covers Tailwind CSS, styled-components, CSS Modules, Sass, LESS, and vanilla CSS approaches. The system also detects state management libraries like Redux, Zustand, Pinia, Vuex, MobX, and Jotai.

When a meta-framework is detected, such as Next.js, the system understands that this implies specific routing conventions, data fetching patterns, and deployment requirements. It does not suggest generic React patterns when Next.js conventions exist.

### Backend Frameworks and Runtimes

Backend detection covers runtime environments and frameworks. Runtime detection includes Node.js, Deno, Bun, Python, Go, Java, .NET, Ruby, PHP, and Rust. Framework detection within those runtimes includes Express, Fastify, NestJS, Hono, Elysia for Node.js/Bun; Django, FastAPI, Flask for Python; Gin, Echo for Go; Spring Boot for Java; ASP.NET Core for .NET; Rails for Ruby; Laravel for PHP; and Axum, Actix for Rust.

The system distinguishes between frameworks that provide full MVC structures and those that are minimal or middleware-based. This distinction matters because a minimal framework like Express requires more manual structure decisions while a framework like NestJS or Django provides strong opinions about project layout.

### Database and Storage

Database detection covers relational databases like PostgreSQL, MySQL, SQLite, and SQL Server; document databases like MongoDB and Firestore; key-value stores like Redis; vector databases like Pinecone, Chroma, Weaviate, and pgvector; and object storage like S3, Cloud Storage, and Blob Storage. The system detects ORMs and database libraries including Prisma, Drizzle, TypeORM, Sequelize, Mongoose, SQLAlchemy, and raw database drivers.

The system infers the database layer from dependency manifests, environment variables containing connection strings, configuration files, and schema definitions. If a project uses Prisma, for example, the system reads the Prisma schema as authoritative for the data model.

### Authentication and Authorization

Authentication detection covers solutions like Firebase Auth, Auth0, Clerk, Supabase Auth, NextAuth.js, Lucia Auth, and custom JWT-based auth. The system detects auth libraries and configuration files, middleware files, and route guard patterns.

### Hosting and Deployment

Hosting detection covers platforms like Vercel, Netlify, Firebase Hosting, Firebase App Hosting, Cloudflare Pages, AWS Amplify, Railway, Render, Fly.io, and self-managed VPS setups. The system detects deployment configuration files, such as `vercel.json`, `netlify.toml`, `firebase.json`, `Dockerfile`, and CI/CD workflow files.

### Storage and Assets

Storage detection covers file storage solutions like Firebase Cloud Storage, AWS S3, Cloudflare R2, Supabase Storage, and local filesystem storage. Asset management includes CDN configuration and image optimization pipelines.

## The Technology Stack Lock Principle

The Technology Stack Lock is a hard rule: once a technology is confirmed as part of the project's stack, it must not be replaced or substituted unless the user explicitly requests a migration. This principle prevents the system from generating code that introduces incompatible technologies, suggests migrating from one framework to another, or otherwise undermines the user's existing technology decisions.

Consider a user who has confirmed they are using React with a Firebase backend. The system must not generate instructions or code that references Vue components, suggests "you should consider migrating to Next.js," or proposes replacing Firebase with Supabase. Even if the system believes an alternative technology would be superior, it defers to the user's chosen stack.

The lock applies at every layer. If the user is using plain CSS, the system does not suggest Tailwind CSS. If the user is using Express, the system does not generate NestJS code patterns. If the user is using MongoDB, the system does not write SQL migrations. The only exception is when the user explicitly asks for migration advice or comparative analysis.

## Technology Compatibility Validation

Once the stack is detected, the system validates compatibility across layers. Not every combination of technologies works well together, and some combinations are outright incompatible. The system checks for known compatibility patterns and flags risks.

A meta-framework like Next.js implies a frontend framework (React) and typically a backend approach (API routes or server components). Pairing Next.js with a separate Express backend is unusual and warrants a compatibility note. Similarly, using Prisma as an ORM with MongoDB is not supported — the system flags this and asks the user to confirm or choose an alternative ORM.

Firebase Auth integrated with a Django backend requires careful token validation configuration. The system flags this pattern and provides the correct integration approach rather than assuming a default auth flow. Tailwind CSS used with a component library like MUI requires conflict resolution for class name collisions.

The system also validates version compatibility. React 19 introduces breaking changes that affect certain libraries. Next.js 15 requires React 19. The system checks dependency versions and warns about known incompatibilities.

## Ambiguous Stack Detection

Ambiguity arises when the system cannot definitively determine one or more layers of the technology stack. This occurs in several common scenarios.

A new project with no existing code provides no files to inspect. In this case, the system has no inferred evidence and must rely entirely on the user's declaration. If the user provides an ambiguous declaration like "I want to build a web app," the system must ask clarifying questions to determine the stack rather than assuming defaults.

A monorepo containing multiple applications creates ambiguity about which technology applies to which part of the project. The system detects monorepo structures and asks the user to specify which technologies belong to which sub-project.

A project using multiple frontend frameworks, such as a micro-frontend architecture, creates ambiguity about which framework to use for new code generation. The system asks for context-specific clarification.

Legacy projects with outdated dependencies create ambiguity about intentional technology choices versus outdated configurations. The system flags very old dependencies but does not assume the user wants to upgrade.

## Clarification Rules for Stack Detection

When the system needs to clarify the technology stack, it follows specific rules to minimize the number of questions and maximize the usefulness of the answers.

The system asks about the most foundational layer first. Starting from the runtime or platform provides context for all subsequent questions. For example, asking "Are you building for web, mobile, or desktop?" narrows the entire conversation. Within web, asking about the frontend framework informs backend compatibility, database integration patterns, and deployment options.

The system avoids asking about technologies that can be confidently inferred. If the project contains a `tsconfig.json`, the system does not ask "Are you using TypeScript?" It assumes TypeScript is in use and proceeds accordingly.

The system groups related questions. Authentication, database, and backend questions are related because choices in one affect the others. The system asks about these together rather than in separate rounds.

When the user provides partial information, the system fills in reasonable defaults for the remaining layers but flags these defaults as assumptions. For example, if the user says "I'm using Next.js," the system assumes React as the frontend framework and can infer Vercel as a likely deployment target, but marks these assumptions explicitly so the user can correct them.

## Example Prompts and Outputs

### Example 1: New Project with Explicit Declaration

User prompt: "I want to build a task management app using React and Node.js."

System analysis: The user has declared a frontend framework (React) and a backend runtime (Node.js). The system needs to determine the specific backend framework, database, authentication approach, and deployment target. It asks a grouped clarification:

"Thanks. I have React for the frontend and Node.js for the backend. To give you the best architecture, I need a few more details about your stack:

1. Which backend framework do you prefer? Common choices with Node.js include Express, Fastify, or NestJS. If you aren't sure, Express is a solid default.
2. What database are you planning to use? Options include PostgreSQL, MongoDB, SQLite for development, or a service like Firebase Firestore.
3. Do you need user authentication? If so, do you have a preferred solution like Firebase Auth, Auth0, or a custom JWT approach?"

### Example 2: Existing Project Detection

System detection on an existing project: The system finds `package.json` with `next`, `react`, `firebase`, `tailwindcss`, and `typescript`. It also finds `firebase.json` and a `firestore.rules` file.

System output: "Detected stack:
- Meta-framework: Next.js
- Frontend: React with TypeScript
- Styling: Tailwind CSS
- Backend/Database: Firebase (Firestore)
- Auth: Firebase Auth (inferred from Firebase setup)
- Deployment: Firebase Hosting or Firebase App Hosting likely

Is this accurate? If not, let me know what needs to change, and I'll update my understanding of your project."

### Example 3: Ambiguous Scenario

User prompt: "I have a website that needs a contact form."

System analysis: The user has provided extremely limited information. The system cannot detect any stack. It asks a minimal set of foundational questions:

"To help you build a contact form, I need to know what you're building with. A few quick questions:

1. Is this a static site, a server-rendered app, or a single-page application?
2. What frontend framework are you using (if any)? For example, React, Vue, or vanilla HTML/JS?
3. Do you have a backend or are you using a service like Firebase or Formspree for form handling?"

### Example 4: Technology Lock in Action

User prompt: "Add user authentication to my app. I'm using Vue 3 and Django with PostgreSQL."

System generates code using Vue 3 components, Django views, and PostgreSQL queries. It does not suggest NextAuth.js, Firebase Auth, or any technology outside the declared stack. The authentication flow uses Django's session-based or token-based auth integrated with Vue 3's frontend.

If the user later says "Actually, can we use Firebase Auth instead?", the system treats this as a migration request and provides guidance on the migration path, including the changes needed in both the Vue frontend and the removal of Django's auth handling.

## Do and Don't Recommendations

Do confirm the detected stack with the user before generating substantial code. A brief confirmation prevents wasted work.

Do ask about the backend framework specifically. Knowing the runtime alone (Node.js) is insufficient for generating correct backend code.

Do detect and respect monorepo structures by asking which technology applies to which package or application.

Do flag compatibility issues between detected technologies, such as an ORM that doesn't support the detected database.

Don't assume a stack based on a single file. A `package.json` could belong to a documentation site rather than the main application.

Don't suggest replacing user-selected technologies with alternatives you consider better. The Technology Stack Lock is absolute.

Don't ask questions whose answers can be inferred from existing files or configuration.

Don't generate code that spans technologies the user hasn't confirmed. If the user hasn't mentioned a backend, don't generate backend code.

Don't silently override user declarations with inferred information. Always flag discrepancies for clarification.
