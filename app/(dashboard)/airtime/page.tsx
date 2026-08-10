"use client";

import { useState } from "react";
import { Smartphone, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { TransactionsTable } from "@/components/modules/TransactionsTable";
import { transactions as seedTransactions } from "@/lib/mock-data";
import { Transaction } from "@/lib/types";
import { useToast } from "@/context/ToastContext";

const networks = ["MTN", "Airtel", "Glo", "9mobile"];
const amounts = [100, 200, 500, 1000, 2000, 5000];

export default function AirtimePage() {
  const { showToast } = useToast();
  const [network, setNetwork] = useState(networks[0]);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<Transaction[]>(
    seedTransactions.filter((t) => t.kind === "AIRTIME")
  );

  function handleSubmit() {
    if (!phone.trim()) {
      showToast("Enter a phone number to continue.", "error");
      return;
    }
    if (!amount) {
      showToast("Select an amount to continue.", "error");
      return;
    }

    setSubmitting(true);
    // Hardcoded/mock processing — no real backend call.
    setTimeout(() => {
      const record: Transaction = {
        id: `airtime_${Date.now()}`,
        date: new Date().toISOString(),
        kind: "AIRTIME",
        description: `${network} airtime — ${phone}`,
        amount,
        direction: "DEBIT",
        status: "COMPLETED",
      };
      setHistory((prev) => [record, ...prev]);
      setSubmitting(false);
      setPhone("");
      setAmount(null);
      showToast(`₦${amount.toLocaleString()} airtime sent to ${phone} on ${network}.`);
    }, 700);
  }

  return (
    <div>
      <PageHeader title="Airtime" description="Buy airtime for yourself or someone else." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Smartphone size={20} />
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">Network</label>
              <div className="grid grid-cols-4 gap-2">
                {networks.map((n) => (
                  <button
                    key={n}
                    onClick={() => setNetwork(n)}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                      network === n
                        ? "border-brand-500 bg-brand-50 text-brand-600"
                        : "border-surface-border text-ink-500"
                    }`}
                  >
                    {n}
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
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">Amount</label>
              <div className="grid grid-cols-3 gap-2">
                {amounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                      amount === a
                        ? "border-brand-500 bg-brand-50 text-brand-600"
                        : "border-surface-border text-ink-500"
                    }`}
                  >
                    ₦{a.toLocaleString()}
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
              {submitting ? "Processing..." : "Buy Airtime"}
            </button>
          </div>
        </Card>

        <TransactionsTable title="Airtime History" transactions={history} emptyMessage="No airtime purchases yet." />
      </div>
    </div>
  );
}
