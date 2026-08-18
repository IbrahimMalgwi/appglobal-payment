"use client";

import { ReactNode } from "react";
import { Download, SlidersHorizontal, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Transaction } from "@/lib/types";
import { formatDate, formatNaira } from "@/lib/format";

export function TransactionsTable({
  title,
  transactions,
  emptyMessage,
  showActions = true,
  onRowClick,
}: {
  title: string;
  transactions: Transaction[];
  emptyMessage?: ReactNode;
  showActions?: boolean;
  onRowClick?: (t: Transaction) => void;
}) {
  const columns: Column<Transaction>[] = [
    { header: "Date", render: (t) => <span className="text-ink-500">{formatDate(t.date)}</span> },
    { header: "Description", render: (t) => <span className="text-ink-700">{t.description}</span> },
    {
      header: "Reference",
      hideOnMobile: true,
      render: (t) => <span className="text-xs text-ink-400">{t.reference}</span>,
    },
    {
      header: "Type",
      hideOnMobile: true,
      render: (t) => (
        <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-bold text-brand-600">{t.kind}</span>
      ),
    },
    { header: "Amount", align: "right", render: (t) => <span className="font-semibold">{formatNaira(t.amount)}</span> },
    {
      header: "Status",
      render: (t) => <Badge tone={statusTone(t.status)}>{t.status}</Badge>,
    },
    {
      header: "Credit/Debit",
      hideOnMobile: true,
      render: (t) => (
        <Badge tone={t.direction === "CREDIT" ? "success" : "danger"}>{t.direction}</Badge>
      ),
    },
    { header: "", hideOnMobile: true, render: () => <ChevronRight size={16} className="text-ink-300" /> },
  ];

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
        <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
        {showActions && (
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-2 text-xs font-semibold text-brand-600 hover:bg-surface">
              <Download size={14} /> Export
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600">
              <SlidersHorizontal size={14} /> Filter
            </button>
          </div>
        )}
      </div>
      <div className="mt-4">
        <Table columns={columns} rows={transactions} emptyMessage={emptyMessage} onRowClick={onRowClick} />
      </div>
    </Card>
  );
}
