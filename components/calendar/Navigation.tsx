"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavigationProps { id?: string; }

export default function Navigation({ id }: NavigationProps) {
  const pathname = usePathname();
  const [isPublic, setIsPublic] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data.isPublic === "boolean") setIsPublic(data.isPublic); else setIsPublic(true);
      } catch { /* ignore */ }
    }
    load();
  }, [id]);

  async function toggleVisibility() {
    if (isPublic == null) return;
    try {
      setSaving(true);
      const res = await fetch("/api/users/visibility", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublic: !isPublic }) });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (typeof data.isPublic === "boolean") setIsPublic(data.isPublic);
    } finally {
      setSaving(false);
    }
  }

  const isActive = (href: string) => pathname === href;
  const navItemStyle = (active: boolean): React.CSSProperties => ({ background: active ? "color-mix(in srgb, var(--foreground) 12%, transparent)" : "transparent", color: "var(--foreground)", borderColor: active ? "color-mix(in srgb, var(--foreground) 30%, transparent)" : "color-mix(in srgb, var(--foreground) 18%, transparent)" });
  const navItemClass = "px-3 py-2 rounded-md text-sm font-medium border transition-colors hover:[background:color-mix(in_srgb,var(--foreground)_8%,transparent)]";

  return (
<nav className="w-full" style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border-subtle)" }}>
      <div className="w-full px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 ml-16 md:ml-12">
            <Link href="/protected/calendar" className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Calendar</Link>
            <div className="hidden md:flex items-center gap-2">
              <Link href="/protected/calendar" className={navItemClass} style={navItemStyle(isActive("/protected/calendar"))}>Dashboard</Link>
              {id && (
                <Link href={`/calendar/${id}`} className={navItemClass} style={navItemStyle(isActive(`/calendar/${id}`))}>Public link</Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {id ? (
              <>
                {isPublic !== null && (
                  <div className="inline-flex items-center gap-2">
                    <button onClick={toggleVisibility} disabled={saving} role="switch" aria-checked={isPublic} title={isPublic ? "Public - click to make private" : "Private - click to make public"} className={["relative inline-flex h-7 w-12 items-center rounded-full","border ring-1 ring-inset transition-all duration-200", isPublic ? "bg-[color-mix(in_srgb,var(--foreground)_14%,transparent)]" : "bg-transparent","border-[color-mix(in_srgb,var(--foreground)_25%,transparent)]","ring-[color-mix(in_srgb,var(--foreground)_18%,transparent)]","disabled:opacity-60 disabled:cursor-not-allowed","focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--foreground)_40%,transparent)]"].join(" ")}> 
                      <span className={["pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full","bg-[var(--background)] shadow-sm transition-transform duration-200 will-change-transform", isPublic ? "translate-x-5" : "translate-x-0"].join(" ")}/>
                    </button>
                    <span className="text-sm font-medium text-[var(--foreground)] select-none">{saving ? "Saving..." : isPublic ? "Public" : "Private"}</span>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}