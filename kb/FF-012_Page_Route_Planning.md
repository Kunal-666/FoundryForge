# Page Route Planning

Page route planning defines how users navigate through an application by structuring the URL space into a logical, maintainable hierarchy. Routes are the backbone of the user experience—they determine how users find content, how search engines index pages, how deep linking works, and how the application handles errors. This document covers public routes, protected routes, dynamic routes, nested routes, admin routes, error routes, route hierarchy, and navigation planning, with complete route maps for SaaS and e-commerce applications.

## Route Fundamentals

A route is a URL pattern that maps to a page component. In modern single-page applications, routes are handled client-side by a router library, while the server typically serves the same application shell for all routes and lets the client determine which page to render. In server-rendered applications, routes map directly to server endpoints that generate HTML.

Every route should have a clear purpose and answer three questions: What page does this route display? What data does this route need? Who should be allowed to access this route? If you cannot answer all three questions, the route is not sufficiently planned. Routes that serve multiple purposes (e.g., "/dashboard" that shows different content depending on the user's role) should be documented as a single route with role-based rendering, not as separate routes.

Route planning should follow RESTful conventions where possible. Use nouns for resources (/products, /users, /orders), use singular for detail views (/product/:id rather than /products/:id), and use hyphens to separate words in multi-word routes (/order-history rather than /orderHistory or /order_history). Consistency in route naming reduces cognitive load for developers and users alike.

## Public Routes

Public routes are accessible to anyone without authentication. They include marketing pages, landing pages, public content, product listings, search results, and legal pages. Public routes should be planned to minimize the attack surface—they should not expose user data, internal APIs, or administrative functionality.

Common public routes include:

- / (home or landing page)
- /about (company information)
- /pricing (pricing plans)
- /contact (contact form)
- /faq (frequently asked questions)
- /privacy (privacy policy)
- /terms (terms of service)
- /blog (blog listing)
- /blog/:slug (individual blog post)
- /products (public product listing)
- /products/:id (product detail)
- /search (search results)

Public routes should be optimized for search engine indexing. Use semantic HTML, proper heading hierarchy, descriptive title tags, and meta descriptions. Server-side rendering or static generation is strongly recommended for public routes to ensure search engines can crawl and index content effectively.

Public routes that accept user input (search, contact forms) must include appropriate validation, rate limiting, and CSRF protection. Even though these routes are public, they should not be vulnerable to abuse.

## Protected Routes

Protected routes require authentication and, optionally, specific authorization levels. These routes should redirect unauthenticated users to the login page, preserving the original URL so they can be redirected back after successful authentication. Protected routes are where the core application functionality lives.

Common protected routes include:

- /dashboard (user's main dashboard)
- /profile (user's profile)
- /settings (account settings)
- /projects (project listing)
- /projects/:id (project detail)
- /projects/:id/settings (project settings)
- /billing (billing and subscription management)

Authorization within protected routes should be handled at the route level, not scattered across components. A common pattern is to define route guards or middleware that checks the user's role or permissions before rendering the route component. If a user tries to access a route they are not authorized for, return a 403 Forbidden page rather than silently rendering incorrect content.

Protected routes should also handle session expiry gracefully. If a user's token expires while they are on a protected page, the application should either silently refresh the token (if a refresh token is available) or redirect them to login and redirect them back after re-authentication. Losing the user's work because of a stale session is a poor experience.

## Dynamic Routes

Dynamic routes contain parameters that are part of the URL. They allow a single route pattern to match many different resources. The most common dynamic route is a detail view: /products/:id matches /products/42 and /products/laptop-pro, with the parameter available to the page component to fetch the appropriate data.

Dynamic route parameters should be validated before data fetching. If /products/:id requires a numeric ID and the user visits /products/abc, the route should return a 404 error immediately rather than attempting a database query that will fail. Similarly, if a dynamic parameter references a resource that does not exist, the route should return a 404.

Multiple dynamic parameters can be combined: /organizations/:orgId/projects/:projectId/tasks/:taskId. However, deep nesting of dynamic parameters should be avoided—prefer flatter routes with query parameters where possible. A route like /tasks?org=:orgId&project=:projectId is easier to maintain and less prone to routing conflicts than deeply nested dynamic routes.

Dynamic routes also apply to catch-all or wildcard patterns. A catch-all route like /* matches any URL and is useful for legacy redirects, custom 404 pages, or multi-tenant subdomain routing. Use catch-all routes sparingly because they can mask routing errors and make the route hierarchy harder to reason about.

## Nested Routes

Nested routes represent a parent-child relationship between pages. The parent route provides a layout shell (sidebar, tabs, sub-navigation), and the child route fills the main content area. Nested routes are appropriate when the child pages share navigation context and the user needs to move between them without losing their place.

A common nested route structure is a settings section:

- /settings (redirects to /settings/profile)
- /settings/profile (profile form)
- /settings/account (account settings)
- /settings/notifications (notification preferences)
- /settings/billing (billing information)

The parent route /settings renders a layout with a sub-navigation (tabs or sidebar links), and the child routes render their content within that layout. The active child route should be highlighted in the sub-navigation so the user always knows where they are.

Nested routes are also useful for resource management:

- /projects/:id (project overview with tabs)
- /projects/:id/overview (project overview tab)
- /projects/:id/tasks (project tasks tab)
- /projects/:id/files (project files tab)
- /projects/:id/settings (project settings tab)

The depth of nesting should be limited. Three levels of nesting is usually the maximum before the route structure becomes confusing. At four or more levels, consider whether the hierarchy can be flattened or whether some of those routes should be separate top-level sections.

## Admin Routes

Admin routes are a special category of protected routes that require elevated permissions. They should be clearly separated from user-facing routes, typically under an /admin prefix. Admin routes should never be accessible to regular users, and they should not appear in the primary navigation of non-admin users.

Common admin routes include:

- /admin (admin dashboard)
- /admin/users (user management)
- /admin/users/:id (user detail)
- /admin/content (content management)
- /admin/analytics (platform analytics)
- /admin/settings (global application settings)
- /admin/monitoring (system health)

Admin routes should have their own layout, navigation, and design language that distinguishes the admin panel from the main application. This is not just for visual consistency—it also helps prevent regular users from accidentally stumbling into admin functionality.

Admin routes must be protected by a route guard that checks for admin or super-admin roles. This check should happen at the route level, not just in the UI. A user who knows the /admin/users URL should not be able to access it by typing it directly, even if the UI does not expose the link.

Consider whether admin routes should be in a separate application entirely. For large-scale applications with complex admin needs, a separate admin app with its own deployment pipeline provides stronger isolation and allows admin features to be developed and deployed independently of the main application.

## Error Routes

Error routes handle cases where the requested URL cannot be resolved, the user lacks permission, or the server encounters an error. Every application should have at minimum a 404 route and a 500 route. These routes should be informative, on-brand, and provide a clear path forward.

The 404 route matches any URL that does not correspond to a defined route. It should display a friendly message explaining that the page was not found, provide a search bar or links to popular pages, and include the application's navigation so the user can continue browsing. Do not simply show "404 Not Found" with no context. The user arrived at this URL intentionally or through a link; help them find what they were looking for.

The 500 route displays when an unexpected error occurs on the server or during rendering. It should apologize for the inconvenience, indicate that the issue has been logged (if applicable), and offer options to retry or return to the home page. A 500 page should not include sensitive debugging information in production, but it can include a reference ID that support staff can use to look up the error in logs.

A 403 route handles authorization failures when the user is authenticated but lacks permission to access a resource. This is distinct from a redirect to login, which handles unauthenticated users. The 403 page should explain that the user does not have permission to access this page and offer to contact support or navigate to an accessible page.

Route guards and error routes should be planned early. Adding error routes after the application is built often results in inconsistent error experiences where some routes show a generic error and others show a custom one. Plan error handling at the route level from the start.

## Route Hierarchy

The route hierarchy is the complete map of all routes in the application, organized by nesting level and access control. A well-documented route hierarchy serves as a reference for developers adding new routes, designers planning navigation changes, and QA engineers writing test scenarios.

A route hierarchy document should include:

- The full URL pattern
- The page component name
- Access level (public, authenticated, admin)
- Whether the route is dynamic and what parameters it accepts
- Any nested child routes
- The layout component used
- Data dependencies (what data is fetched for this route)
- Redirect rules

Example hierarchy entry:

```
/products
  - Page: ProductListingPage
  - Access: Public
  - Layout: StoreLayout
  - Data: Fetches product list, categories, filters
  - Children:
    /products/:slug
      - Page: ProductDetailPage
      - Access: Public
      - Layout: StoreLayout (with sidebar hidden)
      - Data: Fetches product by slug, related products, reviews
      - Parameters: slug (string, URL-friendly product name)
```

Documenting the hierarchy this way makes it easy to identify missing routes, inconsistent patterns, or orphaned pages that are not linked from any navigation element.

## Navigation Planning

Navigation planning maps routes to the navigation elements that expose them to users. Not every route needs to be in the primary navigation. The primary navigation should contain the most important sections that users visit frequently. Secondary routes can be accessed through sub-navigation, contextual links, or direct URL entry.

Primary navigation links should be ordered by priority. For a SaaS application, the order might be: Dashboard, Projects, Reports, Settings. For an e-commerce site: Home, Shop, Categories, Deals, Account. The most commonly used section should be first, and the least commonly used should be last or moved to a secondary menu.

Secondary navigation includes breadcrumbs, related links, footer links, and contextual in-page navigation. Breadcrumbs help users understand where they are in the hierarchy and provide quick navigation to parent sections. Footer links are appropriate for legal pages, about pages, and support resources—content that must be available but is rarely the user's primary destination.

Navigation should reflect the user's role. Admin users see admin links in their navigation. Regular users do not. Guest users see login and signup links. Navigation items that the user cannot access should not appear in the navigation at all, rather than appearing but being disabled.

The navigation structure should be data-driven where possible. A navigation configuration object or CMS-managed navigation allows changes without code deployments. This is especially important for marketing sites and content-heavy applications where navigation structure changes frequently.

## Example Route Map: SaaS Application

```
Public Routes (no auth required)
  /                     HomePage (marketing)
  /pricing              PricingPage
  /about                AboutPage
  /blog                 BlogListPage
  /blog/:slug           BlogPostPage (dynamic, slug)
  /legal/privacy        PrivacyPage
  /legal/terms          TermsPage
  /login                LoginPage
  /signup               SignupPage
  /forgot-password      ForgotPasswordPage
  /reset-password       ResetPasswordPage

Authenticated Routes (auth required)
  /dashboard            DashboardPage
  /dashboard/onboarding OnboardingPage (first-time users)
  /projects             ProjectListPage
  /projects/new         ProjectCreatePage
  /projects/:id         ProjectDetailPage (dynamic, id)
    /projects/:id/overview   ProjectOverviewPage
    /projects/:id/tasks      ProjectTasksPage
    /projects/:id/files      ProjectFilesPage
    /projects/:id/settings   ProjectSettingsPage
  /tasks                TaskListPage (cross-project tasks)
  /tasks/:id            TaskDetailPage (dynamic, id)
  /reports              ReportListPage
  /reports/:id          ReportDetailPage (dynamic, id)
  /account/profile      ProfilePage
  /account/settings     AccountSettingsPage
  /account/billing      BillingPage
  /account/team         TeamPage

Admin Routes (admin role required)
  /admin                AdminDashboardPage
  /admin/users          AdminUserListPage
  /admin/users/:id      AdminUserDetailPage (dynamic, id)
  /admin/projects       AdminProjectListPage
  /admin/settings       AdminSettingsPage
  /admin/logs           AdminLogsPage

Error Routes
  404                   NotFoundPage
  403                   ForbiddenPage
  500                   ServerErrorPage
```

## Example Route Map: E-commerce Application

```
Public Routes
  /                     HomePage (featured products, categories)
  /shop                 ShopPage (all products, filters)
  /shop/category/:slug  CategoryPage (products by category)
  /product/:slug        ProductDetailPage (dynamic, slug)
  /search               SearchPage (query parameter: ?q=)
  /cart                 CartPage
  /checkout             CheckoutPage (multi-step)
  /checkout/success     OrderSuccessPage (order confirmation)
  /about                AboutPage
  /contact              ContactPage
  /faq                  FAQPage
  /login                LoginPage
  /signup               SignupPage

Authenticated Routes
  /account              AccountDashboardPage
  /account/orders       OrderHistoryPage
  /account/orders/:id   OrderDetailPage (dynamic, id)
  /account/wishlist     WishlistPage
  /account/addresses    AddressBookPage
  /account/payments     PaymentMethodsPage
  /account/settings     AccountSettingsPage
  /account/returns      ReturnsPage

Admin Routes
  /admin                AdminDashboardPage
  /admin/products       ProductManagementPage
  /admin/products/new   ProductCreatePage
  /admin/products/:id   ProductEditPage
  /admin/orders         OrderManagementPage
  /admin/orders/:id     OrderDetailPage
  /admin/customers      CustomerListPage
  /admin/customers/:id  CustomerDetailPage
  /admin/inventory      InventoryPage
  /admin/discounts      DiscountManagementPage
  /admin/analytics      AnalyticsPage

Error Routes
  404                   NotFoundPage
  403                   ForbiddenPage
  500                   ServerErrorPage
```

## Do's and Don'ts

Do plan routes before writing components. Do use consistent naming conventions across all routes. Do separate public, protected, and admin routes clearly. Do document every route's purpose, access level, and data dependencies. Do handle 404, 403, and 500 errors at the route level. Do use route guards for authorization. Do preserve the original URL for redirect-after-login flows.

Don't nest dynamic parameters more than two levels deep. Don't expose admin routes to regular users. Don't rely solely on UI hiding for access control—enforce at the route level. Don't use modals or client-side state for navigable content that should have its own URL. Don't create ambiguous routes that could match multiple patterns. Don't forget to handle session expiry on protected routes. Don't let error pages break the navigation experience.
