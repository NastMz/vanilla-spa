import { el } from "../core/dom.js";
import { Button } from "../components/Button.js";
import { FeatureCard } from "../components/FeatureCard.js";
import "./HomeView.css";

/**
 * HomeView — Landing page showcasing the SPA's architecture and features.
 *
 * @param {Object} props
 * @param {Function} props.navigate — router.navigate function
 */
export function HomeView({ navigate }) {
  return el("div", { class: "view container" }, [
    // ── Hero ──────────────────────────────────────────────
    el("section", { class: "hero" }, [
      el("div", { class: "hero__badge" }, ["100% Vanilla JavaScript"]),
      el("h1", { class: "hero__title" }, [
        "Modern SPAs ",
        el("span", { class: "gradient" }, ["without the framework tax."]),
      ]),
      el("p", { class: "hero__subtitle" }, [
        "A production-ready Single Page Application architecture built with zero dependencies. ",
        "Proving that you don't always need React, Vue, or Angular to build great web apps.",
      ]),
      el("div", { class: "hero__actions" }, [
        Button({
          label: "Explore Features ↓",
          variant: "primary",
          size: "lg",
          onClick: () =>
            document
              .getElementById("features")
              ?.scrollIntoView({ behavior: "smooth" }),
        }),
        Button({
          label: "View Architecture →",
          variant: "ghost",
          size: "lg",
          onClick: () => navigate("/about"),
        }),
      ]),
    ]),

    // ── Features ──────────────────────────────────────────
    el("section", { class: "features", id: "features" }, [
      el("h2", { class: "features__title" }, ["What's inside"]),
      el("p", { class: "features__subtitle" }, [
        "Every feature you need for a real-world SPA, with none of the bloat.",
      ]),
      el("div", { class: "features__grid" }, [
        FeatureCard({
          icon: "🧭",
          title: "History Router",
          description:
            "pushState-based routing with dynamic params (/users/:id), transitions, and scroll restoration — no hash fragments.",
        }),
        FeatureCard({
          icon: "📦",
          title: "Reactive Store",
          description:
            "Global state container with immutable updates, subscriptions, and selectors. State persists across navigation.",
        }),
        FeatureCard({
          icon: "🌐",
          title: "Smart Data Fetching",
          description:
            "HTTP client with response caching (TTL), in-flight request deduplication, and AbortController support.",
        }),
        FeatureCard({
          icon: "🧩",
          title: "Functional Components",
          description:
            "Pure functions returning DOM nodes — composable, testable, with no virtual DOM overhead.",
        }),
        FeatureCard({
          icon: "🎨",
          title: "Modern Design System",
          description:
            "CSS custom properties, fluid typography, dark mode, smooth transitions, skeleton loading states.",
        }),
        FeatureCard({
          icon: "⚡",
          title: "Zero Dependencies",
          description:
            "No npm packages in production. Just the web platform: JavaScript, CSS, Fetch, History, and ES Modules.",
        }),
      ]),
    ]),

    // ── Tech Stack ────────────────────────────────────────
    el("section", { class: "tech-stack" }, [
      el("h2", {}, ["Built with"]),
      el(
        "div",
        { class: "tech-stack__items" },
        [
          "Vanilla JS",
          "CSS Custom Properties",
          "History API",
          "Fetch API",
          "AbortController",
          "ES Modules",
          "Vite",
        ].map((t) => el("span", { class: "tech-badge" }, [t])),
      ),
    ]),
  ]);
}
