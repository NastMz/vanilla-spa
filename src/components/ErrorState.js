import { el } from "../core/dom.js";
import { Button } from "./Button.js";
import "./EmptyState.css";

/**
 * ErrorState — Error display with optional retry action.
 * @param {Object}   props
 * @param {string}   props.message
 * @param {Function} [props.onRetry]
 */
export function ErrorState({ message, onRetry }) {
  return el("div", { class: "error-state" }, [
    el("div", { class: "error-state__icon", "aria-hidden": "true" }, ["⚠️"]),
    el("h3", { class: "error-state__title" }, ["Something went wrong"]),
    el("p", { class: "error-state__text" }, [message]),
    onRetry
      ? Button({ label: "Try again", variant: "secondary", onClick: onRetry })
      : null,
  ]);
}
