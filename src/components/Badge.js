import { el } from "../core/dom.js";
import "./Badge.css";

/**
 * Badge — Small status label.
 * @param {Object} props
 * @param {string} props.label
 * @param {string} [props.variant='neutral'] — 'primary' | 'success' | 'error' | 'neutral'
 */
export function Badge({ label, variant = "neutral" }) {
  return el("span", { class: ["badge", `badge--${variant}`] }, [label]);
}
