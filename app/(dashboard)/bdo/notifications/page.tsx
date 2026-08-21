"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { clsx } from "clsx";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { getNotificationsForBdo } from "@/lib/mock-data";
import { AroNotificationType, NotificationRecord } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { useRequireAccess } from "@/components/access/RequireAccess";

const typeTitle: Record<AroNotificationType, string> = {
  "agent-inactive": "Agent inactive",
  milestone: "Milestone reached",
  "new-agent": "New agent onboarded",
  "commission-generated": "Commission generated",
  "pos-inactive": "POS inactive",
  "referral-bonus": "Referral bonus",
};

const typeDot: Record<AroNotificationType, string> = {
  "agent-inactive": "bg-amber-500",
  milestone: "bg-success",
  "new-agent": "bg-brand-500",
  "commission-generated": "bg-success",
  "pos-inactive": "bg-amber-500",
  "referral-bonus": "bg-success",
};

export default function BdoNotificationsPage() {
  const allowed = useRequireAccess("bdo");
  const router = useRouter();
  const [items, setItems] = useState<NotificationRecord[]>(() => getNotificationsForBdo());

  if (!allowed) return null;

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleClick(n: NotificationRecord) {
    setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)));
    if (n.actionLink) router.push(n.actionLink);
  }

  const unread = items.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Notifications & Alerts"
        description="Network-wide activity across every ARO and agent."
        action={
          unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-lg border border-surface-border px-3.5 py-2.5 text-sm font-semibold text-brand-600 hover:bg-surface"
            >
              <CheckCheck size={16} /> Mark all read
            </button>
          )
        }
      />

      <Card>
        <ul>
          {items.length === 0 ? (
            <li className="px-5 py-16 text-center text-sm text-ink-400">No notifications yet.</li>
          ) : (
            items.map((n) => (
              <li key={n.id} className="border-b border-surface-border/70 last:border-0">
                <button
                  onClick={() => handleClick(n)}
                  className={clsx("flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-surface/60", !n.read && "bg-brand-50/40")}
                >
                  <span className={clsx("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", typeDot[n.type])} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-900">{typeTitle[n.type]}</p>
                    <p className="mt-0.5 text-sm text-ink-500">{n.message}</p>
                    <p className="mt-1 text-xs text-ink-400">{formatDate(n.timestamp)}</p>
                  </div>
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                </button>
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  );
}
