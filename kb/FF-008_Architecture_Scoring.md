# Architecture Scoring Rubric

This document defines a comprehensive scoring rubric for evaluating software architecture quality across eight dimensions: simplicity, maintainability, scalability, security, performance, modularity, cost, and developer experience. Each dimension is scored on a scale of 1 to 10, with detailed criteria, weighting guidance, and practical examples. The rubric is designed to be implementation-agnostic and applicable to any architecture from monoliths to microservices, serverless to serverful, and any programming language or framework.

## Scoring Overview

The overall architecture score is a weighted sum of eight dimension scores. The default weights sum to 100 and reflect the relative importance of each dimension for a typical production application. Teams should adjust the weights based on their specific context. For example, a startup building an MVP would weight simplicity and developer experience higher than scalability, while a fintech application serving millions of users would weight security and scalability higher.

| Dimension | Default Weight | Description |
|-----------|---------------|-------------|
| Simplicity | 15 | How easy is the architecture to understand and reason about? |
| Maintainability | 15 | How easy is it to modify, extend, and refactor? |
| Scalability | 12 | How well does the system handle growth in users, data, and traffic? |
| Security | 15 | How well does the architecture protect against threats? |
| Performance | 10 | How fast and efficient is the system under load? |
| Modularity | 12 | How well is the system decomposed into independent, cohesive modules? |
| Cost | 10 | How cost-effective is the architecture to build and operate? |
| Developer Experience | 11 | How productive are developers when working with this architecture? |

Each dimension score is calculated against specific criteria described below. Scores are guided by a 10-point scale: 1-2 (poor), 3-4 (below average), 5-6 (average), 7-8 (good), 9-10 (excellent). Score each dimension independently, then multiply by the weight to get the weighted contribution. The maximum total score is 1000, which is then divided by 10 to get a final score out of 100.

## Dimension 1: Simplicity (Weight 15)

A simple architecture is easy to understand, explain, and debug. It avoids unnecessary abstraction, indirection, and complexity. Simplicity does not mean simplistic—it means choosing the simplest solution that meets the requirements without over-engineering for hypothetical future needs.

Scoring criteria:

| Score | Characteristics |
|-------|----------------|
| 9-10 | A new team member can understand the full architecture in one day. No unnecessary layers or over-engineering. Standard patterns used throughout. Documentation is minimal because the code is self-explanatory. |
| 7-8 | The architecture is clear with minor complexity in a few areas. Most developers can understand it within a week. Some abstractions exist but serve a clear purpose. |
| 5-6 | Several areas of accidental complexity. Multiple abstraction layers that add little value. A new developer needs multiple weeks to understand the full picture. |
| 3-4 | Significant over-engineering. Many unnecessary abstractions, indirections, and frameworks. Understanding the system requires extensive documentation and handover. |
| 1-2 | Incomprehensible. No clear boundaries or patterns. Everything is connected to everything. No amount of documentation can make this system understandable. |

**Example**: A simple architecture uses a single backend monolith with BFF (Backend for Frontend) if needed, communicates via REST or a single message queue, and stores data in one primary database. It does not introduce event sourcing, CQRS, or a service mesh unless there is a demonstrated need.

**What to do**: Start with the simplest architecture that meets today's functional and non-functional requirements. Add complexity only when you have measured that the current architecture cannot meet a specific requirement.

**What to avoid**: Introducing event sourcing, microservices, CQRS, or hexagonal architecture "because we might need it later." These patterns add significant complexity and should be introduced in response to concrete, measured needs.

## Dimension 2: Maintainability (Weight 15)

Maintainability measures how easily the system can be modified, extended, and refactored over its lifetime. A maintainable architecture has clear separation of concerns, consistent coding patterns, comprehensive test coverage, and minimal coupling between components.

Scoring criteria:

| Score | Characteristics |
|-------|----------------|
| 9-10 | Clear module boundaries with well-defined interfaces. Tests cover 90%+ of critical paths. Changes to one module rarely affect others. CI/CD pipeline enforces code quality and runs tests automatically. |
| 7-8 | Good separation of concerns with some minor coupling. Test coverage is adequate. Most changes are localized to a single module. |
| 5-6 | Moderate coupling between modules. Test coverage is below 60%. Changes frequently require modifications in multiple modules. Refactoring is risky. |
| 3-4 | High coupling. Monolithic codebase with unclear boundaries. Few tests. Refactoring is very risky and often introduces regressions. |
| 1-2 | Untestable. No module boundaries. Any change anywhere can break anything. No test suite. Extending the system requires rewriting large portions. |

**What to do**: Enforce strict module boundaries with linting rules. Write tests alongside code—do not treat tests as a separate phase. Use the Dependency Inversion Principle to decouple modules so that high-level modules do not depend on low-level implementation details.

**What to avoid**: Shared mutable state across modules. Global variables. Singleton patterns that prevent testing. Deep inheritance hierarchies.

## Dimension 3: Scalability (Weight 12)

Scalability measures the system's ability to handle increased load—more users, more data, more traffic—without degrading performance or requiring a complete architectural overhaul.

Scoring criteria:

| Score | Characteristics |
|-------|----------------|
| 9-10 | Stateless application servers that scale horizontally with a load balancer. Database is designed for scale with read replicas, sharding, or partitioning. Caching is implemented at multiple levels. The architecture handles 10x growth with linear resource addition. |
| 7-8 | Most components are horizontally scalable. Some bottlenecks exist but are identified and documented. Caching is present but may need tuning. |
| 5-6 | Application servers can scale horizontally, but the database or a single service becomes a bottleneck. Some manual intervention is needed to handle traffic spikes. |
| 3-4 | Vertically scalable only. The application has many singletons or stateful services that prevent horizontal scaling. Database is a single point of failure. |
| 1-2 | Cannot scale at all. Architecture assumes a single process and single-threaded operation. Every component is a bottleneck. |

**What to do**: Design all application components to be stateless so they can be scaled horizontally. Identify and document any stateful components. Use database connection pooling. Implement caching at the CDN, application, and database levels. Design for failure with retry logic, circuit breakers, and graceful degradation.

**What to avoid**: Storing session state in application memory. Using sticky sessions that prevent even request distribution. Ignoring database connection limits. Assuming the database is infinitely scalable without replication or sharding.

## Dimension 4: Security (Weight 15)

Security scoring evaluates how thoroughly the architecture addresses authentication, authorization, data protection, input validation, and secure communication. Security must be designed into the architecture, not bolted on afterward.

Scoring criteria:

| Score | Characteristics |
|-------|----------------|
| 9-10 | Security is built in at every layer. Authentication is enforced by default. All user input is validated server-side. Secrets are managed in a secure vault and never appear in code or logs. Encryption in transit and at rest. Regular security audits and penetration testing. Incident response plan is documented and rehearsed. |
| 7-8 | Authentication and authorization are consistently enforced. Input validation exists but may not cover every edge case. Secrets are managed reasonably well. Encryption is enabled. |
| 5-6 | Basic authentication exists but authorization is ad-hoc. Some endpoints lack input validation. Secrets may appear in configuration files. Encryption in transit is present but not enforced everywhere. |
| 3-4 | Authentication is present but weak. Authorization checks are inconsistent or client-side only. Secrets are hardcoded in several places. No encryption or insufficient key management. |
| 1-2 | No authentication on critical endpoints. SQL injection vulnerabilities are present. Secrets committed to source control. No encryption. No security considerations in the architecture. |

**What to do**: Implement defense in depth—multiple independent security controls so that if one fails, others still protect the system. Apply the principle of least privilege to every component. Use a secrets manager. For Firestore-backed applications, encode all access rules in security rules, never in client code.

**What to avoid**: Relying solely on client-side security checks. Hardcoding API keys or database credentials. Exposing internal IPs, database connection strings, or stack traces in error messages.

## Dimension 5: Performance (Weight 10)

Performance measures how efficiently the system uses resources—CPU, memory, network, and database operations—to deliver acceptable response times under expected load.

Scoring criteria:

| Score | Characteristics |
|-------|----------------|
| 9-10 | Response times under 200ms for 95th percentile. Minimal database queries per request. Caching eliminates redundant computation and reads. Assets are optimized and served via CDN. Performance is monitored with real-user monitoring (RUM). |
| 7-8 | Response times under 500ms. Caching is used in critical paths. Database queries are mostly optimized. Some room for improvement. |
| 5-6 | Response times under 2 seconds. Some slow queries exist. Caching is minimal or missing. Performance optimization has not been prioritized. |
| 3-4 | Response times above 2 seconds. N+1 query problems are common. No caching. Database queries are not optimized. |
| 1-2 | Response times in the tens of seconds. Every page load triggers dozens of sequential requests. Database queries are unindexed and scan entire tables. |

**What to do**: Profile performance in realistic environments before optimizing. Address N+1 queries, missing indexes, and redundant API calls first—these yield the largest improvements. Implement database query logging and slow query monitoring.

**What to avoid**: Premature optimization that adds complexity without measurable benefit. Loading the entire database into memory. Making assumptions about bottlenecks without profiling.

## Dimension 6: Modularity (Weight 12)

Modularity measures how well the system is decomposed into independent, cohesive, loosely coupled modules. Modular systems are easier to develop in parallel, test in isolation, and replace incrementally.

Scoring criteria:

| Score | Characteristics |
|-------|----------------|
| 9-10 | Modules are small, cohesive, and independently deployable. Dependencies between modules are through explicit, versioned interfaces. A module can be replaced without changes to other modules. Module boundaries are enforced by the build system. |
| 7-8 | Clear module boundaries with some inter-module dependencies. Most modules are cohesive. A few modules may have too many responsibilities. |
| 5-6 | Modules exist but have blurry boundaries. High coupling between several modules. The module structure reflects the deploy mechanism rather than domain boundaries. |
| 3-4 | Few clear modules. Most of the system is in a single large module or package. Dependencies are tangled and circular. |
| 1-2 | No modular structure at all. Everything is in one monolithic layer. Any code depends on any other code. |

**What to do**: Decompose by business domain, not by technical layer. Each module should have a single reason to change. Use dependency injection to wire modules together at composition time. Define module boundaries that align with team responsibilities.

**What to avoid**: Splitting modules purely for technological reasons (e.g., "we need a frontend module and a backend module" is obvious; "we need a utils module" usually indicates a dumping ground). Avoid circular dependencies between modules.

## Dimension 7: Cost (Weight 10)

Cost evaluates the total cost of building and operating the architecture, including infrastructure, third-party services, development time, and ongoing maintenance.

Scoring criteria:

| Score | Characteristics |
|-------|----------------|
| 9-10 | Infrastructure costs are predictable and optimized. The architecture uses cost-efficient services (serverless, auto-scaling) that match the usage profile. No over-provisioned resources. Developer time is well-spent on value-adding features rather than operations. |
| 7-8 | Infrastructure costs are reasonable. Some cost optimization has been applied. A few services may be slightly over-provisioned for safety. |
| 5-6 | Costs are higher than necessary. Some over-provisioned resources. Cloud costs are not actively monitored. Manual intervention is needed to scale. |
| 3-4 | Significant over-provisioning. Expensive services used where cheaper alternatives exist. No cost monitoring or optimization. High operational overhead. |
| 1-2 | Unsustainable costs. Massively over-provisioned. Architecture requires expensive proprietary infrastructure when standard alternatives would work. |

**What to do**: Choose serverless or auto-scaling services that match your traffic patterns. Use reserved instances for predictable, steady-state workloads. Monitor cloud costs weekly and set budgets with alerts. Evaluate the total cost of ownership including development time and maintenance, not just infrastructure spend.

**What to avoid**: Over-provisioning "just in case." Running 24/7 instances for workloads that only need to handle traffic during business hours. Ignoring the cost of developer time wasted on overly complex architectures.

## Dimension 8: Developer Experience (Weight 11)

Developer Experience (DX) measures how productive and satisfied developers are when working with the architecture. Good DX means fast feedback loops, easy local development, clear documentation, and tooling that catches errors early.

Scoring criteria:

| Score | Characteristics |
|-------|----------------|
| 9-10 | Local development setup takes minutes, not hours. Hot reload works reliably. Tests run in under 30 seconds. Error messages are clear and actionable. CI/CD provides feedback within 5 minutes. Comprehensive API documentation and code generation are available. |
| 7-8 | Local setup takes 15-30 minutes. Most development is comfortable with occasional friction. Tests run within 2 minutes. CI/CD feedback within 10 minutes. |
| 5-6 | Local setup takes 1-2 hours. Running tests requires manual configuration. CI/CD takes 30 minutes. Some services require cloud connectivity for local development. |
| 3-4 | Local setup takes a full day. Many services require cloud connectivity. Tests are slow and flaky. CI/CD pipeline is unreliable. |
| 1-2 | Local development is nearly impossible. Everything requires cloud infrastructure. No test suite. No CI/CD. |

**What to do**: Provide a Docker Compose setup or equivalent for local development. Use mock or in-memory versions of external services for unit tests. Invest in fast CI/CD pipelines. Write clear README documentation for local setup. Use linters and formatters with IDE integration to catch issues before they reach review.

**What to avoid**: Requiring cloud service credentials for basic local development. Long-running CI pipelines that discourage developers from running tests. Opaque build processes that fail with unhelpful error messages.

## Scoring Example: SaaS Application

Let us score a typical Software-as-a-Service architecture: a Next.js frontend with a Node.js API, PostgreSQL database, Redis caching, deployed on Vercel with Cloudflare CDN.

| Dimension | Score | Weight | Weighted | Rationale |
|-----------|-------|--------|----------|-----------|
| Simplicity | 8 | 15 | 120 | Clear separation between frontend and API. Standard patterns. Minor complexity from caching layer. |
| Maintainability | 7 | 15 | 105 | Good module boundaries but test coverage is at 70%. Some database migration friction. |
| Scalability | 7 | 12 | 84 | Stateless API servers. PostgreSQL read replicas handle read load. Database writes are a bottleneck under extreme load. |
| Security | 8 | 15 | 120 | Authentication and authorization are solid. Input validation on most endpoints. Secrets are managed. CSP is configured. |
| Performance | 7 | 10 | 70 | Under 300ms p95 for most endpoints. Caching is effective but not tuned. Some slow queries exist. |
| Modularity | 7 | 12 | 84 | Domains are separated into modules. Some cross-module dependencies remain. Shared types create coupling. |
| Cost | 8 | 10 | 80 | Serverless deployment scales to zero. Reasonable monthly spend. Some over-provisioned reserved instances. |
| Developer Experience | 8 | 11 | 88 | Fast local setup with Docker. CI runs in 8 minutes. Hot reload works well. |
| **Total** | | **100** | **751** | **Final Score: 75/100** |

A score of 75/100 indicates a solid, production-ready architecture with identifiable areas for improvement. The team might focus on improving test coverage and addressing database write bottlenecks to raise the score in future evaluations.

## Scoring Example: Microservices Architecture

Consider an e-commerce platform with 15 microservices, event-driven messaging via Kafka, separate data stores per service, Kubernetes orchestration, and a GraphQL gateway.

| Dimension | Score | Weight | Weighted | Rationale |
|-----------|-------|--------|----------|-----------|
| Simplicity | 4 | 15 | 60 | 15 services with complex inter-service communication. New developers need weeks to understand the full flow. |
| Maintainability | 6 | 15 | 90 | Each service is independently maintainable, but end-to-end changes across services are complex. Good test coverage within services. |
| Scalability | 9 | 12 | 108 | Each service scales independently. Kafka handles massive throughput. Database per service prevents contention. |
| Security | 7 | 15 | 105 | Good per-service auth. Service mesh provides mTLS. Some services have inconsistent security patterns. |
| Performance | 6 | 10 | 60 | Inter-service latency adds overhead. GraphQL gateway is a bottleneck. Some services make too many downstream calls. |
| Modularity | 9 | 12 | 108 | Excellent domain decomposition. Each service is cohesive with explicit API boundaries. |
| Cost | 4 | 10 | 40 | Significant infrastructure cost for Kubernetes cluster and 15 services. Operational overhead is high. |
| Developer Experience | 5 | 11 | 55 | Complex local setup requiring multiple services running. CI/CD pipelines for each service. Testing across services is hard. |
| **Total** | | **100** | **626** | **Final Score: 63/100** |

This architecture excels in modularity and scalability but pays for it in simplicity, cost, and developer experience. A score of 63 indicates that the architecture may be over-engineered for the current scale—the team should evaluate whether the modularity benefits justify the complexity and cost.

## Using the Scoring Rubric

Apply the rubric during architecture reviews, before major refactors, and quarterly for existing production systems. Score each dimension independently based on the current state, not the intended state. Document the rationale for each score and specific improvement recommendations.

Teams should track their architecture score over time. A declining trend signals that technical debt is accumulating. Use the dimension scores to prioritize investments—if developer experience drops below 5, invest in tooling and CI improvements before adding new features.

The rubric is a communication tool first. The process of scoring forces the team to discuss trade-offs explicitly and align on priorities. The numeric score is useful for tracking trends but should not be used as a performance target or gate.
