"use client";

import { useState } from "react";
import { Wifi, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { TransactionsTable } from "@/components/modules/TransactionsTable";
import { transactions as seedTransactions } from "@/lib/mock-data";
import { Transaction } from "@/lib/types";
import { useToast } from "@/context/ToastContext";

const bundles = [
  { label: "1GB - 30 days", price: 500 },
  { label: "2GB - 30 days", price: 1000 },
  { label: "5GB - 30 days", price: 2500 },
  { label: "10GB - 30 days", price: 4500 },
];

export default function DataPage() {
  const { showToast } = useToast();
  const [beneficiary, setBeneficiary] = useState<"self" | "other">("self");
  const [phone, setPhone] = useState("");
  const [bundle, setBundle] = useState(bundles[0]);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<Transaction[]>(
    seedTransactions.filter((t) => t.kind === "DATA")
  );

  function handleSubmit() {
    if (!phone.trim()) {
      showToast("Enter a phone number to continue.", "error");
      return;
    }

    setSubmitting(true);
    // Hardcoded/mock processing — no real backend call.
    setTimeout(() => {
      const record: Transaction = {
        id: `data_${Date.now()}`,
        date: new Date().toISOString(),
        kind: "DATA",
        description: `${bundle.label}${beneficiary === "other" ? ` — for ${phone}` : ""}`,
        amount: bundle.price,
        direction: "DEBIT",
        status: "COMPLETED",
      };
      setHistory((prev) => [record, ...prev]);
      setSubmitting(false);
      setPhone("");
      showToast(`${bundle.label} data purchased for ${phone}.`);
    }, 700);
  }

  return (
    <div>
      <PageHeader title="Data" description="Buy mobile data for yourself or someone else." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Wifi size={20} />
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">Buying for</label>
              <div className="grid grid-cols-2 gap-2">
                {(["self", "other"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setBeneficiary(opt)}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold capitalize ${
                      beneficiary === opt
                        ? "border-brand-500 bg-brand-50 text-brand-600"
                        : "border-surface-border text-ink-500"
                    }`}
                  >
                    {opt === "self" ? "Myself" : "Someone else"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">Phone number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="080X XXX XXXX"
                className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">Bundle</label>
              <div className="space-y-2">
                {bundles.map((b) => (
                  <button
                    key={b.label}
                    onClick={() => setBundle(b)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium ${
                      bundle.label === b.label
                        ? "border-brand-500 bg-brand-50 text-brand-600"
                        : "border-surface-border text-ink-700"
                    }`}
                  >
                    <span>{b.label}</span>
                    <span className="font-semibold">₦{b.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Processing..." : "Buy Data"}
            </button>
          </div>
        </Card>

        <TransactionsTable title="Data Purchase History" transactions={history} emptyMessage="No data purchases yet." />
      </div>
    </div>
  );
}
