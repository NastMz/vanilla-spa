import { el } from "../core/dom.js";
import "./Toast.css";

/**
 * Toast notification system.
 * Shows a brief message at the bottom-right of the screen.
 *
 * @param {string} message
 * @param {Object} [opts]
 * @param {'info'|'success'|'error'} [opts.type='info']
 * @param {number} [opts.duration=3000]
 */
export function showToast(message, { type = "info", duration = 3000 } = {}) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const classes = ["toast", type !== "info" && `toast--${type}`];
  const toast = el("div", { class: classes }, [message]);
  container.append(toast);

  // Trigger enter animation on next frame
  requestAnimationFrame(() => toast.classList.add("toast--visible"));

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.remove("toast--visible");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, duration);
}
