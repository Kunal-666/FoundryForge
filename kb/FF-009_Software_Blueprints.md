# Software Architecture Blueprints

This document provides reusable architecture blueprints for twelve common application types: SaaS, CRM, CMS, E-commerce, Social Media, Learning Platform, Portfolio, Blog, Marketplace, Analytics Dashboard, and AI Application. Each blueprint describes the typical page structure, data model, core services, and key architectural decisions. These blueprints are implementation-agnostic—they describe what to build and why, not which specific frameworks to use. Use them as starting points for architecture design, adapting the patterns to your specific requirements, scale, and team capabilities.

## Software as a Service (SaaS) Blueprint

A SaaS application delivers software functionality through a subscription model with multi-tenant isolation, billing integration, and tiered feature access.

**Page Structure**: The typical SaaS application includes a public marketing site (landing page, pricing, documentation, blog), authentication pages (login, signup, password reset), an application shell with navigation (dashboard, settings, billing, team management), and feature-specific pages (project view, report viewer, configuration forms). Role-based routing ensures that users see only the pages their plan and role entitle them to.

**Data Model**: Multi-tenancy is achieved through a tenant-scoped data model. Every entity belongs to a tenant (organization or workspace). The core entities are Tenant (with subscription plan, payment method reference, and settings), User (with profiles across multiple tenants), TeamMember (joining users to tenants with a role), and domain-specific entities like Project, Task, or Document scoped to the tenant. Subscription data is typically stored in a billing provider (Stripe, Chargebee) with a reference in the local database.

**Core Services**: An authentication service handles sign-up flows, session management, and team invitation acceptance. A billing service synchronizes subscription state between the billing provider and the local database, provides usage metering, and enforces plan limits. A tenant provisioning service creates the initial tenant during sign-up and handles workspace configuration. Feature gate middleware checks the tenant's plan before granting access to premium features.

**Key Architectural Decisions**: Use tenant ID as a partition key in the database to ensure strict data isolation and efficient queries. Implement row-level security in SQL databases or collection-based security rules in Firestore that filter by tenant ID on every query. Choose a single-database-per-tenant or shared-database model based on your compliance requirements—shared databases are simpler to operate but single-tenant databases provide stronger isolation for enterprise compliance. Design for plan enforcement at the API layer, not just the UI, to prevent users from accessing features they have not paid for.

## Customer Relationship Management (CRM) Blueprint

A CRM system manages interactions with current and potential customers, tracking leads, contacts, deals, and communication history.

**Page Structure**: The CRM dashboard shows pipeline stages with deal counts and revenue forecasts. A leads page provides a list view with filters for source, status, and assignee. The contacts page displays individual and company records. A deals page shows the sales pipeline as a Kanban board with stages from prospecting to closed-won. Detail pages for each entity show activity history, notes, and related entities. Reporting pages provide charts for conversion rates, sales velocity, and team performance.

**Data Model**: The central entities are Contact (individual person with name, email, phone, company), Company (organization with industry, size, address), Lead (unqualified prospect that converts to Contact and Deal upon qualification), Deal (opportunity with value, stage, probability, expected close date), Activity (email, call, meeting, note associated with a Contact or Deal), and Pipeline (stages and workflows). Activities are often modeled as a subcollection or separate table with polymorphic associations to Contacts and Deals.

**Core Services**: A pipeline service manages stage transitions and calculates stage durations. A scoring service ranks leads based on engagement, demographic fit, and behavioral signals. A search service provides full-text search across contacts, companies, and deals. An activity feed service aggregates recent interactions and surfaces them on the contact and deal detail pages. An import/export service handles CSV and vCard data ingestion.

**Key Architectural Decisions**: Design the pipeline stage model to be configurable by administrators rather than hardcoded, since sales workflows vary significantly across industries. Use an append-only log for activity data to preserve the audit trail—activities should never be deleted, only annotated with corrections. Implement real-time updates via WebSocket or Firestore listeners for the Kanban board so that multiple sales representatives see changes instantly.

## Content Management System (CMS) Blueprint

A CMS enables non-technical users to create, edit, and publish digital content without developer involvement.

**Page Structure**: The authoring interface includes a content dashboard showing published, draft, and scheduled content counts, a content list with filters and bulk actions, a rich editor page with preview capabilities, a media library for image and file management, user management for editors and contributors, and settings pages for content types, taxonomies, and workflow configuration. The public-facing side delivers rendered pages optimized for SEO and performance.

**Data Model**: The Content model uses a polymorphic structure where each content type (article, page, product description) has a set of typed fields defined in a schema. The core entities are ContentEntry (with status, author, publish date, slug, SEO metadata), ContentType (defining the field schema for a content type), Taxonomy (categories and tags with hierarchical relationships), Media (assets with URLs, dimensions, alt text), and Revision (version history for each ContentEntry). A pivot table maps content-to-taxonomy associations.

**Core Services**: A rendering service compiles content entries into HTML or JSON for delivery, optionally caching the output at the CDN level. A workflow service manages content lifecycle transitions (draft to review to published) and sends notifications to assigned reviewers. A media optimization service resizes images, generates thumbnails, and serves responsive image sets. A search indexing service builds and updates a full-text search index for public content. A webhook service notifies downstream systems (CDN cache purger, static site generator) when content is published.

**Key Architectural Decisions**: Implement a headless architecture where the content API is decoupled from the presentation layer, allowing the same content to be rendered in web, mobile, and third-party contexts. Use a revision strategy that stores full document snapshots rather than diffs to simplify rollback and avoid the complexity of reconstructing content from diffs. Cache published content aggressively at the CDN layer and clear the cache selectively when content is updated. Design content types as schema-based documents (stored as JSON) rather than rigid relational tables to support customizable fields without migrations.

## E-Commerce Blueprint

An e-commerce platform enables product browsing, shopping cart management, checkout, payment processing, and order fulfillment.

**Page Structure**: The storefront includes a homepage with featured products and categories, a search results page with faceted navigation, a product detail page with images, descriptions, and variants, a shopping cart page, a checkout flow (shipping, payment, review), an order confirmation page, an account page with order history, and an admin area for inventory and order management.

**Data Model**: Product is the core entity with name, description, price, images, and variant options (size, color). SKU represents a specific product variant with its own price, inventory count, and barcode. Category forms a hierarchical taxonomy for product organization. Cart belongs to a user or session and contains CartItems referencing SKUs with quantities. Order captures completed purchases with line items, shipping address, payment details, and status. Inventory records stock levels per SKU at each warehouse location. The Product-Category relationship is many-to-many, typically through a product_category join table.

**Core Services**: A catalog service handles product search with faceted filters, sorting, and pagination. A cart service manages add/remove/quantity-update operations with real-time inventory checks. A checkout service orchestrates the multi-step checkout flow, calculating taxes, shipping costs, and applying discount codes. A payment service integrates with Stripe, PayPal, or another payment processor, handling tokenization and payment confirmation. An order service creates orders from completed checkouts, manages fulfillment status transitions, and triggers shipment notifications.

**Key Architectural Decisions**: Treat inventory as a source of truth and check stock at checkout time, not at add-to-cart time, to avoid overselling during high-demand events. Use idempotency keys on order creation to prevent duplicate charges when the payment confirmation or checkout completion is retried. Implement a cart merge strategy for logged-in users who add items to cart while logged out. Design for high read volume on the catalog with aggressive caching of product data, and lower but transactionally critical writes on orders.

## Social Media Blueprint

A social media platform enables users to create profiles, share content, connect with other users, and interact through comments and reactions.

**Page Structure**: The feed page shows a chronologically or algorithmically sorted stream of posts from followed users. The profile page displays user information, bio, avatar, and a grid or list of their posts. Discovery pages help users find new people and content through search and recommendations. The post detail page shows a single post with its comments, reactions, and share options. Messaging pages provide direct one-to-one or group conversations. Notification pages aggregate likes, comments, follows, and mentions.

**Data Model**: User is the central profile with bio, avatar URL, follower/following counts, and preferences. Post contains text, media attachments, author reference, and engagement metrics. Comment links to a post and a parent comment for threaded replies. Reaction maps a user to a post with a reaction type (like, love, etc.). Follow creates a directed relationship between two users. Notification stores in-app notifications per user. Message and Conversation model direct messaging with read receipts.

**Core Services**: A feed service generates and serves personalized feeds using either a fan-out-on-write pattern (pre-compute feeds for followers when a post is created) or a fan-out-on-read pattern (compute the feed at request time from the followed users' recent posts). A notification service handles event-driven notification creation across email, push, and in-app channels. A social graph service manages follow relationships and provides recommendations for users to follow. A content moderation service scans posts for spam, hate speech, and policy violations using automated tools with human review fallback.

**Key Architectural Decisions**: The feed generation strategy is the most consequential decision. Fan-out-on-write provides fast reads at the cost of write amplification—a user with 10,000 followers generates 10,000 feed entries per post. Fan-out-on-read avoids write amplification but requires faster query infrastructure. Many platforms use a hybrid approach that fans out to active followers and reads from a secondary index for long-tail followers. Use a time-series or ordered key-value store for feed data rather than a general-purpose relational database, as feed queries are heavily optimized for ordered reads of recent content.

## Learning Platform Blueprint

A learning management system (LMS) delivers structured educational content, tracks learner progress, and provides assessment tools.

**Page Structure**: The course catalog lists available courses with search and filter capabilities. The course detail page shows syllabus, instructor information, reviews, and enrollment options. The learning interface provides a structured content player with video, text, quizzes, and progress indicators. The dashboard tracks enrolled courses, completion rates, and earned certificates. Assessment pages present quizzes, assignments, and exams with submission and grading workflows.

**Data Model**: Course contains metadata, description, instructor reference, and pricing. Module groups lessons within a course in a specific sequence. Lesson is the fundamental content unit—video, article, interactive exercise, or quiz question. Enrollment joins a user to a course with enrollment date, progress, and expiration. Progress tracks per-lesson completion with scores on assessments. Certificate represents a completed course credential. Review captures user ratings and feedback for courses.

**Core Services**: A content delivery service serves video content streamed from a CDN, with adaptive bitrate streaming and DRM where required. A progress tracking service records lesson completions and calculates overall course progress, triggering certificate generation when all requirements are met. An assessment engine grades quizzes, manages timed exams, and handles partial credit and retake policies. A recommendation engine suggests courses based on the learner's history, role, and skill gaps.

**Key Architectural Decisions**: Design the lesson content model to support multiple content types (video, SCORM packages, HTML5 interactive content, PDFs) through a plugin architecture rather than a monolithic schema. Store progress updates as append-only events to support analytics and prevent data loss from concurrent updates. Implement bookmarking that automatically saves the learner's position in video and interactive content so they can resume precisely where they left off. Use offline support for mobile learners who may not have continuous internet connectivity.

## Portfolio Blueprint

A portfolio website showcases an individual's work, skills, and professional background for career or business development purposes.

**Page Structure**: The homepage introduces the individual with a tagline, brief bio, and featured work. The portfolio grid displays project cards with thumbnails, categories, and brief descriptions. The project detail page presents case studies with images, descriptions, technologies used, and outcomes. The about page provides a detailed background, resume, skills section, and testimonials. The contact page offers a contact form, social links, and optionally a calendar booking widget.

**Data Model**: Profile stores personal information, bio, avatar, resume link, and social media URLs. Project represents a portfolio item with title, description, images, tags, technologies used, live URL, source code URL, and date completed. Skill categorizes competencies with proficiency levels. Testimonial displays endorsements from clients or colleagues. ContactMessage stores form submissions. The data model is deliberately simple because portfolio sites have limited entities and straightforward relationships.

**Core Services**: A media service optimizes portfolio images for different display sizes and formats. A contact form service validates and delivers form submissions via email or a CRM integration. A static generation service pre-builds portfolio pages for fast delivery. Analytics tracking (optional) measures page views and engagement.

**Key Architectural Decisions**: A static site architecture is ideal for most portfolios—build-time page generation provides excellent performance, security, and minimal operational cost. Use a headless CMS for the content management layer so the portfolio owner can update projects without touching code. Prioritize image optimization because portfolios are image-heavy and slow-loading images directly impact the user's perception of the work. Implement SEO best practices with semantic HTML, Open Graph tags, and structured data since portfolios rely heavily on search discovery.

## Blog Blueprint

A blog publishes articles, tutorials, and opinion pieces with support for categories, tags, comments, and RSS feeds.

**Page Structure**: The homepage shows a list of recent articles with featured images and excerpts. The article page renders full content with author bio, social sharing buttons, comments section, and related posts. The category and tag pages list articles filtered by taxonomy. The archive page provides date-based browsing. The search results page displays matching articles ranked by relevance. An optional newsletter sign-up page collects subscribers.

**Data Model**: Post stores title, slug, body, excerpt, featured image, published date, status (draft/published/scheduled), and author reference. Category and Tag are taxonomies for content organization with many-to-many relationships to posts. Author contains name, bio, avatar, and social links. Comment has a tree structure via parent_id for threaded replies. NewsletterSubscriber stores email addresses with subscription status and source. The data model mirrors the CMS blueprint at a smaller scale.

**Core Services**: A rendering service converts Markdown or rich text body content to HTML with syntax highlighting, table of contents generation, and image lazy loading. An RSS service generates feed XML for subscribers. A newsletter service integrates with Mailchimp, Substack, or a similar platform to send new-post notifications. A search service indexes post content and metadata.

**Key Architectural Decisions**: Use static generation for article pages with incremental static regeneration for updates, providing CDN-level performance without sacrificing content freshness. Store article body content in Markdown for portability and version control friendliness, rendering to HTML at build or request time. Implement pagination with cursor-based pagination for article lists rather than offset-based, since articles are frequently added to the beginning of the list. Configure caching headers to balance freshness for article pages (which change rarely) with index pages (which change as new content is published).

## Marketplace Blueprint

A marketplace connects buyers and sellers, facilitating transactions, reviews, and dispute resolution.

**Page Structure**: The marketplace homepage features popular listings, categories, and search. The listing detail page displays the item description, price, seller information, reviews, and purchase options. The search results page provides extensive filtering by category, price range, location, condition, and seller rating. The seller dashboard shows listing management, sales analytics, and payout information. The buyer dashboard shows purchase history, favorites, and saved searches. The checkout page handles payment, shipping, and any applicable fees.

**Data Model**: Listing represents an item for sale with title, description, price, condition, images, and category. Seller and Buyer profiles contain user-specific data beyond the shared user account. Order captures the transaction between buyer and seller with line items, total, fees, status, and payment reference. Review captures buyer feedback on sellers and optionally seller feedback on buyers. Dispute handles transaction conflicts with resolution tracking. Payout tracks seller earnings and payment disbursements. TransactionFee records platform fees per transaction.

**Core Services**: A listing service manages create, update, search, and promote operations. A search service with faceted filtering supports attribute-based filtering (size, color, price range) specific to the marketplace's vertical. A transaction service handles the purchase flow, escrow logic, and fee calculation. A rating service aggregates reviews and calculates seller reputation scores. A dispute resolution service manages claims, evidence submission, and mediation workflows.

**Key Architectural Decisions**: Implement an escrow or payment-hold pattern to protect both buyers and sellers—release funds to the seller only after the buyer confirms receipt or a hold period expires. Design the rating system to be resistant to gaming with measures like verified-purchase-only reviews and recency-weighted averages. Handle the chicken-and-egg problem by designing for low friction on the supply side initially (easy listing creation) and building demand-side features (recommendations, personalized search) as the marketplace grows. Use geospatial indexing for physical goods marketplaces to support location-based search.

## Analytics Dashboard Blueprint

An analytics dashboard visualizes business data through charts, tables, and interactive filters, helping users make data-driven decisions.

**Page Structure**: The overview dashboard provides a high-level summary with key metrics, trend sparklines, and alerts. The reports section contains predefined report types (revenue report, user growth, conversion funnels) with date range selectors and grouping controls. The explore page offers a flexible query builder for ad-hoc analysis. The dashboards page lets users create, save, and share custom dashboard layouts. The alerts page configures threshold-based notifications.

**Data Model**: The analytics data model is structured around events and dimensions. Event stores individual actions (page view, purchase, sign-up) with a timestamp and properties as JSON. Metric is a computed aggregation (revenue, active users, conversion rate) stored in pre-aggregated tables or rollups. Dimension provides grouping context (date, user segment, country, device type). Dashboard defines a collection of widgets with layout positions. Widget stores a visualization configuration with query parameters and display settings.

**Core Services**: An event ingestion service accepts high-volume event streams, validates them, and writes them to a data store or message queue. A query engine executes analytical queries efficiently, pushing computation down to the database layer where possible. An aggregation service runs periodic batch jobs to compute rollups, reducing query time on high-cardinality data. A visualization service renders chart configurations using a charting library with responsive design. An alerting service evaluates metric thresholds and triggers notifications via email, Slack, or webhook.

**Key Architectural Decisions**: The most critical decision is how to store and query analytical data. Traditional transactional databases are unsuitable for the scan-heavy, aggregation-intensive queries that analytics dashboards require. Use a columnar database (ClickHouse, BigQuery, Snowflake) or a time-series database (TimescaleDB, InfluxDB) for analytical workloads. Pre-aggregate metrics on a schedule (hourly, daily) to serve common queries from rollup tables while allowing raw-data queries for ad-hoc exploration. Use a caching layer (Redis, Memcached) for dashboard data that refreshes on a fixed interval. Design query timeouts to prevent runaway queries from degrading the database for other users.

## AI Application Blueprint

An AI application integrates machine learning models into a user-facing product for tasks like generation, classification, recommendation, or prediction.

**Page Structure**: The interface varies significantly by application type, but a common pattern includes an input area (text prompt, file upload, parameter configuration), a results display (generated content, predictions, visualizations), a history panel showing past queries and results, a settings page for model selection, temperature, and other inference parameters, and optionally a feedback mechanism for rating output quality.

**Data Model**: Prompt stores the input text or parameters sent to the model, along with metadata like model version and token count. Generation stores the model output with references to the input prompt and generation parameters. Feedback captures user ratings and corrections on model outputs. Usage tracks token consumption per user for billing and rate limiting. ModelConfiguration stores provider-specific settings and version references. FineTuningJob and FineTunedModel track custom training runs and their resulting models.

**Core Services**: An inference service routes requests to the appropriate model provider (OpenAI, Anthropic, self-hosted), handles retries and fallbacks, and streams responses when supported. A prompt management service constructs prompts with templates, inserts context, and enforces prompt guidelines. A context service retrieves relevant information from a vector database or knowledge base to augment prompts (RAG pattern). A moderation service scans inputs and outputs for policy violations, PII leakage, and harmful content. A usage tracking service counts tokens, enforces rate limits, and reports usage metrics for billing.

**Key Architectural Decisions**: Implement a prompt template system that separates prompt structure from user input to prevent prompt injection attacks. Use a content moderation layer on both input and output to catch policy violations and PII leakage before users see them. Design for streaming responses by default—users expect to see generation output incrementally rather than waiting for the complete response. Cache identical or near-identical requests using semantic caching (embeddings-based similarity matching) to reduce API costs and latency. Implement a fallback chain that routes to alternative models or degraded modes when the primary model is unavailable or rate-limited. Log all interactions comprehensively for debugging, auditing, and dataset curation for future fine-tuning.

## Cross-Cutting Patterns and Recommendations

Several patterns recur across multiple blueprints and are worth implementing consistently regardless of the application type.

**Authentication and User Management**: Every blueprint except Portfolio benefits from a centralized authentication service that handles sign-up, login, session management, and account recovery. Use the same auth provider across all services to avoid fragmented user databases and inconsistent login experiences.

**API Architecture**: For multi-service architectures, use a gateway pattern (API Gateway or BFF) that handles authentication, rate limiting, request routing, and response transformation. This keeps cross-cutting concerns out of individual services and provides a single entry point for API consumers.

**Observability**: Every production application should emit structured logs, metrics, and traces. Standardize on a logging format across services, use consistent metric naming conventions, and implement distributed tracing for request flows that cross service boundaries.

**Error Handling**: Design a consistent error response format that includes an error code, a human-readable message, and a correlation ID for debugging. Use the same format across all API endpoints so that client-side error handling code is uniform.

**Configuration Management**: Externalize all environment-specific configuration (API keys, database URLs, feature flags) from application code. Use a configuration service or environment variable injection that varies by deployment environment without requiring code changes.

These blueprints provide starting points, not rigid templates. Every real application will deviate from the blueprint based on its specific requirements, constraints, and context. The value of the blueprint is in making the implicit architectural decisions explicit so that the team can evaluate them, adapt them, and document their rationale.
