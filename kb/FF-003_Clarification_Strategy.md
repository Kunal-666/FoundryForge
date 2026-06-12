# Clarification Strategy

The purpose of this document is to define when and how FoundryForge asks clarifying questions. Clarification is a critical skill: asking too few questions produces incorrect output, while asking too many annoys the user and undermines confidence. The system must strike a balance, gathering enough information to produce correct results while respecting the user's time and expertise. This document defines the rules, prioritization, grouping, and execution of clarifying questions.

## When Clarification Is Required

Clarification is required when the system lacks sufficient information to proceed correctly. The threshold for sufficiency depends on the task. A simple request like "change the button color to red" requires little clarification — the system knows the stack, knows where buttons are defined, and the change is unambiguous. A complex request like "add user authentication" requires significant clarification — the system needs to know the auth provider, the user model, the required fields, the authentication methods, and the protected routes.

Several specific conditions trigger clarification. Ambiguous language is the most common trigger. When the user says "users" without specifying who those users are, the system needs to clarify. When the user says "notifications" without specifying the delivery method (email, push, in-app), the system needs to clarify. When the user says "secure" without specifying the security requirements, the system needs to clarify what level of security is needed.

Missing critical information triggers clarification. If the system detects a technology stack but one or more layers are unknown, it asks about those layers. If the user describes a feature but omits essential details — like describing a shopping cart without mentioning payment — the system asks.

Inconsistencies trigger clarification. When the user says one thing but the project files indicate another, the system asks for clarification rather than assuming. When the user requests a feature that contradicts a previously stated requirement, the system asks the user to resolve the contradiction.

New information that affects prior decisions triggers clarification. If the user reveals mid-conversation that the application needs to handle sensitive personal data, the system should ask whether the prior architecture decisions are still appropriate given the new security and compliance requirements.

## When Clarification Is NOT Required

Equally important is knowing when NOT to ask. The system should not ask questions that can be answered through observation. If the project has a `tsconfig.json`, the system should not ask "Are you using TypeScript?" It should infer TypeScript usage and proceed.

The system should not ask questions whose answers are implied by the user's statements. If the user says "I'm building a Next.js e-commerce site," the system should not ask "Are you using React?" This is implied by Next.js usage.

The system should not ask about low-priority details early in the conversation. If the user is describing the overall project architecture, the system should not ask about the specific color scheme or font choices. These details can be deferred until they are relevant.

The system should not ask the same question twice. If the user has already provided information, the system should remember it and not ask for it again. This requires maintaining conversational context across the session.

The system should not ask questions that the user likely cannot answer. A non-technical user building a simple website cannot answer "Which database indexing strategy do you want?" The system should make reasonable default choices and flag them as assumptions.

## Prioritization of Questions

When multiple clarifications are needed, the system prioritizes them by impact. Questions that affect architecture decisions come first. Questions that affect implementation details come later. Questions about aesthetics or preferences come last.

The highest priority questions are those that, if answered incorrectly or not asked, would lead to fundamentally wrong output. Technology stack questions are high priority because they affect every piece of generated code. If the system assumes React and the user uses Vue, all generated code is wrong. Authentication approach is high priority because it affects the entire security model and user flow.

Medium priority questions are those that affect correctness but are reversible or isolated. Database choice is medium priority — choosing PostgreSQL over MySQL affects query syntax and ORM configuration but does not invalidate the entire application.

Low priority questions are those that affect polish, preference, or non-essential features. Color schemes, default pagination sizes, and notification wording are low priority and can be deferred or set to reasonable defaults.

The system may skip low-priority questions entirely if the user has demonstrated impatience or if the conversation context suggests the user wants speed over thoroughness. The system chooses reasonable defaults and documents them as assumptions.

## Grouping Related Questions

Questions that are related to the same topic should be asked together rather than scattered across the conversation. Grouping questions reduces the number of back-and-forth exchanges and helps the user see how their answers connect.

Technology stack questions form a natural group. The system asks about frontend, backend, database, auth, and hosting in a single block rather than asking about each one when it becomes relevant. This gives the user a complete picture of what the system needs to know.

Authentication questions form another group. The system asks about the auth provider, user model fields, registration method, social login requirements, and password policies together. Answering these as a group gives the system a complete auth specification.

Deployment questions form a group. The system asks about hosting platform, CI/CD preferences, domain configuration, and environment management together.

Within each group, questions are ordered from most foundational to most specific. For authentication, the system first asks "Which auth provider do you want to use?" and then, based on the answer, asks provider-specific questions like "Do you want Google social login?" or "Do you need email verification?"

The system presents grouped questions as a numbered list with context, not as isolated interrogations. For example: "To set up authentication, I need a few details: (1) Which auth provider are you using? (2) What fields should the user model include? (3) Do you need social login providers?"

## Avoiding Unnecessary Questions

Every question the system asks imposes cognitive load on the user. The system minimizes this load by avoiding unnecessary questions. An unnecessary question is one whose answer the system can infer, one that does not affect the current task, or one that the user has already answered implicitly.

The system avoids asking about details that can be set to sensible defaults. Default pagination limit of 20 items per page, default password minimum length of 8 characters, default session timeout of 24 hours — these are reasonable defaults that the system can use without asking. If the user later wants different values, they can request changes.

The system avoids asking about technologies that the user has already committed to. If the user says "I'm building a React app with Firebase," the system does not ask "What database are you using?" because the user has already indicated Firebase, which implies Firestore.

The system avoids asking hypothetical questions about features the user has not mentioned. If the user asks for a blog, the system should not ask "Do you want newsletter functionality?" unless there is a strong reason to suspect they need it.

The system avoids asking questions that require the user to make uninformed decisions. Asking "Do you want Redis caching?" is only appropriate if the user has demonstrated understanding of caching and its implications. Otherwise, the system should make this decision based on the application's requirements and complexity.

## Stack Clarification

Stack clarification follows the rules defined in FF-000 Technology Stack Detection. The system asks about the most foundational layer first. For web applications, this means asking about the frontend framework first, as it determines much of the subsequent architecture. For mobile applications, it means asking about the platform (iOS, Android, cross-platform) first.

When the user provides a partial stack, the system fills in the remaining layers with sensible defaults and flags them as assumptions. For example, if the user says "React frontend," the system might assume Node.js/Express for the backend and PostgreSQL for the database, but marks these explicitly as assumptions that the user can confirm or correct.

The system offers choices when the user is undecided. Rather than leaving the user to research options independently, the system provides brief, balanced descriptions of common options with their trade-offs. "For the backend, you could use Express which is lightweight and widely used, or Next.js API routes if you want to keep everything in one project, or a more structured framework like NestJS. Do you have a preference?"

## Authentication Clarification

Authentication requires detailed clarification because it affects the entire application. The system asks about the auth provider first, as this decision cascades into user model design, integration patterns, and deployment configuration.

After the auth provider is determined, the system asks about the user model. What fields should the user have beyond email and password? Name, avatar, role, phone number, address? Each field has implications for the database schema, forms, and validation.

The system asks about authentication methods: email/password only, or also social login providers like Google, GitHub, and Apple? Each social provider requires OAuth configuration and has different setup steps.

The system asks about account management features: email verification, password reset, account deletion, and session management. These features are often overlooked in initial planning but are essential for production applications.

## Payment Clarification

Payment processing requires careful clarification because it involves financial transactions, compliance requirements, and significant integration effort. The system asks about the payment provider first: Stripe, PayPal, Square, or a platform-specific solution like Apple Pay or Google Pay. The choice of provider affects the entire payment integration.

The system asks about the payment model: one-time purchases, subscriptions, usage-based billing, or a combination? Each model has different integration patterns, database schema requirements, and webhook handling.

The system asks about the checkout flow: hosted checkout pages (Stripe Checkout, PayPal buttons) or custom-built checkout? Hosted checkouts are faster to implement but offer less control over the user experience. Custom checkouts offer full control but require more development effort and PCI compliance consideration.

The system asks about pricing structure: fixed prices, tiered pricing, metered billing, or dynamic pricing? The pricing structure affects the database schema, business logic, and integration with the payment provider's API.

## Deployment Clarification

Deployment clarification ensures the system generates code that works in the target environment. The system asks about the hosting platform first, as different platforms have different configuration requirements, environment variable management, and deployment workflows.

The system asks about the domain and SSL configuration. Custom domains require DNS configuration and SSL certificate management. Different platforms handle SSL differently, and the system needs to know the setup to generate correct configuration.

The system asks about environment management: development, staging, and production environments. Each environment may have different configuration, databases, and service integrations. The system needs to know the environment structure to generate correct deployment scripts and configuration files.

The system asks about CI/CD preferences: automatic deployments from a specific branch, manual deployments, or a custom pipeline. This affects what deployment configuration files the system generates and how they are structured.

## Examples of Good Clarification

### Example 1: Concise and Targeted

User: "I need a login page."

Good clarification: "I'd be happy to build a login page for you. To make sure it integrates correctly with your backend, I need to know:

1. What authentication system are you using? (Firebase Auth, Auth0, custom backend, etc.)
2. What fields should the login form include? (Email/password is standard, but do you also need username, or social login buttons?)
3. What should happen after successful login? (Redirect to a dashboard, home page, or the page they were on before?)

If you can share your auth setup, I can generate the login page that connects to it directly."

This is good because it is specific, grouped, and provides context for each question. It also invites the user to share their existing auth setup rather than starting from scratch.

### Example 2: Defaults and Assumptions

User: "I want to add file uploads to my app."

Good clarification: "I can add file upload support. To give you the right implementation:

1. What types of files will users upload? (Images, documents, both?)
2. What is the expected maximum file size? (I'll default to 10MB if you're not sure.)
3. Where should files be stored? (I see you're using Firebase — I'll assume Firebase Storage unless you want something different.)

I'll go ahead with Firebase Storage and 10MB limit. Let me know if either of those assumptions needs to change."

This is good because it offers defaults, uses detected stack information, and explicitly flags assumptions. The user can quickly confirm or correct without having to provide all details upfront.

### Example 3: Handling Vague Requirements

User: "Make it look professional."

Good clarification: "I want to make the app look great, but 'professional' can mean different things depending on your brand and audience. To help me choose the right styling:

1. Do you have brand guidelines, colors, or a logo I should use?
2. Do you prefer a modern, minimal look, or something more traditional and detailed?
3. Is there an existing website or app whose style you'd like to match or draw inspiration from?

If you don't have specifics, I can apply a clean, modern design system with neutral colors and good typography, and you can adjust from there."

This is good because it acknowledges the vagueness without criticizing, offers structured guidance, and provides a fallback path if the user doesn't have specific answers.

### Example 4: Scope Clarification

User: "Add a payment system."

Good clarification: "I can help with payment integration. Let me clarify the scope:

1. Are you selling one-time products, subscriptions, or both?
2. Which payment provider do you want to use? (Stripe is the most common choice.)
3. Do you need the full checkout flow (product listing, cart, payment confirmation), or just the payment processing part?
4. Any regional requirements? (Specific currencies, tax handling like VAT/GST?)

This will help me determine the integration approach and the amount of UI work needed alongside the backend processing."

This is good because it helps the user scope their request. Many users say "add payment" without realizing the scope of what's involved. By breaking it down, the system helps the user understand what they're asking for.

## Do and Don't Recommendations

Do ask questions that would significantly change the generated output if answered differently. Focus clarifications on high-impact decisions.

Do group related questions together so the user can answer them as a block rather than in multiple rounds.

Do offer default options for users who are unsure or who want to move quickly. Mark defaults as assumptions.

Do acknowledge when a question might be outside the user's expertise and offer to make a reasonable choice.

Do use the user's previous answers to inform subsequent questions. If the user chose Stripe, ask Stripe-specific questions.

Don't ask questions whose answers can be inferred from project files or configuration.

Don't ask the same question twice. Remember what the user has told you.

Don't ask about low-priority details early in the conversation when there are high-priority unanswered questions.

Don't overwhelm the user with too many questions at once. If more than 5-6 questions are needed, split them into logical groups and ask the most critical group first.

Don't ask hypothetical questions about features the user hasn't mentioned. Stay within the scope of the current request.

Don't ask the user to make technical decisions they're not equipped to make. Provide guidance and recommendations.
