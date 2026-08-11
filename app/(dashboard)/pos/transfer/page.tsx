"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { posTransfers } from "@/lib/mock-data";
import { PosTransferRecord } from "@/lib/types";
import { formatDate, formatNaira } from "@/lib/format";

const posTabs = [
  { href: "/pos/transfer", label: "POS Transfer" },
  { href: "/pos/withdrawal", label: "POS Withdrawal" },
];

function PosTransferContent() {
  const searchParams = useSearchParams();
  const state = (searchParams.get("tab") ?? "pending") as PosTransferRecord["state"];

  const filtered = useMemo(() => posTransfers.filter((p) => p.state === state), [state]);

  const counts = {
    pending: posTransfers.filter((p) => p.state === "pending").length,
    accepted: posTransfers.filter((p) => p.state === "accepted").length,
    declined: posTransfers.filter((p) => p.state === "declined").length,
  };

  const columns: Column<PosTransferRecord>[] = [
    { header: "Terminal ID", render: (r) => <span className="font-semibold text-ink-900">{r.terminalId}</span> },
    { header: "Amount", align: "right", render: (r) => <span className="font-semibold">{formatNaira(r.amount)}</span> },
    { header: "Date", hideOnMobile: true, render: (r) => <span className="text-ink-500">{formatDate(r.date)}</span> },
    { header: "Status", render: (r) => <Badge tone={statusTone(r.state)}>{r.state}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="POS" description="Transfers and withdrawals made through POS devices linked to your business." />
      <div className="mb-5">
        <RouteTabs tabs={posTabs} />
      </div>
      <div className="mb-5">
        <Tabs
          tabs={[
            { key: "pending", label: "Pending", badge: counts.pending },
            { key: "accepted", label: "Accepted", badge: counts.accepted },
            { key: "declined", label: "Declined", badge: counts.declined },
          ]}
          defaultTab="pending"
        />
      </div>
      <Card>
        <div className="px-5 pt-5">
          <h2 className="font-display text-lg font-bold capitalize text-ink-900">{state} transfers</h2>
        </div>
        <div className="mt-4">
          <Table columns={columns} rows={filtered} emptyMessage={`No ${state} POS transfers.`} />
        </div>
      </Card>
    </div>
  );
}

export default function PosTransferPage() {
  return (
    <Suspense fallback={null}>
      <PosTransferContent />
    </Suspense>
  );
}
