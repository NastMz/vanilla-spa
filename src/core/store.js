/**
 * Store — Minimal reactive state container.
 *
 * Design decisions:
 *  - Single global state object (like a simplified Redux store).
 *  - Immutable updates via shallow merge — no deep merge needed at this scale.
 *  - Subscriber notifications are synchronous — predictable, debuggable.
 *  - structuredClone on initial state prevents accidental external mutation.
 *  - Optional selector in get() enables reading slices without destructuring.
 *  - This store owns shared or persistent state; ephemeral view-local state
 *    now belongs in `src/core/signals.js` so cross-view responsibilities stay clear.
 *
 * Why not Proxy?
 *  For this project's scope, explicit get/set is simpler to reason about
 *  and debug. Proxies add hidden complexity that isn't justified until
 *  you need granular reactivity (per-property tracking). For local, disposable
 *  interaction state, use the explicit signals primitive instead of growing this
 *  store into a second responsibility bucket.
 */

export function createStore(initialState) {
  let state = structuredClone(initialState);
  const subscribers = new Set();

  return {
    /**
     * Read current state, optionally through a selector.
     * @param {Function} [selector] — e.g. `s => s.users`
     */
    get(selector) {
      return selector ? selector(state) : state;
    },

    /**
     * Update state with a patch object or updater function.
     * Notifies all subscribers with (newState, prevState).
     *
     * @param {object | Function} patchOrFn
     * @example
     *   store.set({ users: { status: 'loading', data: null, error: null } })
     *   store.set(prev => ({ session: { ...prev.session, ready: true } }))
     */
    set(patchOrFn) {
      const patch =
        typeof patchOrFn === "function" ? patchOrFn(state) : patchOrFn;
      const prev = state;
      state = { ...state, ...patch };

      if (state !== prev) {
        subscribers.forEach((fn) => fn(state, prev));
      }
    },

    /**
     * Subscribe to state changes. Returns an unsubscribe function.
     * @param {Function} fn — called with (newState, prevState)
     */
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },

    /** Reset state to initial values. */
    reset() {
      const prev = state;
      state = structuredClone(initialState);
      subscribers.forEach((fn) => fn(state, prev));
    },
  };
}
