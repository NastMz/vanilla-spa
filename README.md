# Vanilla SPA

A production-ready Single Page Application architecture built with **zero dependencies** — just Vanilla JavaScript, modern CSS, and the web platform.

![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-f7df1e?style=flat-square&logo=javascript)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-10b981?style=flat-square)
![Vite](https://img.shields.io/badge/Bundler-Vite-646cff?style=flat-square&logo=vite)

## Why?

Modern frameworks are great, but they often obscure what's actually happening. This project proves that you can build a well-architected, maintainable SPA using only what the browser gives you:

- **History API** for routing (no hash fragments)
- **Fetch + AbortController** for data fetching
- **ES Modules** for code organization
- **CSS Custom Properties** for a full design system
- **DOM API** for rendering (no virtual DOM)

## Features

| Feature                 | Implementation                                           |
| ----------------------- | -------------------------------------------------------- |
| **Client-side routing** | `history.pushState` with dynamic params (`/users/:id`)   |
| **State management**    | Global store plus local signals with explicit disposal   |
| **Data fetching**       | HTTP client with TTL cache, request deduplication, abort |
| **Component model**     | Pure functions → DOM nodes (composable, testable)        |
| **Design system**       | CSS custom properties, dark mode, fluid typography       |
| **UX states**           | Loading skeletons, error states, empty states, toasts    |
| **Transitions**         | CSS-only view enter animations                           |
| **Dark mode**           | System-aware with manual toggle and persistence          |

## Quick Start

```bash
# Install (dev dependencies only — Vite)
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Architecture

```text
src/
├── core/                  ← Framework-level primitives
│   ├── router.js          ← History-based SPA router (~80 lines)
│   ├── store.js           ← Shared/persistent state container (~50 lines)
│   ├── signals.js         ← Local reactive primitives with scope disposal
│   └── dom.js             ← DOM creation utilities (~60 lines)
│
├── api/
│   └── client.js          ← HTTP client with cache/dedupe/abort (~70 lines)
│
├── styles/                ← Global CSS layers
│   ├── tokens.css         ← Design tokens (colors, spacing, typography)
│   ├── base.css           ← Reset & element defaults
│   ├── layout.css         ← Header, nav, footer, container, shared view patterns
│   └── animations.css     ← Shared keyframes (viewEnter, spin, shimmer, pulse)
│
├── components/            ← Reusable UI components (JS + co-located CSS)
│   ├── Button.js / .css   ← Multi-variant button
│   ├── Card.js / .css     ← Content card
│   ├── Badge.js / .css    ← Status badge
│   ├── Loader.js / .css   ← Spinner & skeleton placeholders
│   ├── Toast.js / .css    ← Notification system
│   ├── EmptyState.js/.css ← Empty data + error state shared styles
│   ├── ErrorState.js      ← Error display with retry (uses EmptyState.css)
│   ├── UserCard.js / .css ← User list card + skeleton + avatar
│   └── FeatureCard.js/.css← Feature showcase card
│
├── views/                 ← Page-level components (JS + co-located CSS)
│   ├── HomeView.js / .css ← Landing page with feature showcase
│   ├── CounterView.js/.css← State management demo
│   ├── UsersView.js / .css← Data fetching demo (list grid)
│   ├── UserDetailView.js/.css ← Dynamic route params demo
│   ├── AboutView.js / .css← Architecture documentation
│   └── NotFoundView.js/.css ← 404 page
│
└── main.js                ← Entry point (wiring only, imports global CSS)
```

### Design Decisions

#### Router (`core/router.js`)

Routes are an **ordered array** (not an object map) to support dynamic segments. Patterns like `/users/:id` are compiled to regex once at init. The router doesn't know about DOM structure — it receives a root element and replaces its children.

#### Store (`core/store.js`)

A single state object with **shallow-merge immutable updates**. Subscribers are notified synchronously. No Proxy, no deep observation — explicit `get()`/`set()` is easier to reason about and debug at this scale.

#### State Ownership and Local Signals

State needs a clear owner or it turns into a mess. In this architecture, **signals own ephemeral view state**, **the store owns shared or persistent state**, and **the router owns URL state plus mount/unmount timing**. That boundary matters more than the reactive primitive itself.

The signals layer stays intentionally small so it does not grow into a home-made framework:

- **Local-only** — Signals live inside one view or component subtree and are disposed with it.
- **No app-wide graph** — Cross-view or persistent data still belongs in `core/store.js`.
- **No template/runtime magic** — No custom compiler, decorators, proxy traps, or DOM binding DSL.
- **Lifecycle first** — Effects must be created inside an explicit scope and cleaned up on unmount.

Minimal API:

```javascript
const count = signal(0);
const doubled = computed(() => count.get() * 2);

const scope = createScope();
scope.run(() => {
  effect(() => {
    console.log(doubled.get());
  });
});

scope.dispose();
```

- `signal(initial)` — mutable local value with `get()` / `set(next)`
- `computed(fn)` — derived read-only value; invalidation is dependency-driven, so downstream observers may rerun even if the final value does not change
- `effect(fn)` — reactive side effect, registered to the active scope
- `createScope()` / `dispose()` — explicit lifecycle boundary for cleanup

Conceptually, this plugs into the current lifecycle without changing responsibilities: the router still mounts and unmounts views, the store still triggers cross-view re-renders, and a view-level scope is created when a signal-enabled view starts and disposed right before its DOM is replaced. The goal is better local interaction state, not a second global state system.

The first rollout lives in `src/views/CounterView.js`: the counter interaction uses local signals, remounting the route recreates fresh local state, and the existing global store still owns shared flows like users and user details.

#### API Client (`api/client.js`)

Three features you'd want in any production app:

- **TTL Cache** — avoid redundant requests within a time window
- **Deduplication** — concurrent calls to the same URL share one promise
- **Abort** — cancel stale requests with `AbortController`

#### Component Model (`core/dom.js`)

Components are functions that return DOM nodes. The `el()` helper provides a clean API:

```javascript
el("button", { class: "btn btn--primary", onClick: handler }, ["Click me"]);
```

No virtual DOM, no diffing. State changes trigger a full view re-render via `replaceChildren()`. For this scale (~10 users, ~5 views), this is imperceptibly fast.

#### CSS Architecture (co-located modules)

Styles are split into **19 modular CSS files** across three layers:

1. **Global** (`src/styles/`) — Design tokens, reset, layout shell, and shared keyframes. Imported once in `main.js`.
2. **Component** (`src/components/*.css`) — Each component's CSS lives next to its JS and is imported by it (`import "./Button.css"`).
3. **View** (`src/views/*.css`) — Page-specific styles co-located with the view, including their own responsive breakpoints.

Vite bundles all imported CSS into a single optimized stylesheet at build time, so co-location has **zero runtime cost** — it's purely a DX improvement. Token-based design with CSS custom properties. Dark mode via `[data-theme="dark"]` overrides. BEM-lite naming for component scoping. No utility framework.

## Pages

| Route        | Description                                                 |
| ------------ | ----------------------------------------------------------- |
| `/`          | Landing page with feature showcase and tech stack           |
| `/counter`   | Interactive counter demonstrating local ephemeral state     |
| `/users`     | User grid with loading skeletons, cache, and error handling |
| `/users/:id` | Dynamic route — individual user profile                     |
| `/about`     | Architecture documentation (built as a view)                |

## Trade-offs

This architecture **intentionally** doesn't solve:

- **DOM diffing** — Full re-renders are fine at this scale but wouldn't scale to thousands of elements.
- **Server-side rendering** — Client-only. SSR would need Node.js + HTML serialization.
- **TypeScript** — Pure JS with JSDoc comments for documentation.
- **Testing** — Components are pure functions and trivially testable, but no test runner is configured.
- **Code splitting** — All views are bundled together. Dynamic `import()` could be added for larger apps.

These are conscious decisions, not oversights. The goal is demonstrating clean architecture, not building a framework.

## License

MIT
