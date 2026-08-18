"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ListFilter } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionsTable } from "@/components/modules/TransactionsTable";
import { FilterBar, FilterFieldDef } from "@/components/modules/FilterBar";
import { useResolvedDateRange } from "@/components/modules/DateRangeFilter";
import { useFilterParams } from "@/lib/filter-state";
import { isWithinRange } from "@/lib/date-range";
import { transactions, topFiveTransactions } from "@/lib/mock-data";
import { TransactionKind, TransactionStatus } from "@/lib/types";
import { useRequireAccess } from "@/components/access/RequireAccess";

const kinds: TransactionKind[] = ["TRANSFER", "WITHDRAWAL", "AIRTIME", "DATA", "BILL", "CARD", "VAT"];
const statuses: TransactionStatus[] = ["COMPLETED", "PENDING", "FAILED", "REVERSED", "CANCELLED", "DISPUTED"];
const fieldKeys = ["kind", "status"] as const;

function TransactionsContent() {
  const router = useRouter();
  const [view, setView] = useState<"top5" | "all">("top5");
  const [search, setSearch] = useState("");
  const { values, setValue, dateRange, setDateRange, clearAll } = useFilterParams(fieldKeys, "allTime");
  const resolvedRange = useResolvedDateRange(dateRange);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (search && !t.description.toLowerCase().includes(search.toLowerCase()) && !t.reference.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (!isWithinRange(t.date, resolvedRange)) return false;
      if (values.kind !== "ALL" && t.kind !== values.kind) return false;
      if (values.status !== "ALL" && t.status !== values.status) return false;
      return true;
    });
  }, [search, resolvedRange, values]);

  const fields: FilterFieldDef[] = [
    {
      key: "kind",
      label: "Type",
      value: values.kind,
      onChange: (v) => setValue("kind", v),
      options: kinds.map((k) => ({ value: k, label: k })),
    },
    {
      key: "status",
      label: "Status",
      value: values.status,
      onChange: (v) => setValue("status", v),
      options: statuses.map((s) => ({ value: s, label: s })),
    },
  ];

  const allowed = useRequireAccess("transactions");
  if (!allowed) return null;

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
        <>
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description or reference"
              className="w-full max-w-md rounded-lg border border-surface-border bg-surface-card py-2.5 pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none"
            />
          </div>
          <FilterBar dateRange={{ value: dateRange, onChange: setDateRange }} fields={fields} onClearAll={clearAll} />
        </>
      )}

      <TransactionsTable
        title={view === "top5" ? "Top 5 Transactions" : "All Transactions"}
        transactions={view === "top5" ? topFiveTransactions : filtered}
        showActions={view === "all"}
        onRowClick={(t) => router.push(`/transactions/${t.id}`)}
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

export default function TransactionsPage() {
  return (
    <Suspense fallback={null}>
      <TransactionsContent />
    </Suspense>
  );
}
