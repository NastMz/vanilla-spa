import { el } from "../core/dom.js";
import "./Button.css";

/**
 * Button — Multi-variant button component.
 *
 * @param {Object}   props
 * @param {string}   props.label
 * @param {Function} [props.onClick]
 * @param {string}   [props.variant='secondary']  — 'primary' | 'secondary' | 'ghost' | 'danger'
 * @param {string}   [props.size='md']             — 'sm' | 'md' | 'lg'
 * @param {boolean}  [props.disabled=false]
 * @param {string}   [props.type='button']
 */
export function Button({
  label,
  onClick,
  variant = "secondary",
  size = "md",
  disabled = false,
  type = "button",
}) {
  const classes = ["btn", `btn--${variant}`, size !== "md" && `btn--${size}`];

  return el(
    "button",
    { class: classes, type, onClick, disabled: disabled || null },
    [label],
  );
}
