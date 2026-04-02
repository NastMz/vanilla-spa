import test from "node:test";
import assert from "node:assert/strict";

import { installDom, cleanupDom } from "./helpers/dom-test-env.js";

test("main initializes the document theme from persisted storage", async () => {
  const dom = installDom({
    html: htmlShell(),
    url: "https://example.test/",
  });

  try {
    localStorage.setItem("theme", "dark");

    await importMain();

    assert.equal(document.documentElement.dataset.theme, "dark");
  } finally {
    cleanupDom(dom);
  }
});

test("main falls back to light theme when storage reads fail", async () => {
  const dom = installDom({
    html: htmlShell(),
    url: "https://example.test/",
    overrides: {
      localStorage: {
        getItem() {
          throw new Error("blocked");
        },
        setItem() {},
      },
    },
  });

  try {
    await importMain();

    assert.equal(document.documentElement.dataset.theme, "light");
  } finally {
    cleanupDom(dom);
  }
});

test("main updates the theme even when persisted writes fail", async () => {
  const dom = installDom({
    html: htmlShell(),
    url: "https://example.test/",
    overrides: {
      localStorage: {
        getItem() {
          return "light";
        },
        setItem() {
          throw new Error("quota");
        },
      },
    },
  });

  try {
    await importMain();

    document
      .getElementById("theme-toggle")
      .dispatchEvent(new Event("click", { bubbles: true }));

    assert.equal(document.documentElement.dataset.theme, "dark");
  } finally {
    cleanupDom(dom);
  }
});

function htmlShell() {
  return `<!doctype html>
    <html>
      <body>
        <nav>
          <a class="nav__link" data-path="/" href="/">Home</a>
          <a class="nav__link" data-path="/about" href="/about">About</a>
        </nav>
        <button id="theme-toggle" type="button">Toggle theme</button>
        <div id="app"></div>
        <div id="toast-container"></div>
      </body>
    </html>`;
}

let importCounter = 0;

function importMain() {
  importCounter += 1;
  return import(`../src/main.js?test=${importCounter}`);
}
