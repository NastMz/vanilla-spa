import { el } from "../core/dom.js";
import { Loader } from "../components/Loader.js";
import { ErrorState } from "../components/ErrorState.js";
import { getJson } from "../api/client.js";
import "./UserDetailView.css";

const API_BASE = "https://jsonplaceholder.typicode.com/users";

/**
 * UserDetailView — Shows a single user profile.
 * Demonstrates dynamic route params (/users/:id) and individual resource fetching.
 *
 * @param {Object}   props
 * @param {Object}   props.store
 * @param {Object}   props.params  — { id: string }
 * @param {Function} props.navigate
 */
export function UserDetailView({ store, params, navigate }) {
  const userId = params.id;
  const stateKey = `userDetail_${userId}`;
  const state = store.get();

  // Per-user detail state (lazy init)
  const detail = state[stateKey] || { status: "idle", data: null, error: null };

  if (detail.status === "idle") {
    loadUserDetail(store, stateKey, userId);
  }

  // ── Body ──

  let body;

  if (detail.status === "loading") {
    body = Loader({ large: true, text: "Loading user profile…" });
  } else if (detail.status === "error") {
    body = ErrorState({
      message: detail.error,
      onRetry: () => {
        store.set({ [stateKey]: { status: "idle", data: null, error: null } });
      },
    });
  } else if (detail.status === "success" && detail.data) {
    const u = detail.data;
    const initials = u.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    body = el("div", { class: "user-detail" }, [
      // Profile header
      el("div", { class: "user-detail__header" }, [
        el("div", { class: "avatar avatar--lg" }, [initials]),
        el("div", { class: "user-detail__meta" }, [
          el("h2", { class: "user-detail__name" }, [u.name]),
          el("p", { class: "user-detail__username" }, [`@${u.username}`]),
        ]),
      ]),

      // Contact
      el("div", { class: "user-detail__section" }, [
        el("h3", {}, ["Contact"]),
        el("div", { class: "detail-grid" }, [
          detailItem("Email", u.email),
          detailItem("Phone", u.phone),
          detailItem("Website", u.website),
        ]),
      ]),

      // Address
      el("div", { class: "user-detail__section" }, [
        el("h3", {}, ["Address"]),
        el("div", { class: "detail-grid" }, [
          detailItem("Street", `${u.address?.street}, ${u.address?.suite}`),
          detailItem("City", u.address?.city),
          detailItem("Zipcode", u.address?.zipcode),
        ]),
      ]),

      // Company
      el("div", { class: "user-detail__section" }, [
        el("h3", {}, ["Company"]),
        el("div", { class: "detail-grid" }, [
          detailItem("Name", u.company?.name),
          detailItem("Industry", u.company?.bs),
          detailItem("Motto", u.company?.catchPhrase),
        ]),
      ]),
    ]);
  } else {
    body = el("div");
  }

  return el("div", { class: "view container" }, [
    el(
      "a",
      {
        href: "/users",
        class: "view__back",
        dataset: { link: "" },
      },
      ["← Back to users"],
    ),
    body,
  ]);
}

// ── Helpers ───────────────────────────────────────────────────

function detailItem(label, value) {
  return el("div", { class: "detail-item" }, [
    el("div", { class: "detail-item__label" }, [label]),
    el("div", { class: "detail-item__value" }, [value || "—"]),
  ]);
}

async function loadUserDetail(store, stateKey, userId) {
  store.set({ [stateKey]: { status: "loading", data: null, error: null } });

  try {
    const data = await getJson(`${API_BASE}/${userId}`, { ttlMs: 30_000 });
    store.set({ [stateKey]: { status: "success", data, error: null } });
  } catch (err) {
    if (err?.name === "AbortError") return;
    store.set({
      [stateKey]: {
        status: "error",
        data: null,
        error: String(err?.message ?? err),
      },
    });
  }
}
