# React Application Standards

This document defines engineering standards for building production-grade React applications. It covers component architecture, hooks conventions, state management strategy, folder organization, code splitting, performance optimization, error boundaries, and practical patterns that scale across teams and codebases. These recommendations are framework-agnostic within the React ecosystem—they apply equally to Next.js, Remix, Vite-based SPAs, and custom React setups unless noted otherwise.

## Component Organization and Architecture

Components should be organized along a clear hierarchy that separates concerns without over-engineering. The most reliable pattern is a split between **presentational** and **container** components, though in practice most teams adopt a modified version where components are categorized by their role in the feature rather than by a strict binary.

A production React application should group components into three layers: **page components**, **feature components**, and **base (shared) components**. Page components handle routing and data fetching at the top level. Feature components encapsulate domain-specific UI logic for a particular feature area. Base components are generic, reusable UI primitives like buttons, modals, inputs, and cards that contain no business logic.

Within each feature, prefer a flat structure with one component per file. Avoid deeply nested component hierarchies that are hard to trace. A feature folder might look like this:

```
features/
  user-profile/
    UserProfile.tsx
    UserProfile.test.tsx
    UserAvatar.tsx
    UserStats.tsx
    useUserProfile.ts
    useUpdateProfile.ts
    userProfileTypes.ts
```

Each feature folder owns its components, hooks, types, and tests. No component in one feature should import directly from another feature's internal files; instead, expose a public API through an index file at the feature root. This enforces module boundaries and prevents circular dependencies.

Component files should export the component as a named export, not a default export, to improve refactoring support and IDE autocompletion. Name files after the primary export with PascalCase. Keep each component under 200 lines of JSX; if a component exceeds 200 lines, break it into subcomponents or extract logic into custom hooks.

## Hooks Patterns and Custom Hooks

Custom hooks are the primary mechanism for extracting and sharing stateful logic. Every custom hook should have a single responsibility and a name that clearly communicates what it does. Prefix custom hooks with `use` and avoid suffixing with `Hook` since the prefix already signals the contract.

A well-structured custom hook accepts arguments, returns an object with named properties, and avoids side effects in the render phase. Here is a realistic example:

```typescript
function useUserSession(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUser(userId)
      .then((data) => {
        if (!cancelled) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [userId]);

  return { user, loading, error };
}
```

The cancelled flag pattern prevents state updates on unmounted components, which React warns about and which causes memory leaks in certain edge cases. Alternatives like `useRef` flags or AbortController are equally valid; pick one and enforce it across the team.

Keep effects lean. An effect should do one thing. If a component needs multiple unrelated effects, write multiple `useEffect` calls rather than combining concerns in a single effect. This improves readability and reduces the chance of accidental re-runs when dependencies change.

Avoid `useMemo` and `useCallback` preemptively. Only add them when you have measured a performance problem or when you are passing a callback to a child component wrapped in `React.memo`. Premature memoization adds complexity and can actually hurt performance by increasing memory pressure and comparison overhead. When you do use them, always include a complete and correct dependency array. The React linting rules (`eslint-plugin-react-hooks`) should be configured and enforced in CI to catch missing dependencies.

## State Management Approaches

State in a React application exists on a spectrum from local to global. The most common mistake is over-centralizing state that should remain local. Before adding state to a global store, ask whether the state needs to be shared across multiple unrelated components, persisted across page navigations, or accessed outside the React tree. If the answer to all three is no, keep it local with `useState` or `useReducer`.

For server state—data that lives on a remote API or database—use a dedicated server-state library like TanStack Query (React Query) or SWR rather than storing fetched data in a global client store. These libraries handle caching, background refetching, optimistic updates, and stale-while-revalidate patterns out of the box, eliminating entire categories of boilerplate.

Here is a practical decision rule for state management:

- **Local UI state** (form input, toggle open/close, scroll position): `useState` or `useReducer` inside the component. Lift state up only when two sibling components need to share it.
- **Server state** (API responses, database records): TanStack Query or SWR with minimal client-side caching.
- **Shared client state** (current user, theme preference, sidebar visibility): React Context with `useReducer` or a lightweight library like Zustand. Avoid Redux unless the state logic is truly complex or the team is already experienced with it.
- **URL state** (search params, filters, pagination page): Keep in the URL via `useSearchParams` or Next.js search params. This makes the state shareable, bookmarkable, and back-button friendly.
- **Form state**: Use a purpose-built library like React Hook Form or Formik. Raw `useState` for forms becomes unwieldy with validation, dirty tracking, and nested fields.

When using Context, be aware that every consumer re-renders when the context value changes, even if the component only reads a portion of the value. To mitigate this, split contexts by domain (e.g., `AuthContext`, `ThemeContext`, `LayoutContext`) rather than putting everything in one giant context. Alternatively, use state management libraries that provide granular subscriptions.

## Reusable Components and Component API Design

Design reusable components with a clear, predictable API. Every reusable component should accept a `className` prop for styling customization, spread additional HTML attributes onto the root element, and support composition over configuration.

Avoid building components with dozens of boolean props to control every visual variant. Instead, favor composition—let consumers wrap your component with their own styling or pass child components. For example, a `Table` component should accept a custom `renderRow` function rather than a prop for every possible row variant.

The following example shows a well-designed `Button` component:

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

function Button({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded font-medium transition-colors';
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    ghost: 'text-gray-700 hover:bg-gray-100',
  };
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className ?? ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
}
```

Key design choices: the component extends native button HTML attributes via the spread, so consumers can pass `onClick`, `type`, `aria-label`, and other standard attributes naturally. The `loading` prop does not replace the `disabled` behavior but supplements it. CSS class composition allows consumers to override styles when needed.

Do not build reusable components that fetch their own data. Data fetching belongs at the feature or page level, not in base UI components. A `UserDropdown` that fetches the user list internally is not reusable; a `Dropdown` that accepts items as a prop is.

## Folder Organization

A scalable folder structure helps developers locate files, understand boundaries, and avoid import cycles. The recommended structure for a medium-to-large React project is:

```
src/
  app/             # App entry point, providers, router setup
  pages/           # Route-level components (Next.js pages or React Router pages)
  features/        # Feature modules (see above)
  shared/          # Base components, utilities, constants, types
    components/    # Button, Input, Modal, Card, etc.
    hooks/         # useDebounce, useMediaQuery, useLocalStorage, etc.
    utils/         # formatDate, cn (class merge), validators, etc.
    types/         # Shared TypeScript types and interfaces
    constants/     # API base URLs, feature flags, enum values
  styles/          # Global styles, theme tokens, CSS variables
  lib/             # Third-party integrations (Firebase, Stripe, Sentry)
  test/            # Test setup, mocks, test utilities
```

The features folder is the most important. Each feature should be self-contained, testable in isolation, and removable without breaking other parts of the application. If two features frequently import from each other, they may actually be one feature that should be merged.

Avoid deep nesting. Keep the maximum directory depth at four levels from `src`. Beyond four levels, imports become hard to read and refactoring becomes error-prone.

## Code Splitting and Lazy Loading

Code splitting reduces the initial bundle size by deferring the loading of non-critical code. Every route should be its own split point. Use `React.lazy` with dynamic imports for route-level code splitting:

```typescript
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
```

Wrap lazy-loaded routes in a `Suspense` boundary with a fallback loading indicator. Place the Suspense boundary at the router level so that transitioning between routes shows a consistent loading state.

Beyond route-level splitting, consider splitting heavy components that are below the fold or triggered by user interaction. For example, a rich text editor should be lazy-loaded only when the user clicks "Edit" rather than included in the initial bundle.

Use `React.lazy` only for components. For utilities or libraries used in event handlers, use dynamic `import()` directly inside the handler:

```typescript
async function handleExport() {
  const { exportToCSV } = await import('../utils/export');
  exportToCSV(data);
}
```

This pattern works well for libraries like `pdfmake`, `papaparse`, or `date-fns` locale modules that are only needed in specific flows.

Monitor bundle size with tools like `vite-plugin-visualizer` or `webpack-bundle-analyzer` and set CI thresholds that fail the build if the bundle exceeds a target size. For most applications, a 200 KB (gzipped) initial bundle is a reasonable target.

## Performance Recommendations

Performance optimization should follow the principle of measured improvement. Do not optimize without profiling. Use React DevTools Profiler, Chrome Lighthouse, and Core Web Vitals (LCP, FID, CLS) as your measurement tools.

The most impactful performance techniques in order of priority:

1. **Reduce unnecessary re-renders**. Use React.memo on components that receive the same props frequently but re-render due to a parent state change. Do not wrap every component in React.memo; only apply it where profiling shows a benefit.

2. **Virtualize long lists**. For lists longer than 50 items, use `react-window` or `@tanstack/react-virtual` to render only the visible items. This is the single biggest performance win for data-heavy screens.

3. **Avoid prop drilling that causes cascading re-renders**. When deeply nested components need to update state, consider context or a state management library instead of threading callbacks through multiple intermediate components.

4. **Debounce or throttle rapid state updates**. Search inputs, resize handlers, and scroll listeners should use `useDebounce` or `requestAnimationFrame` to avoid flooding the render cycle.

5. **Use `useId` for generated IDs** instead of relying on incrementing counters or random values. This prevents hydration mismatches in server-rendered applications.

6. **Preload critical assets**. Use `<link rel="preload">` for fonts, hero images, and critical CSS. Use `<link rel="modulepreload">` for frequently used JavaScript modules.

7. **Avoid large dependency arrays in useEffect**. If a dependency array contains objects or arrays that are recreated every render, use `useMemo` to stabilize them, or restructure the logic to avoid the dependency.

## Error Boundaries

Error boundaries catch JavaScript errors in the component tree and display a fallback UI instead of crashing the entire application. Every React application should have at least one error boundary at the root level, and ideally one per feature route so that an error in one section does not take down unrelated parts of the UI.

Error boundaries are still implemented as class components since React has not yet introduced a hooks-based equivalent. Create a reusable `ErrorBoundary` component:

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

Log errors to an external service like Sentry or Datadog inside `componentDidCatch` or via the `onError` callback. Do not use error boundaries for control flow—they are for unexpected exceptions, not expected error states like validation errors or failed API calls. Handle expected errors with conditional rendering or try-catch blocks in event handlers.

## Best Practices for Production React Applications

Write TypeScript with strict mode enabled. Every component, hook, and utility should have explicit type annotations for public APIs. Use `interface` for object types and `type` for unions, intersections, and utility types. Avoid `any`; prefer `unknown` when the type is genuinely not known and narrow it with type guards.

Style components using a consistent approach across the project. CSS Modules, Tailwind CSS, and CSS-in-JS libraries are all viable. The key is consistency—do not mix approaches. If using Tailwind, extract repeated utility combinations into reusable class constants or a `cn()` helper that merges classes without conflicts.

Write tests that reflect how users interact with the application. Use React Testing Library for component tests, focusing on behavior rather than implementation details. Test accessible roles, text content, and form interactions. Avoid testing internal state or calling private methods. A rule of thumb: if your test needs to use `wrapper.find` or query by CSS class, you are testing implementation details.

Aim for a test pyramid with many unit tests for utilities and hooks, fewer integration tests for feature workflows, and a small number of end-to-end tests for critical user journeys. Run unit and integration tests in CI on every push. Run E2E tests on merge to main or before release.

Use environment variables for configuration that changes between environments. Prefix them with `REACT_APP_` in CRA projects or `VITE_` in Vite projects. Validate environment variables at build time so that missing configuration fails early.

Accessibility is not optional. Every interactive element must have an accessible name. Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<aside>`) rather than `<div>` with click handlers. Add `aria-label` or `aria-labelledby` when the visual label is not sufficient. Test with a screen reader and run `@axe-core/react` in development to catch violations.

Do not store secrets or API keys in client-side code. Any value embedded in a JavaScript bundle is visible to anyone who inspects the application. Server-side code or a BFF (backend for frontend) should proxy requests that require credentials.

Use strict linting and formatting. Configure ESLint with `eslint-plugin-react`, `eslint-plugin-react-hooks`, and `typescript-eslint`. Format with Prettier. Enforce both in CI with `lint-staged` and `husky` pre-commit hooks. Consistency in code style reduces cognitive load during code reviews and prevents style-related debates.

Finally, document architectural decisions in ADRs (Architecture Decision Records) stored alongside the code. When a team adopts a new pattern, library, or convention, record the context, the decision, and the alternatives considered. This practice prevents future developers from wondering why a particular approach was taken and reduces the likelihood of repeating past mistakes.
