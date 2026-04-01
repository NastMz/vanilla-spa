import test from "node:test";
import assert from "node:assert/strict";

import { computed, createScope, effect, signal } from "../src/core/signals.js";

test("signal updates stay local and computed stays read-only", () => {
  const count = signal(0);
  const doubled = computed(() => count.get() * 2);

  assert.equal(count.get(), 0);
  assert.deepEqual(Object.keys(doubled), ["get"]);
  assert.equal(doubled.get(), 0);

  count.set((value) => value + 3);

  assert.equal(count.get(), 3);
  assert.equal(doubled.get(), 6);
});

test("effect reruns with cleanup and stops after scope disposal", () => {
  const scope = createScope();
  const count = signal(1);
  const seen = [];
  const cleanups = [];

  scope.run(() => {
    effect(() => {
      const current = count.get();
      seen.push(current);
      return () => cleanups.push(current);
    });
  });

  count.set(2);
  count.set(4);
  scope.dispose();
  count.set(8);

  assert.deepEqual(seen, [1, 2, 4]);
  assert.deepEqual(cleanups, [1, 2, 4]);
});

test("effect requires an active scope", () => {
  assert.throws(
    () => effect(() => {}),
    /effect\(\) must run inside createScope\(\)\.run/,
  );
});
