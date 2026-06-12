# Requirement Analysis

The purpose of this document is to define how FoundryForge analyzes, categorizes, extracts, and validates requirements from user input. Requirement analysis is the bridge between what the user wants and what the system builds. Thorough requirement analysis prevents building the wrong thing, missing critical constraints, and producing software that does not satisfy the user's actual needs. The system treats requirement analysis as a mandatory first step for any project or feature, not as an optional exercise.

## The Requirement Analysis Process

Requirement analysis follows a structured process: capture, categorize, validate, and confirm. Capture means extracting all explicit and implicit requirements from the user's input. Categorize means organizing requirements into functional and non-functional categories, identifying actors, goals, constraints, and assumptions. Validate means checking requirements for completeness, consistency, and feasibility. Confirm means presenting the analyzed requirements back to the user for validation.

This process is iterative. As the system learns more about the project through clarification and detection, it refines its understanding of the requirements. New requirements may emerge during implementation, and existing requirements may need revision. The system accommodates this evolution without treating the initial analysis as final.

## Functional Requirements

Functional requirements describe what the system must do. They define specific behaviors, features, capabilities, and responses to inputs. The system extracts functional requirements from user requests by identifying action statements, feature descriptions, and behavioral specifications.

A functional requirement has three components: an actor, an action, and a condition. The actor performs the action under certain conditions. For example, "Registered users can create blog posts" has the actor (registered users), the action (create blog posts), and the implicit condition (the user is authenticated and authorized).

The system identifies functional requirements by looking for verbs and actions in user input. When the user says "I need users to be able to sign up with email and password," the system extracts: functional requirement F1 — users can register with email and password. When the user says "Posts should have a publish button that makes them visible to everyone," the system extracts: functional requirement F2 — authors can publish posts, making them publicly visible.

Functional requirements are written in a consistent format that makes them testable. A well-formed functional requirement is specific enough to verify. "Users can search posts" is vague. "Users can search posts by title and content using full-text search, with results sorted by relevance" is specific and testable.

The system groups related functional requirements into feature areas. Authentication requirements, posting requirements, and search requirements form three distinct groups. This grouping helps identify missing requirements within each area.

### Example Functional Requirement Extraction

User prompt: "I want a task management app where users can create projects, add tasks to projects, assign tasks to team members, and mark tasks as complete. Team members should get notified when they are assigned a task."

System extraction:
- F1: Users can create projects
- F2: Users can add tasks to specific projects
- F3: Users can assign tasks to team members
- F4: Users can mark tasks as complete
- F5: Team members receive notifications when assigned a task
- F6: Implicit — users can view projects and tasks (required to perform the above actions)
- F7: Implicit — users can manage team members within projects

The system identifies F6 and F7 as implicit requirements because the explicit requirements cannot function without them. A task management app where users cannot view projects or tasks is useless. These implicit requirements are surfaced to the user as assumed requirements.

## Non-Functional Requirements

Non-functional requirements describe how the system behaves, not what it does. They define quality attributes, constraints, and performance characteristics. Non-functional requirements are often more important to the long-term success of the system than functional requirements, yet they are more frequently overlooked.

The system extracts non-functional requirements from explicit user statements and infers them from context. When a user says "The app should load quickly," the system categorizes this as a performance requirement and asks for specific targets: "What would you consider an acceptable load time? Under one second? Under three seconds?"

When a user says "This is for a hospital," the system infers non-functional requirements around security, audit logging, HIPAA compliance, and availability. When a user says "This will have thousands of concurrent users," the system infers scalability and performance requirements.

The system categorizes non-functional requirements into several types: performance (response times, throughput, latency), scalability (ability to handle growth), security (authentication, authorization, data protection), reliability (uptime, fault tolerance, disaster recovery), maintainability (code quality, documentation, testability), usability (user experience, accessibility), and compliance (regulatory requirements, data sovereignty).

For each non-functional requirement, the system defines a measurable criterion when possible. "Fast" becomes "API responses under 200ms for 95th percentile." "Secure" becomes "All data encrypted at rest and in transit, authenticated API access, rate-limited endpoints." "Reliable" becomes "99.9% uptime SLA, automated failover, daily backups."

### Example Non-Functional Requirement Extraction

User prompt: "I'm building an e-commerce platform for a growing business. It needs to handle peak shopping seasons without going down, and customer payment data must be secure."

System extraction:
- NF1: Scalability — the system must handle traffic spikes during peak shopping seasons without degradation
- NF2: Reliability — the system must have high availability with minimal downtime
- NF3: Security — payment data must be protected in transit and at rest
- NF4: Implicit — PCI DSS compliance may be required for payment data handling
- NF5: Implicit — the system should support horizontal scaling for demand spikes

The system flags NF4 and NF5 as implications that the user should confirm. PCI DSS compliance is a significant requirement that affects architecture choices, and the system should not assume it without confirmation.

## Actor Identification

Actors are the entities that interact with the system. They include human users with different roles, external systems, and automated processes. Correct actor identification is essential because different actors have different permissions, different interfaces, and different functional requirements.

The system identifies actors by analyzing who performs each action in the user's description. Common actors include unauthenticated users (visitors), authenticated users (registered users), administrators, moderators, external APIs, webhook consumers, cron jobs or scheduled tasks, and internal services.

Each actor is defined with a clear description of their role, their goals, and their relationship to other actors. The system captures whether actors are mutually exclusive (a user cannot be both a regular user and an admin) or overlapping (a user can be both an author and a moderator).

### Example Actor Identification

User prompt: "I need a content management system where writers can draft articles, editors can review and publish them, and anyone can read published articles."

System identifies:
- Actor A1: Writer — can create and edit drafts, cannot publish
- Actor A2: Editor — can review drafts and publish articles, can unpublish
- Actor A3: Reader (unauthenticated) — can view published articles only
- Actor A4: Admin (implicit) — needs user management, role assignment capabilities

The system flags A4 as implicit because the user mentioned writers and editors but did not specify who assigns these roles. An admin role or self-service role assignment is needed.

## User Goals

User goals describe what each actor wants to accomplish. Goals are distinct from functional requirements — a goal is the desired outcome, while functional requirements are the specific system behaviors that enable that outcome. Understanding goals helps the system design better solutions that may go beyond the literal requirements.

The system extracts goals by asking "why" about each requirement. If the user says "Users need to upload profile pictures," the goal might be personalization, identity verification, or community building. Each goal suggests different implementation priorities. If the goal is identity verification, the profile picture needs moderation. If the goal is personalization, moderation is less critical.

Goals also help prioritize requirements. Features that directly serve primary user goals are higher priority than features that serve secondary goals or administrative convenience.

## Business Goals

Business goals describe what the organization wants to achieve through the system. They include revenue generation, user acquisition, engagement metrics, operational efficiency, and competitive positioning. Business goals may conflict with user goals, and the system identifies these conflicts when they arise.

If the business goal is maximizing user engagement, the system might suggest features like notifications, personalized content, and gamification. If the business goal is operational efficiency, the system focuses on automation, streamlined workflows, and integration with existing tools.

The system does not assume business goals. It asks the user about the business context when the system detects that business goals would significantly affect architecture or feature priority.

## Constraints

Constraints are limitations that the system must operate within. They include technical constraints (must run on specific infrastructure), organizational constraints (team size, skill level), time constraints (deadlines), budget constraints, regulatory constraints (GDPR, HIPAA, PCI DSS), and platform constraints (must work on specific browsers or devices).

The system identifies constraints from explicit user statements and from context. When the user mentions "We have a small team of two developers," the system adjusts its recommendations toward simpler architectures, fewer microservices, and more integrated tooling. When the user says "This must work offline," the system incorporates offline-first patterns.

Constraints often determine architecture decisions more than functional requirements do. A team of two developers cannot maintain a microservice architecture effectively, regardless of how well-designed the functional requirements are. The system prioritizes constraints when evaluating architectural options.

The system validates constraints against feasibility. If a constraint contradicts a functional requirement, the system flags the conflict. For example, "must work fully offline" conflicts with "requires real-time collaboration." The system cannot satisfy both simultaneously and asks the user to prioritize.

## Assumptions

Assumptions are beliefs that the system holds about the project that are not explicitly confirmed. Every assumption is a risk because it might be wrong. The system tracks assumptions explicitly and surfaces them to the user.

Common assumptions include the technology stack (assumed from file detection), the deployment environment (assumed from configuration files), the user's technical expertise (assumed from the nature of the request), the scale of the project (assumed from the described requirements), and the development workflow (assumed from project structure).

The system assigns a confidence level to each assumption. High-confidence assumptions are those supported by strong evidence, like detecting a `package.json` with specific dependencies. Low-confidence assumptions are those made with minimal evidence, like assuming a small project because the user gave a vague description.

Low-confidence assumptions are always surfaced to the user. High-confidence assumptions are surfaced only when acting on them would have significant consequences or when they affect multiple upcoming decisions.

## Missing Information Detection

The system detects missing information by analyzing the requirements against a completeness model. The completeness model defines what information is typically needed for a given type of project or feature. When information is missing, the system generates clarifying questions.

For a web application, the completeness model expects: frontend technology, backend technology, database, authentication, hosting, and domain. If the user describes an e-commerce application without mentioning payment processing, the system detects this as missing information and asks about payment requirements.

The system distinguishes between missing information that is essential and missing information that is optional. Essential missing information blocks progress. For a login feature, "how do users register?" is essential. "Do you want password reset?" is optional and can be deferred.

Missing information is detected through pattern matching against common requirement categories. The system knows that file upload features need storage configuration, size limits, and file type restrictions. If the user asks for file uploads without these details, the system flags them as missing.

The system also detects missing information by checking consistency. If the user describes a multitenant application but does not mention tenant isolation or billing, the system flags these as potentially missing requirements.

## Requirement Extraction Examples

### Full Example: Social Media Platform

User prompt: "I want to build a social media platform where users can create profiles, post text updates, follow other users, and see a feed of posts from people they follow."

System analysis:

Functional requirements:
- F1: Users can create and edit profiles
- F2: Users can post text updates
- F3: Users can follow and unfollow other users
- F4: Users can view a feed of posts from followed users
- F5: Implicit — users can register and authenticate (needed for all user-specific features)
- F6: Implicit — users can view other users' profiles
- F7: Implicit — users can unfollow users

Non-functional requirements:
- NF1: Feed generation should be performant (feed queries over large follow networks can be expensive)
- NF2: The system should handle read-heavy workloads (reading posts is more frequent than writing)

Actors:
- Visitor: can view public profiles and posts
- Registered user: can create profile, post, follow, view feed
- Admin: implicit requirement for content moderation

Missing information detected:
- Authentication method (email, social login, or both)
- Privacy settings (are posts public or can they be restricted?)
- Content moderation requirements
- Notification preferences (when followed, when someone posts)
- Mobile support vs web-only

### Minimal Example: Contact Form

User prompt: "I need a contact form on my website that sends me an email when someone submits it."

Functional requirements:
- F1: Visitors can submit a contact form with name, email, and message
- F2: The submission is sent as an email to the site owner

Missing information detected:
- Frontend technology (needs to match existing site)
- Backend email sending service (SMTP, SendGrid, SES, etc.)
- Spam protection (CAPTCHA, rate limiting)
- Storage of submissions (database or email-only)
- Validation requirements (required fields, format validation)
- Confirmation to the submitter (thank-you page or confirmation email)

## Requirement Validation Checklist

The system validates requirements against the following checklist before proceeding to architecture or implementation:

Completeness: Are all necessary requirements present for the described feature? Are there gaps that would prevent implementation?

Consistency: Do any requirements contradict each other? Does the user's description contain internal conflicts?

Feasibility: Can the requirements be implemented within the identified constraints? Are there technical, budgetary, or timeline blockers?

Clarity: Are the requirements specific enough to implement without ambiguity? Can a developer read the requirement and know exactly what to build?

Testability: Can each requirement be verified through testing? Is there a clear definition of done for each requirement?

Traceability: Can each requirement be traced back to a user need or business goal? Are there orphan requirements with no justification?

Priority: Have the requirements been prioritized? Does the user know what is essential for the first version versus what can be deferred?

Actor coverage: Have all actors been identified? Does each functional requirement specify which actor performs it?

## Do and Don't Recommendations

Do extract requirements systematically, separating functional, non-functional, actor, goal, constraint, and assumption categories.

Do identify implicit requirements that the user has not stated but that are necessary for the explicit requirements to function.

Do ask for measurable targets for non-functional requirements rather than accepting vague terms like "fast" or "secure."

Do flag contradictions between requirements and constraints, and ask the user to prioritize.

Do validate requirements against the completeness checklist before proceeding to architecture.

Don't assume missing requirements are intentional omissions. Ask rather than guessing.

Don't treat requirement analysis as a one-time activity. Revisit and refine as the project evolves.

Don't accept vague requirements without clarification. A requirement that cannot be tested is not a requirement.

Don't ignore implicit actors. If the user talks about writers and editors, they need someone to manage roles.

Don't proceed to architecture or implementation until requirements are validated and confirmed by the user.
