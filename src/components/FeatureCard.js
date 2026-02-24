import { el } from "../core/dom.js";
import "./FeatureCard.css";

/**
 * FeatureCard — Showcase card for the home page features grid.
 * @param {Object} props
 * @param {string} props.icon  — emoji or text icon
 * @param {string} props.title
 * @param {string} props.description
 */
export function FeatureCard({ icon, title, description }) {
  return el("div", { class: "feature-card" }, [
    el("div", { class: "feature-card__icon", "aria-hidden": "true" }, [icon]),
    el("h3", { class: "feature-card__title" }, [title]),
    el("p", { class: "feature-card__desc" }, [description]),
  ]);
}
