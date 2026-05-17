"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Notification = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  resourceType?: string | null;
  resourceId?: string | null;
  createdAt: string;
  readAt?: string | null;
};

type ApiResponse = {
  notifications: Notification[];
  nextCursor: string | null;
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);
  const [activeColumn, setActiveColumn] = useState<"unread" | "read">("unread");
  const [priority, setPriority] = useState<number>(3);
  const [updatingPriority, setUpdatingPriority] = useState(false);

  const fetchNotifications = useCallback(async (cursor?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/notifications", window.location.origin);
      url.searchParams.set("take", "20");
      if (cursor) {
        url.searchParams.set("cursor", cursor);
      }
      const res = await fetch(url.toString());
      const data: ApiResponse = await res.json();
      if (!res.ok) {
        throw new Error((data as any)?.error || "Failed to load notifications");
      }
      setItems((current) => {
        const merged = cursor ? [...current, ...data.notifications] : data.notifications;
        const seen = new Set<string>();
        const deduped: Notification[] = [];
        for (const item of merged) {
          if (item?.id && !seen.has(item.id)) {
            seen.add(item.id);
            deduped.push(item);
          }
        }
        return deduped;
      });
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Fetch user's priority setting
    if (session?.user?.id) {
      fetch(`/api/users/${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.priority) {
            setPriority(data.priority);
          }
        })
        .catch(err => console.error("Failed to fetch user priority:", err));
    }
  }, [fetchNotifications, session?.user?.id]);

  const unreadItems = useMemo(() => items.filter((n) => !n.readAt), [items]);
  const readItems = useMemo(() => items.filter((n) => n.readAt), [items]);
  const unreadCount = unreadItems.length;
  const readCount = readItems.length;
  const userId = session?.user?.id ?? "";
  const notifyBaseUrl = "https://hamaralabs-notify.hamaralabs.com";
  const notifyEndpoint = userId ? `${notifyBaseUrl}/alerts-${userId}` : notifyBaseUrl;

  const mutateNotifications = useCallback(
    async (action: "read" | "unread" | "delete", target: string[] | "all") => {
      if (mutating) return;
      if (action !== "read" && target === "all") return;
      if (target !== "all" && (!Array.isArray(target) || target.length === 0)) return;

      setMutating(true);
      setError(null);
      try {
        const body: Record<string, unknown> = { action };
        if (target === "all") {
          body.markAll = true;
        } else {
          body.ids = target;
        }

        const res = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Failed to update notifications");
        }

        setItems((current) => {
          if (!current.length) return current;
          const now = new Date().toISOString();

          if (action === "delete" && target !== "all") {
            const idSet = new Set(target);
            return current.filter((item) => !idSet.has(item.id));
          }

          if (target === "all") {
            return current.map((item) => ({ ...item, readAt: item.readAt ?? now }));
          }

          const idSet = new Set(target);
          return current.map((item) => {
            if (!idSet.has(item.id)) return item;
            if (action === "read") {
              return { ...item, readAt: item.readAt ?? now };
            }
            if (action === "unread") {
              return { ...item, readAt: null };
            }
            return item;
          });
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update notifications");
      } finally {
        setMutating(false);
      }
    },
    [mutating],
  );

  const handlePriorityChange = useCallback(async (newPriority: number) => {
    if (!session?.user?.id || updatingPriority) return;
    
    setUpdatingPriority(true);
    try {
      const res = await fetch(`/api/users/${session.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update priority");
      }
      
      setPriority(newPriority);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update priority");
    } finally {
      setUpdatingPriority(false);
    }
  }, [session?.user?.id, updatingPriority]);

  return (
    <div
      className="relative min-h-screen w-full overflow-y-auto"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <header
        className="sticky top-0 z-10 h-14 border-b"
        style={{ background: "var(--surface-2)", borderColor: "var(--border-subtle)" }}
      >
        <div className="h-full w-full pl-14 pr-3 sm:pl-16 sm:pr-5 flex flex-col justify-center gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold tracking-wide">Notifications</h1>
              <span className="text-xs opacity-70">{`${unreadCount} unread`}</span>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="priority-select" className="text-xs font-semibold tracking-wide">
                Priority:
              </label>
              <select
                id="priority-select"
                value={priority}
                onChange={(e) => handlePriorityChange(Number(e.target.value))}
                disabled={updatingPriority}
                className="rounded border px-2 py-1 text-xs font-medium disabled:opacity-50"
                style={{
                  background: "color-mix(in srgb, var(--foreground) 6%, transparent)",
                  borderColor: "color-mix(in srgb, var(--foreground) 18%, transparent)",
                  color: "var(--foreground)",
                }}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 text-[11px] tracking-wide opacity-80">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">Topic name</span>
                <span className="rounded bg-black/10 px-2 py-0.5 font-medium lowercase">
                  {userId ? `alerts-${userId.toLowerCase()}` : "loading"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">Notify URL</span>
                <a
                  className="break-all rounded bg-black/10 px-2 py-1 text-xs font-semibold tracking-wide underline"
                  style={{
                    color: "var(--foreground)",
                    textDecorationColor: "color-mix(in srgb, var(--foreground) 65%, transparent)",
                  }}
                  href={"https://hamaralabs-notify.hamaralabs.com"}
                  target="_blank"
                  rel="noreferrer"
                >
                    https://hamaralabs-notify.hamaralabs.com
                </a>
              </div>
            </div>
          </div>
          <button
            onClick={() => mutateNotifications("read", "all")}
            disabled={!items.length || mutating || unreadCount === 0}
            className="px-3 py-1.5 rounded text-xs font-medium border transition-colors disabled:opacity-50"
            style={{
              background: "color-mix(in srgb, var(--foreground) 6%, transparent)",
              borderColor: "color-mix(in srgb, var(--foreground) 18%, transparent)",
            }}
          >
            Mark all read
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6 space-y-4">
        {error && (
          <div
            className="mb-4 text-xs rounded-md border px-3 py-2"
            style={{
              background: "color-mix(in srgb, var(--foreground) 8%, transparent)",
              borderColor: "color-mix(in srgb, var(--foreground) 18%, transparent)",
            }}
          >
            {error}
          </div>
        )}

        <section className="grid gap-3 md:grid-cols-2">
          <button
            onClick={() => setActiveColumn("unread")}
            className="rounded-lg border p-4 text-left transition"
            style={{
              background:
                activeColumn === "unread"
                  ? "color-mix(in srgb, var(--foreground) 12%, transparent)"
                  : "color-mix(in srgb, var(--foreground) 4%, transparent)",
              borderColor: "color-mix(in srgb, var(--foreground) 22%, transparent)",
            }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold uppercase tracking-wide">Unread</span>
              <span className="text-xs opacity-75">{unreadCount}</span>
            </div>
            <p className="mt-2 text-xs opacity-70">Notifications awaiting your attention.</p>
          </button>

          <button
            onClick={() => setActiveColumn("read")}
            className="rounded-lg border p-4 text-left transition"
            style={{
              background:
                activeColumn === "read"
                  ? "color-mix(in srgb, var(--foreground) 12%, transparent)"
                  : "color-mix(in srgb, var(--foreground) 4%, transparent)",
              borderColor: "color-mix(in srgb, var(--foreground) 22%, transparent)",
            }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold uppercase tracking-wide">Read</span>
              <span className="text-xs opacity-75">{readCount}</span>
            </div>
            <p className="mt-2 text-xs opacity-70">Notifications you have already viewed.</p>
          </button>
        </section>

        {loading && !items.length ? (
          <div className="text-sm opacity-70">Loading notifications…</div>
        ) : (
          <div className="space-y-4">
            {!items.length && !loading ? (
              <div className="text-xs opacity-60">No notifications yet.</div>
            ) : (
              <section className="space-y-3">
                <header className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide">
                    {activeColumn === "unread" ? "Unread notifications" : "Read notifications"}
                  </h2>
                  <span className="text-xs opacity-60">
                    {activeColumn === "unread" ? unreadCount : readCount} items
                  </span>
                </header>

                {(activeColumn === "unread" ? unreadItems : readItems).length === 0 ? (
                  <p className="text-xs opacity-60">
                    {activeColumn === "unread"
                      ? "You are all caught up."
                      : "No notifications have been read yet."}
                  </p>
                ) : (
                  (activeColumn === "unread" ? unreadItems : readItems).map((item) => {
                    const createdAt = new Date(item.createdAt).toLocaleString();
                    const isUnread = activeColumn === "unread";
                    return (
                      <article
                        key={item.id}
                        className="rounded-lg border p-4 transition"
                        style={{
                          background: isUnread
                            ? "color-mix(in srgb, var(--foreground) 6%, transparent)"
                            : "var(--surface-1)",
                          borderColor: "color-mix(in srgb, var(--foreground) 18%, transparent)",
                        }}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <h3 className="text-sm font-semibold">{item.title}</h3>
                            {item.description ? (
                              <div
                                className="text-sm opacity-80 [&_*]:max-w-full"
                                dangerouslySetInnerHTML={{ __html: item.description }}
                              />
                            ) : null}
                            <p className="text-xs opacity-60">{createdAt}</p>
                          </div>
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {isUnread ? (
                              <button
                                onClick={() => mutateNotifications("read", [item.id])}
                                disabled={mutating}
                                className="text-xs font-medium px-2 py-1 rounded border disabled:opacity-50"
                                style={{
                                  background: "color-mix(in srgb, var(--foreground) 4%, transparent)",
                                  borderColor: "color-mix(in srgb, var(--foreground) 18%, transparent)",
                                }}
                              >
                                Mark read
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => mutateNotifications("unread", [item.id])}
                                  disabled={mutating}
                                  className="text-xs font-medium px-2 py-1 rounded border disabled:opacity-50"
                                  style={{
                                    background: "color-mix(in srgb, var(--foreground) 4%, transparent)",
                                    borderColor: "color-mix(in srgb, var(--foreground) 18%, transparent)",
                                  }}
                                >
                                  Mark unread
                                </button>
                                <button
                                  onClick={() => mutateNotifications("delete", [item.id])}
                                  disabled={mutating}
                                  className="text-xs font-medium px-2 py-1 rounded border disabled:opacity-50"
                                  style={{
                                    background: "color-mix(in srgb, var(--foreground) 4%, transparent)",
                                    borderColor: "color-mix(in srgb, var(--foreground) 18%, transparent)",
                                  }}
                                  aria-label="Delete notification"
                                >
                                  ×
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </section>
            )}

            {nextCursor && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => fetchNotifications(nextCursor)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded text-xs font-medium border disabled:opacity-50"
                  style={{
                    background: "color-mix(in srgb, var(--foreground) 6%, transparent)",
                    borderColor: "color-mix(in srgb, var(--foreground) 18%, transparent)",
                  }}
                >
                  {loading ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
