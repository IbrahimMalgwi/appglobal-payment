"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { getAgentPerformanceRows } from "@/lib/mock-data";
import { AgentPerformanceRow } from "@/lib/types";
import { formatDate, formatNaira } from "@/lib/format";
import { useRequireAccess } from "@/components/access/RequireAccess";

type View = "cumulative" | "individual";
type Row = AgentPerformanceRow & { id: string };

const views: { key: View; label: string }[] = [
  { key: "cumulative", label: "Cumulative" },
  { key: "individual", label: "Individual" },
];

function lastActivityLabel(iso: string | null): string {
  return iso ? formatDate(iso) : "—";
}

export default function AroPerformancePage() {
  const allowed = useRequireAccess("aro");
  const router = useRouter();
  const [view, setView] = useState<View>("cumulative");

  const rows = useMemo<Row[]>(
    () => getAgentPerformanceRows().map((r) => ({ ...r, id: r.agentId })),
    []
  );
  const [selectedAgentId, setSelectedAgentId] = useState(rows[0]?.agentId ?? "");
  const selected = rows.find((r) => r.agentId === selectedAgentId);

  const columns: Column<Row>[] = [
    {
      header: "Agent",
      render: (r) => (
        <div>
          <p className="font-medium text-ink-900">{r.agentName}</p>
          <p className="text-xs text-ink-400">{r.businessName}</p>
        </div>
      ),
    },
    {
      header: "Total Transactions",
      align: "right",
      sortable: true,
      sortValue: (r) => r.totalTransactionCount,
      render: (r) => <span className="font-semibold">{r.totalTransactionCount}</span>,
    },
    {
      header: "Volume",
      align: "right",
      render: (r) => <span className="font-semibold">{formatNaira(r.totalTransactionVolume)}</span>,
    },
    {
      header: "Withdrawals",
      align: "right",
      sortable: true,
      sortValue: (r) => r.totalWithdrawals,
      render: (r) => <span>{r.totalWithdrawals}</span>,
    },
    {
      header: "Transfers",
      align: "right",
      sortable: true,
      sortValue: (r) => r.totalTransfers,
      render: (r) => <span>{r.totalTransfers}</span>,
    },
    {
      header: "Last Activity",
      hideOnMobile: true,
      sortable: true,
      sortValue: (r) => (r.lastActivity ? new Date(r.lastActivity).getTime() : 0),
      render: (r) => <span className="text-ink-500">{lastActivityLabel(r.lastActivity)}</span>,
    },
  ];

  if (!allowed) return null;

  return (
    <div>
      <PageHeader
        title="Performance"
        description="Aggregated transaction performance across your agent network."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {views.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              view === v.key ? "bg-brand-500 text-white" : "bg-surface text-ink-600 hover:bg-brand-50"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "cumulative" && (
        <Card>
          <div className="px-5 pt-5">
            <h2 className="font-display text-lg font-bold text-ink-900">All Agents</h2>
            <p className="text-sm text-ink-400">Click a row to open that agent&apos;s activity log.</p>
          </div>
          <div className="mt-4">
            <Table
              columns={columns}
              rows={rows}
              pageSize={5}
              onRowClick={(r) => router.push(`/aro/agents/${r.agentId}?tab=transactions`)}
              emptyMessage="No agent performance data yet."
            />
          </div>
        </Card>
      )}

      {view === "individual" && (
        <Card className="p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-ink-900">Individual Performance</h2>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="rounded-lg border border-surface-border bg-surface-card px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
            >
              {rows.map((r) => (
                <option key={r.agentId} value={r.agentId}>
                  {r.agentName}
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard label="Total transactions" value={`${selected.totalTransactionCount}`} />
                <StatCard label="Total volume" value={formatNaira(selected.totalTransactionVolume)} />
                <StatCard label="Withdrawals" value={`${selected.totalWithdrawals}`} />
                <StatCard label="Transfers" value={`${selected.totalTransfers}`} />
                <StatCard label="Last activity" value={lastActivityLabel(selected.lastActivity)} />
              </div>
              <Link
                href={`/aro/agents/${selected.agentId}?tab=transactions`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                View full activity log <ArrowRight size={15} />
              </Link>
            </>
          )}
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-4">
      <p className="text-xs text-ink-400">{label}</p>
      <p className="mt-1 font-display text-lg font-bold text-ink-900">{value}</p>
    </div>
  );
}
