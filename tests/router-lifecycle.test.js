import test from "node:test";
import assert from "node:assert/strict";

import { installDom, cleanupDom } from "./helpers/dom-test-env.js";
import { createRouter } from "../src/core/router.js";
import { createScope, effect, signal } from "../src/core/signals.js";

test("router disposes the previous view scope before route replacement", () => {
  const dom = installDom({ url: "https://example.test/counter" });

  try {
    const root = document.getElementById("app");
    let activeCount;
    let effectRuns = 0;
    let cleanupRuns = 0;

    function CounterHarness() {
      const scope = createScope();
      const count = signal(0);
      const node = document.createElement("div");
      activeCount = count;

      scope.run(() => {
        effect(() => {
          effectRuns += 1;
          node.textContent = `count:${count.get()}`;
          return () => {
            cleanupRuns += 1;
          };
        });
      });

      return { node, scope };
    }

    const router = createRouter({
      routes: [
        { path: "/counter", view: CounterHarness },
        { path: "/about", view: () => document.createElement("section") },
      ],
      notFound: () => document.createElement("div"),
      root,
    });

    router.render();
    activeCount.set(2);
    router.navigate("/about");
    activeCount.set(5);

    assert.equal(root.textContent, "");
    assert.equal(effectRuns, 2);
    assert.equal(cleanupRuns, 2);
  } finally {
    cleanupDom(dom);
  }
});

test("remount creates a fresh local scope and resets ephemeral state", () => {
  const dom = installDom({ url: "https://example.test/counter" });

  try {
    const root = document.getElementById("app");
    const instances = [];

    function CounterHarness() {
      const scope = createScope();
      const count = signal(0);
      const node = document.createElement("div");

      scope.run(() => {
        effect(() => {
          node.textContent = String(count.get());
        });
      });

      instances.push(count);
      return { node, scope };
    }

    const router = createRouter({
      routes: [
        { path: "/counter", view: CounterHarness },
        { path: "/about", view: () => document.createElement("section") },
      ],
      notFound: () => document.createElement("div"),
      root,
    });

    router.render();
    instances[0].set(7);
    router.navigate("/about");
    router.navigate("/counter");

    assert.equal(root.textContent, "0");

    instances[0].set(9);
    assert.equal(root.textContent, "0");

    instances[1].set(3);
    assert.equal(root.textContent, "3");
  } finally {
    cleanupDom(dom);
  }
});
