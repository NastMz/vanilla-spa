/**
 * Signals — Minimal local reactive primitives for ephemeral view state.
 *
 * Runtime contract:
 *  - `signal(initial)` returns mutable local state with `get()` / `set(next)`.
 *  - `computed(fn)` returns a read-only derived value with `get()` only.
 *    Downstream invalidation is dependency-driven, so dependents may rerun even
 *    when the recomputed value is referentially equal to the previous one.
 *  - `effect(fn)` must run inside an active `createScope().run(...)` boundary.
 *  - `createScope()` owns effect disposal so router unmount cleanup stays explicit.
 */

let activeObserver = null;
let activeScope = null;
let notificationDepth = 0;
const pendingEffects = new Set();

export function signal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  return {
    get() {
      trackDependency(subscribers);
      return value;
    },

    set(nextValue) {
      const resolvedValue =
        typeof nextValue === "function" ? nextValue(value) : nextValue;

      if (Object.is(resolvedValue, value)) return value;

      value = resolvedValue;
      notifySubscribers(subscribers);
      return value;
    },
  };
}

export function computed(read) {
  const subscribers = new Set();

  const observer = createObserver({
    kind: "computed",
    run: read,
    onInvalidate: () => {
      if (observer.dirty) return;
      observer.dirty = true;
      notifySubscribers(subscribers);
    },
  });

  observer.dirty = true;
  observer.value = undefined;

  return {
    get() {
      trackDependency(subscribers);

      if (observer.dirty) {
        observer.value = observer.execute();
        observer.dirty = false;
      }

      return observer.value;
    },
  };
}

export function effect(run) {
  if (!activeScope) {
    throw new Error(
      "[signals] effect() must run inside createScope().run(...) so cleanup has an explicit owner",
    );
  }

  const observer = createObserver({
    kind: "effect",
    run,
    onInvalidate: () => {
      queueEffect(observer);
    },
  });

  observer.execute();
  activeScope.track(() => observer.dispose());

  return () => observer.dispose();
}

export function createScope() {
  let disposed = false;
  const disposers = new Set();

  return {
    run(fn) {
      if (disposed) {
        throw new Error("[signals] Cannot run work inside a disposed scope");
      }

      const previousScope = activeScope;
      activeScope = this;

      try {
        return fn();
      } finally {
        activeScope = previousScope;
      }
    },

    track(disposer) {
      if (disposed) {
        disposer();
        return disposer;
      }

      disposers.add(disposer);
      return () => disposers.delete(disposer);
    },

    dispose() {
      if (disposed) return;
      disposed = true;

      for (const dispose of Array.from(disposers).reverse()) {
        dispose();
      }

      disposers.clear();
    },
  };
}

function createObserver({ kind, run, onInvalidate }) {
  const observer = {
    cleanup: null,
    dependencies: new Set(),
    disposed: false,
    kind,
    onInvalidate,

    execute() {
      if (observer.disposed) return undefined;

      cleanupObserver(observer);

      const previousObserver = activeObserver;
      activeObserver = observer;

      try {
        const result = run();

        if (observer.kind === "effect") {
          observer.cleanup = typeof result === "function" ? result : null;
        }

        return result;
      } finally {
        activeObserver = previousObserver;
      }
    },

    invalidate() {
      if (observer.disposed) return;
      observer.onInvalidate();
    },

    dispose() {
      if (observer.disposed) return;
      observer.disposed = true;
      cleanupObserver(observer);
    },
  };

  return observer;
}

function cleanupObserver(observer) {
  for (const subscribers of observer.dependencies) {
    subscribers.delete(observer);
  }

  observer.dependencies.clear();

  if (observer.cleanup) {
    const cleanup = observer.cleanup;
    observer.cleanup = null;
    cleanup();
  }
}

function trackDependency(subscribers) {
  if (!activeObserver) return;

  subscribers.add(activeObserver);
  activeObserver.dependencies.add(subscribers);
}

function notifySubscribers(subscribers) {
  notificationDepth += 1;

  try {
    for (const subscriber of Array.from(subscribers)) {
      subscriber.invalidate();
    }
  } finally {
    notificationDepth -= 1;

    if (notificationDepth === 0) {
      flushPendingEffects();
    }
  }
}

function queueEffect(observer) {
  pendingEffects.add(observer);

  if (notificationDepth === 0) {
    flushPendingEffects();
  }
}

function flushPendingEffects() {
  while (pendingEffects.size > 0) {
    const scheduledEffects = Array.from(pendingEffects);
    pendingEffects.clear();

    for (const observer of scheduledEffects) {
      observer.execute();
    }
  }
}
