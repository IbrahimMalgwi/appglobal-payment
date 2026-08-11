"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Loader2, Zap } from "lucide-react";
import { clsx } from "clsx";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { TransactionsTable } from "@/components/modules/TransactionsTable";
import { billCategories, getBillHistory } from "@/lib/mock-data";
import { useToast } from "@/context/ToastContext";

export default function BillPaymentPage() {
  const { showToast } = useToast();
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState(billCategories[0].id);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const visibleCategories = showAll ? billCategories : billCategories.filter((c) => c.primary);
  const selectedCategory = billCategories.find((c) => c.id === selected)!;
  const history = useMemo(() => getBillHistory(selected), [selected]);

  function handleSubmit() {
    if (!accountNumber.trim()) {
      showToast("Enter an account, meter, or phone number.", "error");
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
      setSubmitting(false);
      setAccountNumber("");
      setAmount("");
      showToast(`${selectedCategory.label} payment of ₦${parsedAmount.toLocaleString()} successful.`);
    }, 700);
  }

  return (
    <div>
      <PageHeader title="Bill Payment" description="Pay bills and track your recent payments by category." />

      <Card className="mb-5 p-5">
        <p className="mb-3 text-sm font-semibold text-ink-700">Select a category</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelected(cat.id)}
              className={clsx(
                "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-xs font-semibold transition-colors",
                selected === cat.id
                  ? "border-brand-500 bg-brand-50 text-brand-600"
                  : "border-surface-border text-ink-600 hover:border-brand-200"
              )}
            >
              <Zap size={20} />
              {cat.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand-600"
        >
          {showAll ? "Show fewer categories" : "Show more categories"}
          <ChevronDown size={15} className={clsx("transition-transform", showAll && "rotate-180")} />
        </button>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="p-5">
          <p className="mb-4 text-sm font-semibold text-ink-700">Pay {selectedCategory.label}</p>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">
                {selectedCategory.id === "airtime" || selectedCategory.id === "data"
                  ? "Phone number"
                  : "Account / meter number"}
              </label>
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter number"
                className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
              />
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
              onClick={handleSubmit}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Processing..." : `Pay ${selectedCategory.label}`}
            </button>
          </div>
        </Card>

        <TransactionsTable
          title={`${selectedCategory.label} History`}
          transactions={history}
          emptyMessage={`No ${selectedCategory.label.toLowerCase()} payments yet.`}
        />
      </div>
    </div>
  );
}
