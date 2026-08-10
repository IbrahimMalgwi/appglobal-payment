"use client";

import { Users, Copy } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { Card } from "@/components/ui/Card";
import { referralBalance } from "@/lib/mock-data";
import { formatNaira } from "@/lib/format";

const tabs = [
  { href: "/earn/cashback", label: "Cashback" },
  { href: "/earn/referrals", label: "Referrals" },
];

export default function ReferralsPage() {
  return (
    <div>
      <PageHeader title="Earn Money" description="Invite others and earn referral bonuses." />
      <div className="mb-5">
        <RouteTabs tabs={tabs} />
      </div>
      <Card className="max-w-md p-6">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
          <Users size={22} className="text-brand-500" />
        </div>
        <p className="text-sm text-ink-400">Referral balance</p>
        <p className="mt-1 font-display text-3xl font-extrabold text-ink-900">{formatNaira(referralBalance)}</p>
        <div className="mt-5 flex items-center justify-between rounded-lg border border-dashed border-surface-border bg-surface px-3 py-2.5">
          <span className="text-sm font-semibold text-ink-700">REF-JDOE-2026</span>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-brand-600">
            <Copy size={14} /> Copy
          </button>
        </div>
        <p className="mt-4 text-sm text-ink-500">
          Share your referral code. When someone signs up and completes their first transaction, you both
          earn a bonus.
        </p>
      </Card>
    </div>
  );
}
