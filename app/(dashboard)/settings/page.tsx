"use client";

import { useState } from "react";
import { Landmark, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { useApp } from "@/context/AppContext";
import { getAccountDetailsForUser, getTierByLevel } from "@/lib/mock-data";
import { formatNaira } from "@/lib/format";
import { useToast } from "@/context/ToastContext";
import { useRequireAccess } from "@/components/access/RequireAccess";

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-surface-border/70 py-3 last:border-0">
      <span className="text-sm text-ink-400">{label}</span>
      <span className="text-right text-sm font-semibold text-ink-900">{value ? value : "—"}</span>
    </div>
  );
}

export default function AccountDetailsPage() {
  const allowed = useRequireAccess("accountDetails");
  const { userType } = useApp();
  const { showToast } = useToast();
  const accounts = getAccountDetailsForUser(userType);
  const [index, setIndex] = useState(0);

  const account = accounts[index];
  const tier = account?.tierLevel ? getTierByLevel(account.tierLevel) : undefined;

  if (!allowed) return null;

  return (
    <div>
      <PageHeader title="Settings" description="Your account details, limits, security, and support." />
      <SettingsTabs />

      {!account ? (
        <Card className="px-6 py-16 text-center text-sm text-ink-400">No account details available.</Card>
      ) : (
        <Card className="max-w-2xl overflow-hidden">
          <div className="flex items-center justify-between bg-navy-950 px-5 py-4">
            <div className="flex items-center gap-2 text-white">
              <Landmark size={18} className="text-brand-300" />
              <span className="text-sm font-semibold">{account.accountName}</span>
            </div>
            <Badge tone={statusTone(account.status)}>{account.status}</Badge>
          </div>

          {accounts.length > 1 && (
            <div className="flex items-center justify-between border-b border-surface-border bg-surface px-5 py-2.5">
              <button
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                aria-label="Previous account"
                className="grid h-8 w-8 place-items-center rounded-full text-ink-500 hover:bg-surface-card disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs font-semibold text-ink-600">
                Account {index + 1} / {accounts.length}
              </span>
              <button
                onClick={() => setIndex((i) => Math.min(accounts.length - 1, i + 1))}
                disabled={index === accounts.length - 1}
                aria-label="Next account"
                className="grid h-8 w-8 place-items-center rounded-full text-ink-500 hover:bg-surface-card disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          <div className="p-5">
            <div className="mb-4 flex items-center justify-between rounded-xl bg-surface p-4">
              <div>
                <p className="text-xs text-ink-400">Available balance</p>
                <p className="font-display text-xl font-bold text-ink-900">
                  {formatNaira(account.availableBalance)}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(account.accountNumber);
                  showToast("Account number copied.");
                }}
                className="flex items-center gap-1.5 rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-semibold text-brand-600 hover:bg-surface-card"
              >
                <Copy size={13} /> Copy account no.
              </button>
            </div>

            <DetailRow label="Account number" value={account.accountNumber} />
            <DetailRow label="Tier level" value={tier ? tier.name : account.tierLevel} />
            <DetailRow label="Tier status" value={account.tierStatus} />
            <DetailRow label="CAC number" value={account.cacNumber} />
            <DetailRow label="TIN number" value={account.tinNumber} />
            <DetailRow label="Phone" value={account.phone} />
            <DetailRow label="Business address" value={account.businessAddress} />
            <DetailRow label="Business email" value={account.businessEmail} />
            <DetailRow label="Business website" value={account.businessWebsite} />
          </div>
        </Card>
      )}
    </div>
  );
}
