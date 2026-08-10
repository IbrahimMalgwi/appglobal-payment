"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { TransactionsTable } from "@/components/modules/TransactionsTable";
import { transactions } from "@/lib/mock-data";

export default function DailySummaryPage() {
  const [date, setDate] = useState("");

  const filtered = useMemo(() => {
    if (!date) return transactions;
    return transactions.filter((t) => t.date.startsWith(date));
  }, [date]);

  return (
    <div>
      <PageHeader title="Accounts" description="Filter transactions by a specific date." />
      <div className="mb-5">
        <RouteTabs
          tabs={[
            { href: "/accounts/all-transactions", label: "All Transactions" },
            { href: "/accounts/daily-summary", label: "Daily Summary" },
          ]}
        />
      </div>
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-semibold text-ink-700" htmlFor="date-filter">
          Select date
        </label>
        <input
          id="date-filter"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-surface-border px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
        />
        {date && (
          <button onClick={() => setDate("")} className="text-sm font-semibold text-brand-600">
            Clear
          </button>
        )}
      </div>
      <TransactionsTable
        title="Daily Summary"
        transactions={filtered}
        emptyMessage="No transactions on this date."
      />
    </div>
  );
}
