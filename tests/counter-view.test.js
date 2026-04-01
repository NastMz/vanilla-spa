import test from "node:test";
import assert from "node:assert/strict";

import { installDom, cleanupDom } from "./helpers/dom-test-env.js";
import { CounterView } from "../src/views/CounterView.js";

test("CounterView updates local signal-driven UI and reset toast", () => {
  const dom = installDom();

  try {
    const { node, scope } = CounterView();
    document.getElementById("app").append(node);

    clickButton(node, "+5");
    clickButton(node, "+");

    assert.equal(readValue(node), "6");
    assert.deepEqual(readBadges(node), ["positive", "6 from zero"]);

    clickButton(node, "Reset");

    assert.equal(readValue(node), "0");
    assert.deepEqual(readBadges(node), ["zero", "0 from zero"]);
    assert.equal(
      document.getElementById("toast-container").textContent,
      "Counter reset to zero",
    );

    scope.dispose();
  } finally {
    cleanupDom(dom);
  }
});

test("CounterView remount starts from initial local state", () => {
  const dom = installDom();

  try {
    const first = CounterView();
    document.getElementById("app").replaceChildren(first.node);
    clickButton(first.node, "+");
    clickButton(first.node, "+");
    first.scope.dispose();

    const second = CounterView();
    document.getElementById("app").replaceChildren(second.node);

    assert.equal(readValue(second.node), "0");
    assert.deepEqual(readBadges(second.node), ["zero", "0 from zero"]);

    second.scope.dispose();
  } finally {
    cleanupDom(dom);
  }
});

function clickButton(node, label) {
  const button = Array.from(node.querySelectorAll("button")).find(
    (candidate) => candidate.textContent === label,
  );

  if (!button) {
    throw new Error(`Button not found: ${label}`);
  }

  button.click();
}

function readValue(node) {
  return node.querySelector(".counter__value")?.textContent;
}

function readBadges(node) {
  return Array.from(node.querySelectorAll(".badge")).map(
    (badge) => badge.textContent,
  );
}
