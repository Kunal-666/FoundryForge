# Component Inventory Rules

This document defines how to enumerate and classify every UI component required by a FoundryForge project before any implementation begins. A complete component inventory is the bridge between a feature specification and code generation — it ensures that no component is missing, no edge case is forgotten, and no prop interface is ambiguous. Every component listed in the inventory becomes a generation target with a defined contract.

The inventory is produced during the Architecture phase of the specification and must be reviewed before any code is generated. Missing a component in the inventory means the code generator will either skip it or hallucinate an implementation, both of which lead to rework.

## Component Classification Categories

Every component in the inventory is classified into exactly one of the following categories. The classification determines where the component file is placed in the folder structure and what level of reuse it should support.

### Global Components

Global components are the atomic UI primitives used across the entire application. They are generic, composable, and maintain a consistent design language. Global components live in `src/components/ui/` and must be designed for maximum reuse.

Each global component must define variants, states, and a clear prop interface. Global components must not import from application-specific services, hooks, or contexts — they must be self-contained and rely only on their props.

Examples of global components include Button, Input, Select, Checkbox, RadioGroup, Toggle, Switch, Badge, Tag, Avatar, Icon (wrapper), Tooltip, Popover, DropdownMenu, Modal, Dialog, Drawer, Toast, Alert, Card, CardHeader, CardBody, CardFooter, Table, Tbody, Thead, Tr, Th, Td, Pagination, Breadcrumb, Tabs, Accordion, ProgressBar, Spinner, Skeleton, EmptyState, ErrorBoundary, and Portal.

A Button component, for example, must be built once and used everywhere. It must support variants (primary, secondary, ghost, danger), sizes (sm, md, lg), loading state (shows a spinner and disables click), disabled state, and an `asChild` pattern (via Radix's Slot) so that links can render as a button visually without losing anchor semantics.

```
// Button component spec in the inventory
Button
  Category: Global
  Path: src/components/ui/Button.tsx
  Props:
    variant: 'primary' | 'secondary' | 'ghost' | 'danger'
    size: 'sm' | 'md' | 'lg'
    isLoading: boolean
    disabled: boolean
    children: ReactNode
    onClick: () => void
    type: 'button' | 'submit' | 'reset'
    asChild: boolean
  States:
    - default (render children with variant styles)
    - hover (darken background by 10%)
    - active (scale transform 0.98)
    - disabled (opacity 50%, pointer-events none)
    - loading (show spinner, hide children, disable pointer events)
  Edge cases:
    - asChild + isLoading: wrap the child in a span with spinner, do not pass button attributes to child
    - no onClick provided: render as type="submit" only
  Accessibility:
    - role="button" when asChild is used with a non-button element
    - aria-disabled when disabled
    - aria-busy when loading
```

### Layout Components

Layout components define the structural skeleton of the application. They control positioning, spacing, and the arrangement of content areas. Layout components live in `src/components/layout/`.

Layout components are typically page-level or section-level wrappers. They often consume application-level context (authentication state, sidebar open/closed) and compose global and domain components into a coherent page shell.

Examples include AppShell (the main application wrapper with sidebar, header, and content area), Header (top navigation bar with logo, search, user menu, and mobile hamburger), Sidebar (left navigation panel with links, project list, and collapse toggle), Footer (copyright, links, social icons), MainContent (content area wrapper that handles padding and max-width), PageHeader (breadcrumbs plus page title plus optional actions), and Section (horizontal spacing and vertical padding wrapper for content sections).

An AppShell component might manage the sidebar collapsed state, coordinate with the header for mobile menu toggling, and ensure the main content area scrolls independently.

```
AppShell
  Category: Layout
  Path: src/components/layout/AppShell.tsx
  Props:
    children: ReactNode
  Internal state:
    sidebarOpen: boolean (from local state or context)
  Behavior:
    - On desktop (>= 1024px): sidebar is always visible, togglable to collapsed (icons only)
    - On tablet (768-1023px): sidebar is overlayed with backdrop, toggled by hamburger
    - On mobile (< 768px): sidebar is hidden by default, slides in from left on toggle
  Accessibility:
    - Skip-to-content link as first focusable element
    - aria-expanded on hamburger button referencing sidebar
    - inert attribute on main content when sidebar overlay is open
```

### Navigation Components

Navigation components handle routing, linking, and menu interaction. They are closely related to layout components but are distinguished by their specific concern: enabling users to move between views.

Examples include NavLink (active-aware link component that renders as a Next.js Link or anchor with active state styling), NavMenu (dropdown or flyout menu for navigation items), Breadcrumbs (auto-generated from route path segments), TabBar (horizontal tab navigation for sub-sections of a page), SidebarNav (vertical navigation list within the sidebar), MobileNav (off-canvas navigation for small screens), StepIndicator (progress through a multi-step flow), and PaginationControls (page navigation for list views).

Navigation components must be accessible. Every NavLink must properly announce the current page using `aria-current="page"`. Dropdown menus must support arrow key navigation. Breadcrumbs must use `aria-label="Breadcrumbs"` and `role="navigation"` with proper `aria-current` on the last item.

```
NavLink
  Category: Navigation
  Path: src/components/navigation/NavLink.tsx
  Props:
    href: string
    children: ReactNode
    exact?: boolean (default: true — match only exact path, false for prefix match)
    icon?: ReactNode
    badge?: number | string
    disabled?: boolean
  Behavior:
    - Uses Next.js Link internally
    - Compares current route to href using pathname
    - Applies active styles when matched
    - Sets aria-current="page" when active
  Edge cases:
    - Badge with number > 99: display "99+"
    - Disabled link: render as span with disabled styles, not an anchor
```

### Form Components

Form components handle user input, validation, and submission. They are a specialized category because forms have unique accessibility requirements and interaction patterns.

Examples include TextInput, TextArea, Select, MultiSelect, DatePicker, FileUpload (drag-and-drop zone), CheckboxGroup, RadioGroup, ToggleGroup, Slider, ColorPicker, Autocomplete (async search with debounce), FormField (wrapper that provides label, error, hint, and layout), FormSection (group of related fields with optional legend), and SubmitButton (button that shows loading state during form submission).

Form components must integrate with React Hook Form or the project's form library. Each form component exposes an `error` prop and uses `aria-describedby` for error and hint text.

```
TextInput
  Category: Form
  Path: src/components/forms/TextInput.tsx
  Props:
    label: string
    name: string
    value?: string
    onChange?: (value: string) => void
    error?: string
    hint?: string
    placeholder?: string
    disabled?: boolean
    required?: boolean
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
    maxLength?: number
    prefix?: ReactNode  // Icon or text before input
    suffix?: ReactNode  // Icon or text after input
    register?: UseFormRegisterReturn  // For React Hook Form integration
  States:
    - default: outlined border, placeholder text
    - focused: primary-colored border ring
    - filled: normal display
    - error: red border, error message via aria-describedby
    - disabled: gray background, no interaction
  Edge cases:
    - prefix + suffix both used: input text should not overlap either
    - error + hint both provided: error replaces hint, hint is hidden
    - type="password": show/hide toggle button in suffix position
  Accessibility:
    - label element with htmlFor matching input id
    - aria-invalid when error prop is present
    - aria-describedby referencing hint or error element
    - aria-required when required is true
```

### Display Components

Display components present data to the user without collecting input. They are read-only by nature but may include interactive elements for expanding or exploring the displayed data.

Examples include DataTable (sortable, filterable table for structured data), Card (content container with optional image, title, description, and actions), List (ordered or unordered list with optional icons), StatCard (numeric metric with label, trend indicator, and icon), Timeline (chronological event display), KanbanBoard (drag-and-drop column layout for task management), Calendar (date grid with event indicators), Chart (bar, line, pie, area visualizations), TreeView (hierarchical data browser), DescriptionList (key-value pair display for detail views), and ActivityFeed (chronological list of events with avatars and timestamps).

Display components that handle lists or tables must support loading state (skeleton placeholders), empty state (descriptive message with optional illustration and action), error state (error message with retry action), and the populated state.

```
DataTable
  Category: Display
  Path: src/components/display/DataTable.tsx
  Props:
    columns: Array<{ key: string, header: string, sortable?: boolean, render?: (value: any, row: any) => ReactNode }>
    data: Array<any>
    loading?: boolean
    emptyMessage?: string
    error?: string
    onRetry?: () => void
    onSort?: (key: string, direction: 'asc' | 'desc') => void
    sortKey?: string
    sortDirection?: 'asc' | 'desc'
    pagination?: { page: number, totalPages: number, onPageChange: (page: number) => void }
    onRowClick?: (row: any) => void
  States:
    - loading: 5 skeleton rows that pulse
    - empty: EmptyState component with emptyMessage and optional action
    - error: Error state with error message and Retry button
    - populated: rendered table rows with zebra striping
    - sorted: active sort column has arrow indicator
    - row click: hover state on rows when onRowClick is provided
  Edge cases:
    - Data with 0 rows: show empty state, not a table with a single empty row
    - Data with ellipsis content: truncated with tooltip on hover
    - Sort with no onSort handler: column headers render as plain text, not buttons
  Accessibility:
    - <table> with <thead>, <tbody>, <th scope="col">
    - sortable column headers are <button> elements with aria-sort
    - row click: ensure <tr> has tabIndex=0 and onKeyDown for Enter/Space
```

### Dashboard Components

Dashboard components are specialized display components designed for the primary dashboard view. They aggregate and present key metrics and insights.

Examples include MetricsGrid (responsive grid of StatCards), ActivityWidget (recent activity feed limited to 5 items), ChartWidget (chart with title, timeframe selector, and full-screen expand), QuickActions (context-sensitive action buttons), WelcomeBanner (personalized greeting with tips), ProgressWidget (goal or project completion progress), TopPerformingWidget (ranked list of top items), and NotificationCenter (dropdown panel of recent notifications).

Dashboard components are a subcategory of display components but are classified separately because they are tightly coupled to the dashboard layout and often combine multiple data sources. They must handle the case where a data source fails while others succeed — a broken chart should not break the entire dashboard.

```
MetricsGrid
  Category: Dashboard
  Path: src/components/dashboard/MetricsGrid.tsx
  Props:
    metrics: Array<{ id: string, label: string, value: string | number, trend?: { direction: 'up' | 'down', percentage: number }, icon?: ReactNode }>
    loading?: boolean
    columns?: 2 | 3 | 4
  States:
    - loading: grid of skeleton StatCards (one per metric)
    - populated: grid of StatCards
    - partial: individual metric can show error if its data source failed
  Behavior:
    - Responsive columns: 1 on mobile, specified columns on desktop
    - Positive trend is green (up arrow), negative trend is red (down arrow)
```

### Admin Components

Admin components are used exclusively in the administration panel. They manage users, billing, system configuration, and monitoring.

Examples include UserTable (admin view of all users with search, filter, and actions like suspend/delete), SubscriptionManager (view and modify user subscriptions and billing status), SystemHealth (service status indicators, uptime, error rates), AuditLog (filterable, paginated audit trail of admin actions), FeatureFlagEditor (toggle feature flags for specific users or percentages), ConfigurationEditor (key-value system settings editor), and InviteUserForm (admin-initiated user invitation with role selection).

Admin components require elevated permission checks. They must include confirmation dialogs for destructive actions and must log all mutations to the audit trail.

```
UserTable (Admin)
  Category: Admin
  Path: src/components/admin/UserTable.tsx
  Props:
    users: Array<UserAdminView>
    loading: boolean
    onSearch: (query: string) => void
    onFilterByRole: (role: string) => void
    onSuspend: (userId: string) => void
    onDelete: (userId: string) => void
    onImpersonate: (userId: string) => void
  States:
    - loading, empty, error, populated
  Behavior:
    - Search debounced at 300ms
    - Suspended users shown with warning badge
    - Delete requires confirmation via Modal ("Are you sure? This cannot be undone.")
    - On suspend: optimistic update, rollback on error
    - On impersonate: logs adminId, targetUserId, timestamp to audit log
  Accessibility:
    - All action buttons have aria-label
    - Confirmation modal traps focus
```

### Authentication Components

Authentication components handle sign-in, sign-up, password reset, and account recovery flows. They are a separate category because they are the only components that exist outside the application shell — they must render without requiring authentication context.

Examples include SignInForm (email/password and OAuth provider buttons), SignUpForm (registration with validation), ForgotPasswordForm (email input to request reset), ResetPasswordForm (new password with confirmation and token validation), MfaSetup (QR code display and verification code input for TOTP), MfaChallenge (verification code input during sign-in), SocialLoginButtons (Google, GitHub, Apple OAuth buttons), AuthLayout (centered card layout for all auth pages), and EmailVerified (success or failure page after email verification link click).

Authentication components must handle loading, error (invalid credentials, account locked, email already registered), success (redirect to dashboard or destination), and validation states (field-level errors). They must also support the "email already in use" case by suggesting sign-in instead of sign-up.

```
SignInForm
  Category: Authentication
  Path: src/components/auth/SignInForm.tsx
  Props:
    onSuccess: () => void
    redirectUrl?: string
    oauthProviders?: Array<'google' | 'github' | 'apple'>
  States:
    - default: email and password fields with Sign In button
    - loading: button shows spinner, fields disabled
    - error: inline error message ("Invalid email or password")
    - rate-limited: "Too many attempts. Try again in 5 minutes."
    - success: redirect to redirectUrl or dashboard
  Behavior:
    - On submit: call authService.signIn(), handle 401 vs 429 vs 500
    - OAuth buttons: redirect to provider OAuth URL
    - "Forgot password?" link navigates to /auth/forgot-password
    - If user signs in with OAuth but email exists with password: show merge prompt
  Edge cases:
    - User enters email that was registered via OAuth only: show "Sign in with Google" button
    - Form submitted while already loading: ignore duplicate submission
    - Rate limited: disable form, show countdown timer
  Accessibility:
    - Form has role="form" and aria-label="Sign in"
    - Error messages via aria-describedby on each field
    - Auto-focus on email field on mount
```

### Shared UI Components

Shared UI components are composed from global primitives to form reusable domain-specific patterns. They are not as generic as global components but are shared across multiple features rather than scoped to a single page.

Examples include UserAvatar (display user avatar with fallback initials and online status dot), NotificationBadge (icon with unread count), SearchInput (text input with search icon, clear button, and debounced onChange), ConfirmDialog (modal wrapper for destructive confirmation with cancel/confirm buttons), EmptyState (consistent empty state with illustration, title, description, and optional action), LoadingOverlay (full-screen or section-level loading overlay), FileUploadZone (drag-and-drop file upload with preview and progress), ColorPicker (color selection with swatches and hex input), DateRangePicker (start and end date selection with calendar), and RichTextEditor (wysiwyg editor for content creation).

Shared UI components may import from hooks and services. A UserAvatar component may use the `useAuth` hook to get the current user's avatar URL. A NotificationBadge may use the `useNotifications` hook to get the unread count.

```
UserAvatar
  Category: Shared UI
  Path: src/components/shared/UserAvatar.tsx
  Props:
    user: { name?: string | null, avatarUrl?: string | null }
    size: 'sm' | 'md' | 'lg' | 'xl'
    showStatus?: boolean
    status?: 'online' | 'away' | 'busy' | 'offline'
  Behavior:
    - If avatarUrl is provided: render <img> with fallback to initials on error
    - If avatarUrl is null: render initials (first letter of first and last name)
    - Initials use deterministic background color derived from user name hash
    - Status dot positioned at bottom-right of avatar with appropriate color
  Edge cases:
    - User with no name: fallback to "?" icon
    - Image load failure: silently fallback to initials (onError handler)
    - Single character name: show single initial centered
```

## Producing a Complete Inventory

To produce a component inventory for a project, start with the pages enumerated in the specification. For each page, list every distinct UI element visible in the design mockup or described in the specification. Classify each element into one of the nine categories above. If you see duplicate elements across pages, promote them to Global or Shared UI.

After listing visible elements, identify invisible components required for functionality: ErrorBoundary wrappers, Suspense boundaries, LoadingSkeleton variants, EmptyState components for each list or table, ConfirmDialog for each destructive action, and Toast notifications for each mutation success or failure.

Cross-reference the inventory against the specification's requirements. Every requirement that produces a visible outcome should be traceable to at least one component. If a requirement says "users can upload an avatar," the inventory must include FileUploadZone or an AvatarUpload component.

## Implementation Checklist Format

The final inventory for code generation must be formatted as a checklist. Each component entry includes its category, file path, prop interface, states, and edge cases. The checklist serves as the implementation plan and should be tracked during generation.

```
Component Inventory Checklist

Global:
  [ ] Button - src/components/ui/Button.tsx
  [ ] Input - src/components/ui/Input.tsx
  [ ] Modal - src/components/ui/Modal.tsx
  ...

Layout:
  [ ] AppShell - src/components/layout/AppShell.tsx
  [ ] Header - src/components/layout/Header.tsx
  ...

Navigation:
  [ ] NavLink - src/components/navigation/NavLink.tsx
  [ ] Breadcrumbs - src/components/navigation/Breadcrumbs.tsx
  ...

Form:
  [ ] TextInput - src/components/forms/TextInput.tsx
  [ ] Select - src/components/forms/Select.tsx
  ...

Display:
  [ ] DataTable - src/components/display/DataTable.tsx
  [ ] StatCard - src/components/display/StatCard.tsx
  ...

Dashboard:
  [ ] MetricsGrid - src/components/dashboard/MetricsGrid.tsx
  [ ] ChartWidget - src/components/dashboard/ChartWidget.tsx
  ...

Admin:
  [ ] UserTable - src/components/admin/UserTable.tsx
  [ ] AuditLog - src/components/admin/AuditLog.tsx
  ...

Authentication:
  [ ] SignInForm - src/components/auth/SignInForm.tsx
  [ ] SignUpForm - src/components/auth/SignUpForm.tsx
  ...

Shared UI:
  [ ] UserAvatar - src/components/shared/UserAvatar.tsx
  [ ] ConfirmDialog - src/components/shared/ConfirmDialog.tsx
  ...
```

## Do's and Don'ts

**Do** inventory every component before writing any code. The inventory serves as a contract — once agreed upon, it should be possible to parallelize implementation across multiple developers or agents without coordination issues.

**Don't** omit edge case documentation from the inventory. The most common code generation failure is an edge case that the generator did not anticipate — a list with zero items, a button without an onClick handler, a modal that opens behind another modal. Document these in the inventory.

**Do** design each component to handle at least four states: loading, empty, error, and populated. Applications that only handle the populated state are brittle and produce poor user experiences when things go wrong.

**Don't** create a component that breaks the single-responsibility principle. A component that both renders a data table and handles file uploads is two components forced into one. Split early, split often.

**Do** keep global components framework-agnostic. A Button should not import from Next.js, from your API client, or from any feature-specific hook. This lets you reuse global components across projects and test them without spinning up the full application stack.
