/**
 * DOM — Minimal DOM creation utilities.
 *
 * These functions replace JSX / template literals with a functional API
 * that returns real DOM nodes. No virtual DOM, no diffing, no compilation.
 *
 * Design decision: Functions return actual Nodes, not descriptions.
 * This keeps the abstraction paper-thin — components are just functions
 * that return DOM elements, composable via standard DOM APIs.
 */

/**
 * Create an HTML element with props and children.
 *
 * @param {string} tag — HTML tag name
 * @param {Record<string, any>} props — attributes, events (onXxx), class, style, dataset
 * @param {Array<Node|string|null|false>} children — child nodes or text
 * @returns {HTMLElement}
 *
 * @example
 *   el('button', { class: 'btn btn--primary', onClick: handleClick }, ['Save'])
 *   el('div', { class: ['card', isActive && 'card--active'] }, [...])
 */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    applyProp(node, key, value);
  }

  appendChildren(node, children);
  return node;
}

/** @internal Apply a single prop to a DOM node. */
function applyProp(node, key, value) {
  if (key === "class" || key === "className") {
    const classes = Array.isArray(value)
      ? value.filter(Boolean).join(" ")
      : value;
    if (classes) node.className = classes;
  } else if (key === "style" && typeof value === "object") {
    Object.assign(node.style, value);
  } else if (key === "dataset") {
    Object.assign(node.dataset, value);
  } else if (key === "htmlFor") {
    node.setAttribute("for", value);
  } else if (key.startsWith("on") && typeof value === "function") {
    node.addEventListener(key.slice(2).toLowerCase(), value);
  } else if (value !== false && value != null) {
    node.setAttribute(key, String(value));
  }
}

/**
 * Create a DocumentFragment from an array of children.
 * Useful for returning multiple root elements from a component.
 */
export function fragment(children = []) {
  const frag = document.createDocumentFragment();
  appendChildren(frag, children);
  return frag;
}

/**
 * Create a text node.
 */
export function text(content) {
  return document.createTextNode(String(content));
}

/** @internal Append mixed children (Nodes, strings, null) to a parent. */
function appendChildren(parent, children) {
  for (const child of children) {
    if (child == null || child === false) continue;
    parent.append(
      child instanceof Node ? child : document.createTextNode(String(child)),
    );
  }
}
