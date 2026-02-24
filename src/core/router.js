/**
 * Router — History-based SPA router with dynamic segments and view transitions.
 *
 * Design decisions:
 *  - Routes declared as an ordered array → supports dynamic segments (:param).
 *  - Pattern matching via lightweight regex (no path-to-regexp dependency).
 *  - View transitions handled via CSS class — the router simply mounts new DOM;
 *    the `view` CSS class triggers an enter animation automatically.
 *  - Scroll-to-top on navigation for a native-app feel.
 *  - `onNavigate` callback enables side-effects (active nav, analytics)
 *    without coupling the router to the DOM layout.
 */

/**
 * @param {Object}   config
 * @param {Array}    config.routes    — [{ path: '/users/:id', view: (params) => Node }]
 * @param {Function} config.notFound  — () => Node
 * @param {Element}  config.root      — container element
 * @param {Function} [config.onNavigate] — called after each render with (pathname, params)
 */
export function createRouter({ routes, notFound, root, onNavigate }) {
  if (!root) throw new Error("[Router] root element is required");

  // Pre-compile route patterns once at init
  const compiled = routes.map((route) => ({
    ...route,
    ...compilePath(route.path),
  }));

  /** Match current pathname against compiled routes */
  function match(pathname) {
    for (const route of compiled) {
      const m = pathname.match(route.regex);
      if (m) {
        const params = Object.fromEntries(
          route.keys.map((key, i) => [key, decodeURIComponent(m[i + 1])]),
        );
        return { route, params };
      }
    }
    return null;
  }

  /** Render the view matching the current URL */
  function render() {
    const pathname = globalThis.location.pathname;
    const result = match(pathname);
    const view = result ? result.route.view(result.params) : notFound();

    root.replaceChildren(view);
    onNavigate?.(pathname, result?.params);
  }

  /** Navigate programmatically */
  function navigate(path) {
    if (globalThis.location.pathname === path) return;
    history.pushState({}, "", path);
    window.scrollTo({ top: 0, behavior: "instant" });
    render();
  }

  // Handle browser back/forward
  globalThis.addEventListener("popstate", render);

  return { render, navigate, match };
}

// ── Internals ────────────────────────────────────────────────────

/**
 * Convert a path pattern to a regex + list of param names.
 *   '/users/:id' → { regex: /^\/users\/([^/]+)$/, keys: ['id'] }
 */
function compilePath(path) {
  const keys = [];
  const pattern = path.replaceAll(/:(\w+)/g, (_, key) => {
    keys.push(key);
    return "([^/]+)";
  });
  return { regex: new RegExp(`^${pattern}$`), keys };
}
