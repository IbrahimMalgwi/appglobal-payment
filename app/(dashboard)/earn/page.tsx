"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Gift, Users, Copy, Share2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { referralBalance, referralCode, referralStats } from "@/lib/mock-data";
import { formatNaira } from "@/lib/format";
import { useToast } from "@/context/ToastContext";
import { useRequireAccess } from "@/components/access/RequireAccess";

function EarnMoneyContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "referral";
  const referralLink = `https://appglobal.pay/r/${referralCode}`;

  return (
    <div>
      <PageHeader title="Earn Money" description="Referral rewards and cashback, in one place." />
      <div className="mb-5">
        <Tabs
          tabs={[
            { key: "referral", label: "Referral" },
            { key: "cashback", label: "Cashback" },
          ]}
          defaultTab="referral"
        />
      </div>

      {tab === "cashback" ? (
        <ComingSoon
          icon={Gift}
          title="Cashback is coming soon"
          description="We're building automatic cashback on qualifying transactions. Check back soon."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Card className="p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
              <Users size={22} className="text-brand-500" />
            </div>
            <p className="text-sm text-ink-400">Referral balance</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-ink-900">{formatNaira(referralBalance)}</p>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-surface-border pt-4">
              <div>
                <p className="text-xs text-ink-400">Successful referrals</p>
                <p className="font-display text-lg font-bold text-ink-900">{referralStats.successfulReferrals}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Total earnings</p>
                <p className="font-display text-lg font-bold text-ink-900">
                  {formatNaira(referralStats.totalEarnings)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <p className="mb-3 text-sm font-semibold text-ink-700">Your referral code</p>
            <div className="mb-3 flex items-center justify-between rounded-lg border border-dashed border-surface-border bg-surface px-3 py-2.5">
              <span className="text-sm font-semibold text-ink-700">{referralCode}</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(referralCode);
                  showToast("Referral code copied.");
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-600"
              >
                <Copy size={14} /> Copy
              </button>
            </div>

            <p className="mb-2 text-sm font-semibold text-ink-700">Your referral link</p>
            <div className="mb-4 flex items-center justify-between rounded-lg border border-dashed border-surface-border bg-surface px-3 py-2.5">
              <span className="truncate text-sm text-ink-600">{referralLink}</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(referralLink);
                  showToast("Referral link copied.");
                }}
                className="ml-2 flex shrink-0 items-center gap-1.5 text-xs font-semibold text-brand-600"
              >
                <Copy size={14} /> Copy
              </button>
            </div>

            <button
              onClick={() => showToast("Share sheet would open here.")}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600"
            >
              <Share2 size={16} /> Share referral link
            </button>

            <p className="mt-4 text-sm text-ink-500">
              Share your link. When someone signs up and completes their first transaction, you both earn a
              bonus.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function EarnMoneyPage() {
  const allowed = useRequireAccess("earnMoney");
  if (!allowed) return null;
  return (
    <Suspense fallback={null}>
      <EarnMoneyContent />
    </Suspense>
  );
}
