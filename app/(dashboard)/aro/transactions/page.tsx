"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { agents, aroTransactions } from "@/lib/mock-data";
import { AroTransactionRecord, AroTransactionType } from "@/lib/types";
import { formatDate, formatNaira } from "@/lib/format";
import { useRequireAccess } from "@/components/access/RequireAccess";

type DateRange = "all" | "today" | "7days" | "30days";

const txnTypes: (AroTransactionType | "ALL")[] = ["ALL", "Payment", "Transfer", "Cashout"];
const dateRanges: { key: DateRange; label: string }[] = [
  { key: "all", label: "All time" },
  { key: "today", label: "Today" },
  { key: "7days", label: "Last 7 days" },
  { key: "30days", label: "Last 30 days" },
];

export default function AroTransactionMonitoringPage() {
  const allowed = useRequireAccess("aro");
  const [agentId, setAgentId] = useState("ALL");
  const [type, setType] = useState<AroTransactionType | "ALL">("ALL");
  const [range, setRange] = useState<DateRange>("all");

  const filtered = useMemo(() => {
    const now = new Date();
    return aroTransactions.filter((t) => {
      if (agentId !== "ALL" && t.agentId !== agentId) return false;
      if (type !== "ALL" && t.type !== type) return false;
      if (range !== "all") {
        const txnDate = new Date(t.date);
        const diffDays = (now.getTime() - txnDate.getTime()) / (1000 * 60 * 60 * 24);
        if (range === "today" && diffDays > 1) return false;
        if (range === "7days" && diffDays > 7) return false;
        if (range === "30days" && diffDays > 30) return false;
      }
      return true;
    });
  }, [agentId, type, range]);

  const totals = useMemo(() => {
    const credit = filtered.filter((t) => t.direction === "CREDIT").reduce((s, t) => s + t.amount, 0);
    const debit = filtered.filter((t) => t.direction === "DEBIT").reduce((s, t) => s + t.amount, 0);
    return { credit, debit, net: credit - debit, count: filtered.length };
  }, [filtered]);

  const columns: Column<AroTransactionRecord>[] = [
    { header: "Date & Time", render: (t) => <span className="text-ink-500">{formatDate(t.date)}</span> },
    { header: "Agent", render: (t) => <span className="font-medium text-ink-900">{t.agentName}</span> },
    {
      header: "Type",
      hideOnMobile: true,
      render: (t) => (
        <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-bold text-brand-600">{t.type}</span>
      ),
    },
    { header: "Amount", align: "right", render: (t) => <span className="font-semibold">{formatNaira(t.amount)}</span> },
    { header: "Status", render: (t) => <Badge tone={statusTone(t.status)}>{t.status}</Badge> },
  ];

  if (!allowed) return null;

  return (
    <div>
      <PageHeader title="Transaction Monitoring" description="Every transaction across your agent network." />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          className="rounded-lg border border-surface-border bg-surface-card px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
        >
          <option value="ALL">All agents</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as AroTransactionType | "ALL")}
          className="rounded-lg border border-surface-border bg-surface-card px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
        >
          {txnTypes.map((t) => (
            <option key={t} value={t}>
              {t === "ALL" ? "All types" : t}
            </option>
          ))}
        </select>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as DateRange)}
          className="rounded-lg border border-surface-border bg-surface-card px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
        >
          {dateRanges.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-ink-400">Total Credit</p>
          <p className="mt-1 font-display text-lg font-bold text-success">{formatNaira(totals.credit)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-400">Total Debit</p>
          <p className="mt-1 font-display text-lg font-bold text-danger">{formatNaira(totals.debit)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-400">Net Difference</p>
          <p className="mt-1 font-display text-lg font-bold text-ink-900">{formatNaira(totals.net)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-400">Total Volume</p>
          <p className="mt-1 font-display text-lg font-bold text-ink-900">{totals.count}</p>
        </Card>
      </div>

      <Card>
        <div className="px-5 pt-5">
          <h2 className="font-display text-lg font-bold text-ink-900">Transactions</h2>
        </div>
        <div className="mt-4">
          <Table columns={columns} rows={filtered} emptyMessage="No transactions match your filters." />
        </div>
      </Card>
    </div>
  );
}
