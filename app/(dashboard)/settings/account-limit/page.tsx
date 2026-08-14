"use client";

import { useState } from "react";
import { Loader2, Check, ArrowUpCircle } from "lucide-react";
import { clsx } from "clsx";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { useApp } from "@/context/AppContext";
import { accountTiers, getAccountDetailsForUser } from "@/lib/mock-data";
import { formatNaira } from "@/lib/format";
import { useToast } from "@/context/ToastContext";
import { canAccess } from "@/lib/access-control";
import { apiPost } from "@/lib/api-client";

export default function AccountLimitPage() {
  const { userType } = useApp();
  const { showToast } = useToast();
  const [upgrading, setUpgrading] = useState<number | null>(null);

  // Every role can view this page; only the Upgrade action itself is gated.
  const canUpgrade = canAccess(userType, "accountLimitUpgrade");
  const currentLevel = getAccountDetailsForUser(userType)[0]?.tierLevel ?? 1;

  // Show the current tier and every tier above it.
  const visibleTiers = accountTiers.filter((t) => t.level >= currentLevel);

  async function handleUpgrade(level: number) {
    setUpgrading(level);
    try {
      await apiPost("/api/account-limit/upgrade", { level });
      showToast(`Upgrade to Tier ${level} requested — we'll review your documents shortly.`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't request an upgrade. Please try again.", "error");
    } finally {
      setUpgrading(null);
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="Your account details, limits, security, and support." />
      <SettingsTabs />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visibleTiers.map((tier) => {
          const isCurrent = tier.level === currentLevel;
          return (
            <Card
              key={tier.level}
              className={clsx("p-5", isCurrent && "border-brand-400 ring-1 ring-brand-400/40")}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-lg font-bold text-ink-900">{tier.name}</span>
                {isCurrent && (
                  <span className="flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-600">
                    <Check size={13} /> Current
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-ink-400">Daily Transaction Limit</p>
                  <p className="font-display text-base font-bold text-ink-900">
                    {formatNaira(tier.dailyTransactionLimit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-400">Maximum Account Balance</p>
                  <p className="font-display text-base font-bold text-ink-900">
                    {formatNaira(tier.maxAccountBalance)}
                  </p>
                </div>
              </div>

              {!isCurrent && (
                <div className="mt-5">
                  {canUpgrade ? (
                    <button
                      onClick={() => handleUpgrade(tier.level)}
                      disabled={upgrading !== null}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
                    >
                      {upgrading === tier.level ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ArrowUpCircle size={16} />
                      )}
                      {upgrading === tier.level ? "Requesting..." : `Upgrade to ${tier.name}`}
                    </button>
                  ) : (
                    <div>
                      <button
                        disabled
                        className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-surface py-2.5 text-sm font-semibold text-ink-400"
                      >
                        <ArrowUpCircle size={16} /> Upgrade to {tier.name}
                      </button>
                      <p className="mt-1.5 text-center text-xs text-ink-400">
                        Not available on your account.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
