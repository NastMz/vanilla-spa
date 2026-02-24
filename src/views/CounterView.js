import { el } from "../core/dom.js";
import { Button } from "../components/Button.js";
import { Badge } from "../components/Badge.js";
import { showToast } from "../components/Toast.js";
import "./CounterView.css";

/**
 * CounterView — Demonstrates reactive state management.
 * The counter value persists across navigation (no page reload).
 *
 * @param {Object} props
 * @param {Object} props.store — global store instance
 */
function countLabel(count) {
  if (count === 0) return "zero";
  return count > 0 ? "positive" : "negative";
}

function countVariant(count) {
  if (count === 0) return "neutral";
  return count > 0 ? "success" : "error";
}

export function CounterView({ store }) {
  const { count } = store.get();

  return el("div", { class: "view container" }, [
    // Header
    el("div", { class: "view__header view__header--center" }, [
      el("h1", { class: "view__title" }, ["State Management"]),
      el("p", { class: "view__subtitle", style: { margin: "0 auto" } }, [
        "A reactive store that persists across navigation — no page reloads, no lost state. ",
        "Try changing the counter, navigate away, and come back.",
      ]),
    ]),

    // Counter
    el("div", { class: "counter" }, [
      // Value display
      el("div", { class: "counter__display" }, [
        el("span", { class: "counter__value" }, [String(count)]),
      ]),

      // Controls
      el("div", { class: "counter__controls" }, [
        Button({
          label: "−",
          variant: "secondary",
          onClick: () => store.set((s) => ({ count: s.count - 1 })),
        }),
        Button({
          label: "−5",
          variant: "ghost",
          onClick: () => store.set((s) => ({ count: s.count - 5 })),
        }),
        Button({
          label: "Reset",
          variant: "ghost",
          onClick: () => {
            store.set({ count: 0 });
            showToast("Counter reset to zero", { type: "success" });
          },
        }),
        Button({
          label: "+5",
          variant: "ghost",
          onClick: () => store.set((s) => ({ count: s.count + 5 })),
        }),
        Button({
          label: "+",
          variant: "secondary",
          onClick: () => store.set((s) => ({ count: s.count + 1 })),
        }),
      ]),

      // Status
      el(
        "div",
        {
          style: {
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            justifyContent: "center",
          },
        },
        [
          Badge({
            label: countLabel(count),
            variant: countVariant(count),
          }),
          Badge({ label: `${Math.abs(count)} from zero`, variant: "primary" }),
        ],
      ),

      // Hint
      el("p", { class: "counter__hint" }, [
        "Navigate to another page and come back — the count will still be here.",
      ]),
    ]),
  ]);
}
