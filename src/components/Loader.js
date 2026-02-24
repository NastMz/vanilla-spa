import { el } from "../core/dom.js";
import "./Loader.css";

/**
 * Loader — Spinner for loading states.
 * @param {Object} [props]
 * @param {boolean} [props.large=false]
 * @param {string}  [props.text]
 */
export function Loader({ large = false, text: label } = {}) {
  return el("div", { class: "loading-center" }, [
    el("div", { class: ["spinner", large && "spinner--lg"] }),
    label ? el("p", {}, [label]) : null,
  ]);
}

/**
 * Skeleton — Placeholder rectangle for content loading.
 * @param {Object} props
 * @param {string} [props.width='100%']
 * @param {string} [props.height='1em']
 * @param {boolean} [props.circle=false]
 */
export function Skeleton({
  width = "100%",
  height = "1em",
  circle = false,
} = {}) {
  return el("div", {
    class: "skeleton",
    style: {
      width,
      height,
      borderRadius: circle ? "50%" : undefined,
    },
  });
}
