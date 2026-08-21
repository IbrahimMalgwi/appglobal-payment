"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Tabs, useActiveTab } from "@/components/ui/Tabs";
import { FilterBar } from "@/components/modules/FilterBar";
import { useResolvedDateRange } from "@/components/modules/DateRangeFilter";
import { useFilterParams } from "@/lib/filter-state";
import { AroComparisonRow, getAroComparisonRows } from "@/lib/aro-analytics";
import { formatNaira } from "@/lib/format";
import { useRequireAccess } from "@/components/access/RequireAccess";

const fieldKeys: readonly string[] = [];

type Row = AroComparisonRow & { id: string };

const metricRows: { key: keyof AroComparisonRow; label: string; format: (v: number) => string }[] = [
  { key: "agentCount", label: "Total Agents", format: (v) => `${v}` },
  { key: "activeAgentCount", label: "Active Agents", format: (v) => `${v}` },
  { key: "transactionCount", label: "Transaction Count", format: (v) => `${v}` },
  { key: "transactionVolume", label: "Transaction Volume", format: formatNaira },
  { key: "commissionTotal", label: "Commission Total", format: formatNaira },
  { key: "commissionPending", label: "Commission Pending", format: formatNaira },
];

function AllAroTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const columns: Column<Row>[] = [
    {
      header: "ARO",
      render: (r) => <span className="font-medium text-ink-900">{r.aroName}</span>,
    },
    { header: "Cluster", hideOnMobile: true, render: (r) => <span className="text-ink-500">{r.cluster}</span> },
    { header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
    {
      header: "Agents",
      align: "right",
      sortable: true,
      sortValue: (r) => r.agentCount,
      render: (r) => (
        <span>
          {r.activeAgentCount}/{r.agentCount}
        </span>
      ),
    },
    {
      header: "Txn Volume",
      align: "right",
      sortable: true,
      sortValue: (r) => r.transactionVolume,
      render: (r) => <span className="font-semibold">{formatNaira(r.transactionVolume)}</span>,
    },
    {
      header: "Commission",
      align: "right",
      sortable: true,
      sortValue: (r) => r.commissionTotal,
      render: (r) => <span>{formatNaira(r.commissionTotal)}</span>,
    },
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      pageSize={10}
      onRowClick={(r) => router.push(`/bdo/aros/${r.aroId}`)}
      emptyMessage="No AROs yet."
    />
  );
}

function CompareAros({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<string[]>(rows.slice(0, 2).map((r) => r.aroId));

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const compared = rows.filter((r) => selected.includes(r.aroId));

  return (
    <div>
      <Card className="mb-5 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">Select 2 or more AROs to compare</p>
        <div className="flex flex-wrap gap-2">
          {rows.map((r) => (
            <button
              key={r.aroId}
              onClick={() => toggle(r.aroId)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selected.includes(r.aroId) ? "bg-brand-500 text-white" : "bg-surface text-ink-600 hover:bg-brand-50"
              }`}
            >
              {r.aroName}
            </button>
          ))}
        </div>
      </Card>

      {compared.length < 2 ? (
        <Card className="px-6 py-16 text-center text-sm text-ink-400">Select at least 2 AROs to see a side-by-side comparison.</Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left">
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Metric
                </th>
                {compared.map((r) => (
                  <th
                    key={r.aroId}
                    className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-400"
                  >
                    <Link href={`/bdo/aros/${r.aroId}`} className="hover:text-brand-600">
                      {r.aroName}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metricRows.map((m) => (
                <tr key={m.key} className="border-b border-surface-border/70 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3.5 text-ink-500">{m.label}</td>
                  {compared.map((r) => (
                    <td key={r.aroId} className="whitespace-nowrap px-4 py-3.5 text-right font-semibold text-ink-900 tabular">
                      {m.format(r[m.key] as number)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function BdoArosContent() {
  const { dateRange, setDateRange, clearAll } = useFilterParams(fieldKeys, "thisMonth");
  const resolvedRange = useResolvedDateRange(dateRange);
  const tab = useActiveTab("tab", "all") ?? "all";

  const rows = useMemo<Row[]>(
    () => getAroComparisonRows(resolvedRange).map((r) => ({ ...r, id: r.aroId })),
    [resolvedRange]
  );

  return (
    <div>
      <PageHeader title="ARO Management" description="All AROs, ranked, with side-by-side comparison." />

      <FilterBar dateRange={{ value: dateRange, onChange: setDateRange }} fields={[]} onClearAll={clearAll} />

      <div className="mb-5">
        <Tabs tabs={[{ key: "all", label: "All AROs" }, { key: "compare", label: "Compare" }]} defaultTab="all" />
      </div>

      {tab === "all" && <AllAroTable rows={rows} />}
      {tab === "compare" && <CompareAros rows={rows} />}
    </div>
  );
}

export default function BdoArosPage() {
  const allowed = useRequireAccess("bdo");
  if (!allowed) return null;
  return (
    <Suspense fallback={null}>
      <BdoArosContent />
    </Suspense>
  );
}
