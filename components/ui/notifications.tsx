"use client";

import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";

export type NotificationVariant = "default" | "destructive";

export type NotificationInput = {
  title: string;
  description?: string;
  variant?: NotificationVariant;
  durationMs?: number;
};

type NotificationItem = {
  id: string;
} & Required<Pick<NotificationInput, "title">> & Omit<NotificationInput, "title">;

type NotificationsContextValue = {
  notify: (n: NotificationInput) => string;
  dismiss: (id: string) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function useId() {
  const [counter, setCounter] = useState(0);
  return useCallback(() => {
    setCounter((c) => (c + 1) % Number.MAX_SAFE_INTEGER);
    return `${Date.now()}_${Math.random().toString(36).slice(2)}_${counter}`;
  }, [counter]);
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const genId = useId();
  const [items, setItems] = useState<NotificationItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const notify = useCallback(
    (n: NotificationInput) => {
      const id = genId();
      const item: NotificationItem = {
        id,
        title: n.title,
        description: n.description,
        variant: n.variant ?? "default",
        durationMs: n.durationMs ?? 4000,
      };
      setItems((prev) => [item, ...prev]);
      return id;
    },
    [genId]
  );

  // Auto-dismiss timers
  useEffect(() => {
    const timers = items
      .filter((i) => i.durationMs && i.durationMs > 0)
      .map((i) => setTimeout(() => dismiss(i.id), i.durationMs));
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [items, dismiss]);

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions removals"
        className="fixed top-0 right-0 z-[100] m-4 flex max-h-screen w-full flex-col-reverse gap-2 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col sm:max-w-[420px]"
      >
        {items.map((n) => (
          <div
            key={n.id}
            className="group relative flex w-full items-start justify-between gap-3 overflow-hidden rounded-md border p-4 shadow-lg transition-all"
            style={{
              background: n.variant === "destructive"
                ? "color-mix(in srgb, var(--foreground) 10%, transparent)"
                : "var(--background)",
              color: "var(--foreground)",
              borderColor: n.variant === "destructive"
                ? "color-mix(in srgb, var(--foreground) 35%, transparent)"
                : "color-mix(in srgb, var(--foreground) 20%, transparent)",
            }}
          >
            <div className="grid gap-1">
              <div className="text-sm font-semibold">{n.title}</div>
              {n.description ? (
                <div className="text-sm opacity-90">{n.description}</div>
              ) : null}
            </div>
            <button
              onClick={() => dismiss(n.id)}
              aria-label="Close notification"
              className="rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2"
              style={{
                color: "var(--foreground)",
                borderColor: "color-mix(in srgb, var(--foreground) 25%, transparent)",
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}