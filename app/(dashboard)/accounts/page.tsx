"use client";

import { Landmark, Copy } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { useApp } from "@/context/AppContext";
import { getAccountsForUser } from "@/lib/mock-data";
import { formatNaira } from "@/lib/format";

export default function AccountsPage() {
  const { userType } = useApp();
  const accounts = getAccountsForUser(userType);

  return (
    <div>
      <PageHeader
        title="Accounts"
        description={
          userType === "business"
            ? "All accounts linked to your business."
            : "Your account details."
        }
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {accounts.map((acct) => (
          <Card key={acct.id} className="overflow-hidden">
            <div className="flex items-center justify-between bg-navy-950 px-5 py-4">
              <div className="flex items-center gap-2 text-white">
                <Landmark size={18} className="text-brand-300" />
                <span className="text-sm font-semibold">{acct.accountType} Account</span>
              </div>
              <Badge tone={statusTone(acct.status)}>{acct.status}</Badge>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs text-ink-400">Account name</p>
                <p className="text-sm font-semibold text-ink-900">{acct.accountName}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-ink-400">Account number</p>
                  <p className="text-sm font-semibold text-ink-900">{acct.accountNumber}</p>
                </div>
                <button
                  className="flex items-center gap-1.5 rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-semibold text-brand-600 hover:bg-surface"
                  onClick={() => navigator.clipboard?.writeText(acct.accountNumber)}
                >
                  <Copy size={13} /> Copy
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-surface-border pt-4">
                <div>
                  <p className="text-xs text-ink-400">Available balance</p>
                  <p className="font-display text-lg font-bold text-ink-900">
                    {formatNaira(acct.availableBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-400">Current balance</p>
                  <p className="font-display text-lg font-bold text-ink-900">
                    {formatNaira(acct.currentBalance)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-surface-border pt-4 text-xs text-ink-400">
                <span>Currency</span>
                <span className="font-semibold text-ink-700">{acct.currency}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
