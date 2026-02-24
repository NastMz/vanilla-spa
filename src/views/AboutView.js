import { el } from "../core/dom.js";
import "./AboutView.css";

/**
 * AboutView — Architecture documentation page.
 * Explains the project's design decisions, folder structure, and patterns.
 */
export function AboutView() {
  return el("div", { class: "view container about" }, [
    el("div", { class: "view__header" }, [
      el("h1", { class: "view__title" }, ["Architecture"]),
      el("p", { class: "view__subtitle" }, [
        "How this SPA is structured, and why each technical decision was made.",
      ]),
    ]),

    // ── Overview ──
    el("h2", {}, ["Overview"]),
    el("p", {}, [
      "This is a Single Page Application built entirely with Vanilla JavaScript — no React, Vue, Angular, or any UI framework. ",
      "It uses only the web platform APIs (DOM, Fetch, History, ES Modules) and Vite as a dev server / bundler.",
    ]),
    el("p", {}, [
      "The goal is to demonstrate that modern, well-architected web applications don't require heavy abstractions. ",
      "Every feature you see — routing, state management, data fetching, component composition — is implemented in under 100 lines of code each.",
    ]),

    // ── Folder Structure ──
    el("h2", {}, ["Folder Structure"]),
    el("div", { class: "folder-tree" }, [
      `src/
├── core/               ← Framework-level primitives
│   ├── router.js       ← History-based SPA router
│   ├── store.js        ← Reactive state container
│   └── dom.js          ← DOM creation utilities (el, text, fragment)
│
├── api/
│   └── client.js       ← HTTP client (cache, dedupe, abort)
│
├── components/         ← Reusable UI components
│   ├── Button.js       ← Multi-variant button
│   ├── Card.js         ← Content card
│   ├── Badge.js        ← Status label
│   ├── Loader.js       ← Spinner & skeleton
│   ├── Toast.js        ← Notification system
│   ├── ErrorState.js   ← Error display with retry
│   ├── EmptyState.js   ← Empty data placeholder
│   ├── UserCard.js     ← User list card + skeleton
│   └── FeatureCard.js  ← Home page feature card
│
├── views/              ← Page-level components
│   ├── HomeView.js     ← Landing / showcase
│   ├── CounterView.js  ← State management demo
│   ├── UsersView.js    ← Data fetching demo
│   ├── UserDetailView.js ← Dynamic route params demo
│   ├── AboutView.js    ← This page (architecture docs)
│   └── NotFoundView.js ← 404 page
│
├── styles.css          ← Design system (tokens, components, views)
└── main.js             ← App entry point (wiring)`,
    ]),

    // ── Router ──
    el("h2", {}, ["Router"]),
    el("p", {}, [
      "The router is built on ",
      el("code", {}, ["history.pushState"]),
      " and ",
      el("code", {}, ["popstate"]),
      " events. Routes are defined as an ordered array, enabling dynamic segments like ",
      el("code", {}, ["/users/:id"]),
      ".",
    ]),
    el("ul", {}, [
      el("li", {}, [
        el("strong", {}, ["Pattern Matching"]),
        " — Route patterns are compiled to regex at init time. Params are extracted and passed to view functions.",
      ]),
      el("li", {}, [
        el("strong", {}, ["No hash fragments"]),
        " — Uses real URLs via the History API. Requires server-side fallback to index.html (handled by Vite in dev).",
      ]),
      el("li", {}, [
        el("strong", {}, ["View transitions"]),
        " — Each view has a CSS ",
        el("code", {}, ["animation"]),
        " on mount. The router simply replaces DOM children — animation is handled purely in CSS.",
      ]),
      el("li", {}, [
        el("strong", {}, ["Scroll restoration"]),
        " — Scrolls to top on programmatic navigation for a native-app feel.",
      ]),
    ]),

    // ── Store ──
    el("h2", {}, ["State Management"]),
    el("p", {}, [
      "The store is a minimal reactive container: ",
      el("code", {}, ["get()"]),
      ", ",
      el("code", {}, ["set()"]),
      ", ",
      el("code", {}, ["subscribe()"]),
      ". That's the entire API.",
    ]),
    el("ul", {}, [
      el("li", {}, [
        el("strong", {}, ["Immutable updates"]),
        " — Each ",
        el("code", {}, ["set()"]),
        " creates a new state object via shallow merge. No deep merge needed at this scale.",
      ]),
      el("li", {}, [
        el("strong", {}, ["Synchronous notifications"]),
        " — Subscribers are called synchronously, making the data flow predictable and easy to debug.",
      ]),
      el("li", {}, [
        el("strong", {}, ["Re-render strategy"]),
        " — The store triggers a full view re-render on change. This is fast because DOM creation from pure functions is cheap, and ",
        el("code", {}, ["replaceChildren()"]),
        " batches the DOM update.",
      ]),
    ]),

    // ── Data Fetching ──
    el("h2", {}, ["Data Fetching"]),
    el("p", {}, [
      "The HTTP client wraps ",
      el("code", {}, ["fetch()"]),
      " with three production-essential features:",
    ]),
    el("ul", {}, [
      el("li", {}, [
        el("strong", {}, ["TTL Cache"]),
        " — Responses are cached in-memory with a configurable time-to-live. Avoids redundant network calls.",
      ]),
      el("li", {}, [
        el("strong", {}, ["Request Deduplication"]),
        " — Concurrent calls to the same URL share one in-flight promise. Prevents duplicate requests from re-renders.",
      ]),
      el("li", {}, [
        el("strong", {}, ["Abort Support"]),
        " — Uses ",
        el("code", {}, ["AbortController"]),
        " to cancel stale requests when a newer call supersedes the previous one.",
      ]),
    ]),

    // ── Components ──
    el("h2", {}, ["Component Model"]),
    el("p", {}, [
      "Components are plain functions that accept props and return DOM nodes. There's no virtual DOM, no JSX, no template compilation.",
    ]),
    el("pre", {}, [
      el("code", {}, [
        `// A component is just a function
function Button({ label, variant = 'secondary', onClick }) {
  return el('button', { class: ['btn', \`btn--\${variant}\`], onClick }, [label]);
}

// Compose like regular functions
function Toolbar() {
  return el('div', { class: 'toolbar' }, [
    Button({ label: 'Save', variant: 'primary', onClick: save }),
    Button({ label: 'Cancel', variant: 'ghost', onClick: cancel }),
  ]);
}`,
      ]),
    ]),
    el("p", {}, [
      "This pattern gives you the composability benefits of React components with zero abstraction cost. ",
      "The tradeoff: no automatic DOM diffing — the full view re-renders on state change. ",
      "For this app's scale, that's perfectly acceptable and measurably fast.",
    ]),

    // ── Design System ──
    el("h2", {}, ["Design System"]),
    el("p", {}, [
      "The CSS is structured around custom properties (design tokens) for colors, spacing, typography, shadows, and transitions. ",
      "Dark mode is implemented via ",
      el("code", {}, ['[data-theme="dark"]']),
      " selector overrides — no JavaScript class toggling for individual elements.",
    ]),
    el("ul", {}, [
      el("li", {}, [
        el("strong", {}, ["Token-based"]),
        " — All values reference CSS custom properties, making theming and consistency trivial.",
      ]),
      el("li", {}, [
        el("strong", {}, ["Component classes"]),
        " — BEM-lite naming (",
        el("code", {}, [".card__title"]),
        ", ",
        el("code", {}, [".btn--primary"]),
        ") for scoping without CSS modules.",
      ]),
      el("li", {}, [
        el("strong", {}, ["No utility framework"]),
        " — Intentionally avoids Tailwind/utility CSS to demonstrate clean hand-written styles.",
      ]),
    ]),

    // ── Tradeoffs ──
    el("h2", {}, ["Known Tradeoffs"]),
    el("ul", {}, [
      el("li", {}, [
        el("strong", {}, ["Full re-render"]),
        " — Every state change re-renders the entire view. For this app it's imperceptible, but a larger app would need targeted updates or a virtual DOM.",
      ]),
      el("li", {}, [
        el("strong", {}, ["No SSR"]),
        " — Client-only rendering. Server-Side Rendering would require a Node runtime and HTML serialization.",
      ]),
      el("li", {}, [
        el("strong", {}, ["No TypeScript"]),
        " — Pure JS for simplicity. JSDoc annotations provide minimal type documentation.",
      ]),
      el("li", {}, [
        el("strong", {}, ["State in URL"]),
        " — Only route path is reflected in URL. Query params, filters, etc. would need additional router features.",
      ]),
    ]),
  ]);
}
