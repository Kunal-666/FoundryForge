# Architecture Planning

The purpose of this document is to define how FoundryForge approaches architecture planning for software projects. Architecture planning is the process of defining the structural elements of a system, their relationships, and the principles governing their design and evolution. It sits between requirement analysis and implementation, translating what the system must do into how it will be structured. Good architecture makes implementation straightforward, testing practical, and maintenance sustainable. Poor architecture makes every change expensive and every bug difficult to trace.

## The Architecture Planning Process

Architecture planning follows a structured process: decompose, allocate, define interfaces, and validate. Decompose means breaking the system into logical components based on separation of concerns. Allocate means assigning responsibilities to each component based on the detected technology stack and project constraints. Define interfaces means specifying how components communicate. Validate means checking the architecture against requirements, constraints, and engineering principles.

The system produces architecture plans that are detailed enough to guide implementation but flexible enough to accommodate changes. An architecture plan is not a rigid blueprint — it is a structural framework within which implementation decisions are made. The plan evolves as the system learns more about the project and as requirements change.

## Layered Architecture

Layered architecture organizes the system into horizontal layers, each with a specific responsibility. The most common layered architecture in web applications has four layers: presentation, application, domain, and infrastructure. The presentation layer handles user interface and API endpoints. The application layer orchestrates workflows and coordinates between components. The domain layer contains business logic and rules. The infrastructure layer handles data access, external services, and technical capabilities.

The system follows the dependency rule: dependencies point inward. The presentation layer depends on the application layer. The application layer depends on the domain layer. The domain layer depends on nothing external — it contains pure business logic with no framework or infrastructure dependencies. The infrastructure layer implements interfaces defined by the inner layers.

This layered approach provides several benefits. Business logic is isolated from framework changes — migrating from Express to Fastify requires changes only in the presentation layer, not in the domain layer. Data access can be replaced without affecting business logic — switching from PostgreSQL to MongoDB affects only the infrastructure layer. Testing is simplified — the domain layer can be tested without infrastructure dependencies like databases or external APIs.

The system determines the appropriate number of layers based on the application's complexity. A simple CRUD application might combine the application and domain layers. A complex enterprise application might add additional layers for cross-cutting concerns like caching, auditing, or authorization.

### Layered Architecture Example

For a blog application with a React frontend, Node.js/Express backend, and PostgreSQL database, the system proposes:

Presentation layer: React components for the UI, Express route handlers for the API. This layer handles HTTP requests and responses, input validation, and formatting output for the client.

Application layer: Service classes that orchestrate workflows. A `PostService` handles creating posts (validating author permissions, saving the post, triggering notifications). A `CommentService` handles adding comments (validating the post exists, saving the comment, notifying the post author).

Domain layer: Entity definitions and business rules. A `Post` entity has a status (draft, published, archived) and rules about when it can transition between states. A `User` entity has roles and permissions. These are plain objects or classes with no framework dependencies.

Infrastructure layer: Database repositories using Prisma or SQL queries, file storage for images, email sending for notifications. This layer implements interfaces defined by the application or domain layers.

The system would document: "The presentation layer (React components, Express routes) depends on the application layer (PostService, CommentService). The application layer depends on the domain layer (Post, User entities). The domain layer has no external dependencies. The infrastructure layer (Prisma repositories, email service) implements interfaces defined by the application and domain layers."

## Modular Architecture

Modular architecture organizes the system into vertical slices, each containing all layers for a specific feature or domain. Unlike layered architecture, which groups code by technical concern, modular architecture groups code by business capability. Each module is self-contained, with its own presentation, application, domain, and infrastructure components.

Modular architecture works well for complex domains where different features have different lifecycles, different teams, or different scaling requirements. An e-commerce platform might have separate modules for product catalog, shopping cart, order processing, payment, and user management. Each module can be developed, tested, and deployed independently.

The system chooses between layered and modular architecture based on project size, team structure, and domain complexity. Small projects with a single developer benefit from simple layered architecture. Large projects with multiple teams benefit from modular architecture. The system may recommend a hybrid approach: layered architecture within modules, with modules communicating through well-defined interfaces.

The system defines module boundaries around business capabilities rather than technical convenience. A module boundary that separates "user management" from "order management" is meaningful because these are distinct business capabilities. A module boundary that separates "frontend code" from "backend code" is a technical boundary, not a modular boundary, and is always present regardless of the modular approach.

### Modular Architecture Example

For an e-commerce platform using Next.js with TypeScript and PostgreSQL, the system proposes:

Product module: Product listing, search, filtering, product detail pages, inventory management. This module owns the product schema, product API endpoints, product UI components, and product domain logic.

Cart module: Add/remove items, cart persistence, cart calculations. This module owns the cart schema, cart API endpoints, cart UI components, and pricing logic.

Order module: Checkout flow, order creation, order status tracking, order history. This module owns the order schema, order API endpoints, order management UI, and order domain logic.

Payment module: Payment processing, refunds, invoice generation. This module integrates with Stripe, owns payment records, and communicates with the order module.

User module: Registration, authentication, profile management, address management. This module owns the user schema, auth configuration, and user profile components.

Each module has its own directory structure following the layered pattern within the module. Modules communicate through typed interfaces rather than direct database access. For example, the order module calls the payment module's `processPayment` function rather than reading the payment database table directly.

## Client and Server Responsibilities

The system defines clear boundaries between client and server responsibilities. These boundaries depend on the architecture style (SPA, SSR, static site, mobile app) but follow consistent principles.

The server is responsible for data persistence, business logic enforcement, authentication and authorization, input validation (as a security measure), file storage and management, email and notification sending, scheduled tasks and background jobs, and API rate limiting and throttling.

The client is responsible for rendering the user interface, handling user interactions, client-side input validation (for user experience, not security), managing local state and UI state, routing and navigation (for SPAs), and caching and offline support (for progressive web apps).

The system avoids duplicating business logic on the client and server. Business rules are enforced on the server and may be mirrored on the client for UX purposes, but the server is always authoritative. For example, the server validates that a user can edit a post (ownership check), while the client may hide the edit button for posts the user does not own. The client-side check is UX optimization, not security — the server still enforces the rule.

When using meta-frameworks like Next.js or Nuxt, the boundary becomes more nuanced. Server components and server actions blur the traditional client/server split. The system adapts by defining which code runs on the server, which runs on the client, and which runs on both. Data fetching and business logic remain server-side. Interactive state and event handlers remain client-side.

## Service Boundaries

Service boundaries define where one service ends and another begins. In a monolithic application, service boundaries are logical — they define modules within the same process. In a distributed application, service boundaries are physical — they define separate processes that communicate over a network.

The system identifies service boundaries by analyzing data ownership, change frequency, and team boundaries. Data ownership is the primary boundary criterion: a service should own its data exclusively. If two pieces of functionality frequently access the same data, they likely belong in the same service. If they access different data with minimal overlap, they can be separate services.

Change frequency is another boundary criterion: if two components change at different rates or for different reasons, they benefit from separate service boundaries. A product catalog that changes weekly and an order processing system that changes quarterly benefit from being separate services, even in a monolithic codebase, because it reduces the risk of one change affecting the other.

Team boundaries are a practical boundary criterion: if different teams own different parts of the system, service boundaries should align with team boundaries. Each team should own a set of services end-to-end, including their data, APIs, and deployment.

The system starts with a monolithic or modular-monolith architecture by default and only recommends distributed services when there is clear evidence they are needed. Distributed systems introduce network latency, data consistency challenges, deployment coordination, and operational complexity. The system does not recommend distributed services for projects that would be better served by a monolith.

## Scalability Planning

Scalability planning addresses how the system handles growth. The system evaluates the application's expected scaling dimensions: user growth, data growth, traffic growth, and feature growth. Each dimension suggests different scaling strategies.

User growth affects authentication, session management, and user-specific data. Data growth affects database performance, query optimization, and data archiving. Traffic growth affects request handling capacity, caching requirements, and CDN usage. Feature growth affects code organization, module boundaries, and team coordination.

The system recommends specific scalability patterns based on the application's profile. For read-heavy applications like content sites, the system recommends caching layers, CDN integration, and database read replicas. For write-heavy applications like logging systems, the system recommends message queues, batch processing, and write-optimized storage. For data-intensive applications like analytics platforms, the system recommends data partitioning, columnar storage, and pre-aggregation strategies.

Scalability planning also addresses database scaling. The system evaluates whether the application needs vertical scaling (bigger database instance), read replicas, sharding, or a distributed database. For most applications, vertical scaling and read replicas are sufficient. Sharding and distributed databases introduce significant complexity and are recommended only when clearly necessary.

The system documents scalability assumptions and limits. If the architecture assumes a single database instance can handle the load, the system documents the expected throughput limit and what to do when it is reached.

## Event-Driven Considerations

Event-driven architecture uses events to communicate between components asynchronously. Events are messages that describe something that happened — "order.created," "payment.completed," "user.registered." Components publish events when they do something, and other components subscribe to events they care about.

The system recommends event-driven patterns when the application needs loose coupling between components, asynchronous processing, or integration with multiple downstream systems. An order processing system that needs to send confirmation emails, update inventory, notify shipping, and update analytics is a good candidate for event-driven architecture.

The system does not recommend event-driven architecture for simple request-response workflows. A contact form that sends an email does not need a message queue and event bus. Adding event-driven infrastructure for simple workflows introduces complexity without benefit.

When the system recommends event-driven patterns, it specifies the event schema, the delivery guarantees, and the error handling strategy. Events should have a defined schema that includes an event type, a timestamp, a unique identifier, and the event payload. Delivery guarantees range from at-most-once (best effort) to exactly-once (guaranteed processing). Error handling covers dead-letter queues, retry policies, and compensation transactions.

The system also addresses event ordering and idempotency. Events may arrive out of order, and consumers must handle this correctly. Event handlers should be idempotent — processing the same event twice should have the same effect as processing it once.

## Monolith vs Modular

The monolithic versus modular decision is one of the most important architecture choices. The system approaches this decision pragmatically, recommending a monolith or modular monolith as the default and only recommending distributed services when specific conditions are met.

A monolith is a single deployable unit containing all the application's functionality. A modular monolith is a single deployable unit with clear module boundaries and well-defined interfaces between modules. A distributed system is multiple deployable units that communicate over a network.

The system recommends a monolith or modular monolith when: the team is small (fewer than 10 developers), the application is in its early stages and requirements are still evolving, the domain complexity is moderate, operational experience with distributed systems is limited, or the expected scale does not require independent scaling of components.

The system recommends distributed services when: multiple teams need to work independently, different components have significantly different scaling requirements, different components need different technology stacks, the organization has operational experience with distributed systems, or independent deployability is a hard requirement.

The system explicitly warns against premature distribution. A distributed system is harder to develop, test, deploy, and debug than a monolith. Moving from a monolith to distributed services is a well-understood migration path. Moving from distributed services back to a monolith is extremely difficult.

## Architecture Diagrams with Markdown

The system produces architecture diagrams using Markdown-compatible notation. While Markdown cannot render actual diagrams, the system uses structured text formats that can be converted to diagrams or understood as architectural descriptions.

Component descriptions use nested lists to show hierarchy:

- Presentation Layer
  - Web Application (Next.js)
    - React Components (client components, server components)
    - API Routes (server-side endpoints)
  - Mobile App (React Native)
    - Shared API Client
    - Native UI Components

- Application Layer
  - Service Orchestration
    - OrderService
    - PaymentService
    - NotificationService
  - Workflow Management
    - CheckoutWorkflow
    - OnboardingWorkflow

- Domain Layer
  - Entities
    - User
    - Order
    - Product
    - Payment
  - Business Rules
    - OrderValidation
    - PaymentAuthorization

- Infrastructure Layer
  - Data Access (Prisma ORM)
  - External Services
    - Stripe (payments)
    - SendGrid (email)
    - Firebase Cloud Storage (files)
  - Background Jobs
    - EmailQueue (BullMQ + Redis)
    - ReportGeneration (cron)

Data flow descriptions use arrows and text to show communication paths:

```
Browser -> Next.js SSR -> API Route -> Service -> Repository -> PostgreSQL
              |                            |
              v                            v
         React Component             External API (Stripe)
```

API contract summaries document the key interfaces between components:

```
POST /api/orders
  Request: { productId, quantity, paymentMethodId }
  Response: { orderId, status, totalAmount }
  Authorization: authenticated user
  Validates: product availability, payment method, user address
  
POST /api/webhooks/stripe
  Request: Stripe event object
  Authorization: Stripe webhook signature
  Handles: payment.intent.succeeded, payment.intent.failed
```

The system provides these descriptions at a level of detail appropriate for the project stage. Early-stage projects get high-level component diagrams. Detailed implementation phases get specific interface descriptions.

## Decision Framework

Architecture decisions follow a consistent framework: context, decision, consequences, and alternatives. The system documents each significant architecture decision using this framework so that the rationale is preserved for future developers.

Context describes the situation that requires a decision. What requirements, constraints, or forces are driving this choice? For example: "The application needs real-time notifications for order updates. The team has experience with WebSockets but not Server-Sent Events."

Decision describes what was chosen. For example: "We will use Server-Sent Events for real-time notifications because they are simpler to implement, work over standard HTTP, and are supported by all modern browsers. Our backend can stream events directly without additional infrastructure."

Consequences describe the results of the decision, both positive and negative. For example: "Positive: simpler architecture, no additional WebSocket server, automatic reconnection in browsers. Negative: unidirectional communication only (server to client), limited to 6 concurrent connections per browser, no built-in support in some reverse proxies."

Alternatives describe what was considered and why it was rejected. For example: "WebSockets: more complex infrastructure, bidirectional communication not needed, requires WebSocket-specific scaling considerations. Polling: simpler but less efficient for real-time updates."

The system applies this framework iteratively as architecture decisions are made. The accumulated decisions form an architecture decision record that serves as documentation for the project's architectural evolution.

## Do and Don't Recommendations

Do start with a layered architecture and add modular boundaries as the application's complexity grows. Simple projects need simple structures.

Do define clear client/server boundaries and ensure the server is authoritative for business logic and security enforcement.

Do document architecture decisions using the context-decision-consequences-alternatives framework to preserve rationale.

Do choose a monolith or modular monolith by default. Only recommend distributed services when there is clear evidence they are needed.

Do plan for scalability, but scale to the expected needs, not to hypothetical Google-scale traffic. Over-engineering for scale is waste.

Don't duplicate business logic across client and server. The server is authoritative; the client may mirror logic for UX only.

Don't introduce event-driven architecture for simple request-response workflows. Event-driven patterns add complexity without benefit for straightforward operations.

Don't create distributed services before understanding the domain. Start with a modular monolith and extract services when the boundaries are well-understood.

Don't let the technology stack dictate the architecture. Architecture should serve the requirements; the stack should serve the architecture.

Don't skip architecture validation. Present the architecture plan to the user for confirmation before writing implementation code.
