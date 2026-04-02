/**
 * main.js — Application entry point.
 *
 * Wires together the core modules (router, store), registers routes,
 * and sets up global event listeners. This is the only file that
 * "knows" about everything — all other modules are decoupled.
 */

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/animations.css";

import { createStore } from "./core/store.js";
import { createRouter } from "./core/router.js";
import { createSafeStorage } from "./core/storage.js";

import { HomeView } from "./views/HomeView.js";
import { CounterView } from "./views/CounterView.js";
import { UsersView } from "./views/UsersView.js";
import { UserDetailView } from "./views/UserDetailView.js";
import { AboutView } from "./views/AboutView.js";
import { NotFoundView } from "./views/NotFoundView.js";

// ── Store ─────────────────────────────────────────────────────
// Single global state. Each view reads/writes the slices it owns.

export const store = createStore({
  users: { status: "idle", data: null, error: null },
});

// ── Router ────────────────────────────────────────────────────
// Routes are declared as an ordered array to support dynamic segments.

const appRoot = document.querySelector("#app");

const router = createRouter({
  routes: [
    { path: "/", view: () => HomeView({ navigate: router.navigate }) },
    { path: "/counter", view: () => CounterView() },
    {
      path: "/users",
      view: () => UsersView({ store, navigate: router.navigate }),
    },
    {
      path: "/users/:id",
      view: (params) =>
        UserDetailView({ store, params, navigate: router.navigate }),
    },
    { path: "/about", view: () => AboutView() },
  ],
  notFound: () => NotFoundView({ navigate: router.navigate }),
  root: appRoot,
  onNavigate: updateActiveNav,
});

// ── Re-render on state changes ────────────────────────────────
// Simple strategy: any shared-store change re-renders the current route view.
// Views may also manage ephemeral local state through router-owned scopes.

store.subscribe(() => router.render());

// ── Link interception (event delegation) ──────────────────────
// All <a data-link> elements are intercepted for client-side navigation.

document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-link]");
  if (!link) return;

  // Allow modifier keys for new tabs
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  const href = link.getAttribute("href");
  if (!href?.startsWith("/")) return;

  e.preventDefault();
  router.navigate(href);
});

// ── Active navigation state ───────────────────────────────────

function updateActiveNav(pathname) {
  document.querySelectorAll(".nav__link").forEach((link) => {
    const linkPath = link.dataset.path;
    const isActive =
      linkPath === "/"
        ? pathname === "/"
        : pathname === linkPath || pathname.startsWith(linkPath + "/");
    link.classList.toggle("nav__link--active", isActive);
  });
}

// ── Theme toggle ──────────────────────────────────────────────

const safeStorage = createSafeStorage();

const themeToggle = document.getElementById("theme-toggle");
const savedTheme = safeStorage.getItem("theme", "light");
document.documentElement.dataset.theme = savedTheme;

themeToggle?.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  safeStorage.setItem("theme", next);
});

// ── Initial render ────────────────────────────────────────────

router.render();
