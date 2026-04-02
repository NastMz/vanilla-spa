/**
 * Router — History-based SPA router with dynamic segments and view transitions.
 *
 * Design decisions:
 *  - Routes declared as an ordered array → supports dynamic segments (:param).
 *  - Pattern matching via lightweight regex (no path-to-regexp dependency).
 *  - View transitions handled via CSS class — the router simply mounts new DOM;
 *    the `view` CSS class triggers an enter animation automatically.
 *  - Scroll-to-top on navigation for a native-app feel when the platform supports it.
 *  - `onNavigate` callback enables side-effects (active nav, analytics)
 *    without coupling the router to the DOM layout.
 */

/**
 * @param {Object}   config
 * @param {Array}    config.routes    — [{ path: '/users/:id', view: (params) => Node | { node, scope } }]
 * @param {Function} config.notFound  — () => Node | { node, scope }
 * @param {Element}  config.root      — container element
 * @param {Function} [config.onNavigate] — called after each render with (pathname, params)
 */
export function createRouter({ routes, notFound, root, onNavigate }) {
  if (!root) throw new Error("[Router] root element is required");
  let activeScope = null;

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
    const pathname = getCurrentPathname();
    const result = pathname ? match(pathname) : null;
    const mountedView = normalizeViewResult(
      result ? result.route.view(result.params) : notFound(),
    );

    activeScope?.dispose();
    root.replaceChildren(mountedView.node);
    activeScope = mountedView.scope;
    onNavigate?.(pathname ?? "", result?.params);
  }

  /** Navigate programmatically */
  function navigate(path) {
    if (getCurrentPathname() === path) return;
    if (!canPushHistory()) return;

    try {
      globalThis.history.pushState({}, "", path);
    } catch {
      return;
    }

    safeScrollToTop();
    render();
  }

  // Handle browser back/forward
  subscribeToPopstate(render);

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

function normalizeViewResult(viewResult) {
  if (viewResult instanceof Node) {
    return { node: viewResult, scope: null };
  }

  if (viewResult?.node instanceof Node) {
    return { node: viewResult.node, scope: viewResult.scope ?? null };
  }

  throw new Error(
    "[Router] view() must return a Node or an object shaped like { node, scope }",
  );
}

function getCurrentPathname() {
  try {
    return globalThis.location?.pathname ?? null;
  } catch {
    return null;
  }
}

function canListenPopstate() {
  return typeof globalThis.addEventListener === "function";
}

function canPushHistory() {
  return typeof globalThis.history?.pushState === "function";
}

function subscribeToPopstate(listener) {
  if (!canListenPopstate()) return;

  try {
    globalThis.addEventListener("popstate", listener);
  } catch {
    // Ignore platform listener failures.
  }
}

function safeScrollToTop() {
  if (typeof globalThis.scrollTo !== "function") return;

  try {
    globalThis.scrollTo({ top: 0, behavior: "instant" });
  } catch {
    // Ignore scroll reset failures.
  }
}
