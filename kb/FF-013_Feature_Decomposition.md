# Feature Decomposition

Feature decomposition is the practice of breaking a high-level product idea into smaller, independently buildable modules that can be planned, estimated, developed, and tested in isolation. Without decomposition, teams attempt to build monolithic features that take months to deliver, integrate poorly with other parts of the system, and are impossible to test thoroughly. Proper decomposition creates a modular architecture where each piece has a clear responsibility, well-defined interfaces, and a natural owner. This document provides decomposition rules, detailed examples, and guidance for applying decomposition at any scale.

## Why Decompose?

A feature like "Build an online learning platform" is too large to plan or estimate. It contains dozens of distinct capabilities—user management, course creation, lesson delivery, assessment, certification, payments, analytics, messaging, and more. Attempting to plan all of these as a single unit guarantees that the team will underestimate the effort, miss critical details, and build a system that is tightly coupled and hard to change.

Decomposition addresses this by applying two principles: separation of concerns and single responsibility. Each module should handle one aspect of the overall system and should communicate with other modules through well-defined interfaces. When decomposition is done well, modules can be developed in parallel, tested independently, and replaced without affecting the rest of the system.

Decomposition also enables incremental delivery. Instead of waiting for the entire platform to be built before releasing anything, the team can deliver the authentication module first, then courses, then lessons, and so on. Each module can be released as it is completed, providing value to users earlier and generating feedback that informs subsequent modules.

## Decomposition Rules

Rule one: decompose by user workflow, not by technical layer. A common mistake is to decompose by "frontend," "backend," and "database," but this creates cross-cutting modules that cannot be delivered independently. Instead, decompose by the workflows that users actually perform: "user registration," "course browsing," "lesson completion," "quiz taking." Each workflow spans all technical layers but represents a self-contained capability.

Rule two: each module must have a clear boundary and a defined interface. Before building a module, specify what it depends on and what it provides to other modules. For example, a payment module depends on the user module (to know who is paying) and the order module (to know what is being paid for), and it provides a payment confirmation event that other modules can subscribe to. These interfaces should be defined as explicit contracts, not implicit assumptions.

Rule three: modules should be independently testable. If you cannot write a test for a module without spinning up the entire application, the module is not sufficiently decomposed. Each module should have a focused set of responsibilities and should accept their dependencies through dependency injection or a similar mechanism so they can be tested in isolation.

Rule four: limit inter-module communication to events and queries, not direct calls that create tight coupling. A module that directly calls another module's internal functions is tightly coupled to that module's implementation. Instead, modules should emit events when something happens ("user registered," "payment completed") and expose query interfaces that other modules can call through a defined API. This allows modules to be replaced, refactored, or removed without causing cascading failures.

Rule five: keep modules small enough that one person can understand them fully but large enough that they provide meaningful value. A module that contains only a single function is too small; the overhead of module boundaries outweighs the benefit. A module that contains an entire subsystem is too large. A good heuristic is that a module should implement one user-facing capability and be deliverable within a single development iteration or sprint.

## Detailed Example: Learning Management System

Decomposing "Build an LMS" produces the following modules:

Authentication and user management handles registration, login, password reset, profile management, and role-based access control (student, instructor, admin). It provides events like "user.registered" and "user.role.changed" that other modules can consume. This module should be built first because every other module depends on knowing who the user is.

Course management handles course creation, editing, publishing, and archiving. Instructors create courses with titles, descriptions, categories, pricing, and curriculum structure. The module emits "course.created," "course.published," and "course.archived" events. It depends on the authentication module for user identity and role validation.

Lesson management handles the creation and delivery of individual lessons within a course. Lessons can be video, text, PDF, or interactive content. The module tracks completion status for each student-lesson combination. It emits "lesson.completed" events that feed into the progress and analytics modules.

Quiz and assessment management handles the creation of quizzes, question banks, grading logic, and score tracking. It supports multiple question types: multiple choice, true/false, short answer, essay. Automated grading is available for objective question types, while subjective types require instructor review. The module emits "quiz.completed" and "quiz.graded" events.

Certificate management generates completion certificates when a student finishes all required lessons and passes all required assessments. It depends on the lesson and quiz modules to determine completion status. It provides downloadable PDF certificates with student name, course name, completion date, and a verification code.

Payment and enrollment management handles course purchasing, enrollment tracking, refund processing, and revenue reporting. It integrates with external payment providers. It emits "enrollment.created" and "payment.received" events. This module depends on the user and course modules.

Administration provides user management, course oversight, system configuration, and moderation tools. Administrators can suspend users, unpublish courses, manage site-wide settings, and view system logs. This module depends on most other modules but primarily in a read-only capacity.

Analytics and reporting tracks user engagement, course completion rates, revenue trends, popular content, and instructor performance. This module consumes events from other modules and provides aggregated data via dashboards and exportable reports. It is primarily read-only and can be built later without blocking other modules.

Notification and messaging handles email notifications, in-app notifications, and internal messaging between users. It subscribes to events from other modules and sends appropriate notifications: "You have been enrolled in a course," "Your quiz has been graded," "You have a new message from your instructor." It also provides a direct messaging feature for student-instructor communication.

Each of these modules can be developed and tested independently. The authentication module can be built and released first, allowing users to register before any courses exist. The course and lesson modules come next, enabling instructors to create content. Quiz, certificate, payment, and notification modules can be added incrementally. Analytics and admin modules can be developed in parallel with any of the later modules because they depend only on events and read-only access.

## Detailed Example: E-commerce Platform

Decomposing "Build an e-commerce platform" produces these modules:

Product management handles product creation, categorization, inventory tracking, pricing, variants (size, color), and media management. It emits "product.created," "product.updated," and "product.out-of-stock" events. It provides search and filtering interfaces for other modules to use.

Shopping cart manages the user's selected items, quantities, and saved-for-later items. It persists cart state across sessions so users do not lose their selections. It depends on the product module for product data and pricing.

Checkout and order management handles the order creation flow: address collection, shipping method selection, order review, and order placement. It creates an order record and transitions it through states: pending, confirmed, processing, shipped, delivered, cancelled, returned. It emits "order.placed," "order.shipped," and "order.cancelled" events.

Payment processing handles payment authorization, capture, refund, and payment method management. It integrates with payment gateways and handles webhook callbacks. It emits "payment.authorized" and "payment.settled" events. It depends on the order module for order data.

User account and profile handles registration, login, address book, wishlist, order history, and preferences. It provides user identity and address data to other modules.

Reviews and ratings manages product reviews, ratings, and moderation. Users can leave reviews for products they have purchased. It depends on the order module to verify purchase history and on the product module to associate reviews with products.

Inventory and fulfillment manages stock levels across warehouses, supplier orders, and fulfillment workflows. It integrates with shipping providers for label generation and tracking. It consumes "order.placed" events to trigger fulfillment and emits "fulfillment.completed" events.

Search and discovery provides full-text search, faceted navigation, personalized recommendations, and related products. It indexes products from the product module and provides a fast search API.

Admin dashboard provides order management, product management, customer management, discount and promotion configuration, analytics, and system configuration.

Each of these modules maps to a user workflow: browsing products, adding to cart, checking out, managing orders. They can be built incrementally. The product module is foundational and must come first. Cart and checkout follow. Payment, reviews, fulfillment, and search can be layered on in subsequent iterations.

## Detailed Example: Team Collaboration Tool

Decomposing "Build a team collaboration tool" produces these modules:

Workspace and team management handles organization creation, team membership, roles and permissions, and billing. It emits "workspace.created" and "member.added" events.

Channel and messaging handles public and private channels, direct messages, message threading, reactions, file attachments, and search. It depends on the workspace module for determining user membership and permissions. It emits "message.sent" and "channel.created" events.

Task and project management handles task creation, assignment, due dates, status tracking, project boards (Kanban), and task dependencies. It provides task data and events that feed into notifications and reporting.

Calendar and events handles event creation, meeting scheduling, calendar views (day, week, month), and integration with external calendar providers. It emits "event.created" and "event.updated" events.

File and document management handles file upload, storage, versioning, document collaboration (real-time editing), and permission-based access control. It depends on the workspace module for access control.

Notifications and activity feed collects events from all other modules and presents them in a unified activity feed with push notifications, email digests, and filterable streams.

Search provides cross-module full-text search across messages, files, tasks, and events. It indexes content from every other module and provides a unified search interface.

Integrations and API provides webhooks, REST API, OAuth authentication, and pre-built integrations with external services (GitHub, Slack, Google Drive). This module depends on most other modules to expose their capabilities through the API.

## Detailed Example: Healthcare Appointment System

Decomposing "Build a healthcare appointment system" produces these modules:

Provider management handles doctor profiles, specialties, availability schedules, credentials, and office locations. It emits "provider.availability.updated" events.

Patient management handles patient registration, medical history, insurance information, and communication preferences. It depends on authentication for identity and provides patient data to appointment booking.

Appointment booking handles slot selection, appointment creation, rescheduling, cancellation, and waitlist management. It depends on both provider and patient modules. It emits "appointment.created," "appointment.rescheduled," and "appointment.cancelled" events.

Telehealth integration handles video consultation links, waiting room management, session recording (with consent), and connection quality monitoring. It depends on the appointment module to determine which appointments are telehealth.

Medical records handles visit notes, prescriptions, lab results, imaging, and immunization records. Compliance with HIPAA or equivalent regulations is critical. It provides structured medical data accessible only to authorized providers and patients.

Billing and insurance handles claim submission, copay calculation, insurance verification, patient invoicing, and payment processing. It depends on both provider and patient modules for rate and coverage information.

Prescription management handles electronic prescription generation, pharmacy integration, prescription refills, and medication history. It emits "prescription.written" events.

Patient portal provides appointment history, bill payment, prescription refill requests, secure messaging with providers, and access to medical records.

Each module addresses a distinct healthcare workflow. Provider and patient modules must be built first. Appointment booking, medical records, and billing follow. Telehealth, prescription management, and the patient portal are value-add modules that can be layered on.

## Decomposition Anti-Patterns

The "kitchen sink" anti-pattern occurs when a module takes on too many responsibilities. The symptom is a module whose description contains the word "and"—"user management and notifications and reporting." This module should be split. If you cannot describe a module without using "and," it is not sufficiently decomposed.

The "tech layer" anti-pattern occurs when modules are organized by technology rather than workflow: "frontend module," "backend module," "database module." This creates tight coupling because a single user workflow spans all layers. Organize by workflow, not technology.

The "shared everything" anti-pattern occurs when modules share a database schema or pass around raw database records instead of defined data structures. This creates invisible coupling where changes in one module silently break another. Each module should own its data and expose it through an API, not through direct database access.

The "premature decomposition" anti-pattern occurs when modules are created for features that may never be built. Decompose for what you are building now, with enough foresight to avoid painting yourself into a corner, but do not create placeholder modules for hypothetical future features.

## Do's and Don'ts

Do decompose by user workflow. Do define module interfaces before implementation. Do make modules independently testable. Do use events for inter-module communication. Do keep modules focused on a single responsibility. Do build foundational modules first. Do document module dependencies in a dependency graph.

Don't decompose by technical layer. Don't create modules that share databases directly. Don't build placeholder modules for hypothetical features. Don't write module descriptions containing "and"—that signals too many responsibilities. Don't let modules call each other's internal functions. Don't start building before decomposition is complete enough to identify dependencies.

Feature decomposition is the most important planning activity a team performs. A well-decomposed system can be built incrementally, tested thoroughly, and maintained sustainably. A poorly decomposed system becomes a monolith that is hard to change, hard to deploy, and hard for any single person to understand. The time invested in decomposition is repaid many times over during development.
