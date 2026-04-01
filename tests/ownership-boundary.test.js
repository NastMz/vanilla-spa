import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("shared-data views still depend on the global store instead of signals", async () => {
  const [usersView, userDetailView] = await Promise.all([
    readFile(new URL("../src/views/UsersView.js", import.meta.url), "utf8"),
    readFile(new URL("../src/views/UserDetailView.js", import.meta.url), "utf8"),
  ]);

  assert.match(usersView, /export function UsersView\(\{ store, navigate \}\)/);
  assert.match(usersView, /store\.get\(\)/);
  assert.doesNotMatch(usersView, /signals\.js/);

  assert.match(
    userDetailView,
    /export function UserDetailView\(\{ store, params, navigate \}\)/,
  );
  assert.match(userDetailView, /store\.get\(\)/);
  assert.doesNotMatch(userDetailView, /signals\.js/);
});
