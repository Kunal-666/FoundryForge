# Roadmap Generation

A software roadmap translates a product vision into a phased, time-bound plan that coordinates engineering effort, business priorities, and user needs. This document defines how to generate, structure, and maintain roadmaps that are realistic, adaptable, and aligned with delivery constraints. Roadmap generation is not a one-time exercise—it is a recurring discipline that balances ambition with evidence, sequencing decisions so that every phase builds on the last while managing risk and uncertainty.

## Phase Planning

A phase is a bounded period of work that delivers a meaningful, testable outcome. Phases typically last between four and twelve weeks, though the exact cadence depends on team velocity, organizational rhythms, and the complexity of the problem. The purpose of phase planning is to break an otherwise overwhelming vision into digestible chunks where each chunk produces something that can be demonstrated, measured, and learned from.

The first phase should always answer the biggest unknown. If you are building a payment system, the biggest unknown might be whether users trust your checkout flow, not whether the database can handle a million rows. This principle—tackle risk before convenience, uncertainty before scale—prevents teams from spending months building infrastructure for a product that has not yet proven its core value proposition. Each subsequent phase should retire the next-biggest risk.

When defining a phase, establish three things: the goal (what problem are you solving), the scope (what features are in and out), and the exit criteria (how do you know the phase is done). Exit criteria must be objective: "users can complete checkout with a credit card" is better than "payment system is stable." Without clear exit criteria, phases blur into each other, and what was meant to be a six-week cycle stretches into four months.

Phase planning also requires a buffer. No plan survives contact with development. Reserve fifteen to twenty percent of each phase for unplanned work—bugs, technical debt, feedback-driven changes, and discovery tasks that emerged during the phase. This buffer is not slack for poor estimation; it is an acknowledgment that software development is inherently uncertain and that pretending otherwise only guarantees missed dates.

## MVP Definition

The minimum viable product is the smallest version of your product that can be shipped to early users and generate validated learning. The most common mistake in MVP definition is confusing "minimum" with "incomplete." An MVP is not a prototype or a proof of concept—it is a shippable product that delivers enough value that a real user would choose to use it rather than walk away.

To define an MVP, start with the user journey. Identify the single most important task a user must accomplish for the product to be useful. For a project management tool, that task might be "create a task and assign it to someone." For a food delivery app, it might be "order food from a nearby restaurant and have it delivered." Strip away everything that is not strictly necessary to complete that core journey. Features like team dashboards, reporting, notification preferences, dark mode, and integrations are all valuable, but none of them are required for the MVP.

A helpful heuristic is the "surgery rule": if you had to stop development forever after the MVP launch, would the product still be useful on its own? If the answer is no, the MVP is too small. If the answer is yes but no one would pay for it or tell a friend about it, the MVP is probably too small as well. The goal is a product that is useful, usable, and compelling within a narrow scope.

Consider this example: a SaaS analytics dashboard. The MVP might include a single dashboard view showing page views, sessions, and bounce rate for the past seven days. It would not include custom date ranges, saved reports, email exports, team collaboration, anomaly detection, or integrations with other tools. The MVP is intentionally limited, but it answers the core question: "Will someone use this to understand their traffic?" If they will, you have validated the concept and can expand. If they will not, you have learned something critical before investing months in advanced features.

## Milestone Definition

Milestones are checkpoints within and across phases that mark meaningful progress. Unlike exit criteria, which signal that a phase is complete, milestones are intermediate signals that keep the team oriented and stakeholders informed. A milestone should be concrete enough that anyone on the team can look at it and say "yes, that happened" or "no, it did not."

Good milestones are not about percentage completion. "Backend is 50% done" is not a milestone; it is a guess. "User registration API returns 201 for valid requests and 422 for invalid data" is a milestone. "Checkout flow works end-to-end in staging" is a milestone. Each milestone should be associated with a demonstration: someone can run a command, visit a URL, or view a screen and verify the milestone is met.

Milestones serve a second purpose: they create natural go/no-go decision points. If the team misses a milestone by more than a week, that is a signal that something has gone wrong—the estimate was bad, the approach is wrong, or the scope is too large. Rather than pushing harder to make up time, the team should pause, reassess, and potentially rescope. Milestones that are repeatedly missed are not a failure of execution; they are a failure of planning, and the plan must be adjusted.

## Sprint Suggestions

Sprints are the tactical execution layer within a phase. While the roadmap defines what you are building and when, sprints define how the team organizes day-to-day work to deliver those outcomes. The sprint length should be consistent—typically one or two weeks—so that the team develops a reliable rhythm.

When suggesting sprint content, do not simply divide the phase work evenly across sprints. Instead, sequence sprints to maximize learning and reduce risk early. In a four-sprint phase, the first sprint should tackle the highest-risk, most-uncertain work. If the team discovers that their approach to a core algorithm is fundamentally flawed, it is far better to learn that in sprint one than sprint three. Lower-risk work—polish, documentation, minor UI tweaks—should go in later sprints where it serves as predictable work if earlier sprints finish ahead of schedule.

Each sprint should have a theme that ties its stories together. A sprint theme like "connect the payment provider" is clearer and more motivating than "sprint 3 tasks." The theme helps everyone—engineers, designers, product managers—understand what success looks like for that sprint and how it contributes to the phase goal.

Sprint planning must account for dependencies. If the frontend team needs an API that the backend team will not deliver until sprint three, the frontend cannot meaningfully work on that feature in sprint two. Map dependencies explicitly during phase planning and adjust sprint sequencing accordingly. Sometimes this means the frontend team works on a different feature first, or builds against mock APIs that will be replaced later.

## Risk Identification and Mitigation

Risk management is not a separate activity that happens after planning; it is integral to the planning process itself. Every feature, every dependency, every technical choice carries risk. The job of the roadmap is to identify those risks early and build mitigation strategies into the plan.

Risks fall into several categories. Technical risk arises when the team is using an unfamiliar technology, integrating with an external system that may be unreliable, or building something that pushes the boundaries of the current architecture. Schedule risk emerges from overly optimistic estimates, unclear requirements, or external dependencies outside the team's control. Value risk is the possibility that you are building something users do not actually want. Market risk involves competitors, regulatory changes, or shifts in user behavior.

For each risk, decide whether to accept, avoid, transfer, or mitigate. Acceptance means you acknowledge the risk but choose not to act—this is appropriate for low-probability, low-impact risks. Avoidance means changing the plan to eliminate the risk, such as choosing a well-known library over an experimental one. Transfer means shifting the risk to someone else, such as using a third-party payment provider rather than building your own. Mitigation means taking proactive steps to reduce either the likelihood or the impact of the risk.

A concrete example: if your team has never built real-time collaboration features, that is a significant technical risk. Mitigation strategies might include building a small prototype in the first week of the phase, pairing an experienced engineer with a less experienced one, or using a managed service like Firebase Realtime Database instead of building custom WebSocket infrastructure. The mitigation is baked into the plan, not left as an afterthought.

## Priority Ordering (MoSCoW)

The MoSCoW method categorizes every item into four buckets: Must have, Should have, Could have, and Will not have. This framework forces explicit trade-offs and prevents scope creep by naming what will not be delivered, not just what will.

Must-have items are non-negotiable for the current phase. Without them, the phase goal cannot be achieved. For an MVP, must-haves are the absolute minimum to deliver the core user journey. If a must-have slips, the phase is not complete. Limiting must-haves to no more than sixty percent of total effort is a good rule of thumb—if everything is a must-have, nothing is.

Should-have items are important but not critical. They add significant value, and the team intends to deliver them, but they can be deferred if necessary. The difference between a must-have and a should-have is the difference between a user completing a purchase and a user receiving a confirmation email. The purchase is the must-have; the email is a should-have.

Could-have items are desirable improvements that will only be included if time and resources permit. These are the first items cut when the team runs into unexpected complexity. The key discipline with could-haves is to resist the temptation to promote them to should-haves simply because they are nice. Be ruthless: if a could-have would take three days and the phase has no buffer, it does not go in.

Will-not-have items are explicitly excluded from the current phase. This category is the most important because it prevents the "yes, and" pattern that causes scope creep. By naming what is not happening, you give the team permission to stop thinking about it. "We will not have team collaboration features in this phase" clarifies expectations for stakeholders and frees the team to focus.

## Deliverable Definition

Every item on the roadmap must be associated with a deliverable that is concrete, verifiable, and meaningful. A deliverable is not "implement search." It is "users can search products by name and category, with results returned within 500 milliseconds." The deliverable defines the acceptance criteria and makes it clear what done looks like.

Deliverables should be written in language that both technical and non-technical stakeholders can understand. "The API endpoint GET /api/products returns a JSON array of product objects filtered by query string parameters" is precise but excludes stakeholders who do not speak REST. "A user can type a product name into the search bar and see matching products appear below" includes the same information but is accessible to everyone.

Each deliverable should also specify what is explicitly out of scope. A search deliverable might state: "Fuzzy matching, autocomplete suggestions, and search analytics are out of scope for this deliverable." This prevents the classic pattern where a QA tester or stakeholder expects a more sophisticated version than what was planned.

## Example Roadmap: 3-Phase SaaS Launch

Consider a SaaS product for freelance invoice management. The vision is a platform where freelancers can create invoices, track payments, manage clients, and generate tax reports.

Phase one (MVP, eight weeks) focuses on the core transaction: creating and sending an invoice. Must-haves include user registration with email and password, a client contact list, invoice creation with line items, PDF generation, invoice sending via email, and payment tracking (paid, pending, overdue). Should-haves include invoice templates and a dashboard showing outstanding balances. Could-haves include recurring invoices and payment reminders. Will-not-haves include tax reports, time tracking, expense tracking, team collaboration, and mobile apps. Milestones include user registration working end-to-end by week two, invoice creation by week four, PDF generation and email sending by week six, and the full flow tested and deployed by week eight.

Phase two (six weeks) expands the product to cover payment collection. Must-haves include credit card payment via Stripe integration, automatic invoice marking as paid, payment receipts, and a payment history view. Should-haves include bank transfer instructions on invoices and partial payment support. Could-haves include PayPal integration and payment reminders. Will-not-haves include tax reports and expense tracking. The risk in this phase is the Stripe integration—mitigated by having the lead engineer build a proof of concept with Stripe's test mode in the first week.

Phase three (six weeks) adds reporting and retention features. Must-haves include an annual earnings report, expense categorization, and basic tax summary (total income, total expenses, estimated tax owed). Should-haves include data export to CSV and quarterly reports. Could-haves include customizable report date ranges and charts. Will-not-haves include multi-currency support and team accounts. The risk here is data accuracy—if the tax summary is wrong, users could face legal issues. Mitigation includes extensive automated testing of all calculations and a beta period where users can review reports before they are finalized.

This three-phase roadmap spans twenty weeks. Each phase produces a shippable product increment. The MVP validates that freelancers will use the platform. Phase two confirms they will collect payments through it. Phase three proves the platform can replace their existing accounting workflows. If any phase reveals that the underlying assumption is wrong, the roadmap can be adjusted before investing further.

## Do's and Don'ts

Do define exit criteria before starting a phase. Do include a buffer for unplanned work. Do sequence work by risk, not convenience. Do make milestones verifiable and concrete. Do use MoSCoW to explicitly exclude items. Do write deliverables in language everyone can understand. Do revisit the roadmap after each phase. Do adjust the plan when risks materialize.

Don't plan more than two phases in detail—beyond that, uncertainty makes detailed plans misleading. Don't allow must-haves to exceed sixty percent of the phase. Don't confuse an MVP with a prototype; it must be shippable. Don't ignore risks because they are uncomfortable to discuss. Don't treat the roadmap as a commitment; treat it as a hypothesis. Don't let stakeholders add scope without removing something of equal size. Don't skip the will-not-have category—it is the most important part of priority setting.

The roadmap is not the goal. The product is the goal. The roadmap is a tool for making explicit decisions about sequencing, scope, and risk so that the team can focus on building the right thing, in the right order, without pretending to know everything in advance.
