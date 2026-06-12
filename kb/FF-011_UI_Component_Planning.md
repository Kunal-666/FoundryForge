# UI Component Planning

UI component planning is the practice of systematically identifying, categorizing, and specifying the user interface elements that make up an application before writing code. Proper component planning prevents redundant work, ensures visual consistency, simplifies testing, and creates a shared vocabulary between designers and developers. This document covers the full range of UI patterns: pages, layouts, shared components, navigation elements, forms, cards, tables, dashboards, modals, drawers, dialogs, empty states, skeletons, and loaders. It teaches when to use each pattern, how to decide between similar patterns, and provides concrete examples across SaaS, e-commerce, and social applications.

## Pages and Layouts

A page is a top-level view associated with a route. Every application has a finite set of pages, and identifying them is the first step in component planning. Pages are typically composed of smaller components and are rarely reused directly—each page is unique in its combination of content and purpose. However, pages share layout structures, and that is where layout components come in.

Layouts define the chrome that surrounds page content: headers, sidebars, footers, and the main content area. Rather than repeating chrome markup on every page, define one or more layout components and wrap page content with them. A SaaS application might have a "public layout" for marketing pages (header, hero, footer) and an "authenticated layout" for logged-in users (sidebar navigation, top bar, main content area). An e-commerce site might have a "store layout" with a category sidebar and a "checkout layout" that strips away navigation to minimize distractions.

Do not over-nest layouts. A common mistake is creating a layout hierarchy five levels deep for minor variations. If two layouts differ by only one element, consider using a prop or slot instead of a separate layout component. Layouts should be wide and shallow, handling only the structural chrome that changes between major sections of the application.

## Shared Components

Shared components are the building blocks that appear across multiple pages and features. These include buttons, inputs, selects, checkboxes, radio buttons, tooltips, badges, avatars, icons, and typography elements. Every shared component should be built in a centralized location, typically a components or ui directory, and should be designed to be composable, accessible, and themeable.

The decision to make a component shared should be driven by actual reuse, not predicted reuse. Do not extract a "primary button" variant into a shared component after seeing it used once. Wait until the pattern appears three times, then extract. This rule, sometimes called the Rule of Three, prevents premature abstraction without causing significant rework later. When you do extract, ensure the component has a clear API, handles edge cases (disabled state, loading state, error state), and is documented so other developers know it exists and how to use it.

Shared components must be accessible. Buttons need proper role attributes and keyboard handling. Forms need labels associated with inputs. Modals need focus trapping and escape key handling. Tooltips need to be dismissible and should not rely solely on hover. Accessibility is not a feature; it is a requirement for every shared component, and it is far easier to build in from the start than to retrofit later.

## Navigation Elements

Navigation elements tell users where they are and how to get where they want to go. The primary categories are top navigation bars, side navigation, tabs, breadcrumbs, pagination, step indicators, and bottom navigation (common in mobile).

A top navigation bar typically contains the application logo or name, primary navigation links, user account controls, and possibly a search bar. It should be sticky or fixed so it remains accessible as users scroll. On authenticated pages, the top nav should indicate which user is logged in, typically with an avatar or initials.

Side navigation works well for applications with many sections that cannot all fit in a top nav. It can be collapsed to icons only on smaller screens or when the user needs more horizontal space for content. Side navs are common in SaaS dashboards, admin panels, and development tools. When designing a side nav, consider whether categories are needed to group related links, and whether the nav should support nested expansion.

Breadcrumbs provide secondary navigation that shows the user's current location within the site hierarchy. They are most useful on content-heavy sites like e-commerce platforms and documentation. A product page breadcrumb might read: Home > Electronics > Laptops > MacBook Pro. Breadcrumbs should not replace primary navigation; they are supplementary.

Tabs organize content within a page into sections that the user can switch between without navigating to a new page. Tabs are appropriate when the content is related and the user needs to see multiple views of the same data. They are inappropriate when each tab contains completely unrelated functionality—in that case, separate pages are usually better.

## Forms

Forms are the primary mechanism for data collection and should be planned with care. Every form needs a clear purpose, logical field ordering, appropriate input types, validation, error handling, and feedback on submission.

Plan forms by starting with the data model. What fields are required? What are the validation rules? What does success look like? A registration form needs email, password, and password confirmation. But should it also ask for name? Should it ask for marketing preferences? The rule is: ask for the minimum information needed at each step. If the user can create an account with just an email and password, do not ask for their phone number, company name, and job title. Collect additional information progressively as the user engages with more features.

Forms should provide immediate validation feedback where possible. Validate email format as soon as the user types it, not on submission. Show inline error messages next to the relevant field, not in a banner at the top of the page. Disable the submit button while the form is submitting to prevent double submission. Show a success message or redirect after successful submission.

Long forms should be broken into steps with a step indicator showing progress. This applies to checkout flows, multi-step registration, wizards, and complex configuration forms. Each step should be a manageable chunk—typically three to seven fields—and the user should be able to go back to previous steps without losing their data.

## Cards

Cards are self-contained content containers that group related information. They are one of the most versatile UI patterns and appear in almost every type of application. A card typically has a visual boundary (border, shadow, or background color), contains a title and content, and may include actions at the bottom.

Use cards for collections of items where each item has roughly equal visual weight. Product listings, blog post previews, team member profiles, dashboard widgets, and notification items are all good candidates for cards. Cards work well in grid layouts because each card is a self-contained unit that can be laid out independently.

Cards should be consistent in structure but not necessarily in content. A product card always has an image, title, price, and add-to-cart button. A blog card always has a featured image, headline, excerpt, author, and date. Consistency in card structure makes scanning easier for users and makes the layout more predictable.

Interactive cards need clear affordances. If a card is clickable, the entire card should feel clickable—use a hover effect, a cursor change, and ensure the card is a single link or button element rather than wrapping each piece of content in its own clickable element. However, avoid putting multiple actions inside a clickable card without careful consideration. A card that is clickable and also has a separate button inside creates confusion about what happens when the user clicks different areas.

## Tables

Tables display structured data in rows and columns. They are appropriate when users need to compare values, sort data, take action on individual rows, or scan large amounts of information quickly. Tables are common in admin panels, reporting dashboards, order management, inventory systems, and any feature that involves lists of records.

Plan a table by identifying its columns, row actions, and interactive features. Every column should have a clear purpose and a meaningful header. Avoid columns that are never used for sorting or filtering—if the column exists only because the data model has that field, it probably does not belong in the table.

Row actions include viewing details, editing, deleting, duplicating, and any other operation specific to that row. Common patterns for row actions include icon buttons that appear on hover, a dropdown menu triggered by a "more" button, or a dedicated actions column with buttons. The hover-reveal pattern saves visual space but can be frustrating on touch devices where there is no hover state.

Sorting should be available on columns where ordering is meaningful: dates, names, prices, status. Provide visual indication of the current sort column and direction. Server-side sorting becomes necessary when the dataset exceeds a few hundred rows.

Pagination or infinite scroll is needed for large datasets. Pagination gives users control and a sense of scale (showing "page 3 of 47"). Infinite scroll works better for content discovery where the user is browsing rather than searching for a specific item. For tables specifically, traditional pagination is almost always preferred because users frequently need to reference data across pages.

## Dashboards

Dashboards are pages that aggregate key information into an at-a-glance view. They typically combine multiple card types: stat cards (a single number with a label), chart cards (visualizations), list cards (recent activity, top items), and alert cards (notifications, warnings).

Plan a dashboard by identifying the audience and their primary question. A CEO dashboard answers "how is the business doing?" and shows revenue, active users, and growth metrics. A support manager dashboard answers "how are we handling tickets?" and shows ticket volume, response time, and satisfaction scores. A developer dashboard answers "is the system healthy?" and shows error rates, latency, and uptime.

The most important content should be at the top left—the position of highest visual priority in left-to-right reading cultures. Group related metrics together. Use consistent sizing for cards that are conceptually equal. Avoid the temptation to fill every pixel with data; whitespace helps users process what they are seeing.

Dashboards should be actionable. If a metric is below a threshold, the user should be able to click through to investigate. A dashboard that shows "12 failed orders" is less useful than a dashboard that shows "12 failed orders" and links to the list of failed orders where the user can take action.

## Modals, Drawers, and Dialogs

These three patterns are often confused but serve different purposes. A modal is a window that appears on top of the current page and requires user interaction before returning to the main page. A drawer is a panel that slides in from the side, partially overlaying the page. A dialog is a specific type of modal used for Confirm, Alert, and Prompt interactions.

Use modals for focused tasks that do not require reference to the underlying page. Creating a new item, editing a record, or viewing a detail view are good modal use cases. Modals should be sized appropriately for their content—a small form in a full-screen modal feels wasteful, while a complex form in a tiny modal feels cramped.

Use drawers for tasks where the user might need to reference the underlying page. For example, editing a product while viewing its details in the main panel is a good drawer use case. Drawers also work well for secondary content like notification panels, shopping carts, and settings that users access frequently but do not want to navigate away from.

Use dialogs for confirmations: "Are you sure you want to delete this item?" Dialogs should be simple, clear, and present a binary choice. Never put complex forms inside a dialog. Dialog buttons should clearly indicate the action—"Delete" and "Cancel" is better than "Yes" and "No" because it tells the user exactly what will happen.

All three patterns must handle focus management (trap focus inside the modal or drawer), keyboard interaction (Escape to close), and click-outside behavior (clicking the backdrop closes the pattern). Closing should never result in data loss. If the user has unsaved changes, warn them before closing.

## Empty States

Empty states are what users see when there is no data to display. They are often an afterthought, but they are one of the most important design elements for user onboarding. A well-designed empty state does three things: explains what this page is for, shows what the user should do next, and provides a clear action to get started.

A generic empty state like "No items found" is unhelpful. Instead, write something like "You haven't created any projects yet. Projects are where you organize your work. Click the button below to create your first project." Include an illustration or icon that makes the page feel intentional rather than broken.

Empty states also apply to search results. When a search returns no results, explain why—"No invoices match 'orange'. Try searching by client name, invoice number, or date range." Suggest alternatives: "You might also try browsing all invoices."

## Skeletons and Loaders

Skeletons and loaders communicate that content is on its way. A skeleton screen is a placeholder that mimics the structure of the actual content, showing gray rectangles where text, images, and other elements will appear. A loader is a spinner, progress bar, or animation that indicates activity without suggesting what the final layout will look like.

Prefer skeleton screens for content that loads within a predictable structure—a list of cards, a table, a product grid. Skeletons give the user a sense of what is coming and make the loading feel faster because the layout is already established. Use loaders (spinners) for actions where the result has an unpredictable structure—a search that returns varied results, a submission that might succeed or fail.

Skeletons should match the content layout closely. If the page shows a grid of four cards, the skeleton should show four card-shaped rectangles. If the page shows a table with five columns, the skeleton should show rows and columns. A generic full-page spinner tells the user nothing about what is loading or how much longer it will take.

For any loading state, consider how long the user will wait. For actions under one second, no loading indicator is needed. For one to three seconds, a skeleton or spinner is appropriate. For actions over three seconds, show a progress bar or percentage indicator so the user knows the system is still working.

## Examples by Application Type

In a SaaS application, component planning might identify: a dashboard page (composed of stat cards, a chart card, and a recent activity table), a settings page (composed of a tabbed form with text inputs, selects, and toggles), a team management page (composed of a table with avatar, name, role, and actions), and a billing page (composed of a plan card, payment history table, and a modal for updating payment method). Shared components include buttons, inputs, selects, modals, drawers, and a toast notification system.

In an e-commerce application, component planning might identify: a product listing page (card grid with filters sidebar and pagination), a product detail page (image gallery, description, specs table, reviews section, add-to-cart form), a cart page (line item table, promo code input, totals card, checkout button), and a checkout page (multi-step form with address, shipping, and payment steps). Shared components include product cards, rating stars, quantity selectors, and breadcrumbs.

In a social application, component planning might identify: a feed page (composed of post cards with author, content, images, comments, and actions), a profile page (cover photo, avatar, bio, tabs for posts/replies/likes, and settings), a notifications page (notification items grouped by date with read/unread states), and a messaging page (conversation list in a drawer with a chat panel). Shared components include avatars, follow buttons, like buttons, comment forms, and media viewers.

## Do's and Don'ts

Do identify pages first, then layouts, then shared components. Do use the Rule of Three before extracting shared components. Do make every component accessible from the start. Do design empty states as carefully as populated states. Do prefer skeleton screens over spinners for structured content. Do match the component to the task—modals for focused work, drawers for reference-heavy work, dialogs for confirmations.

Don't nest layouts more than two levels deep. Don't create shared components before there is evidence of reuse. Don't use tables for data that is better presented as cards. Don't use a modal when the user needs to reference the underlying page. Don't let users lose data when closing a modal or drawer. Don't overload dashboards with every possible metric—focus on what is actionable. Don't forget loading, empty, and error states for every component that fetches or displays data.
