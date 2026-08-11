"use client";

import { useMemo, useState } from "react";
import { Search, ListFilter } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionsTable } from "@/components/modules/TransactionsTable";
import { transactions, topFiveTransactions } from "@/lib/mock-data";
import { TransactionKind, TransactionStatus } from "@/lib/types";

const kinds: (TransactionKind | "ALL")[] = ["ALL", "TRANSFER", "WITHDRAWAL", "AIRTIME", "DATA", "BILL", "CARD", "VAT"];
const statuses: (TransactionStatus | "ALL")[] = ["ALL", "COMPLETED", "PENDING", "FAILED"];

export default function TransactionsPage() {
  const [view, setView] = useState<"top5" | "all">("top5");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [kind, setKind] = useState<TransactionKind | "ALL">("ALL");
  const [status, setStatus] = useState<TransactionStatus | "ALL">("ALL");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (search && !t.description.toLowerCase().includes(search.toLowerCase()) && !t.reference.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (date && !t.date.startsWith(date)) return false;
      if (kind !== "ALL" && t.kind !== kind) return false;
      if (status !== "ALL" && t.status !== status) return false;
      return true;
    });
  }, [search, date, kind, status]);

  return (
    <div>
      <PageHeader
        title="Transactions"
        description={view === "top5" ? "Your five most recent transactions." : "Complete transaction history."}
        action={
          <button
            onClick={() => setView(view === "top5" ? "all" : "top5")}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            {view === "top5" ? "View All Transactions" : "Back to Top 5"}
          </button>
        }
      />

      {view === "all" && (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description or reference"
              className="w-full rounded-lg border border-surface-border bg-surface-card py-2.5 pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none"
            />
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-surface-border bg-surface-card px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as TransactionKind | "ALL")}
            className="rounded-lg border border-surface-border bg-surface-card px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          >
            {kinds.map((k) => (
              <option key={k} value={k}>
                {k === "ALL" ? "All types" : k}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TransactionStatus | "ALL")}
            className="rounded-lg border border-surface-border bg-surface-card px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "All statuses" : s}
              </option>
            ))}
          </select>
        </div>
      )}

      <TransactionsTable
        title={view === "top5" ? "Top 5 Transactions" : "All Transactions"}
        transactions={view === "top5" ? topFiveTransactions : filtered}
        showActions={view === "all"}
        emptyMessage={
          view === "all" ? (
            <span className="flex items-center justify-center gap-1.5">
              <ListFilter size={14} /> No transactions match your filters.
            </span>
          ) : (
            "No transactions yet."
          )
        }
      />
    </div>
  );
}
