import test from "node:test";
import assert from "node:assert/strict";

import { createSafeStorage } from "../src/core/storage.js";

test("safe storage returns persisted values when storage works", () => {
  const safeStorage = createSafeStorage({
    getItem(key) {
      return key === "theme" ? "dark" : null;
    },
    setItem() {},
  });

  assert.equal(safeStorage.getItem("theme", "light"), "dark");
});

test("safe storage falls back when reads fail or storage is unavailable", () => {
  const throwingStorage = createSafeStorage({
    getItem() {
      throw new Error("blocked");
    },
  });

  assert.equal(throwingStorage.getItem("theme", "light"), "light");
  assert.equal(createSafeStorage(undefined).getItem("theme", "light"), "light");
});

test("safe storage never throws on writes and reports best-effort success", () => {
  const safeStorage = createSafeStorage({
    setItem() {
      throw new Error("quota");
    },
  });

  assert.equal(safeStorage.setItem("theme", "dark"), false);
  assert.equal(createSafeStorage(undefined).setItem("theme", "dark"), false);
});
