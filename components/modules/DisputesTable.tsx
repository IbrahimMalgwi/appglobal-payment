"use client";

import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { DisputeRecord } from "@/lib/types";
import { formatDate, formatNaira } from "@/lib/format";

export function DisputesTable({ title, records }: { title: string; records: DisputeRecord[] }) {
  const columns: Column<DisputeRecord>[] = [
    { header: "Reference", render: (r) => <span className="font-semibold text-ink-900">{r.reference}</span> },
    { header: "Reason", render: (r) => <span className="text-ink-600">{r.reason}</span> },
    { header: "Amount", align: "right", render: (r) => <span className="font-semibold">{formatNaira(r.amount)}</span> },
    { header: "Date", render: (r) => <span className="text-ink-500">{formatDate(r.date)}</span> },
    { header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
  ];

  return (
    <Card>
      <div className="px-5 pt-5">
        <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
      </div>
      <div className="mt-4">
        <Table columns={columns} rows={records} emptyMessage="No disputes recorded." />
      </div>
    </Card>
  );
}
