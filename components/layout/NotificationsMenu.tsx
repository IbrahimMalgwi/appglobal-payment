"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { clsx } from "clsx";
import { notifications as seedNotifications } from "@/lib/mock-data";
import { NotificationItem } from "@/lib/types";
import { formatDate } from "@/lib/format";

const toneDot: Record<NotificationItem["tone"], string> = {
  info: "bg-brand-500",
  success: "bg-success",
  warning: "bg-amber-500",
};

export function NotificationsMenu() {
  const [items, setItems] = useState<NotificationItem[]>(seedNotifications);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function toggle() {
    // Opening the panel marks everything as read, mirroring typical inbox behaviour.
    setOpen((v) => {
      const next = !v;
      if (next && unread > 0) setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      return next;
    });
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-surface"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-panel">
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Notifications</p>
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          </div>
          <ul className="max-h-96 divide-y divide-surface-border/70 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-ink-400">No notifications.</li>
            ) : (
              items.map((n) => (
                <li key={n.id} className={clsx("flex gap-3 px-4 py-3", !n.read && "bg-brand-50/50")}>
                  <span className={clsx("mt-1.5 h-2 w-2 shrink-0 rounded-full", toneDot[n.tone])} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                    <p className="mt-0.5 text-xs text-ink-500">{n.message}</p>
                    <p className="mt-1 text-[11px] text-ink-400">{formatDate(n.date)}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
