# State Management Guidelines

This document defines when and how to use each state management approach in FoundryForge projects. State management is the single largest source of architectural overengineering in frontend applications. The right choice depends on the type of state, its scope, its mutation frequency, and its synchronization requirements with remote data. This document replaces dogma with a decision framework.

## Types of State

Before choosing a tool, classify the state you are managing. Every piece of state in an application falls into one of these categories:

- **Local state**: Data that belongs to a single component. A dropdown's open/closed state, a form field's current value, a tooltip's visibility. This state does not need to leave the component and should not be lifted unless another component needs it.

- **Shared state**: Data that multiple components at different branches of the tree need to read or write. The currently authenticated user, the theme selection, the contents of a shopping cart.

- **Server state**: Data that lives on a remote server and is fetched, cached, and invalidated. The list of projects from the API, the current user's profile, the dashboard metrics. This is the most commonly misclassified category — developers often put server state into a global store when a caching library is the correct tool.

- **URL state**: Data that is reflected in the browser's URL. The current route, search parameters, pagination page number, filter selections. This state belongs in the URL, not in a store or context.

- **Derived state**: Data computed from other state values. A filtered list derived from the full list and the current filter text. The total price derived from line items and tax rate. Derived state should never be stored separately — it should be computed on render with useMemo or a selector.

## The Decision Matrix

| Requirement | Recommended Approach |
|---|---|
| Single component needs state | `useState` or `useReducer` |
| Two or three related components in a subtree | Prop drilling (first), then `useContext` |
| Many components across the tree need the same state | Context API or Zustand |
| Complex local state with multiple sub-values | `useReducer` |
| State is fetched from or synced with a server | TanStack Query (React Query) / SWR |
| State needs to survive page refresh and tabs | `localStorage` or URL params |
| State is part of navigation or filtering | URL search params |
| Large-scale app with complex client state | Zustand or Redux Toolkit |
| Real-time data (WebSocket, SSE, Firestore onSnapshot) | TanStack Query with subscription adapter, or Zustand with event subscription |

## Local State with useState and useReducer

Start with `useState`. It is the simplest tool and covers roughly seventy percent of all state management needs in a typical application. A toggle, an input value, a modal's visibility — these are not problems that require architecture.

Use `useReducer` when local state has multiple related values that change together, or when the next state depends on the previous state in complex ways. A multi-step form with validation errors, dirty flags, and submission status is a good candidate for `useReducer` because the state transitions are predictable and the reducer function can be unit-tested independently of the component.

```
function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, values: { ...state.values, [action.field]: action.value } };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors, isSubmitting: false };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, error: null };
    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false, isSubmitted: true };
    case 'SUBMIT_FAILURE':
      return { ...state, isSubmitting: false, error: action.error };
    default:
      return state;
  }
}
```

Do not reach for `useReducer` for single-value state like a boolean toggle. That is `useState` territory. Do not use `useReducer` to manage server state — that is TanStack Query's job.

## Context API

React Context is the right tool when you need to share state across a subtree without prop drilling through intermediate components that do not use the value. Context shines for truly global concerns: theme, locale, current user identity, notification toast system.

Context breaks down under two conditions. First, when the context value changes frequently and many components consume it, every consumer re-renders even if the relevant slice of the value did not change. This causes performance problems in dashboards, data grids, and real-time displays. Second, when deeply nested components need context but intermediate components block re-renders via `React.memo` in ways that are hard to debug.

Split contexts by frequency of change and by domain. A theme context changes rarely and is safe to have as a single provider. A notification context that pushes toast messages may change every few seconds and should be isolated from other state. Do not create a single `AppContext` that holds every piece of global state — that guarantees re-renders across the entire tree for any state change.

```
// Do: separate contexts for separate concerns
<ThemeProvider>
  <AuthProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </AuthProvider>
</ThemeProvider>
```

```
// Don't: a single context for everything
<AppProvider value={{ theme, user, notifications, settings, locale }}>
  <App />
</AppProvider>
```

## Zustand

Zustand is the recommended client-state library for projects that outgrow Context API. It provides a lightweight store with no boilerplate, no providers, and built-in support for selectors that prevent unnecessary re-renders.

Use Zustand when state needs to be accessed by many unrelated components across the tree, when state changes frequently and you need fine-grained re-render control, or when state has complex update logic that should not live inside a component.

```
import { create } from 'zustand';

const useCartStore = create((set) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return { items: state.items.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return { items: [...state.items, { ...product, quantity: 1 }] };
    }),
  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== productId) })),
  clearCart: () => set({ items: [] }),
}));
```

Zustand does not require wrapping your application in providers. The store is a plain JavaScript object with a React hook attached. This makes it ideal for libraries, micro-frontends, and any code where wrapping tree sections in providers is impractical.

Use Zustand over Redux when your team size is small, when you do not need middleware-heavy pipelines, and when you want to avoid Redux's boilerplate. Use Redux over Zustand when you need battle-tested DevTools, a mature ecosystem of addons, or the normalized entity pattern (Redux Toolkit's `createEntityAdapter`) for managing large collections of normalized data.

## Redux (Redux Toolkit)

Redux Toolkit is appropriate for large-scale applications where state management complexity justifies the ceremony. Consider Redux when multiple teams work on the same codebase and need clear contracts for state shape and actions, when you need time-travel debugging and action logging in production, or when state normalization across multiple related entity types (users, posts, comments, tags) requires a structured approach.

```
import { createSlice, configureStore } from '@reduxjs/toolkit';

const postsSlice = createSlice({
  name: 'posts',
  initialState: { entities: {}, ids: [], loading: false },
  reducers: {
    addPost: (state, action) => {
      const post = action.payload;
      state.entities[post.id] = post;
      state.ids.push(post.id);
    },
    removePost: (state, action) => {
      delete state.entities[action.payload];
      state.ids = state.ids.filter((id) => id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});
```

Redux is overkill for most projects. If you are unsure whether you need Redux, you do not need Redux. Start with Zustand or Context. You can migrate to Redux if and when the project grows to a scale where Redux's specific benefits matter.

## TanStack Query (React Query)

TanStack Query is the correct tool for server state — data that your application fetches from, saves to, and synchronizes with a remote server. It handles caching, background refetching, pagination, optimistic updates, and stale-while-revalidate patterns. Every project that makes HTTP requests to a backend should consider TanStack Query as the default data-fetching layer.

TanStack Query eliminates the need for a global store to hold server data. Before TanStack Query, developers would fetch data in a component, dispatch it to a Redux store, and let other components select it from the store. This pattern required writing three files (component, action creator, reducer) for every data-fetching operation. TanStack Query reduces this to a single query hook.

```
function Dashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get('/dashboard/stats'),
    refetchInterval: 30000, // Poll every 30 seconds for near-real-time
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  return <StatsGrid data={stats} />;
}
```

For mutations, TanStack Query handles the full lifecycle: mutate, optimistic update, rollback on error, and cache invalidation on success.

```
const mutation = useMutation({
  mutationFn: (newProject) => api.post('/projects', newProject),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  },
});
```

## Real-Time Data Patterns

Real-time data presents unique state management challenges. When a dashboard subscribes to a Firestore collection, a WebSocket feed, or a Server-Sent Events endpoint, the incoming data must be merged into the local state without losing the user's pending edits or local UI state.

For Firestore real-time listeners, use TanStack Query with the `@tanstack/react-query` and Firebase SDK integration. The query function returns an unsubscribe function, and the cache manages deduplication across components.

```
function useRealtimeProjects() {
  return useQuery({
    queryKey: ['projects', 'realtime'],
    queryFn: ({ signal }) => {
      const unsubscribe = onSnapshot(
        collection(db, 'projects'),
        (snapshot) => {
          const projects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          queryClient.setQueryData(['projects', 'realtime'], projects);
        }
      );
      signal.addEventListener('abort', unsubscribe);
    },
    refetchOnWindowFocus: false, // WebSocket handles freshness
  });
}
```

For raw WebSocket or SSE connections, combine Zustand for the local state that accumulates incoming messages and TanStack Query for the initial data load. This lets you display historical data immediately via query cache while the WebSocket streams updates into the Zustand store for real-time display.

```
const useLiveFeed = create((set, get) => ({
  events: [],
  addEvent: (event) => set((state) => ({ events: [...state.events.slice(-100), event] })),
  clearEvents: () => set({ events: [] }),
}));

// In the hook that manages the WebSocket connection
useEffect(() => {
  const ws = new WebSocket(WS_URL);
  ws.onmessage = (msg) => {
    useLiveFeed.getState().addEvent(JSON.parse(msg.data));
  };
  return () => ws.close();
}, []);
```

## When a Dashboard Needs Real-Time Data

Consider a dashboard that displays live metrics: active users, request latency, error rates, and revenue for the current hour. This scenario combines server state (the initial data load), real-time streaming (websocket updates), and local UI state (selected time range, chart zoom level, filter settings).

The correct approach uses three layers. TanStack Query fetches the initial data and provides a loading state and error boundary. A WebSocket connection merges incremental updates into the query cache. Zustand or URL parameters manage the purely client-side UI state — which time range is selected, whether a chart is expanded, what filter is active.

```
function LiveDashboard() {
  const [timeRange, setTimeRange] = useSearchParams('range', '1h');

  const { data: initialMetrics } = useQuery({
    queryKey: ['metrics', timeRange],
    queryFn: () => api.get(`/metrics?range=${timeRange}`),
  });

  // WebSocket merges live updates into the query cache
  useMetricsWebSocket((update) => {
    queryClient.setQueryData(['metrics', timeRange], (old) => mergeMetrics(old, update));
  });

  return (
    <div>
      <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      <MetricsGrid data={initialMetrics} />
    </div>
  );
}
```

## Do's and Don'ts

**Do** start with the simplest solution that works. `useState` for local state, TanStack Query for server state, URL params for filter and pagination state. Only add Zustand or Redux when you can articulate a specific problem that the simpler tools cannot solve.

**Don't** put server data into a client-side store. If you are fetching API data and calling `setState` or `dispatch` to store it in a global store, you are writing boilerplate that TanStack Query eliminates. Every line of code you write to sync server state to a Redux store is a line that can and should be deleted.

**Do** use selectors to prevent unnecessary re-renders. Whether you use Zustand's `useStore` with a selector, Redux's `useSelector`, or `useContext` with a split provider, always select the smallest slice of state your component needs.

**Don't** lift state to a context or store "just in case" another component needs it later. Lift state when a concrete component needs it and prop drilling becomes painful. Premature lifting couples unrelated components to shared state that they do not need.

**Do** treat URL search params as your primary state management tool for filter, sort, and pagination state. URL state survives page refresh, enables link sharing, supports browser back/forward navigation, and keeps the component tree uncluttered. It is the most underused state management tool in frontend development.
