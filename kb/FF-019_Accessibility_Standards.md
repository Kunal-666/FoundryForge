# Accessibility Standards

This document defines the accessibility requirements for all FoundryForge projects. Accessibility is not an add-on or a QA gate at the end of development — it must be integrated during the design and implementation phases. Every component generated from a specification must be evaluated against these standards. The target compliance level is WCAG 2.1 Level AA, with Level AAA required for specific criteria where feasible.

## Semantic HTML

Semantic HTML is the foundation of accessibility. Assistive technologies rely on the document structure and element semantics to convey meaning and enable navigation. Using the correct HTML element for its intended purpose costs zero effort and provides immediate accessibility improvements.

Use `<nav>` for navigation blocks, `<main>` for the primary content of a page, `<aside>` for tangential content, `<article>` for self-contained compositions, `<section>` for thematic groupings with a heading, `<header>` and `<footer>` for introductory and concluding content for a section or page, and `<form>` with proper fieldset and legend groupings for form controls.

Headings must follow a logical hierarchy without skipping levels. An `<h1>` should describe the page's purpose, followed by `<h2>` for major sections, `<h3>` for subsections, and so on. Skipping from `<h2>` to `<h4>` disorients screen reader users who navigate by heading structure. Do not use headings for visual styling — use CSS if you need a different appearance.

```
<!-- Good: logical heading hierarchy -->
<h1>Account Settings</h1>
<h2>Profile</h2>
<h3>Personal Information</h3>
<h3>Avatar</h3>
<h2>Security</h2>
<h3>Password</h3>
<h3>Two-Factor Authentication</h3>

<!-- Bad: skipped levels and headings used for styling -->
<h1>Account Settings</h1>
<h4>Profile</h4>  <!-- Skipped h2 and h3 -->
<h6>Personal Information</h6>  <!-- Skipped h5 -->
```

## ARIA Attributes

ARIA (Accessible Rich Internet Applications) attributes supplement HTML semantics when native elements cannot provide the necessary accessibility information. The first rule of ARIA is: do not use ARIA if you can use a native HTML element that provides the semantics you need. A native `<button>` already communicates "button" to the accessibility tree. A `<div>` with `role="button"` requires additional ARIA attributes and keyboard event handling to match the native behavior.

When ARIA is necessary, use it correctly. Landmark roles (`role="banner"`, `role="navigation"`, `role="main"`, `role="contentinfo"`) are usually redundant when you use semantic HTML5 elements, but they can be helpful in legacy codebases.

Use `aria-label` when a visible label is not present. An icon-only button must have an `aria-label` that describes its action.

```
<button aria-label="Close dialog">
  <XIcon />
</button>
```

Use `aria-labelledby` to associate an element with a visible label elsewhere in the DOM. This is useful for dialog titles and form section descriptions.

```
<div role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Deletion</h2>
</div>
```

Use `aria-describedby` to provide additional descriptive text. A form field that has a hint below it should use `aria-describedby` to link the hint to the input.

```
<label for="password">Password</label>
<input
  id="password"
  type="password"
  aria-describedby="password-hint"
/>
<p id="password-hint">Must be at least 8 characters with a number and a symbol</p>
```

Use `aria-expanded` on toggle buttons and `aria-controls` to indicate which element the button controls. Use `aria-selected` for tab interfaces and `aria-current` for the current page in a navigation list.

Never use `role="presentation"` or `aria-hidden="true"` on focusable elements. Doing so hides the element from assistive technologies while leaving it accessible via keyboard navigation, creating a trap for screen reader users.

## Keyboard Navigation

Every interactive element must be accessible and operable via keyboard alone. Users who cannot use a mouse navigate using Tab, Shift+Tab, arrow keys, Enter, and Escape.

Tab order must follow the visual order of elements. Do not use positive `tabindex` values (greater than 0) — they create a tab order that diverges from the DOM order and breaks expected navigation flow. Use `tabindex="0"` to make an element focusable in its natural order, and `tabindex="-1"` to make it programmatically focusable but not reachable via Tab.

All interactive elements must have visible focus indicators. The default browser focus ring is acceptable, but custom focus styles that provide a minimum 2-pixel offset and 3-pixel thickness with a contrast ratio of at least 3:1 against the adjacent background are better. Never use `outline: none` or `:focus { outline: none }` without providing an alternative focus style.

Implement custom keyboard handlers for complex widgets. A tab panel must support arrow key navigation between tabs. A dropdown menu must support arrow keys for option selection and Escape to close. A modal must trap focus within the modal while it is open and return focus to the triggering element when closed.

```
function Tabs({ tabs }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef([]);

  const handleKeyDown = (e) => {
    let newIndex = activeIndex;
    if (e.key === 'ArrowRight') newIndex = (activeIndex + 1) % tabs.length;
    if (e.key === 'ArrowLeft') newIndex = (activeIndex - 1 + tabs.length) % tabs.length;
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      tabRefs.current[newIndex]?.focus();
    }
  };

  return (
    <div role="tablist" onKeyDown={handleKeyDown}>
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          ref={(el) => (tabRefs.current[i] = el)}
          role="tab"
          aria-selected={i === activeIndex}
          tabIndex={i === activeIndex ? 0 : -1}
          onClick={() => setActiveIndex(i)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

## Screen Reader Compatibility

Screen readers announce content linearly and rely on semantic structure, ARIA attributes, and alternative text. Content must be understandable when read in DOM order, not visual order.

Provide alternative text for every non-decorative image. Decorative images (purely visual with no informational content) should have `alt=""` to tell screen readers to skip them. Informational images must have descriptive alt text that conveys the same information as the image.

A chart or graph should have alt text that summarizes the key insight, not "Chart 1". Better alt text: "Bar chart showing Q4 revenue increased 23% year-over-year, driven by enterprise subscriptions."

Use `aria-live` regions for dynamically updated content. A notification toast, a chat message arrival, or a form error that appears without a full page reload should be announced by screen readers. Use `aria-live="polite"` for non-urgent updates and `aria-live="assertive"` for time-sensitive updates like expiration warnings.

```
<div aria-live="polite" aria-atomic="true">
  {notifications.map((n) => (
    <div key={n.id} role="alert">{n.message}</div>
  ))}
</div>
```

Hidden content that should not be announced (offscreen navigation, decorative elements) must use `aria-hidden="true"` or the `hidden` attribute. Content that should be available to screen readers but visually hidden (skip links, form labels for icon-only inputs) should use a CSS class that clips the content to 1 pixel and hides overflow, not `display: none` or `visibility: hidden`.

```
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## Focus Management

When a new page loads, focus should move to the `<h1>` or the main content area. When a modal opens, focus must move to the first focusable element inside the modal. When a modal closes, focus must return to the element that triggered the modal.

Single-page application route changes require explicit focus management because the page does not reload. After a route change, move focus to the main content heading or container.

```
function useFocusOnRouteChange() {
  const pathname = usePathname();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
      // Prevent the focus scroll from jumping to the top
      mainRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [pathname]);

  return mainRef;
}
```

## Color Contrast

Text and images of text must meet minimum contrast ratios against their background at all states, including hover, focus, active, and disabled. WCAG 2.1 Level AA requires a contrast ratio of at least 4.5:1 for normal text (under 18px or under 14px bold) and 3:1 for large text (18px and above or 14px bold and above). WCAG Level AAA requires 7:1 for normal text and 4.5:1 for large text.

Non-text elements like icons, chart lines, and form input borders must have a contrast ratio of at least 3:1 against adjacent colors. This includes placeholder text, which must meet the 4.5:1 ratio.

Do not rely solely on color to convey information. Error states must include an icon or text label in addition to a red border. Chart data must use patterns or labels in addition to color coding. Links must be underlined or otherwise distinguishable from body text by more than color, unless the link is in a navigation block where context makes it obvious.

Use a color contrast checker during development. Every design token and CSS variable in the theme should be validated against its expected background.

## Form Labels and Error Associations

Every form input must have an associated `<label>`. Use the `for` attribute matching the input's `id` to create the association programmatically. Wrapping an input in a `<label>` element also creates the association but is less reliable with assistive technologies across browsers.

Form errors must be associated with their input using `aria-describedby` or `aria-errormessage`. Error messages should appear adjacent to the input in the DOM order, not in a summary list at the top of the form (though a summary list in addition to inline errors is helpful).

```
<label for="email">Email address</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={!!errors.email}
/>
{errors.email && (
  <p id="email-error" role="alert">{errors.email}</p>
)}
```

Required fields must be indicated with more than color alone. Use an asterisk with `aria-required="true"` on the input and include a note at the top of the form explaining that asterisk-marked fields are required. Alternatively, explicitly state "required" in the label text.

## Accessible Tables

Data tables must use `<table>`, `<thead>`, `<tbody>`, `<th>`, and `<tr>` elements correctly. Header cells (`<th>`) must use the `scope` attribute to associate them with their corresponding row or column. Use `scope="col"` for column headers and `scope="row"` for row headers.

For complex tables with multiple levels of headers, use the `headers` attribute on `<td>` elements to reference the `id` of the header cells that apply.

```
<table>
  <caption>Q1 2025 Revenue by Region</caption>
  <thead>
    <tr>
      <th scope="col">Region</th>
      <th scope="col">January</th>
      <th scope="col">February</th>
      <th scope="col">March</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">North America</th>
      <td>$45,000</td>
      <td>$52,000</td>
      <td>$58,000</td>
    </tr>
  </tbody>
</table>
```

Use `<caption>` to provide a descriptive title for the table. The caption acts as the table's accessible name.

Do not use tables for layout. Layout tables are not inherently wrong but they create navigation complexity for screen reader users, who must navigate through layout cells to reach actual content. CSS Grid and Flexbox provide the same layout capabilities without the accessibility overhead.

## Accessible Modals and Dialogs

Modals are one of the most common accessibility failure points. An accessible modal must satisfy these requirements:

The modal must use the `dialog` role or the native `<dialog>` element with appropriate ARIA attributes. The modal title must be referenced via `aria-labelledby`. If the modal has additional descriptive text, use `aria-describedby`. Focus must be trapped inside the modal — pressing Tab cycles through elements within the modal and does not reach content behind it. Pressing Escape closes the modal. Closing the modal returns focus to the element that triggered the modal. Content behind the modal must be marked as inert (use the `inert` attribute or set `aria-hidden="true"` on the background content).

```
function Modal({ isOpen, onClose, title, children }) {
  const triggerRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      triggerRef.current?.focus();
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  return isOpen ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
    >
      <h2 id="modal-title">{title}</h2>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  ) : null;
}
```

## Accessibility Testing

Accessibility testing must be performed at every stage of development, not as a final audit. Use a combination of automated tools, manual testing, and assistive technology testing.

### Automated Testing

Automated tools catch approximately thirty to forty percent of accessibility issues. Use `axe-core` (via the `@axe-core/react` package or the axe browser extension) for programmatic audits. Integrate `jsx-a11y` ESLint rules to catch accessibility issues during development — rules like `alt-text`, `label-has-associated-control`, `no-onchange`, and `role-has-required-aria-props` catch common mistakes before they reach a pull request.

Write end-to-end tests with Playwright or Cypress that verify accessibility using `@axe-core/playwright` or `cypress-axe`. Run these tests as part of the CI pipeline.

```
import { injectAxe, checkA11y } from 'axe-playwright';

test('dashboard page has no critical violations', async ({ page }) => {
  await page.goto('/dashboard');
  await injectAxe(page);
  await checkA11y(page, null, {
    includedImpacts: ['critical', 'serious'],
  });
});
```

### Manual Testing

Automated tools cannot catch every issue. Manual checks include verifying keyboard navigation flows through all interactive elements in the correct order, confirming that focus indicators are visible on every element, testing with browser zoom at 200% with no horizontal scrolling or content loss, and verifying that all functionality works without JavaScript enabled (for content sites) or degrades gracefully (for web applications).

### Assistive Technology Testing

Test with at least one screen reader. On Windows, use NVDA (free) or JAWS. On macOS, use VoiceOver. On mobile, test with TalkBack (Android) and VoiceOver (iOS). Perform a full task flow — sign up, browse, make a purchase — using only the screen reader and keyboard.

## Do's and Don'ts

**Do** build accessible components from the start. Retrofitting accessibility is significantly more expensive than building it in. A modal component built without focus management requires rewriting rather than patching.

**Don't** use `title` attributes as a substitute for visible labels. The `title` attribute is not reliably exposed by screen readers and does not provide a visible label for sighted users.

**Do** test accessibility on real devices with real assistive technology. Browser simulation tools do not replicate how actual screen readers behave.

**Don't** disable user zoom or scaling in the viewport meta tag. The `user-scalable=no` attribute and `maximum-scale=1.0` are accessibility violations under WCAG 2.1.

**Do** include accessibility requirements in the definition of done for every user story. A feature is not complete until it has been tested with keyboard navigation, a screen reader, and automated auditing tools.
