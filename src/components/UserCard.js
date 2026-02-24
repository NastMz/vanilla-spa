import { el } from "../core/dom.js";
import "./UserCard.css";

/**
 * UserCard — Clickable card showing user summary (avatar, name, email, company).
 * @param {Object}   props
 * @param {Object}   props.user     — { name, email, company: { name } }
 * @param {Function} [props.onClick]
 */
export function UserCard({ user, onClick }) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return el("article", { class: "user-card", onClick }, [
    el("div", { class: "avatar" }, [initials]),
    el("div", { class: "user-card__info" }, [
      el("h3", { class: "user-card__name" }, [user.name]),
      el("p", { class: "user-card__email" }, [user.email]),
      user.company
        ? el("p", { class: "user-card__company" }, [user.company.name])
        : null,
    ]),
  ]);
}

/**
 * UserCardSkeleton — Loading placeholder matching UserCard layout.
 */
export function UserCardSkeleton() {
  return el("div", { class: "user-card-skeleton" }, [
    el("div", {
      class: "skeleton",
      style: {
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        flexShrink: "0",
      },
    }),
    el(
      "div",
      {
        style: {
          flex: "1",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        },
      },
      [
        el("div", {
          class: "skeleton",
          style: { width: "60%", height: "16px" },
        }),
        el("div", {
          class: "skeleton",
          style: { width: "80%", height: "14px" },
        }),
        el("div", {
          class: "skeleton",
          style: { width: "40%", height: "12px" },
        }),
      ],
    ),
  ]);
}
