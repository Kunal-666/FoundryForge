# Performance Checklist

This document provides a comprehensive performance optimization checklist for FoundryForge projects. Performance is not a feature — it is a constraint that must be designed from the start. Every item on this checklist should be evaluated during the Architecture phase of a project specification and verified during code review and pre-launch QA.

This checklist covers frontend performance for browser-based applications. Backend performance (database indexing, query optimization, connection pooling) is covered in the API Service Planning document.

## Bundle Size and Code Splitting

### Measure Baseline Bundle Size

Before optimizing, establish a baseline. Run your build tool's bundle analyzer to understand what is shipping to the browser. Configure Webpack Bundle Analyzer, Vite's `rollup-plugin-visualizer`, or Next.js's built-in `@next/bundle-analyzer` as part of the CI pipeline. Set a budget alert — if the main bundle exceeds a threshold (typically 250 KB gzipped for initial load), the build should warn or fail.

Track bundle size across commits to catch regressions early. A single imported utility library can add sixty kilobytes to the bundle without a visible code change.

### Code Splitting with React.lazy

Split your application at route boundaries. Every page or route segment should be a separate chunk that loads only when the user navigates to it. React.lazy makes this straightforward.

```
import { lazy } from 'react';

const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const SettingsPage = lazy(() => import('@/pages/Settings'));
const AnalyticsPage = lazy(() => import('@/pages/Analytics'));
```

Wrap lazy-loaded routes in a Suspense boundary with a loading fallback. The fallback should be minimal — a skeleton screen or a spinner — and should not cause layout shift.

Split at the component level only when the component is large and rarely used. A rich text editor that appears only when the user clicks "edit" is a good candidate for component-level splitting. A button icon is not.

Use `webpackChunkName` magic comments (Webpack) or Vite's default chunk naming to give meaningful names to lazy chunks. Meaningful names make debugging cache misses easier.

### Tree Shaking and Side Effects

Configure `sideEffects: false` in package.json for library authors and verify that your build tool's tree-shaking is working. Import specific exports rather than entire modules.

```
// Do: import specific functions
import { formatDistanceToNow } from 'date-fns';

// Don't: import entire library
import { formatDistanceToNow } from 'date-fns';
```

Use `eslint-plugin-import` with the `no-unused-modules` rule to detect dead code elimination opportunities. Dead code that cannot be tree-shaken inflates the bundle.

## Image Optimization

### Responsive Images

Every image must be served in multiple sizes and formats. Use the `srcset` and `sizes` attributes on `<img>` elements to let the browser choose the appropriate size based on viewport and device pixel ratio. Never serve a 4000-pixel-wide hero image to a mobile device.

Use Next.js's `next/image` component or a build-time image optimization pipeline. `next/image` automatically generates multiple sizes, serves WebP and AVIF formats, and implements lazy loading by default. For non-Next.js projects, use `gatsby-plugin-image` (Gatsby) or a manual `srcset` configuration.

```
<!-- Manual responsive image -->
<img
  src="hero-800.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
  sizes="(max-width: 768px) 100vw, 800px"
  alt="Hero image"
  loading="lazy"
/>
```

### Compression and Format

Use WebP as the default format with AVIF as an upgrade for browsers that support it. Convert all raster images at build time. Configure your image processing pipeline to strip EXIF metadata, which can add tens of kilobytes to a JPEG without any visible benefit.

For icons and simple illustrations, prefer SVGs over PNG. SVG files are resolution-independent, typically smaller, and can be styled with CSS.

### Lazy Loading

Add `loading="lazy"` to all images below the fold. This attribute tells the browser to defer loading until the image approaches the viewport. Avoid setting `loading="lazy"` on the hero image above the fold — it should load immediately for the best Largest Contentful Paint score.

For background images set via CSS, use a lazy-loading technique: load a low-resolution placeholder first, then swap to the full-resolution image after the page loads.

## Virtualization

Virtualization (also called windowing) renders only the items currently visible in the viewport, plus a small overscan buffer. It is essential for any scrollable list or grid that renders more than about 100 items.

Use `react-window` for simple lists and grids. It provides `FixedSizeList`, `VariableSizeList`, and `FixedSizeGrid` components with minimal API surface. For more complex scenarios — dynamic heights, animated items, sticky headers, or infinite loading — use `react-virtuoso`, which provides a richer feature set with zero configuration.

```
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={72}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <ListItem item={items[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

Without virtualization, rendering a table with 10,000 rows creates 10,000 DOM nodes and causes frame drops during scrolling and re-renders. With virtualization, the same table creates around 20 DOM nodes regardless of total data size.

Virtualization is also critical for long chat threads, activity feeds, dropdowns with hundreds of options (use `react-window`-based select components), and data grids.

## Memoization with useMemo and useCallback

Memoization trades memory for computation time. Apply it when the computation is expensive or when the re-render cascade it prevents would be costly. Do not memoize everything — the overhead of comparing dependencies can exceed the cost of recomputation.

Apply `useMemo` to derived data that requires non-trivial computation. Filtering and sorting an array of thousands of items is a good candidate. Formatting dates or currency values is not — the computation is cheap and the result is small.

```
// Good useMemo: expensive computation on large dataset
const sortedUsers = useMemo(() => {
  return [...users].sort((a, b) => a.lastName.localeCompare(b.lastName));
}, [users]);
```

Apply `useCallback` when passing a function to a memoized child component that implements `React.memo`. Without `useCallback`, the child receives a new function reference on every render and the memoization is defeated.

```
function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => {
    setCount((c) => c + 1);
  }, []);
  return <ExpensiveChild onClick={handleClick} />;
}
```

Do not wrap every inline function in `useCallback`. The overhead of the hook and the dependency array comparison can be greater than the cost of the re-render. Profile first, then memoize.

## React.memo

Wrap pure presentational components in `React.memo` when they receive the same props frequently and re-render often as a result of parent state changes. A list item component that receives an object and an onClick handler is a good candidate — when the parent re-renders due to a search filter change, the list items that did not change should not re-render.

```
const ListItem = React.memo(({ item, onSelect }) => {
  return (
    <div onClick={() => onSelect(item.id)}>
      {item.name}
    </div>
  );
});
```

Do not use `React.memo` on every component. Components that are cheap to render (a plain `<div>` with static text) or that always receive different props (a component that receives the current timestamp) gain nothing from memoization.

## Caching Strategies

### HTTP Caching

Configure Cache-Control headers on API responses appropriately. Static assets (JavaScript bundles, images, fonts) should use `Cache-Control: public, max-age=31536000, immutable` with a content hash in the filename. API responses that rarely change should use `Cache-Control: public, max-age=300` (5-minute cache). User-specific data should use `no-cache` or `private, max-age=60`.

Use ETag headers for conditional requests. An ETag-based cache validation saves bandwidth and latency by returning a 304 Not Modified response when the resource has not changed.

### Service Worker Caching (PWA)

For applications that need offline support or faster repeat visits, implement a service worker using Workbox. Cache the app shell (HTML, JavaScript, CSS) on first visit using the StaleWhileRevalidate strategy. Cache API responses that are expensive or infrequently changing using the CacheFirst strategy with a visibility timeout.

### TanStack Query Cache

TanStack Query provides built-in caching for server data. Configure `staleTime` and `gcTime` per query based on how frequently the data changes. Dashboard metrics that update every 5 minutes should have a `staleTime` of 4 minutes and a `gcTime` of 30 minutes. User profile data that rarely changes should have a `staleTime` of 10 minutes.

```
useQuery({
  queryKey: ['dashboard', 'metrics'],
  queryFn: fetchMetrics,
  staleTime: 4 * 60 * 1000,   // 4 minutes until refetch
  gcTime: 30 * 60 * 1000,      // 30 minutes until garbage collection
});
```

## Lazy Loading

Beyond code splitting, lazy loading applies to non-critical resources. Defer loading of third-party scripts (analytics, chat widgets, social media embeds) until after the main content has rendered. Use the `async` or `defer` attribute on script tags and consider using `IntersectionObserver` to load widgets only when they scroll into view.

```
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

Fonts are a major performance bottleneck. Use `font-display: swap` to ensure text remains visible during font load. Preload the primary font using `<link rel="preload">` and subset fonts to include only the characters your application actually uses.

## SSR and Hydration Considerations

For Next.js and other SSR frameworks, the Server-Side Rendering pipeline introduces unique performance concerns. The server-rendered HTML must be as small as possible because it blocks the browser from rendering until the full response arrives. Streaming SSR (available in Next.js App Router, React 18's `renderToPipeableStream`) sends HTML in chunks, allowing the browser to render content progressively.

Avoid rendering expensive components on the server if they have no SEO value. A dashboard chart that depends on client-side data should be rendered entirely on the client. Use Next.js dynamic imports with `ssr: false` to exclude components from server rendering.

```
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('@/components/Chart'), { ssr: false });
```

Hydration mismatches between server and client cause React to re-render entire subtrees. Ensure that data fetched during SSR produces the same output on the client. Use stable IDs and avoid relying on `Math.random()` or `Date.now()` during server rendering.

## Production Optimization Checklist

Before launching, verify each of these items. This checklist should be run as part of the release process.

- [ ] All images use modern formats (WebP/AVIF) with responsive srcset
- [ ] All images below the fold use loading="lazy"
- [ ] Route-level code splitting is configured with React.lazy and Suspense
- [ ] Main bundle size is under 250 KB gzipped (or the project's established budget)
- [ ] Bundle analyzer has been run and reviewed for unexpected large dependencies
- [ ] Tree shaking is verified — no unused imports in the production bundle
- [ ] Long lists use virtualization (react-window or react-virtuoso)
- [ ] Font display is set to swap with subset fonts
- [ ] Third-party scripts are deferred or loaded asynchronously
- [ ] Cache-Control headers are set for static assets and API responses
- [ ] TanStack Query staleTime and gcTime are configured per query
- [ ] Components that re-render often with unchanged props use React.memo or useMemo
- [ ] No unnecessary context providers wrapping the entire app tree
- [ ] Server-side rendering avoids expensive non-essential components
- [ ] Largest Contentful Paint (LCP) is under 2.5 seconds on mobile throttled
- [ ] First Input Delay (FID) / Interaction to Next Paint (INP) is under 200ms
- [ ] Cumulative Layout Shift (CLS) is under 0.1

## Do's and Don'ts

**Do** measure before optimizing. Use Lighthouse, Web Vitals, and the React DevTools profiler to identify actual bottlenecks. Optimizing code that contributes 5 milliseconds to a 3-second load is wasted effort.

**Don't** apply premature optimization. A `useMemo` on every computed value, a `React.memo` on every component, and a `useCallback` on every event handler add cognitive overhead and can degrade performance by consuming memory and increasing comparison cost.

**Do** set a performance budget and enforce it in CI. A budget of 250 KB gzipped for initial JavaScript and 500 KB for total page weight gives your application room to deliver a fast experience on mobile networks.

**Don't** ship analytics or monitoring scripts that impact user experience. Load analytics asynchronously after the page is interactive. If your analytics script blocks rendering, it creates a negative performance impact while measuring performance, which is counterproductive.

**Do** test on real mobile hardware with throttled network conditions. Developer machines on gigabit Ethernet with 16 GB of RAM mask performance problems. Test on a Moto G4 simulated device with Slow 3G throttling to understand what actual users experience.
