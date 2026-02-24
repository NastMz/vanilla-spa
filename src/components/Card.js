import { el } from "../core/dom.js";
import "./Card.css";

/**
 * Card — Content container with optional title and subtitle.
 *
 * @param {Object}  props
 * @param {string}  [props.title]
 * @param {string}  [props.subtitle]
 * @param {boolean} [props.hoverable=false]
 * @param {Function} [props.onClick]
 * @param {Array}   [props.children]
 */
export function Card({
  title,
  subtitle,
  hoverable = false,
  onClick,
  children = [],
}) {
  const classes = ["card", hoverable && "card--hoverable"];

  const inner = [];
  if (title) inner.push(el("h3", { class: "card__title" }, [title]));
  if (subtitle) inner.push(el("p", { class: "card__subtitle" }, [subtitle]));
  inner.push(...children);

  return el("section", { class: classes, onClick }, inner);
}
