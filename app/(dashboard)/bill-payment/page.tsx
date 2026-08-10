"use client";

import { useState } from "react";
import { Zap, Tv2, GraduationCap, Droplets, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { TransactionsTable } from "@/components/modules/TransactionsTable";
import { transactions as seedTransactions } from "@/lib/mock-data";
import { Transaction } from "@/lib/types";
import { useToast } from "@/context/ToastContext";

const billers = [
  { label: "Electricity", icon: Zap },
  { label: "Cable TV", icon: Tv2 },
  { label: "Education", icon: GraduationCap },
  { label: "Water", icon: Droplets },
];

export default function BillPaymentPage() {
  const { showToast } = useToast();
  const [biller, setBiller] = useState(billers[0].label);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<Transaction[]>(
    seedTransactions.filter((t) => t.kind === "BILL")
  );

  function handleSubmit() {
    if (!accountNumber.trim()) {
      showToast("Enter an account or meter number.", "error");
      return;
    }
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      showToast("Enter a valid amount.", "error");
      return;
    }

    setSubmitting(true);
    // Hardcoded/mock processing — no real backend call.
    setTimeout(() => {
      const record: Transaction = {
        id: `bill_${Date.now()}`,
        date: new Date().toISOString(),
        kind: "BILL",
        description: `${biller} bill payment — ${accountNumber}`,
        amount: parsedAmount,
        direction: "DEBIT",
        status: "COMPLETED",
      };
      setHistory((prev) => [record, ...prev]);
      setSubmitting(false);
      setAccountNumber("");
      setAmount("");
      showToast(`${biller} bill of ₦${parsedAmount.toLocaleString()} paid successfully.`);
    }, 700);
  }

  return (
    <div>
      <PageHeader title="Bill Payment" description="Pay bills and track your recent payments." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="p-5">
          <label className="mb-2 block text-sm font-semibold text-ink-700">Select a biller</label>
          <div className="grid grid-cols-2 gap-3">
            {billers.map((b) => (
              <button
                key={b.label}
                onClick={() => setBiller(b.label)}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-xs font-semibold ${
                  biller === b.label
                    ? "border-brand-500 bg-brand-50 text-brand-600"
                    : "border-surface-border text-ink-600"
                }`}
              >
                <b.icon size={20} />
                {b.label}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-semibold text-ink-700">Account / Meter number</label>
            <input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
              className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
            />
          </div>
          <div className="mt-4">
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
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "Processing..." : "Pay Bill"}
          </button>
        </Card>

        <TransactionsTable title="Bill Payment History" transactions={history} emptyMessage="No bill payments yet." />
      </div>
    </div>
  );
}
