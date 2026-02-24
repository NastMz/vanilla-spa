/**
 * HTTP Client — GET JSON with smart caching, request deduplication, and abort.
 *
 * Features:
 *  - TTL-based cache: avoids redundant network calls within a time window.
 *  - Deduplication: concurrent GETs to the same URL share one in-flight promise.
 *  - Abort: cancel previous request when a new one for the same resource is fired.
 *
 * Why build this instead of using a library?
 *  Fetch + AbortController + a Map is all you need for 90% of client-side
 *  data-fetching patterns. No need for axios, ky, or tanstack-query at this scale.
 */

const inFlight = new Map(); // key → { promise, controller }
const cache = new Map(); // key → { data, expiresAt }

function now() {
  return Date.now();
}

function makeKey(method, url) {
  return `${method.toUpperCase()} ${url}`;
}

/**
 * GET JSON with cache, deduplication, and optional abort.
 *
 * @param {string} url
 * @param {Object} [opts]
 * @param {number} [opts.ttlMs=0]           Cache TTL in ms (0 = no cache)
 * @param {boolean} [opts.cancelPrevious=false]  Abort any in-flight request for this URL
 * @returns {Promise<any>}
 */
export async function getJson(url, { ttlMs = 0, cancelPrevious = false } = {}) {
  const key = makeKey("GET", url);

  // 1. Cache hit
  if (ttlMs > 0) {
    const hit = cache.get(key);
    if (hit && hit.expiresAt > now()) return hit.data;
  }

  // 2. Deduplication / cancel previous
  const existing = inFlight.get(key);
  if (existing) {
    if (cancelPrevious) existing.controller.abort();
    else return existing.promise;
  }

  // 3. New request
  const controller = new AbortController();
  const promise = (async () => {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      if (ttlMs > 0) {
        cache.set(key, { data, expiresAt: now() + ttlMs });
      }

      return data;
    } finally {
      // Clean up in-flight entry (only if it's still ours)
      const current = inFlight.get(key);
      if (current?.controller === controller) inFlight.delete(key);
    }
  })();

  inFlight.set(key, { promise, controller });
  return promise;
}

/** Clear the entire response cache. */
export function clearCache() {
  cache.clear();
}

/** Abort an in-flight GET for a specific URL. */
export function abortInFlight(url) {
  const key = makeKey("GET", url);
  const existing = inFlight.get(key);
  if (existing) existing.controller.abort();
}
