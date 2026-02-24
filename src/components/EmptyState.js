import { el } from "../core/dom.js";
import "./EmptyState.css";

/**
 * EmptyState — Placeholder for empty lists / no data.
 * @param {Object} props
 * @param {string} [props.icon='📭']
 * @param {string} props.title
 * @param {string} [props.text]
 */
export function EmptyState({ icon = "📭", title, text: desc }) {
  return el("div", { class: "empty-state" }, [
    el("div", { class: "empty-state__icon", "aria-hidden": "true" }, [icon]),
    el("h3", { class: "empty-state__title" }, [title]),
    desc ? el("p", { class: "empty-state__text" }, [desc]) : null,
  ]);
}
