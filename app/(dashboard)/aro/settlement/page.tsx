"use client";

import { useState } from "react";
import { Landmark, Copy, ArrowUpRight, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TransactionsTable } from "@/components/modules/TransactionsTable";
import { aroPayoutBank, aroSettlementAccount, aroSettlementTransactions } from "@/lib/mock-data";
import { Transaction } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { useToast } from "@/context/ToastContext";
import { useRequireAccess } from "@/components/access/RequireAccess";
import { canAccess } from "@/lib/access-control";
import { useApp } from "@/context/AppContext";
import { apiPost } from "@/lib/api-client";

export default function AroSettlementPage() {
  const allowed = useRequireAccess("aro");
  const { userType } = useApp();
  const { showToast } = useToast();
  const account = aroSettlementAccount;

  // An ARO's only route to moving money out is withdrawing this settlement balance,
  // so the available balance and history are held in local state and mutated on withdraw.
  const [available, setAvailable] = useState(account.availableBalance);
  const [history, setHistory] = useState<Transaction[]>(aroSettlementTransactions);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canWithdraw = canAccess(userType, "settlementWithdraw");

  if (!allowed) return null;

  async function handleWithdraw() {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) {
      showToast("Enter a valid amount to withdraw.", "error");
      return;
    }
    if (parsed > available) {
      showToast("Amount exceeds your available settlement balance.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const { transaction } = await apiPost<{ transaction: Transaction }>("/api/settlement/withdraw", {
        amount: parsed,
        available,
      });
      setAvailable((prev) => prev - parsed);
      setHistory((prev) => [transaction, ...prev]);
      setOpen(false);
      setAmount("");
      showToast(`${formatNaira(parsed)} withdrawn to ${aroPayoutBank.bankName} — ${aroPayoutBank.accountNumber}.`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Withdrawal failed. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Settlement Account"
        description="Your dedicated account for commissions, earnings, and payouts."
        action={
          canWithdraw && (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              <ArrowUpRight size={16} /> Withdraw
            </button>
          )
        }
      />

      <Card className="mb-5 max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between bg-navy-950 px-5 py-4">
          <div className="flex items-center gap-2 text-white">
            <Landmark size={18} className="text-brand-300" />
            <span className="text-sm font-semibold">{account.accountType} Account</span>
          </div>
          <Badge tone={statusTone(account.status)}>{account.status}</Badge>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <p className="text-xs text-ink-400">Account name</p>
            <p className="text-sm font-semibold text-ink-900">{account.accountName}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-400">Account number</p>
              <p className="text-sm font-semibold text-ink-900">{account.accountNumber}</p>
            </div>
            <button
              className="flex items-center gap-1.5 rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-semibold text-brand-600 hover:bg-surface"
              onClick={() => navigator.clipboard?.writeText(account.accountNumber)}
            >
              <Copy size={13} /> Copy
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-surface-border pt-4">
            <div>
              <p className="text-xs text-ink-400">Available balance</p>
              <p className="font-display text-lg font-bold text-ink-900">{formatNaira(available)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">Current balance</p>
              <p className="font-display text-lg font-bold text-ink-900">
                {formatNaira(account.currentBalance)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-surface-border pt-4 text-xs text-ink-400">
            <span>Currency</span>
            <span className="font-semibold text-ink-700">{account.currency}</span>
          </div>
        </div>
      </Card>

      <TransactionsTable
        title="Settlement History"
        transactions={history}
        emptyMessage="No settlement activity yet."
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Withdraw settlement balance">
        <div className="space-y-4">
          <div className="rounded-xl bg-surface p-4">
            <p className="text-xs text-ink-400">Available balance</p>
            <p className="font-display text-xl font-bold text-ink-900">{formatNaira(available)}</p>
          </div>

          <div className="rounded-xl border border-surface-border p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">Withdraw to</p>
            <p className="text-sm font-semibold text-ink-900">{aroPayoutBank.accountName}</p>
            <p className="text-sm text-ink-600">
              {aroPayoutBank.bankName} — {aroPayoutBank.accountNumber}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700">Amount</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0.00"
              inputMode="decimal"
              className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
            />
          </div>

          <button
            onClick={handleWithdraw}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "Processing..." : "Withdraw"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
