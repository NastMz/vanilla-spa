import { el } from "../core/dom.js";
import { Button } from "../components/Button.js";
import "./NotFoundView.css";

/**
 * NotFoundView — 404 page with a friendly message and navigation.
 *
 * @param {Object}   props
 * @param {Function} props.navigate
 */
export function NotFoundView({ navigate }) {
  return el("div", { class: "view container not-found" }, [
    el("div", { class: "not-found__code", "aria-hidden": "true" }, ["404"]),
    el("h1", { class: "not-found__title" }, ["Page not found"]),
    el("p", { class: "not-found__text" }, [
      "The page you're looking for doesn't exist or has been moved. Let's get you back on track.",
    ]),
    el("div", { style: { display: "flex", gap: "12px", marginTop: "8px" } }, [
      Button({
        label: "← Go home",
        variant: "primary",
        size: "lg",
        onClick: () => navigate("/"),
      }),
      Button({
        label: "View users",
        variant: "ghost",
        size: "lg",
        onClick: () => navigate("/users"),
      }),
    ]),
  ]);
}
