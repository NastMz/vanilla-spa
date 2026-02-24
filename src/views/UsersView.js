import { el } from "../core/dom.js";
import { Button } from "../components/Button.js";
import { Badge } from "../components/Badge.js";
import { ErrorState } from "../components/ErrorState.js";
import { EmptyState } from "../components/EmptyState.js";
import "./UsersView.css";
import { UserCard, UserCardSkeleton } from "../components/UserCard.js";
import { showToast } from "../components/Toast.js";
import { getJson, clearCache } from "../api/client.js";

const USERS_URL = "https://jsonplaceholder.typicode.com/users";

/**
 * UsersView — Demonstrates data fetching with cache, deduplication, and UX states.
 *
 * @param {Object}   props
 * @param {Object}   props.store
 * @param {Function} props.navigate
 */
export function UsersView({ store, navigate }) {
  const { users } = store.get();

  // Trigger fetch on first visit (status === 'idle')
  if (users.status === "idle") {
    loadUsers(store);
  }

  // ── Body: loading / error / empty / data ──

  let body;

  if (users.status === "loading") {
    // Skeleton loading state
    body = el(
      "div",
      { class: "users-grid" },
      Array.from({ length: 6 }, () => UserCardSkeleton()),
    );
  } else if (users.status === "error") {
    body = ErrorState({
      message: users.error,
      onRetry: () => {
        clearCache();
        store.set({ users: { status: "idle", data: null, error: null } });
      },
    });
  } else if (users.status === "success" && users.data?.length === 0) {
    body = EmptyState({
      icon: "👥",
      title: "No users found",
      text: "The API returned an empty list. Try reloading.",
    });
  } else if (users.status === "success") {
    body = el(
      "div",
      { class: "users-grid" },
      users.data.map((user) =>
        UserCard({
          user,
          onClick: () => navigate(`/users/${user.id}`),
        }),
      ),
    );
  } else {
    body = el("div");
  }

  // ── Status badges ──

  const statusBadge = buildStatusBadge(users);

  const cacheBadge = Badge({ label: "15s cache TTL", variant: "neutral" });

  // ── View ──

  return el("div", { class: "view container" }, [
    el("div", { class: "view__header view__header--with-actions" }, [
      el("div", {}, [
        el("h1", { class: "view__title" }, ["Users"]),
        el("p", { class: "view__subtitle" }, [
          "Data fetched from JSONPlaceholder with response caching, request deduplication, and abort support. ",
          "Click a card to see user details.",
        ]),
        el(
          "div",
          {
            style: {
              display: "flex",
              gap: "6px",
              marginTop: "12px",
              flexWrap: "wrap",
            },
          },
          [statusBadge, cacheBadge],
        ),
      ]),
      el("div", { class: "view__actions" }, [
        Button({
          label: "Reload",
          variant: "secondary",
          onClick: () => {
            clearCache();
            store.set({ users: { status: "idle", data: null, error: null } });
            showToast("Cache cleared, reloading…");
          },
        }),
        Button({
          label: "Force refetch",
          variant: "ghost",
          onClick: () => {
            store.set({
              users: { status: "loading", data: null, error: null },
            });
            loadUsers(store, { cancelPrevious: true, ttlMs: 0 });
            showToast("Forced refetch (cancelled previous)");
          },
        }),
      ]),
    ]),
    body,
  ]);
}

// ── Helpers ───────────────────────────────────────────────────

function buildStatusBadge(users) {
  if (users.status === "success")
    return Badge({
      label: `${users.data?.length ?? 0} users`,
      variant: "success",
    });
  if (users.status === "loading")
    return Badge({ label: "loading", variant: "primary" });
  if (users.status === "error")
    return Badge({ label: "error", variant: "error" });
  return Badge({ label: "idle", variant: "neutral" });
}

// ── Data loading ──────────────────────────────────────────────

async function loadUsers(
  store,
  { ttlMs = 15_000, cancelPrevious = false } = {},
) {
  store.set({ users: { status: "loading", data: null, error: null } });

  try {
    const data = await getJson(USERS_URL, { ttlMs, cancelPrevious });
    store.set({ users: { status: "success", data, error: null } });
  } catch (err) {
    if (err?.name === "AbortError") return; // Cancelled — ignore
    store.set({
      users: {
        status: "error",
        data: null,
        error: String(err?.message ?? err),
      },
    });
  }
}
