import { el } from "../core/dom.js";
import { computed, createScope, effect, signal } from "../core/signals.js";
import { Button } from "../components/Button.js";
import { Badge } from "../components/Badge.js";
import { showToast } from "../components/Toast.js";
import "./CounterView.css";

/**
 * CounterView — Demonstrates ephemeral local state owned by a route-level scope.
 */
function countLabel(count) {
  if (count === 0) return "zero";
  return count > 0 ? "positive" : "negative";
}

function countVariant(count) {
  if (count === 0) return "neutral";
  return count > 0 ? "success" : "error";
}

export function CounterView() {
  const scope = createScope();
  const count = signal(0);
  const label = computed(() => countLabel(count.get()));
  const variant = computed(() => countVariant(count.get()));
  const distance = computed(() => `${Math.abs(count.get())} from zero`);

  const valueNode = el("span", { class: "counter__value" }, [
    String(count.get()),
  ]);
  const statusNode = el(
    "div",
    {
      style: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        justifyContent: "center",
      },
    },
    [],
  );

  scope.run(() => {
    effect(() => {
      valueNode.textContent = String(count.get());
    });

    effect(() => {
      statusNode.replaceChildren(
        Badge({ label: label.get(), variant: variant.get() }),
        Badge({ label: distance.get(), variant: "primary" }),
      );
    });
  });

  const node = el("div", { class: "view container" }, [
    el("div", { class: "view__header view__header--center" }, [
      el("h1", { class: "view__title" }, ["State Management"]),
      el("p", { class: "view__subtitle", style: { margin: "0 auto" } }, [
        "This route uses local signals for ephemeral interaction state while the global store stays responsible for shared data. ",
        "Navigate away and back to watch the scope re-initialize cleanly.",
      ]),
    ]),
    el("div", { class: "counter" }, [
      el("div", { class: "counter__display" }, [valueNode]),
      el("div", { class: "counter__controls" }, [
        Button({
          label: "−",
          variant: "secondary",
          onClick: () => count.set((value) => value - 1),
        }),
        Button({
          label: "−5",
          variant: "ghost",
          onClick: () => count.set((value) => value - 5),
        }),
        Button({
          label: "Reset",
          variant: "ghost",
          onClick: () => {
            count.set(0);
            showToast("Counter reset to zero", { type: "success" });
          },
        }),
        Button({
          label: "+5",
          variant: "ghost",
          onClick: () => count.set((value) => value + 5),
        }),
        Button({
          label: "+",
          variant: "secondary",
          onClick: () => count.set((value) => value + 1),
        }),
      ]),
      statusNode,
      el("p", { class: "counter__hint" }, [
        "Navigate to another page and come back — this counter resets because its state belongs to the mounted view scope.",
      ]),
    ]),
  ]);

  return { node, scope };
}
