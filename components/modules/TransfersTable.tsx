"use client";

import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { TransferRecord } from "@/lib/types";
import { formatDate, formatNaira } from "@/lib/format";

export function TransfersTable({
  title,
  records,
  ctaLabel = "New Transfer",
  onCtaClick,
}: {
  title: string;
  records: TransferRecord[];
  ctaLabel?: string;
  onCtaClick?: () => void;
}) {
  const columns: Column<TransferRecord>[] = [
    { header: "Recipient", render: (r) => <span className="font-semibold text-ink-900">{r.recipient}</span> },
    { header: "Bank", render: (r) => <span className="text-ink-500">{r.bank}</span> },
    { header: "Amount", align: "right", render: (r) => <span className="font-semibold">{formatNaira(r.amount)}</span> },
    { header: "Date", render: (r) => <span className="text-ink-500">{formatDate(r.date)}</span> },
    { header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
  ];

  return (
    <Card>
      <div className="flex items-center justify-between px-5 pt-5">
        <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
        <button
          onClick={onCtaClick}
          className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600"
        >
          <Plus size={14} /> {ctaLabel}
        </button>
      </div>
      <div className="mt-4">
        <Table columns={columns} rows={records} emptyMessage="No transfers yet." />
      </div>
    </Card>
  );
}
