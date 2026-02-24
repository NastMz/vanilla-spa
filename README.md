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
| **State management**    | Reactive store with `get()`, `set()`, `subscribe()`      |
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
├── core/               ← Framework-level primitives
│   ├── router.js       ← History-based SPA router (~80 lines)
│   ├── store.js        ← Reactive state container (~50 lines)
│   └── dom.js          ← DOM creation utilities (~60 lines)
│
├── api/
│   └── client.js       ← HTTP client with cache/dedupe/abort (~70 lines)
│
├── components/         ← Reusable UI components
│   ├── Button.js       ← Multi-variant button
│   ├── Card.js         ← Content card
│   ├── Badge.js        ← Status badge
│   ├── Loader.js       ← Spinner & skeleton placeholders
│   ├── Toast.js        ← Notification system
│   ├── ErrorState.js   ← Error display with retry
│   ├── EmptyState.js   ← Empty data placeholder
│   ├── UserCard.js     ← User list card + skeleton
│   └── FeatureCard.js  ← Feature showcase card
│
├── views/              ← Page-level components (one per route)
│   ├── HomeView.js     ← Landing page with feature showcase
│   ├── CounterView.js  ← State management demo
│   ├── UsersView.js    ← Data fetching demo (list)
│   ├── UserDetailView.js ← Dynamic route params demo
│   ├── AboutView.js    ← Architecture documentation
│   └── NotFoundView.js ← 404 page
│
├── styles.css          ← Design system (tokens → components → views)
└── main.js             ← Entry point (wiring only)
```

### Design Decisions

#### Router (`core/router.js`)

Routes are an **ordered array** (not an object map) to support dynamic segments. Patterns like `/users/:id` are compiled to regex once at init. The router doesn't know about DOM structure — it receives a root element and replaces its children.

#### Store (`core/store.js`)

A single state object with **shallow-merge immutable updates**. Subscribers are notified synchronously. No Proxy, no deep observation — explicit `get()`/`set()` is easier to reason about and debug at this scale.

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

#### CSS Design System (`styles.css`)

Token-based design with CSS custom properties. Dark mode via `[data-theme="dark"]` overrides. BEM-lite naming for component scoping. No utility framework — hand-written CSS demonstrating modern techniques.

## Pages

| Route        | Description                                                 |
| ------------ | ----------------------------------------------------------- |
| `/`          | Landing page with feature showcase and tech stack           |
| `/counter`   | Interactive counter demonstrating persistent state          |
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
